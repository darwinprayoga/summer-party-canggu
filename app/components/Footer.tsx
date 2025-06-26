import Link from "next/link"
import Image from "next/image"
import { Instagram, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/favicon.webp"
                alt="Summer Party Canggu Watermelon Icon"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-display font-bold text-lg">Summer Party Canggu</span>
            </div>
            <p className="text-gray-300 mb-4">
              Premium beach and pool essentials in Canggu, Bali. Everything you need for the perfect summer party.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/areas" className="text-gray-300 hover:text-white transition-colors">
                  Our Areas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Our Products</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products#beach-essentials" className="text-gray-300 hover:text-white transition-colors">
                  Beach Essentials
                </Link>
              </li>
              <li>
                <Link href="/products#pool-day-gear" className="text-gray-300 hover:text-white transition-colors">
                  Pool Day Gear
                </Link>
              </li>
              <li>
                <Link href="/products#party-essentials" className="text-gray-300 hover:text-white transition-colors">
                  <span className="flex items-center">
                    Party Essentials
                    <span className="ml-2 bg-coral text-white px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://wa.me/6285190459091"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/summerparty.canggu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-300">&copy; 2024 Summer Party Canggu. All rights reserved.</p>
            </div>

            {/* PRAYOGA.io Credit */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">Developed by</span>
              <a href="https://prayoga.io" target="_blank" rel="noopener noreferrer" className="flex">
                <Image
                  src="/prayoga-io.svg"
                  alt="PRAYOGA.io Logo"
                  width={100}
                  height={24}
                  className="group-hover:scale-110 transition-transform"
                />
              </a>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-xs md:text-right">
              Full-service digital agency specializing in design, development, and branding
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
