"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCheck({ requiredRole, children }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/check-auth')
        const data = await res.json()
        
        if (!res.ok || !data.authenticated) {
          router.push('/login')
          return
        }
        
        // Check if user has the required role
        if (requiredRole && data.user.role !== requiredRole) {
          // Redirect to their appropriate dashboard
          router.push(`/${data.user.role}`)
          return
        }
        
        setLoading(false)
      } catch (err) {
        console.error(err)
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router, requiredRole])
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return children
}