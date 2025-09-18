"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle, Menu, X, ChevronDown } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (dropdown: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // Small delay to prevent flickering
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        !(event.target as Element).closest(".mobile-menu-container")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const productCategories = [
    {
      name: "Beach Essentials",
      href: "/products#beach-essentials",
      icon: "🏖️",
    },
    { name: "Pool Day Gear", href: "/products#pool-day-gear", icon: "🏊‍♀️" },
    {
      name: "Party Essentials",
      href: "/products#party-essentials",
      icon: "🎉",
      isNew: true,
    },
  ];

  const areaCategories = [
    { name: "Canggu", href: "/areas/canggu", icon: "🏄‍♂️" },
    { name: "Echo Beach", href: "/areas/echo-beach", icon: "🌊" },
    { name: "Berawa", href: "/areas/berawa", icon: "🏖️" },
    { name: "Seminyak", href: "/areas/seminyak", icon: "🍸" },
    { name: "Uluwatu", href: "/areas/uluwatu", icon: "🏛️" },
    { name: "View All Areas", href: "/areas", icon: "📍" },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-mint/20">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.webp"
              alt="Summer Party Canggu Logo"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/tools"
              className="text-charcoal hover:text-teal transition-colors"
            >
              Tools
            </Link>

            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("products")}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center text-charcoal hover:text-teal transition-colors">
                Our Products
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {activeDropdown === "products" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {productCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-mint/10 hover:text-teal transition-colors"
                    >
                      <span className="text-xl mr-3">{category.icon}</span>
                      <div className="flex-1">
                        <span className="font-medium">{category.name}</span>
                        {category.isNew && (
                          <span className="ml-2 bg-coral text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className="text-charcoal hover:text-teal transition-colors"
            >
              Blog
            </Link>

            {/* Areas Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("areas")}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center text-charcoal hover:text-teal transition-colors">
                Our Areas
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {activeDropdown === "areas" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {areaCategories.map((area) => (
                    <Link
                      key={area.name}
                      href={area.href}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-mint/10 hover:text-teal transition-colors"
                    >
                      <span className="text-xl mr-3">{area.icon}</span>
                      <span className="font-medium">{area.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 ml-4">
              <a
                href="https://wa.me/6285190459091"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime hover:text-lime/80 transition-colors"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/summerparty.canggu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:text-red transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@summerparty.canggu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-charcoal hover:text-teal transition-colors"
                aria-label="Follow us on TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button & Social Icons */}
          <div className="flex items-center space-x-3">
            {/* Mobile Social Icons */}
            <a
              href="https://wa.me/6285190459091"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime hover:text-lime/80 transition-colors lg:hidden"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/summerparty.canggu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral hover:text-red transition-colors lg:hidden"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://www.tiktok.com/@summerparty.canggu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-charcoal hover:text-teal transition-colors lg:hidden"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-6 h-6" />
            </a>

            {/* Contact Button */}
            <a
              href="/event"
              rel="noopener noreferrer"
              className="btn-primary hidden sm:block"
            >
              RSVP NOW!
              <span className="ml-2">🎉</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal hover:text-teal transition-colors"
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
          <div className="mobile-menu-container lg:hidden">
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              <div className="container-custom py-6">
                <div className="space-y-6">
                  {/* Home */}
                  <Link
                    href="/tools"
                    onClick={closeMobileMenu}
                    className="block text-lg font-medium text-charcoal hover:text-teal transition-colors"
                  >
                    Tools
                  </Link>

                  {/* Products Section */}
                  <div>
                    <div className="text-lg font-medium text-charcoal mb-3">
                      Our Products
                    </div>
                    <div className="space-y-3 ml-4">
                      {productCategories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onClick={closeMobileMenu}
                          className="flex items-center text-gray-600 hover:text-teal transition-colors"
                        >
                          <span className="text-lg mr-3">{category.icon}</span>
                          <span>{category.name}</span>
                          {category.isNew && (
                            <span className="ml-2 bg-coral text-white px-2 py-0.5 rounded-full text-xs font-bold">
                              NEW
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Blog */}
                  <Link
                    href="/blog"
                    onClick={closeMobileMenu}
                    className="block text-lg font-medium text-charcoal hover:text-teal transition-colors"
                  >
                    Blog
                  </Link>

                  {/* Areas Section */}
                  <div>
                    <div className="text-lg font-medium text-charcoal mb-3">
                      Our Areas
                    </div>
                    <div className="space-y-3 ml-4">
                      {areaCategories.map((area) => (
                        <Link
                          key={area.name}
                          href={area.href}
                          onClick={closeMobileMenu}
                          className="flex items-center text-gray-600 hover:text-teal transition-colors"
                        >
                          <span className="text-lg mr-3">{area.icon}</span>
                          <span>{area.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Contact Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href="https://wa.me/6285190459091"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={closeMobileMenu}
                      className="btn-primary w-full text-center"
                    >
                      Contact Us on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
