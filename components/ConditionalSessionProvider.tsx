"use client";

import { usePathname } from "next/navigation";
import NextAuthSessionProvider from "./SessionProvider";

export default function ConditionalSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // NextAuth now enabled for all pages - Jest worker issues resolved
  const disableNextAuth = false;

  if (disableNextAuth) {
    return <>{children}</>;
  }

  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}