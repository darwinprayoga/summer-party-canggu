"use client"

import { useState } from "react"
import { Calculator, Ruler, Weight, Info, CheckCircle } from "lucide-react"

interface SurfboardRecommendation {
  length: string
  width: string
  thickness: string
  volume: string
  skillLevel: string
  boardType: string
  waveConditions: string[]
  tips: string[]
}

export default function SurfboardCalculator() {
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [skillLevel, setSkillLevel] = useState<string>("beginner")
  const [showResult, setShowResult] = useState<boolean>(false)
  const [recommendation, setRecommendation] = useState<SurfboardRecommendation | null>(null)

  const calculateSurfboard = () => {
    const weightNum = Number.parseFloat(weight)
    const heightNum = Number.parseFloat(height)

    if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
      alert("Please enter valid weight and height values")
      return
    }

    // Surfboard calculation logic based on weight, height, and skill level
    let baseVolume = weightNum * 0.4 // Base volume calculation
    let lengthMultiplier = 1.0
    let widthBase = 20
    let thicknessBase = 2.5

    // Adjust based on skill level
    switch (skillLevel) {
      case "beginner":
        baseVolume *= 1.3
        lengthMultiplier = 1.15
        widthBase = 22
        thicknessBase = 2.8
        break
      case "intermediate":
        baseVolume *= 1.1
        lengthMultiplier = 1.05
        widthBase = 21
        thicknessBase = 2.6
        break
      case "advanced":
        baseVolume *= 0.9
        lengthMultiplier = 0.95
        widthBase = 19.5
        thicknessBase = 2.4
        break
    }

    // Calculate dimensions
    const length = (((heightNum * 2.54 + 15) * lengthMultiplier) / 12).toFixed(1) // Convert to feet
    const width = (widthBase + (weightNum - 70) * 0.05).toFixed(1)
    const thickness = (thicknessBase + (weightNum - 70) * 0.01).toFixed(1)
    const volume = baseVolume.toFixed(1)

    // Determine board type and recommendations
    let boardType = "Longboard"
    let waveConditions = ["Small to medium waves (1-4 feet)"]
    let tips = []

    if (skillLevel === "beginner") {
      boardType = "Foam Longboard"
      waveConditions = ["Small waves (1-3 feet)", "Beach breaks", "Gentle rolling waves"]
      tips = [
        "Start with foam boards for safety and easier learning",
        "Focus on paddling technique and wave positioning",
        "Practice pop-up on the beach before entering water",
        "Always surf with supervision or take lessons",
      ]
    } else if (skillLevel === "intermediate") {
      boardType = Number.parseFloat(length) > 8.5 ? "Longboard" : "Funboard"
      waveConditions = ["Small to medium waves (2-5 feet)", "Various break types", "Consistent surf spots"]
      tips = [
        "Experiment with different board shapes",
        "Work on turning and wave selection",
        "Practice cross-stepping on longboards",
        "Start reading wave patterns more carefully",
      ]
    } else {
      boardType = Number.parseFloat(length) < 7 ? "Shortboard" : "Mid-length"
      waveConditions = ["Medium to large waves (3-8+ feet)", "Reef breaks", "Powerful surf spots"]
      tips = [
        "Focus on performance and maneuverability",
        "Consider wave-specific board designs",
        "Fine-tune your equipment for conditions",
        "Explore different fin setups",
      ]
    }

    const result: SurfboardRecommendation = {
      length: `${length}'`,
      width: `${width}"`,
      thickness: `${thickness}"`,
      volume: `${volume}L`,
      skillLevel: skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1),
      boardType,
      waveConditions,
      tips,
    }

    setRecommendation(result)
    setShowResult(true)
  }

  const resetCalculator = () => {
    setWeight("")
    setHeight("")
    setSkillLevel("beginner")
    setShowResult(false)
    setRecommendation(null)
  }

  return (
    <section className="section-padding bg-gradient-to-br from-teal/10 to-mint/20">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-teal mr-3" />
            <h2 className="font-display font-bold text-3xl md:text-4xl">Surfboard Size Calculator</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find your perfect surfboard size based on your body measurements and skill level
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!showResult ? (
            /* Calculator Form */
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl mb-6 text-charcoal">Your Measurements</h3>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Weight className="w-4 h-4 mr-2 text-teal" />
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Enter your weight in kg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal transition-colors"
                      min="30"
                      max="150"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Ruler className="w-4 h-4 mr-2 text-teal" />
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Enter your height in cm"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal transition-colors"
                      min="140"
                      max="220"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Info className="w-4 h-4 mr-2 text-teal" />
                      Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal transition-colors"
                    >
                      <option value="beginner">Beginner (0-1 years)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="advanced">Advanced (3+ years)</option>
                    </select>
                  </div>

                  <button onClick={calculateSurfboard} className="w-full btn-primary py-4 text-lg">
                    Calculate My Perfect Board
                  </button>
                </div>

                {/* Info Section */}
                <div className="bg-mint/10 rounded-xl p-6">
                  <h4 className="font-display font-semibold text-lg mb-4 text-charcoal">How It Works</h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                      <span>We calculate board volume based on your weight and skill level</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                      <span>Board length is determined by your height and experience</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                      <span>Width and thickness optimize stability and performance</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                      <span>Recommendations include board type and wave conditions</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Note:</strong> These calculations provide general recommendations. Personal preferences,
                      local wave conditions, and specific surfing goals may require adjustments. Consult with our surf
                      experts for personalized advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Section */
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h3 className="font-display font-bold text-2xl text-charcoal mb-2">Your Perfect Surfboard</h3>
                <p className="text-gray-600">Based on your measurements and skill level</p>
              </div>

              {recommendation && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Board Specifications */}
                  <div>
                    <h4 className="font-display font-semibold text-xl mb-6 text-teal">Board Specifications</h4>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-charcoal">{recommendation.length}</div>
                        <div className="text-sm text-gray-600">Length</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-charcoal">{recommendation.width}</div>
                        <div className="text-sm text-gray-600">Width</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-charcoal">{recommendation.thickness}</div>
                        <div className="text-sm text-gray-600">Thickness</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-charcoal">{recommendation.volume}</div>
                        <div className="text-sm text-gray-600">Volume</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold text-gray-700">Recommended Board Type:</span>
                        <span className="ml-2 text-teal font-medium">{recommendation.boardType}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Skill Level:</span>
                        <span className="ml-2 text-coral font-medium">{recommendation.skillLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-display font-semibold text-xl mb-6 text-coral">Wave Conditions</h4>
                    <ul className="space-y-2 mb-6">
                      {recommendation.waveConditions.map((condition, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-lime mr-2 flex-shrink-0" />
                          {condition}
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-display font-semibold text-xl mb-4 text-coral">Pro Tips</h4>
                    <ul className="space-y-2">
                      {recommendation.tips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-lime mr-2 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={resetCalculator} className="btn-secondary">
                    Calculate Again
                  </button>
                  <a
                    href={`https://wa.me/6285190459091?text=Hi! I used your surfboard calculator and I'm interested in renting a ${recommendation?.boardType} (${recommendation?.length} x ${recommendation?.width} x ${recommendation?.thickness}) for my ${recommendation?.skillLevel.toLowerCase()} level surfing in Canggu`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Rent This Board Size
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto">
            <h4 className="font-display font-semibold text-lg mb-3">Need Expert Advice?</h4>
            <p className="text-gray-600 mb-4">
              Our local surf experts in Canggu can help you choose the perfect board and provide lessons to match your
              skill level.
            </p>
            <a
              href="https://wa.me/6285190459091?text=Hi! I'd like to speak with a surf expert about choosing the right surfboard for Canggu waves"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Talk to Surf Expert
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
