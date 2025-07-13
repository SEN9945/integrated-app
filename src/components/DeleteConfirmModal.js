"use client";

import { useState } from "react";

export default function DeleteConfirmModal({ isOpen, onConfirm, onCancel, message, isDeleting = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-sm sm:max-w-md p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-gray-900">Konfirmasi Hapus</h2>
        <div className="mb-4 sm:mb-6 text-gray-700">
          {message ? (
            <p className="text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: message }} />
          ) : (
            <p className="text-sm sm:text-base">Apakah Anda yakin ingin menghapus item ini?</p>
          )}
          <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-end pt-3 sm:pt-4 space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            disabled={isDeleting}
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors" 
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
