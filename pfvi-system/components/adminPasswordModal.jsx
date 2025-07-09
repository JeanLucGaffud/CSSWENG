// components/adminPasswordModal.jsx
"use client";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function AdminPasswordModal({ onClose, onConfirm, isLoading }) {
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

    const handleConfirm = () => {
    if (!adminPassword) {
        setError("Please enter the admin password");
        return;
    }
    setError("");
    onConfirm(adminPassword);
    };


  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-md border">
        <h2 className="text-xl font-medium mb-2">Admin Confirmation</h2>
        <p className="text-sm text-gray-500 mb-4">Enter admin password to confirm registration</p>

        {error && (
          <div className="text-sm text-red-600 mb-2 bg-red-100 p-2 rounded">{error}</div>
        )}

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Admin password"
            className="w-full h-11 px-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Validating..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
