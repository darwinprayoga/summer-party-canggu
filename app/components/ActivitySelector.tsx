"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, MapPin, Clock, X } from "lucide-react"
import activities from "@/data/activities.json"
import locationRecommendations from "@/data/location-recommendations.json"

interface ActivityOption {
  id: string
  name: string
  emoji: string
  description: string
}

interface LocationRecommendation {
  name: string
  slug: string
  timeSlots: string[]
  description: string
  highlights: string[]
}

export default function ActivitySelector() {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
    setShowPopup(true)
  }

  const closePopup = () => {
    setSelectedActivity(null)
    setShowPopup(false)
  }

  const selectedActivityData = activities.find((a) => a.id === selectedActivity)
  const recommendations = selectedActivity ? locationRecommendations[selectedActivity] || [] : []

  return (
    <section className="section-padding bg-gradient-to-br from-mint/20 to-teal/10">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">What would you like to do today in Bali?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us your vibe and we'll recommend the perfect spots with our premium equipment
          </p>
        </div>

        {/* Activity Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleActivitySelect(activity.id)}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className="flex items-center mb-3">
                <span className="text-3xl mr-3">{activity.emoji}</span>
                <h3 className="font-display font-semibold text-lg text-charcoal group-hover:text-teal transition-colors">
                  {activity.name}
                </h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
              <div className="flex items-center text-teal font-medium text-sm">
                <span>Explore options</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Popup Modal */}
        {showPopup && selectedActivityData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Popup Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-4xl mr-3">{selectedActivityData.emoji}</span>
                    <div>
                      <h3 className="font-display font-bold text-2xl text-charcoal">
                        Perfect spots for {selectedActivityData.name}
                      </h3>
                      <p className="text-gray-600">Choose your ideal location and time</p>
                    </div>
                  </div>
                  <button
                    onClick={closePopup}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close popup"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Popup Content */}
              <div className="p-6">
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recommendations.map((location) => (
                      <div
                        key={location.slug}
                        className="bg-gray-50 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <MapPin className="w-5 h-5 text-coral mr-2" />
                            <h4 className="font-display font-bold text-xl text-charcoal">{location.name}</h4>
                          </div>

                          <p className="text-gray-600 mb-4">{location.description}</p>

                          <div className="mb-4">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Highlights:</h5>
                            <ul className="space-y-1">
                              {location.highlights.map((highlight, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-lime rounded-full mr-2 flex-shrink-0"></span>
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-6">
                            <h5 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Available Times:
                            </h5>
                            <div className="space-y-2">
                              {location.timeSlots.map((timeSlot, index) => (
                                <Link
                                  key={index}
                                  href={`/areas/${location.slug}?activity=${selectedActivity}&time=${encodeURIComponent(timeSlot)}`}
                                  onClick={closePopup}
                                  className="block bg-mint/20 hover:bg-mint/40 text-teal font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                                >
                                  {selectedActivityData.name} in {location.name} {timeSlot.toLowerCase()}
                                </Link>
                              ))}
                            </div>
                          </div>

                          <Link
                            href={`/areas/${location.slug}`}
                            onClick={closePopup}
                            className="btn-primary w-full text-center"
                          >
                            View {location.name} Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">{selectedActivityData.emoji}</div>
                    <h4 className="font-display font-bold text-xl mb-4">
                      {selectedActivityData.name} Recommendations Coming Soon!
                    </h4>
                    <p className="text-gray-600 mb-6">
                      We're working on curating the best spots for {selectedActivityData.name.toLowerCase()}. Contact us
                      for personalized recommendations!
                    </p>
                    <a
                      href={`https://wa.me/6285190459091?text=Hi! I'm interested in ${selectedActivityData.name.toLowerCase()} recommendations in Bali`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      onClick={closePopup}
                    >
                      Get Personal Recommendations
                    </a>
                  </div>
                )}

                {/* Equipment CTA */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-teal/10 to-coral/10 rounded-xl p-6 text-center">
                    <h4 className="font-display font-bold text-xl mb-4">Need Equipment for Your Adventure?</h4>
                    <p className="text-gray-600 mb-6">
                      We provide all the premium equipment you need for your {selectedActivityData.name.toLowerCase()}{" "}
                      experience
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={`https://wa.me/6285190459091?text=Hi! I'm interested in ${selectedActivityData.name.toLowerCase()} equipment in Bali`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        onClick={closePopup}
                      >
                        Get Equipment Quote
                      </a>
                      <Link href="/products" className="btn-secondary" onClick={closePopup}>
                        Browse All Equipment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
