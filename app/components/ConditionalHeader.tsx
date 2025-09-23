"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import StaffHeader from "./StaffHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Use simplified header on staff page to avoid NextAuth dependency
  if (pathname === "/staff") {
    return <StaffHeader />;
  }

  return <Header />;
}