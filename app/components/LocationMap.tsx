interface LocationMapProps {
  title?: string
  description?: string
  className?: string
}

export default function LocationMap({
  title = "Our Service Areas in Bali",
  description = "We deliver premium beach and pool party equipment across Canggu and popular destinations in Bali",
  className = "",
}: LocationMapProps) {
  return (
    <section className={`section-padding ${className}`}>
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.321591232109!2d115.1319957!3d-8.6609338!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd247fab90d9005%3A0x5b91881172370ed4!2sSummer%20Party%20Canggu!5e0!3m2!1sen!2sid!4v1750933907385!5m2!1sen!2sid"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Summer Party Canggu Service Areas Map"
              className="w-full"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-mint/10 rounded-lg">
              <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">📍</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Primary Service Area</h3>
              <p className="text-gray-600 text-sm">Canggu, Echo Beach, Berawa, Batu Bolong, Pererenan</p>
            </div>

            <div className="text-center p-6 bg-coral/10 rounded-lg">
              <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">🚚</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Extended Delivery</h3>
              <p className="text-gray-600 text-sm">Seminyak, Uluwatu, Sanur, Ubud and surrounding areas</p>
            </div>

            <div className="text-center p-6 bg-lime/10 rounded-lg">
              <div className="w-12 h-12 bg-lime rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">⏰</span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Quick Response</h3>
              <p className="text-gray-600 text-sm">Same-day delivery available within Canggu area</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don't see your location? We're expanding our service areas across Bali.
            </p>
            <a
              href="https://wa.me/6285190459091?text=Hi! I'd like to check if you deliver to my area in Bali"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Check Service Availability
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
