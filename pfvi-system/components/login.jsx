"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from 'next/navigation'
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const activated = searchParams.get('activated')
  
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
    const result = await signIn('phone-credentials', {
      phoneNumber,
      password,
      redirect: false,
    });

    if (result?.ok) {
      const session = await getSession();
      
      if (session?.user?.role) {
        switch(session.user.role) {
          case 'secretary':
            router.push('/secretary');
            break;
          case 'driver':
            router.push('/driver');
            break;
          case 'salesman':
            router.push('/salesman');
            break;
          default:
            setError("Invalid user role");
        }
      } else {
        setError("Unable to determine user role");
      }
    } else {
      setError(result?.error || "Login failed");
    }
  } catch (error) {
    setError("An error occurred during login");
    console.error("Login error:", error);
  } finally {
    setIsLoading(false);
  }
  }
  
  return (
    <div className="min-h-screen bg-custom flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
        {/* header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </div>

        {activated && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            Your account has been activated. You can now log in.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          
          <div className="space-y-4">
            {/* phone # */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full h-11 px-3 border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
                required
              />
            </div>

            {/* pass */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* remember me & forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <label className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <button type="button" className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors">
              Forgot password?
            </button>
          </div>

          {/* sign in */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {/* sign up */}
          <p className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <button type="button" onClick={() => router.push('/register')} className="text-gray-900 hover:underline font-medium transition-colors">
              Sign up
            </button>
          </p>

        </form>
      </div>
    </div>
  )
}
