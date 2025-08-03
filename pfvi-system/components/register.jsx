"use client";

import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AdminPasswordModal from "@/components/adminPasswordModal";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  const isValidPHNumber = (number) => {
    const regexLocal = /^09\d{9}$/;
    const regexIntl = /^\+639\d{9}$/;
    return regexLocal.test(number) || regexIntl.test(number);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!isValidPHNumber(phoneNumber)) {
      toast.error("Enter a valid Philippine mobile number (e.g. 09123456789 or +639123456789)");
      return;
    }

    setShowAdminModal(true);
  };

  const handleAdminConfirm = async (adminPassword) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName,
          firstName,
          phoneNumber,
          role: selectedRole,
          password,
          adminPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("User successfully registered!");

        setShowAdminModal(false);
        setLastName("");
        setFirstName("");
        setPhoneNumber("");
        setSelectedRole("");
        setPassword("");
        setConfirmPassword("");

        router.push("/");
      } else {
        toast.error(data.message || "Registration failed.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-center flex items-center justify-center p-4 relative">
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 w-40 bg-blue-100 text-blue-950 font-semibold px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center shadow"
      >
        ← Back to Dashboard
      </button>

      <div className="w-full max-w-md bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-500">Register Employee Details</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Enter user name"
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Enter user name"
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    if (e.target.value.toLowerCase() === "admin") {
                      setError("You are not allowed to create an Admin account.");
                      return;
                    }
                    setSelectedRole(e.target.value);
                  }}
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>Select user role</option>
                  <option value="salesman">Salesman</option>
                  <option value="driver">Driver</option>
                  <option value="secretary">Secretary</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm user password"
                  className="w-full h-11 px-3 pr-10 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={selectedRole.toLowerCase() === "admin"}
          >
            Create account
          </button>
        </form>
      </div>

      {showAdminModal && (
        <AdminPasswordModal
          onClose={() => setShowAdminModal(false)}
          onConfirm={handleAdminConfirm}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
