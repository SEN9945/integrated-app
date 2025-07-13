"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

export default function MembersStatusModal({ isOpen, onClose, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Auto refresh every 30 seconds when modal is open
      const interval = setInterval(fetchUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      // Use /api/members endpoint for all users (anggota can also see other members)
      const response = await fetch("/api/members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      
      // Sort users: online first, then by last seen (most recent first)
      const sortedUsers = data.sort((a, b) => {
        // First, sort by online status (online users first)
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        
        // Then sort by last seen (most recent first)
        if (!a.lastSeen && !b.lastSeen) return 0;
        if (!a.lastSeen) return 1;
        if (!b.lastSeen) return -1;
        
        return new Date(b.lastSeen) - new Date(a.lastSeen);
      });
      
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat daftar anggota");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Tidak pernah";
    
    const now = new Date();
    const lastSeen = new Date(date);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari yang lalu`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl p-4 sm:p-6 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Status Anggota</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 text-sm sm:text-base">Memuat...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              Tidak ada anggota
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {user.fullName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">
                      @{user.username}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Terakhir dilihat
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 font-medium">
                      {user.isOnline ? 'Online sekarang' : getTimeAgo(user.lastSeen)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-blue-300 transition-colors"
          >
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
