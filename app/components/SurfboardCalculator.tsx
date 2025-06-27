"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Calculator,
  Ruler,
  Weight,
  Info,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { memo } from "react";

interface SurfboardRecommendation {
  length: string;
  width: string;
  thickness: string;
  volume: string;
  skillLevel: string;
  boardType: string;
  waveConditions: string[];
  tips: string[];
  seoKeywords: string[];
}

const SurfboardCalculator = memo(function SurfboardCalculator() {
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [recommendation, setRecommendation] =
    useState<SurfboardRecommendation | null>(null);

  const calculateSurfboard = useCallback(async () => {
    const weightNum = Number.parseFloat(weight);
    const heightNum = Number.parseFloat(height);

    if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
      alert("Please enter valid weight and height values");
      return;
    }

    setIsCalculating(true);

    // Simulate calculation time for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Enhanced surfboard calculation logic
    let baseVolume = weightNum * 0.4;
    let lengthMultiplier = 1.0;
    let widthBase = 20;
    let thicknessBase = 2.5;

    // Adjust based on skill level with more precise calculations
    switch (skillLevel) {
      case "beginner":
        baseVolume *= 1.3;
        lengthMultiplier = 1.15;
        widthBase = 22;
        thicknessBase = 2.8;
        break;
      case "intermediate":
        baseVolume *= 1.1;
        lengthMultiplier = 1.05;
        widthBase = 21;
        thicknessBase = 2.6;
        break;
      case "advanced":
        baseVolume *= 0.9;
        lengthMultiplier = 0.95;
        widthBase = 19.5;
        thicknessBase = 2.4;
        break;
    }

    // Calculate dimensions with better precision
    const length = (((heightNum * 2.54 + 15) * lengthMultiplier) / 12).toFixed(
      1,
    );
    const width = (widthBase + (weightNum - 70) * 0.05).toFixed(1);
    const thickness = (thicknessBase + (weightNum - 70) * 0.01).toFixed(1);
    const volume = baseVolume.toFixed(1);

    // Enhanced recommendations with SEO keywords
    let boardType = "Longboard";
    let waveConditions = ["Small to medium waves (1-4 feet)"];
    let tips = [];
    let seoKeywords = [];

    if (skillLevel === "beginner") {
      boardType = "Foam Longboard";
      waveConditions = [
        "Small waves (1-3 feet) - Perfect for Canggu Beach",
        "Beach breaks like Echo Beach and Berawa",
        "Gentle rolling waves at Batu Bolong",
        "Protected spots during monsoon season",
      ];
      tips = [
        "Start with foam boards for safety and easier learning in Bali waters",
        "Focus on paddling technique - essential for Canggu's currents",
        "Practice pop-up on the beach before entering water",
        "Always surf with supervision or take lessons from local Canggu instructors",
        "Best beginner spots: Batu Bolong, Echo Beach (small days), Berawa Beach",
      ];
      seoKeywords = [
        "beginner surfboard Bali",
        "learn to surf Canggu",
        "foam surfboard rental Bali",
      ];
    } else if (skillLevel === "intermediate") {
      boardType = Number.parseFloat(length) > 8.5 ? "Longboard" : "Funboard";
      waveConditions = [
        "Small to medium waves (2-5 feet) - Ideal for most Canggu spots",
        "Various break types including reef and beach breaks",
        "Consistent surf spots like Old Man's and Echo Beach",
        "Perfect for Uluwatu on smaller days",
      ];
      tips = [
        "Experiment with different board shapes for Bali's diverse waves",
        "Work on turning and wave selection at Canggu's multiple breaks",
        "Practice cross-stepping on longboards at Old Man's",
        "Start reading wave patterns - crucial for Bali's reef breaks",
        "Try different spots: Padang Padang, Bingin, Dreamland",
      ];
      seoKeywords = [
        "intermediate surfboard Bali",
        "funboard rental Canggu",
        "surf progression Bali",
      ];
    } else {
      boardType = Number.parseFloat(length) < 7 ? "Shortboard" : "Mid-length";
      waveConditions = [
        "Medium to large waves (3-8+ feet) - Perfect for Uluwatu, Padang Padang",
        "Reef breaks - Bingin, Impossibles, Dreamland",
        "Powerful surf spots during dry season (April-October)",
        "Advanced breaks like Desert Point (Lombok day trips)",
      ];
      tips = [
        "Focus on performance and maneuverability for Bali's world-class waves",
        "Consider wave-specific board designs for different Bali breaks",
        "Fine-tune your equipment for reef break conditions",
        "Explore different fin setups for various wave types",
        "Master spots: Uluwatu, Padang Padang, Bingin, Impossibles",
      ];
      seoKeywords = [
        "advanced surfboard Bali",
        "shortboard rental Uluwatu",
        "performance surfboard Bali",
      ];
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
      seoKeywords,
    };

    setRecommendation(result);
    setShowResult(true);
    setIsCalculating(false);
  }, [weight, height, skillLevel]);

  const resetCalculator = useCallback(() => {
    setWeight("");
    setHeight("");
    setSkillLevel("beginner");
    setShowResult(false);
    setRecommendation(null);
  }, []);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Surfboard Size Calculator - Bali",
      description:
        "Free surfboard size calculator for Bali surf conditions. Get personalized recommendations for Canggu, Uluwatu, and other Bali surf spots.",
      url: "https://summer.prayoga.io/#surfboard-calculator",
      applicationCategory: "Sports",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    }),
    [],
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section
        id="surfboard-calculator"
        className="section-padding bg-gradient-to-br from-teal/10 to-mint/20"
      >
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8 text-teal mr-3" />
              <h2 className="font-display font-bold text-3xl md:text-4xl">
                Surfboard Calculator
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find your perfect surfboard size for Bali's world-class waves. Get
              personalized measurements and skill level.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="bg-white px-3 py-1 rounded-full">
                #BaliSurfboard
              </span>
              <span className="bg-white px-3 py-1 rounded-full">
                #CangguSurf
              </span>
              <span className="bg-white px-3 py-1 rounded-full">
                #UluwatuSurf
              </span>
              <span className="bg-white px-3 py-1 rounded-full">
                #SurfboardCalculator
              </span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {!showResult ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="font-display font-bold text-xl mb-6 text-charcoal">
                      Your Measurements
                    </h3>

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
                        aria-label="Your weight in kilograms"
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
                        aria-label="Your height in centimeters"
                      />
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Info className="w-4 h-4 mr-2 text-teal" />
                        Surfing Experience Level
                      </label>
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal transition-colors"
                        aria-label="Your surfing skill level"
                      >
                        <option value="beginner">
                          Beginner (0-1 years) - New to surfing
                        </option>
                        <option value="intermediate">
                          Intermediate (1-3 years) - Can catch waves
                        </option>
                        <option value="advanced">
                          Advanced (3+ years) - Experienced surfer
                        </option>
                      </select>
                    </div>

                    <button
                      onClick={calculateSurfboard}
                      disabled={isCalculating}
                      className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isCalculating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Calculating Perfect Board...
                        </>
                      ) : (
                        "Calculate My Perfect Bali Surfboard"
                      )}
                    </button>
                  </div>

                  <div className="bg-mint/10 rounded-xl p-6">
                    <h4 className="font-display font-semibold text-lg mb-4 text-charcoal">
                      Bali Surf Conditions Guide
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Dry Season (April-October):</strong>{" "}
                          Consistent offshore winds, perfect for advanced
                          surfers at Uluwatu and Padang Padang
                        </span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Wet Season (November-March):</strong> Great
                          for beginners at Canggu beaches with smaller, more
                          forgiving waves
                        </span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Board Volume:</strong> Calculated based on
                          your weight, height, and Bali's unique wave
                          characteristics
                        </span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-teal mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Local Expertise:</strong> Recommendations
                          include the best Bali surf spots for your skill level
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">
                        🏄‍♂️ Popular Bali Surf Spots by Level:
                      </h5>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          <strong>Beginner:</strong> Batu Bolong, Echo Beach,
                          Berawa
                        </div>
                        <div>
                          <strong>Intermediate:</strong> Old Man's, Balangan,
                          Jimbaran
                        </div>
                        <div>
                          <strong>Advanced:</strong> Uluwatu, Padang Padang,
                          Bingin, Impossibles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="font-display font-bold text-2xl text-charcoal mb-2">
                    Your Perfect Bali Surfboard Recommendation
                  </h3>
                  <p className="text-gray-600">
                    Optimized for {recommendation?.skillLevel.toLowerCase()}{" "}
                    surfing in Bali's diverse wave conditions
                  </p>
                </div>

                {recommendation && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-display font-semibold text-xl mb-6 text-teal">
                        Board Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-charcoal">
                            {recommendation.length}
                          </div>
                          <div className="text-sm text-gray-600">Length</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-charcoal">
                            {recommendation.width}
                          </div>
                          <div className="text-sm text-gray-600">Width</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-charcoal">
                            {recommendation.thickness}
                          </div>
                          <div className="text-sm text-gray-600">Thickness</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-charcoal">
                            {recommendation.volume}
                          </div>
                          <div className="text-sm text-gray-600">Volume</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="font-semibold text-gray-700">
                            Recommended Board Type:
                          </span>
                          <span className="ml-2 text-teal font-medium">
                            {recommendation.boardType}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            Skill Level:
                          </span>
                          <span className="ml-2 text-coral font-medium">
                            {recommendation.skillLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-semibold text-xl mb-6 text-coral">
                        Perfect Bali Wave Conditions
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {recommendation.waveConditions.map(
                          (condition, index) => (
                            <li
                              key={index}
                              className="flex items-start text-gray-700 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-lime mr-2 mt-0.5 flex-shrink-0" />
                              {condition}
                            </li>
                          ),
                        )}
                      </ul>

                      <h4 className="font-display font-semibold text-xl mb-4 text-coral">
                        Bali Surf Pro Tips
                      </h4>
                      <ul className="space-y-2">
                        {recommendation.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-gray-700"
                          >
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
                      Calculate Another Board
                    </button>
                    <a
                      href={`https://wa.me/6285190459091?text=Hi! I used your Bali surfboard calculator and I'm interested in renting a ${
                        recommendation?.boardType
                      } (${recommendation?.length} x ${
                        recommendation?.width
                      } x ${
                        recommendation?.thickness
                      }) for ${recommendation?.skillLevel.toLowerCase()} level surfing in Bali. Can you help me with rental options in Canggu?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Rent This Board in Bali
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="container mx-auto px-4 py-10 max-w-5xl">
            {/* SEO Content Section */}
            <div className="p-6 sm:p-8">
              <h3 className="font-display font-bold text-2xl sm:text-3xl mb-6 text-center">
                Complete Guide to Surfboard Sizes in Bali
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-teal">
                    Beginner Surfboards for Bali
                  </h4>
                  <p className="mb-3">
                    If you're learning to surf in Bali, foam longboards (8'6" -
                    9'6") are perfect for Canggu's beginner-friendly beaches.
                    These boards offer maximum stability and safety in Bali's
                    tropical waters.
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• Best spots: Batu Bolong, Echo Beach, Berawa Beach</li>
                    <li>• Ideal conditions: 1-3 feet waves, onshore winds</li>
                    <li>• Board volume: 50-70 liters for most beginners</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-coral">
                    Advanced Boards for Bali Reefs
                  </h4>
                  <p className="mb-3">
                    Experienced surfers tackling Uluwatu, Padang Padang, and
                    Bingin need shorter, more maneuverable boards (5'8" - 6'4")
                    designed for Bali's powerful reef breaks.
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • Best spots: Uluwatu, Padang Padang, Bingin, Impossibles
                    </li>
                    <li>• Ideal conditions: 4-8+ feet waves, offshore winds</li>
                    <li>
                      • Board volume: 25-35 liters for performance surfing
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-mint/10 rounded-lg">
                <h5 className="font-semibold mb-2">
                  🌊 Bali Surf Season Guide
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong>Dry Season (April - October):</strong> Perfect for
                    advanced surfers. Consistent swells, offshore winds, and
                    world-class waves at Uluwatu peninsula.
                  </div>
                  <div>
                    <strong>Wet Season (November - March):</strong> Ideal for
                    beginners and intermediates. Smaller waves, warmer water,
                    and great learning conditions at Canggu beaches.
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA Section */}
            <div className="p-6 sm:p-8 text-center">
              <h4 className="font-display font-semibold text-lg sm:text-xl mb-3">
                🏄‍♂️ Need Local Bali Surf Expert Advice?
              </h4>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Our experienced local surf guides in Canggu know Bali's waves
                inside and out. Get personalized board recommendations, surf
                lessons, and insider tips for the best surf spots including
                Uluwatu, Padang Padang, Bingin, and hidden gems only locals know
                about.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://wa.me/6285190459091?text=Hi! I'd like to speak with a local Bali surf expert about choosing the right surfboard and getting surf lessons in Canggu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Talk to Bali Surf Expert
                </a>
                <a
                  href="https://wa.me/6285190459091?text=Hi! I want to book surf lessons in Bali and need equipment recommendations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Book Surf Lessons
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export default SurfboardCalculator;
