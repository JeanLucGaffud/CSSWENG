"use client";
import { SessionProvider } from "next-auth/react";

export default function NextAuthProvider({ children, session }) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}