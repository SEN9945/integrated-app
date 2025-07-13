"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';
import EditProjectModal from '@/components/EditProjectModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import MembersStatusModal from '@/components/MembersStatusModal';

// Add Project Modal Component
function AddProjectModal({ token, onClose, onProjectAdded }) {
  const [name, setName] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const promise = fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, projectLink }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menambahkan proyek");
      return data;
    });

    toast.promise(promise, {
      loading: 'Menyimpan proyek...',
      success: (data) => {
        onProjectAdded(data);
        onClose();
        return 'Proyek berhasil ditambahkan!';
      },
      error: (err) => err.toString(),
    }).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-sm sm:max-w-md p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900">Tambah Proyek Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 sm:mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Nama Proyek</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-3 py-2 text-sm sm:text-base text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              required 
            />
          </div>
          <div className="mb-4 sm:mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700">Link Proyek</label>
            <input 
              type="url" 
              value={projectLink} 
              onChange={(e) => setProjectLink(e.target.value)} 
              className="w-full px-3 py-2 text-sm sm:text-base text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              required 
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end pt-3 sm:pt-4 space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const router = useRouter();

  // Auto logout after 8 minutes of inactivity
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      setLastActivity(Date.now());
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        // Auto logout after 8 minutes (480000 ms)
        localStorage.removeItem("token");
        toast.error("Sesi Anda telah berakhir karena tidak ada aktivitas");
        router.push("/");
      }, 8 * 60 * 1000); // 8 minutes
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Track user activities
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity, true);
      });
    };
  }, [router]);

  // Auto ping every 30 seconds
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const ping = () => {
      fetch("/api/users/ping", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: "ping" }),
      }).catch(console.error);
    };
    
    ping(); // First ping on mount
    const interval = setInterval(ping, 30000); // Ping every 30 seconds
    
    // Set offline when window/tab is closed
    const handleUnload = () => {
      fetch("/api/users/ping", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: "offline" }),
      }).catch(console.error);
    };
    
    window.addEventListener("beforeunload", handleUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  // Auto logout after 8 minutes of inactivity
  useEffect(() => {
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 8 * 60 * 1000; // 8 minutes in milliseconds

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        toast.error('Sesi berakhir karena tidak ada aktivitas');
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Set initial timer
    resetTimer();

    // Add event listeners to reset timer on user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      router.push("/");
      return;
    }

    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Gagal memuat proyek");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (updatedProject) => {
    setProjects(projects.map(p => 
      p._id === updatedProject._id ? updatedProject : p
    ));
  };

  const handleDeleteProject = async (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${projectToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects(projects.filter(p => p._id !== projectToDelete._id));
      toast.success("Proyek berhasil dihapus");
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Gagal menghapus proyek");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/users/ping", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: "offline" }),
      }).catch(console.error);
    }
    
    localStorage.removeItem("token");
    router.push("/");
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat daftar pengguna");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-3 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Mobile Layout (xs to sm) */}
          <div className="block sm:hidden">
            {/* Top row - Dashboard title and Logout */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {userRole === 'admin' ? 'Admin' : 'Anggota'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
            
            {/* Bottom row - Action icons */}
            <div className="flex items-center justify-start space-x-3">
              {/* Status/Users icon */}
              {userRole === 'admin' ? (
                <button
                  onClick={() => router.push("/dashboard/users")}
                  className="p-2.5 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  title="Lihat Users"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setIsMembersModalOpen(true)}
                  className="p-2.5 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  title="Status Anggota"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                  </svg>
                </button>
              )}
              
              {/* Add project icon */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="p-2.5 text-white bg-green-600 rounded-md hover:bg-green-700"
                title="Tambah Proyek"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Layout (sm and up) */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {userRole === 'admin' ? 'Admin' : 'Anggota'}
              </span>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Tambah Proyek
              </button>
              {userRole === 'admin' ? (
                <button
                  onClick={() => router.push("/dashboard/users")}
                  className="px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white bg-purple-600 rounded-md hover:bg-purple-700"
                >
                  Lihat Users
                </button>
              ) : (
                <button
                  onClick={() => setIsMembersModalOpen(true)}
                  className="px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Status Anggota
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-video relative cursor-pointer" onClick={() => window.open(project.projectLink, '_blank')}>
                <Image
                  src={project.imageUrl || 'https://via.placeholder.com/400x300?text=No+Preview'}
                  alt={project.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Preview';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-200">
                    <svg className="w-6 h-6 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-2 sm:p-3 lg:p-4">
                <h3 className="font-semibold text-xs sm:text-sm lg:text-base mb-2 text-gray-900 line-clamp-2 leading-tight">
                  {project.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 truncate">
                    {new Date(project.createdAt).toLocaleDateString('id-ID')}
                  </span>
                  {userRole === 'admin' && (
                    <div className="flex space-x-1 flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentProject(project);
                          setIsEditModalOpen(true);
                        }}
                        className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-red-600 bg-red-100 rounded hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Belum ada proyek yang tersedia</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {isAddModalOpen && (
        <AddProjectModal
          token={localStorage.getItem("token")}
          onClose={() => setIsAddModalOpen(false)}
          onProjectAdded={handleAddProject}
        />
      )}

      {isEditModalOpen && currentProject && (
        <EditProjectModal
          project={currentProject}
          token={localStorage.getItem("token")}
          onClose={() => setIsEditModalOpen(false)}
          onProjectUpdated={handleUpdateProject}
        />
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        message={projectToDelete ? `Apakah Anda yakin ingin menghapus proyek <strong>"${projectToDelete.name}"</strong>?` : ""}
        isDeleting={isDeleting}
      />

      <MembersStatusModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        token={localStorage.getItem("token")}
      />
    </div>
  );
}
