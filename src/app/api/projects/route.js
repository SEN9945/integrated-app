import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { authenticate } from '@/middleware/auth';
import { getLinkPreview } from 'link-preview-js';

export async function GET(req) {
  try {
    console.log('GET /api/projects - Starting request');
    await connectDB();
    console.log('GET /api/projects - Database connected');
    
    const auth = await authenticate(req);
    console.log('GET /api/projects - Auth result:', auth.error ? 'Failed' : 'Success');
    
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    const projects = await Project.find().sort({ createdAt: -1 });
    console.log('GET /api/projects - Found projects:', projects.length);
    
    return Response.json(projects);

  } catch (error) {
    console.error('Get projects error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    const auth = await authenticate(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    const { name, projectLink, imageUrl: customImageUrl } = await req.json();

    if (!name || !projectLink) {
      return Response.json({ message: 'Nama dan link proyek wajib diisi' }, { status: 400 });
    }

    let imageUrl;
    let previewType = 'image';
    let previewUrl = '';

    try {
      // Logic for Admin
      if (auth.role === 'admin') {
        if (customImageUrl) {
          imageUrl = customImageUrl;
        } else {
          // Detect link type
          if (projectLink.endsWith('.pdf')) {
            previewType = 'pdf';
            imageUrl = '/pdf-icon.png';
            previewUrl = projectLink;
          } else if (projectLink.includes('drive.google.com')) {
            previewType = 'google';
            imageUrl = 'https://ssl.gstatic.com/docs/doclist/images/icon_10_pdf_list.png';
            previewUrl = projectLink;
          } else {
            const preview = await getLinkPreview(projectLink);
            imageUrl = preview.images && preview.images[0] ? preview.images[0] : 'https://via.placeholder.com/400x300?text=No+Preview';
            previewUrl = preview.url || projectLink;
          }
        }
      } 
      // Logic for Members
      else {
        if (!projectLink.startsWith('https://www.canva.com')) {
          return Response.json({ message: 'Anggota hanya boleh memasukkan link Canva' }, { status: 403 });
        }
        const preview = await getLinkPreview(projectLink);
        imageUrl = preview.images && preview.images[0] ? preview.images[0] : 'https://via.placeholder.com/400x300?text=No+Preview';
        previewType = 'image';
        previewUrl = preview.url || projectLink;
      }

      if (!imageUrl) {
        imageUrl = 'https://via.placeholder.com/400x300?text=No+Preview';
      }

      const project = await Project.create({
        name,
        projectLink,
        imageUrl,
        previewType,
        previewUrl,
        createdBy: auth.userId,
      });

      return Response.json(project, { status: 201 });

    } catch (linkError) {
      console.error('Link preview error:', linkError);
      
      // Fallback: create project without preview
      const project = await Project.create({
        name,
        projectLink,
        imageUrl: 'https://via.placeholder.com/400x300?text=No+Preview',
        previewType: 'other',
        previewUrl: projectLink,
        createdBy: auth.userId,
      });

      return Response.json(project, { status: 201 });
    }

  } catch (error) {
    console.error('Create project error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
