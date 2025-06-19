"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

export default function SignOutButton({ className }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // call the custom API endpoint
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // clear the NextAuth session
        await signOut({ 
          callbackUrl: "/login",
          redirect: true 
        });
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      // optional className prop for custom styling
      // default styles can be overridden
      className={`${className || "bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded transition-colors"}`}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </button>
  );
}