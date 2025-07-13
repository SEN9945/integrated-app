import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { getLinkPreview } from 'link-preview-js';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    
    const auth = await requireAdmin(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const { name, projectLink, imageUrl: customImageUrl } = await req.json();

    const project = await Project.findById(id);
    if (!project) {
      return Response.json({ message: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    let updateData = { name, projectLink };

    // If projectLink changed, update preview
    if (projectLink && projectLink !== project.projectLink) {
      try {
        let imageUrl;
        let previewType = 'image';
        let previewUrl = '';

        if (customImageUrl) {
          imageUrl = customImageUrl;
        } else {
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

        updateData.imageUrl = imageUrl;
        updateData.previewType = previewType;
        updateData.previewUrl = previewUrl;

      } catch (linkError) {
        console.error('Link preview error:', linkError);
        updateData.imageUrl = 'https://via.placeholder.com/400x300?text=No+Preview';
        updateData.previewType = 'other';
        updateData.previewUrl = projectLink;
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true });

    return Response.json(updatedProject);

  } catch (error) {
    console.error('Update project error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    
    const auth = await requireAdmin(req);
    if (auth.error) {
      return Response.json({ message: auth.error }, { status: auth.status });
    }

    const { id } = params;

    const project = await Project.findById(id);
    if (!project) {
      return Response.json({ message: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    await Project.findByIdAndDelete(id);

    return Response.json({ message: 'Proyek berhasil dihapus' });

  } catch (error) {
    console.error('Delete project error:', error);
    return Response.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
