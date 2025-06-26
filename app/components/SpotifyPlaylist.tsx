import { Music, Play, Headphones } from "lucide-react"

interface SpotifyPlaylistProps {
  title?: string
  description?: string
  className?: string
}

export default function SpotifyPlaylist({
  title = "Summer Party Vibes",
  description = "Get in the mood with our curated playlist of the hottest summer tracks for your Canggu beach and pool parties",
  className = "",
}: SpotifyPlaylistProps) {
  return (
    <section className={`section-padding bg-gradient-to-br from-coral/10 to-mint/20 ${className}`}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-coral mr-3" />
            <h2 className="font-display font-bold text-3xl md:text-4xl">{title}</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Playlist Info */}
              <div className="lg:col-span-1">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-coral to-teal rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-3 text-charcoal">Official Summer Party Playlist</h3>
                  <p className="text-gray-600 mb-4">
                    Handpicked tracks that capture the essence of Canggu's beach culture and party atmosphere
                  </p>
                  <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Headphones className="w-4 h-4 mr-1" />
                      <span>Perfect for parties</span>
                    </div>
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      <span>Updated weekly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spotify Embed */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <iframe
                    style={{ borderRadius: "12px" }}
                    src="https://open.spotify.com/embed/playlist/5Imvn4GTLriTtH5x7Xj59e?utm_source=generator"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Summer Party Canggu Spotify Playlist"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-coral font-bold">🎵</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">Beach Vibes</h4>
                  <p className="text-xs text-gray-600">Perfect soundtrack for your beach day</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-teal font-bold">🏊‍♀️</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">Pool Party</h4>
                  <p className="text-xs text-gray-600">High-energy tracks for pool parties</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lime font-bold">🌅</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2">Sunset Sessions</h4>
                  <p className="text-xs text-gray-600">Chill beats for golden hour moments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto">
            <h4 className="font-display font-semibold text-lg mb-3">Need Sound Equipment?</h4>
            <p className="text-gray-600 mb-4">
              We provide waterproof speakers and sound systems to bring this playlist to life at your beach or pool
              party!
            </p>
            <a
              href="https://wa.me/6285190459091?text=Hi! I'm interested in renting sound equipment for my party in Canggu"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Rent Sound Equipment
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
