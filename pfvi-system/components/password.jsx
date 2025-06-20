"use client"

import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from 'next/navigation'

export default function AdminPassword() {
    const [showPassword, setShowPassword] = useState(false)
    const [adminPassword, setAdminPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const phoneNumber = searchParams.get('phoneNumber')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        
        try {
            const res = await fetch('/api/validate-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    adminPassword,
                    phoneNumber
                }),
            })
            
            const data = await res.json()
            
            if (res.ok) {
                // Redirect to login page on success
                router.push('/login?activated=true')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-custom flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light text-gray-900 mb-2">Admin Verification</h1>
                    <p className="text-gray-500">Enter the administrative password provided to you</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                        disabled={isLoading}
                        className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70"
                    >
                        {isLoading ? "Validating..." : "Submit Password"}
                    </button>
                </form>
            </div>
        </div>
    )
}
