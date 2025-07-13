"use client";

import { useState } from "react";
import toast from 'react-hot-toast';

export default function EditProjectModal({ project, token, onClose, onProjectUpdated }) {
  const [name, setName] = useState(project.name);
  const [projectLink, setProjectLink] = useState(project.projectLink);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const promise = fetch(`/api/projects/${project._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, projectLink }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui proyek");
      return data;
    });

    toast.promise(promise, {
        loading: 'Memperbarui proyek...',
        success: (data) => {
            onProjectUpdated(data);
            onClose();
            return 'Proyek berhasil diperbarui!';
        },
        error: (err) => err.toString(),
    }).finally(() => setIsSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-sm sm:max-w-md p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900">Edit Proyek</h2>
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
              {isSubmitting ? 'Memperbarui...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
