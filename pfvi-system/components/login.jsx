"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"

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
        const session = await getSession()

        if (session?.user?.role) {
          switch (session.user.role) {
            case 'secretary':
              router.push('/secretary')
              break
            case 'driver':
              router.push('/driver')
              break
            case 'salesman':
              router.push('/salesman')
              break
            default:
              setError("Invalid user role")
          }
        } else {
          setError("Unable to determine user role")
        }
      } else {
        setError(result?.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred during login")
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col md:flex-row overflow-hidden">

        {/* Left: For Customers */}
        <div className="w-full md:w-7/12 bg-gray-50 px-8 py-12 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-gray-500 mb-2 uppercase">For Customers</h2>
          <img
            src="/logo.png"
            alt="PFVI Logo"
            className="w-full max-w-[180px] mb-4"
          />
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            PFVI Delivery Tracker System
          </h3>
          <img
            src="/delivery.png"
            alt="Box with wings"
            className="w-full max-w-[240px] h-auto mb-6"
          />
          <p className="text-gray-600 mb-4 text-sm">
            View your order status and details here
          </p>
          <button
            type="button"
            onClick={() => router.push("/customer")}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-base font-semibold rounded-md shadow-md transition"
          >
            {isLoading ? "Loading..." : "Find My Order"}
          </button>
        </div>

        {/* Right: For Employees */}
        <div className="w-full md:w-5/12 px-8 py-10 flex flex-col justify-center">
          <h2 className="text-xl font-semibold text-gray-500 mb-2 uppercase">For Employees</h2>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome back</h1>
          <p className="text-gray-600 mb-6 text-sm">Sign in to your account to continue</p>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm pr-10 focus:outline-none focus:ring focus:ring-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="h-4 w-4 border-gray-300 rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-gray-600 hover:text-gray-900 underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2 rounded-md transition"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
