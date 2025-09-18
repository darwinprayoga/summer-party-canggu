"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Phone,
  ArrowRight,
  CheckCircle,
  QrCode,
  MessageCircle,
  Share2,
  Trophy,
  DollarSign,
  Users,
  Copy,
} from "lucide-react";

type Step = "login" | "form" | "success";

interface UserData {
  phone: string;
  email: string;
  fullName: string;
  instagram: string;
  whatsapp: string;
  userId: string;
}

interface ReferralData {
  referrerUsername: string;
  myExpenses: number;
  myEarnings: number;
  referredUsers: Array<{
    username: string;
    expenses: number;
    earnings: number;
  }>;
}

interface LeaderboardEntry {
  username: string;
  expenses: number;
  rank: number;
}

export default function EventPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("referral");

  const [currentStep, setCurrentStep] = useState<Step>("login");
  const [loginMethod, setLoginMethod] = useState<"phone" | "google" | null>(
    null,
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    phone: "",
    email: "",
    fullName: "",
    instagram: "",
    whatsapp: "",
    userId: "",
  });

  const [referralData, setReferralData] = useState<ReferralData>({
    referrerUsername: "beach_vibes_bali",
    myExpenses: 1250000, // IDR
    myEarnings: 187500, // IDR (5% of 3,750,000)
    referredUsers: [
      { username: "surfergirl_indo", expenses: 850000, earnings: 42500 },
      { username: "bali_nomad_life", expenses: 1200000, earnings: 60000 },
      { username: "tropical_dreams", expenses: 1700000, earnings: 85000 },
    ],
  });

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { username: "party_king_canggu", expenses: 2500000, rank: 1 },
    { username: "bali_lifestyle", expenses: 2200000, rank: 2 },
    { username: "surf_and_party", expenses: 1950000, rank: 3 },
    {
      username: userData.instagram || "you",
      expenses: referralData.myExpenses,
      rank: 8,
    },
    { username: "beach_lover_id", expenses: 1100000, rank: 12 },
  ]);

  const [copiedReferral, setCopiedReferral] = useState(false);

  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/event?referral=${userData.userId}`;
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(generateReferralLink());
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (err) {
      console.error("Failed to copy referral link:", err);
    }
  };

  // Simulate phone OTP login
  const handlePhoneLogin = () => {
    if (!phoneNumber) return;
    setShowOtpInput(true);
  };

  const handleOtpVerification = () => {
    if (otpCode.length === 6) {
      // Simulate successful OTP verification
      setUserData((prev) => ({
        ...prev,
        phone: phoneNumber,
        whatsapp: phoneNumber, // Auto-fill WhatsApp with phone number
        email: "", // Will be filled in form
      }));
      setCurrentStep("form");
    }
  };

  // Simulate Google login
  const handleGoogleLogin = () => {
    // Simulate Google OAuth response
    const mockGoogleData = {
      phone: "+62 812-3456-7890",
      email: "user@gmail.com",
      whatsapp: "+62 812-3456-7890",
    };
    setUserData((prev) => ({
      ...prev,
      ...mockGoogleData,
    }));
    setCurrentStep("form");
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate user ID (simulate)
    const userId = `SP${Date.now().toString().slice(-6)}`;
    setUserData((prev) => ({ ...prev, userId }));
    setCurrentStep("success");
  };

  if (currentStep === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%5BSPC%5D%201st%20Poster%20-%20IG-n3sOlDEwhDML4dnjhrfIFVyz6zMEfj.png"
                alt="Summer Party Canggu"
                fill
                className="rounded-2xl object-cover"
              />
            </div>
            <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
              <span className="text-coral">SUMMER PARTY</span>{" "}
              <span className="text-teal italic">Canggu</span>
            </h1>
            <p className="text-charcoal/70">Saturday, September 27 • 2PM-9PM</p>

            {referralCode ? (
              <div className="bg-lime/10 border border-lime/20 rounded-xl p-4 mt-4">
                <p className="text-sm text-charcoal/80">
                  🎉 Hey, you are invited from{" "}
                  <span className="font-semibold text-lime">
                    @{referralData.referrerUsername}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-charcoal/60 mt-2">
                Please login to RSVP for this exclusive event
              </p>
            )}
          </div>

          {/* Login Options */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="space-y-4">
              {/* Phone Login */}
              <div className="space-y-3">
                <button
                  onClick={() => setLoginMethod("phone")}
                  className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    loginMethod === "phone"
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-gray-200 hover:border-teal/50 text-charcoal"
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-medium">
                    Continue with Phone Number
                  </span>
                </button>

                {loginMethod === "phone" && (
                  <div className="space-y-3 pl-4">
                    {!showOtpInput ? (
                      <div className="space-y-3">
                        <input
                          type="tel"
                          placeholder="+62 812-3456-7890"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        />
                        <button
                          onClick={handlePhoneLogin}
                          disabled={!phoneNumber}
                          className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Send OTP Code
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-charcoal/70">
                          Enter the 6-digit code sent to {phoneNumber}
                        </p>
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, ""))
                          }
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent text-center text-lg tracking-widest"
                        />
                        <button
                          onClick={handleOtpVerification}
                          disabled={otpCode.length !== 6}
                          className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Verify & Continue
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-charcoal/60">or</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-coral/50 text-charcoal transition-all hover:bg-coral/5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Continue with Google</span>
              </button>
            </div>

            <p className="text-xs text-charcoal/60 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-teal hover:text-teal/80 text-sm font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-teal" />
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal mb-2">
              Almost There!
            </h1>
            <p className="text-charcoal/70">Complete your RSVP details</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={userData.fullName}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Instagram Username */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Instagram Username *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-charcoal/60">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={userData.instagram}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      instagram: e.target.value,
                    }))
                  }
                  className="w-full p-3 pl-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="your_username"
                />
              </div>
            </div>

            {/* WhatsApp Number (Auto-filled) */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={userData.whatsapp}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, whatsapp: e.target.value }))
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-gray-50"
                placeholder="+62 812-3456-7890"
              />
              <p className="text-xs text-charcoal/60 mt-1">
                Auto-filled from your login method
              </p>
            </div>

            {/* Email (Auto-filled for Google, manual for phone) */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={userData.email}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent ${
                  userData.email ? "bg-gray-50" : ""
                }`}
                placeholder="your.email@example.com"
              />
              {userData.email && (
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from your Google account
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-coral text-white p-4 rounded-lg font-medium hover:bg-coral/90 transition-colors flex items-center justify-center gap-2"
            >
              Complete RSVP
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-lime" />
            </div>
            <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
              You're In!
            </h1>
            <p className="text-charcoal/70">Welcome to Summer Party Canggu</p>
          </div>

          <div className="space-y-6">
            {/* User ID & QR Code */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              {/* User Details */}
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-charcoal">
                  Hello, {userData.fullName}!
                </h2>
                <p className="text-charcoal/70">Your RSVP is confirmed</p>
              </div>

              {/* QR Code Section */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                    <QrCode className="w-16 h-16 text-charcoal/40" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal/60">Your Event ID</p>
                    <p className="text-2xl font-bold text-charcoal font-mono">
                      {userData.userId}
                    </p>
                  </div>
                  <p className="text-xs text-charcoal/60">
                    Show this QR code at the event entrance
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                <h4 className="font-medium text-charcoal mb-3">
                  Account Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Full Name:</span>
                    <span className="text-charcoal font-medium">
                      {userData.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Instagram:</span>
                    <span className="text-charcoal font-medium">
                      @{userData.instagram}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">WhatsApp:</span>
                    <span className="text-charcoal font-medium">
                      {userData.whatsapp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Email:</span>
                    <span className="text-charcoal font-medium">
                      {userData.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-coral/10 rounded-xl p-4 border border-coral/20 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Share2 className="w-6 h-6 text-coral" />
                  <h3 className="font-semibold text-charcoal">
                    Generate Referral Link
                  </h3>
                </div>
                <p className="text-sm text-charcoal/70 mb-4">
                  Invite friends and earn 5% of their event expenses!
                </p>
                <button
                  onClick={copyReferralLink}
                  className="w-full bg-coral text-white p-3 rounded-lg font-medium hover:bg-coral/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  {copiedReferral ? "Copied!" : "Copy Referral Link"}
                </button>
                {copiedReferral && (
                  <p className="text-xs text-lime mt-2 text-center">
                    Referral link copied to clipboard!
                  </p>
                )}
              </div>

              {/* WhatsApp Community */}
              <div className="bg-lime/10 rounded-xl p-4 border border-lime/20">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-6 h-6 text-lime" />
                  <h3 className="font-semibold text-charcoal">
                    Join Our Community
                  </h3>
                </div>
                <p className="text-sm text-charcoal/70 mb-4">
                  Get event updates, connect with other attendees, and stay in
                  the loop!
                </p>
                <a
                  href="https://chat.whatsapp.com/DUMMY_LINK_TO_BE_REPLACED"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-lime text-white p-3 rounded-lg font-medium hover:bg-lime/90 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Join WhatsApp Community
                </a>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-teal" />
                <h3 className="text-xl font-semibold text-charcoal">
                  My Event Expenses
                </h3>
              </div>
              <div className="bg-teal/10 rounded-xl p-4 border border-teal/20">
                <p className="text-3xl font-bold text-teal">
                  IDR {referralData.myExpenses.toLocaleString()}
                </p>
                <p className="text-sm text-charcoal/70 mt-1">
                  Total spent at this event
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-semibold text-charcoal">
                  Top Spenders Leaderboard
                </h3>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.username}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      entry.username === userData.instagram ||
                      entry.username === "you"
                        ? "bg-coral/10 border border-coral/20"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? "bg-amber-100 text-amber-600"
                            : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : index === 2
                            ? "bg-orange-100 text-orange-600"
                            : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        #{entry.rank}
                      </div>
                      <span className="font-medium text-charcoal">
                        @{entry.username}
                        {(entry.username === userData.instagram ||
                          entry.username === "you") &&
                          " (You)"}
                      </span>
                    </div>
                    <span className="font-semibold text-charcoal">
                      IDR {entry.expenses.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              {referralCode && (
                <div className="bg-lime/10 rounded-lg p-3 border border-lime/20 mb-4">
                  <p className="text-sm text-charcoal/70 text-center">
                    Your account connected to{" "}
                    <span className="font-semibold text-lime">
                      @{referralData.referrerUsername}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-lime" />
                <h3 className="text-xl font-semibold text-charcoal">
                  My Referral Connections
                </h3>
              </div>

              <div className="space-y-4">
                {referralData.referredUsers.map((user, index) => (
                  <div
                    key={index}
                    className="bg-lime/10 rounded-lg p-4 border border-lime/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-charcoal">
                        @{user.username}
                      </span>
                      <span className="text-sm text-charcoal/70">
                        IDR {user.expenses.toLocaleString()} spent
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal/70">
                        Your earnings (5%)
                      </span>
                      <span className="font-semibold text-lime">
                        +IDR {user.earnings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-lime" />
                <h3 className="text-xl font-semibold text-charcoal">
                  Total Referral Earnings
                </h3>
              </div>
              <div className="bg-lime/10 rounded-xl p-4 border border-lime/20">
                <p className="text-3xl font-bold text-lime">
                  IDR {referralData.myEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-charcoal/70 mt-1">
                  Earned from {referralData.referredUsers.length} referrals (5%
                  commission)
                </p>
              </div>
            </div>

            {/* Event Details Reminder */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="font-semibold text-charcoal mb-4">
                Event Details
              </h3>
              <div className="space-y-2 text-sm text-charcoal/70">
                <p>
                  <strong>Date:</strong> Saturday, September 27
                </p>
                <p>
                  <strong>Time:</strong> 2:00 PM - 9:00 PM
                </p>
                <p>
                  <strong>Venue:</strong> bauerhaus, Canggu, Bali
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 bg-white text-charcoal border border-gray-200 p-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Back to Home
              </Link>
              <Link
                href="https://www.instagram.com/p/DOp-l_NEvBy/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-coral text-white p-3 rounded-lg font-medium hover:bg-coral/90 transition-colors text-center"
              >
                Share on IG
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
