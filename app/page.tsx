import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container-custom section-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8 fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-coral/10 text-coral px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-coral rounded-full animate-pulse"></span>
                  Exclusive Pool Party Event
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-bold text-charcoal leading-tight text-balance">
                  <span className="text-coral">SUMMER</span>{" "}
                  <span className="text-charcoal">PARTY</span>
                  <br />
                  <span className="text-teal italic font-normal text-4xl md:text-5xl">
                    Canggu
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-charcoal/80 font-light text-pretty">
                  The exclusive pool party experience you've been waiting for
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-6 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-teal"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal/60 font-medium">
                        Date & Time
                      </p>
                      <p className="text-lg font-semibold text-charcoal">
                        Saturday, September 27
                      </p>
                      <p className="text-charcoal/80">2:00 PM - 9:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-coral"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal/60 font-medium">
                        Location
                      </p>
                      <p className="text-lg font-semibold text-charcoal">
                        Canggu
                      </p>
                      <p className="text-charcoal/80">Bali, Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/event"
                  className="btn-primary text-center inline-block"
                >
                  RSVP NOW!
                  <span className="ml-2">🎉</span>
                </Link>

                <Link
                  href="https://www.instagram.com/p/DOp-l_NEvBy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-center inline-block"
                >
                  Learn More
                  <span className="ml-2">📱</span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal">100+</p>
                  <p className="text-sm text-charcoal/60">Expected Guests</p>
                </div>
                <div className="w-px h-12 bg-charcoal/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-coral">7hrs</p>
                  <p className="text-sm text-charcoal/60">Non-stop Fun</p>
                </div>
                <div className="w-px h-12 bg-charcoal/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-lime">VIP</p>
                  <p className="text-sm text-charcoal/60">Experience</p>
                </div>
              </div>
            </div>

            {/* Event Poster */}
            <div className="relative slide-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/instagram-poster.png"
                  alt="Summer Party Canggu - Exclusive Pool Party at Canggu, Saturday September 27, 2PM-9PM"
                  width={600}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-coral rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-2xl">🏊‍♂️</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-teal rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-xl">🎵</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-mint/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-coral/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white/40 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-4">
              What to Expect
            </h2>
            <p className="text-lg text-charcoal/70 max-w-2xl mx-auto text-pretty">
              An unforgettable pool party experience in the heart of Canggu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🏊‍♂️</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal">
                Pool Vibes
              </h3>
              <p className="text-charcoal/70">
                Dive into the ultimate pool party atmosphere with crystal clear
                waters and tropical vibes
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal">
                Live Music
              </h3>
              <p className="text-charcoal/70">
                Dance to amazing beats from top DJs and live performances
                throughout the event
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-lime/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🍹</span>
              </div>
              <h3 className="text-xl font-semibold text-charcoal">
                Premium Drinks
              </h3>
              <p className="text-charcoal/70">
                Enjoy signature cocktails and refreshing beverages crafted by
                expert bartenders
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-gradient-to-r from-teal to-coral text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Make Waves?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto text-pretty">
            Don't miss out on Canggu's most exclusive pool party. Limited spots
            available!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/event"
              className="bg-white text-teal hover:bg-white/90 font-semibold py-4 px-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal transform hover:scale-105 active:scale-95 inline-block text-center"
            >
              RSVP NOW - Get Location Info
            </Link>

            <Link
              href="https://www.instagram.com/p/DOp-l_NEvBy/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-teal font-semibold py-4 px-8 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal transform hover:scale-105 active:scale-95 inline-block text-center"
            >
              View on Instagram
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
