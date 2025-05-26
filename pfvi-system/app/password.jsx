"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function AdminPassword() {
    const [showPassword, setShowPassword] = useState(false)
    const [adminPassword, setAdminPassword] = useState("")

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light text-gray-900 mb-2">Admin Verification</h1>
                    <p className="text-gray-500">Enter the administrative password provided to you</p>
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                        Administrative Password
                        </label>
                        <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter the password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
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

                    {/*Submit*/}
                    <button
                        type="submit"
                        className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Submit Password
                    </button>
                </form>
            </div>
        </div>
  )
}
