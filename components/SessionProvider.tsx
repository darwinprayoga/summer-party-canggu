"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect } from "react";

export default function NextAuthSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  // Suppress NextAuth session errors in development due to Jest worker issues
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString?.() || '';

      // Suppress specific NextAuth session errors
      if (
        message.includes('[next-auth][error][CLIENT_FETCH_ERROR]') ||
        message.includes('api/auth/session') ||
        message.includes('api/auth/_log') ||
        message.includes('Unexpected token \'<\', "<!DOCTYPE "')
      ) {
        return; // Suppress these errors
      }

      // Let other errors through
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}