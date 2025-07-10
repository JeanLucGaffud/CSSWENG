"use client";

import { SessionProvider, useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function NextAuthProvider({ children, session }) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // every 5 minutes
      refetchOnWindowFocus={true}
    >
      <SessionManager>{children}</SessionManager>
    </SessionProvider>
  );
}

function SessionManager({ children }) {
  const { data: session, status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [countdown, setCountdown] = useState(60); // seconds

  // Start 60s warning countdown before logout
  const startWarningCountdown = () => {
    setShowWarning(true);
    let seconds = 60;

    const id = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);

      if (seconds <= 0) {
        clearInterval(id);
        signOut({ callbackUrl: "/login" });
      }
    }, 1000);

    setTimeoutId(id);
  };

  const clearWarning = () => {
    if (timeoutId) clearInterval(timeoutId);
    setShowWarning(false);
    setCountdown(60);
  };

  // Poll session expiration
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentSession = await getSession();
      if (!currentSession?.expires) return;

      const expiresAt = new Date(currentSession.expires).getTime();
      const now = Date.now();
      const timeLeft = expiresAt - now;

      // if less than 60s left and warning not shown
      if (timeLeft <= 60_000 && !showWarning) {
        startWarningCountdown();
      }
    }, 30_000); // Check every 30s

    return () => clearInterval(interval);
  }, [showWarning]);

  return (
    <>
      {children}

      {showWarning && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded shadow-lg z-50">
          <p className="font-medium">You've been inactive.</p>
          <p>Logging out in {countdown} second{countdown !== 1 ? "s" : ""}…</p>
          <button
            onClick={clearWarning}
            className="mt-2 underline text-sm text-yellow-900 hover:text-yellow-700"
          >
            I'm still here
          </button>
        </div>
      )}
    </>
  );
}
