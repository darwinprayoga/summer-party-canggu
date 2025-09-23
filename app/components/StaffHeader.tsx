"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle, Menu, X, ChevronDown, User, LogOut, Shield } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z" />
  </svg>
);

export default function StaffHeader() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffData, setStaffData] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('staff_token');
    if (token) {
      setIsAuthenticated(true);
      // Try to get staff data from localStorage or decode from token
      const payload = JSON.parse(atob(token.split('.')[1]));
      setStaffData({ phone: payload.phone, staffId: payload.staffId });
    }
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('🚪 StaffHeader logout - Setting logout flag in localStorage');

      // Set logout flag to prevent automatic re-login
      localStorage.setItem('staff_explicitly_logged_out', 'true');

      // Clear staff token and state
      localStorage.removeItem('staff_token');
      setIsAuthenticated(false);
      setStaffData(null);
      setActiveDropdown(null);

      // Sign out from NextAuth if using Google OAuth
      if (session) {
        await signOut({ redirect: false });
      }

      console.log('✅ StaffHeader logout successful - logout flag set to prevent auto-login');

      // Refresh the page to reset authentication state
      window.location.reload();
    } catch (error) {
      console.error('❌ StaffHeader logout error:', error);
      // Still perform cleanup even if error occurs
      localStorage.setItem('staff_explicitly_logged_out', 'true');
      localStorage.removeItem('staff_token');
      setIsAuthenticated(false);
      setStaffData(null);
      setActiveDropdown(null);
      window.location.reload();
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%5BSPC%5D%201st%20Poster%20-%20IG-n3sOlDEwhDML4dnjhrfIFVyz6zMEfj.png"
                alt="Summer Party Canggu"
                fill
                className="rounded-lg object-cover"
                priority
              />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-charcoal">
                <span className="text-coral">SUMMER</span>{" "}
                <span className="text-teal italic">PARTY</span>
              </div>
              <div className="text-xs text-charcoal/60 -mt-1">CANGGU</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-charcoal hover:text-teal transition-colors">
              Home
            </Link>
            <Link href="/event" className="text-charcoal hover:text-teal transition-colors">
              Event
            </Link>
            <Link href="/blog" className="text-charcoal hover:text-teal transition-colors">
              Blog
            </Link>
            <Link href="/areas" className="text-charcoal hover:text-teal transition-colors">
              Areas
            </Link>
          </nav>

          {/* Social Links & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Social Links - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="https://instagram.com/summerpartycanggu"
                className="text-charcoal hover:text-coral transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://tiktok.com/@summerpartycanggu"
                className="text-charcoal hover:text-coral transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </Link>
              <Link
                href="https://wa.me/6282243019049"
                className="text-charcoal hover:text-teal transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>

            {/* Staff Indicator */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-teal/10 rounded-full">
              <div className="w-2 h-2 bg-teal rounded-full"></div>
              <span className="text-xs font-medium text-teal">STAFF PORTAL</span>
            </div>

            {/* Authentication Menu - Desktop */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "auth" ? null : "auth")}
                  className="flex items-center space-x-2 text-charcoal hover:text-teal transition-colors"
                >
                  <div className="w-8 h-8 bg-teal/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-teal" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {activeDropdown === "auth" && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-charcoal">Staff Portal</div>
                      {staffData?.phone && (
                        <div className="text-xs text-charcoal/60">{staffData.phone}</div>
                      )}
                      {staffData?.staffId && (
                        <div className="text-xs text-charcoal/60">ID: {staffData.staffId}</div>
                      )}
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-charcoal hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 text-charcoal/60">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Not Authenticated</span>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-charcoal hover:text-teal transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-charcoal hover:text-teal transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/event"
                className="text-charcoal hover:text-teal transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Event
              </Link>
              <Link
                href="/blog"
                className="text-charcoal hover:text-teal transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/areas"
                className="text-charcoal hover:text-teal transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Areas
              </Link>

              {/* Staff Indicator - Mobile */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-teal/10 rounded-lg mt-4">
                <div className="w-2 h-2 bg-teal rounded-full"></div>
                <span className="text-sm font-medium text-teal">STAFF PORTAL</span>
              </div>

              {/* Authentication - Mobile */}
              {isAuthenticated ? (
                <div className="border border-gray-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-teal" />
                    </div>
                    <span className="text-sm font-medium text-charcoal">Authenticated</span>
                  </div>
                  {staffData?.phone && (
                    <div className="text-xs text-charcoal/60 mb-1">{staffData.phone}</div>
                  )}
                  {staffData?.staffId && (
                    <div className="text-xs text-charcoal/60 mb-2">ID: {staffData.staffId}</div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-3 mt-4">
                  <div className="flex items-center space-x-2 text-charcoal/60">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Not Authenticated</span>
                  </div>
                </div>
              )}

              {/* Social Links - Mobile */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                <Link
                  href="https://instagram.com/summerpartycanggu"
                  className="text-charcoal hover:text-coral transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://tiktok.com/@summerpartycanggu"
                  className="text-charcoal hover:text-coral transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="https://wa.me/6282243019049"
                  className="text-charcoal hover:text-teal transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}