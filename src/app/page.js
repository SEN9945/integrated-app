"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const promise = fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }
      return data;
    });

    toast.promise(promise, {
      loading: 'Mencoba login...',
      success: (data) => {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
        return 'Login berhasil!';
      },
      error: (err) => err.toString(),
    }).finally(() => setLoading(false));
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Project Design
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Silakan masuk untuk melanjutkan
          </p>
        </div>
        
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className="w-full px-3 py-2 sm:px-4 sm:py-3 mt-1 text-sm sm:text-base text-white bg-white/10 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base text-white bg-white/10 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 cursor-pointer text-white hover:text-blue-400 transition-colors"
                tabIndex={-1}
                style={{ userSelect: 'none' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
