"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  CheckCircle,
  Trophy,
  DollarSign,
  Users,
  Settings,
  Edit3,
  Calendar,
  MapPin,
  Clock,
  Save,
  X,
  UserCheck,
  Check,
  Shield,
} from "lucide-react";

type Step = "login" | "form" | "approval" | "dashboard";

interface AdminData {
  phone: string;
  email: string;
  fullName: string;
  instagram: string;
  whatsapp: string;
  adminId: string;
}

interface ExpenseEntry {
  id: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: string;
  staffId: string;
  staffName: string;
}

interface EventData {
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  maxCapacity: number;
  currentAttendees: number;
}

interface RegistrationData {
  id: string;
  fullName: string;
  instagramUsername: string;
  email: string;
  whatsappNumber: string;
  appliedAt: string;
  loginMethod: string;
}

export default function AdminPage() {
  const [currentStep, setCurrentStep] = useState<Step>("login");
  const [loginMethod, setLoginMethod] = useState<"phone" | "google" | null>(
    null,
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [adminData, setAdminData] = useState<AdminData>({
    phone: "",
    email: "",
    fullName: "",
    instagram: "",
    whatsapp: "",
    adminId: "",
  });

  const [expenseHistory] = useState<ExpenseEntry[]>([
    {
      id: "EXP001",
      userId: "SP006351",
      username: "beach_vibes_bali",
      amount: 250000,
      timestamp: "2024-09-27 14:30:00",
      staffId: "STF001",
      staffName: "Made Wirawan",
    },
    {
      id: "EXP002",
      userId: "SP006352",
      username: "surfergirl_indo",
      amount: 180000,
      timestamp: "2024-09-27 15:15:00",
      staffId: "STF002",
      staffName: "Kadek Sari",
    },
    {
      id: "EXP003",
      userId: "SP006353",
      username: "bali_nomad_life",
      amount: 320000,
      timestamp: "2024-09-27 16:00:00",
      staffId: "STF001",
      staffName: "Made Wirawan",
    },
    {
      id: "EXP004",
      userId: "SP006354",
      username: "tropical_dreams",
      amount: 450000,
      timestamp: "2024-09-27 16:45:00",
      staffId: "STF003",
      staffName: "Wayan Agus",
    },
    {
      id: "EXP005",
      userId: "SP006355",
      username: "party_king_canggu",
      amount: 680000,
      timestamp: "2024-09-27 17:30:00",
      staffId: "STF002",
      staffName: "Kadek Sari",
    },
  ]);

  const [leaderboard] = useState([
    {
      username: "party_king_canggu",
      expenses: 2500000,
      referrals: 8,
      earnings: 625000,
    },
    {
      username: "bali_lifestyle",
      expenses: 2200000,
      referrals: 5,
      earnings: 412500,
    },
    {
      username: "surf_and_party",
      expenses: 1950000,
      referrals: 12,
      earnings: 780000,
    },
    {
      username: "beach_vibes_bali",
      expenses: 1250000,
      referrals: 3,
      earnings: 187500,
    },
    {
      username: "tropical_dreams",
      expenses: 1100000,
      referrals: 7,
      earnings: 385000,
    },
  ]);

  const [referralStructure] = useState({
    totalUsers: 156,
    totalReferrals: 89,
    topReferrers: [
      { username: "party_king_canggu", referrals: 12, level: "Gold" },
      { username: "surf_and_party", referrals: 8, level: "Silver" },
      { username: "bali_lifestyle", referrals: 5, level: "Bronze" },
    ],
    referralLevels: {
      gold: 8, // 12+ referrals
      silver: 15, // 5-11 referrals
      bronze: 23, // 1-4 referrals
      none: 110, // 0 referrals
    },
    referralNetwork: [
      {
        id: "party_king_canggu",
        username: "party_king_canggu",
        level: "Gold",
        referrals: [
          {
            id: "beach_vibes_1",
            username: "beach_vibes_bali",
            level: "Bronze",
          },
          { id: "surf_life_1", username: "surf_life_indo", level: "Silver" },
          { id: "nomad_1", username: "bali_nomad_life", level: "Bronze" },
          { id: "tropical_1", username: "tropical_dreams", level: "Bronze" },
        ],
      },
      {
        id: "surf_and_party",
        username: "surf_and_party",
        level: "Silver",
        referrals: [
          {
            id: "wave_rider_1",
            username: "wave_rider_canggu",
            level: "Bronze",
          },
          { id: "sunset_1", username: "sunset_chaser", level: "None" },
          {
            id: "beach_lover_1",
            username: "beach_lover_bali",
            level: "Bronze",
          },
        ],
      },
      {
        id: "bali_lifestyle",
        username: "bali_lifestyle",
        level: "Bronze",
        referrals: [
          { id: "island_1", username: "island_hopper", level: "None" },
          { id: "yoga_1", username: "yoga_retreat_bali", level: "Bronze" },
        ],
      },
    ],
  });

  const [eventData, setEventData] = useState<EventData>({
    name: "Summer Party Canggu",
    date: "2024-09-27",
    time: "14:00-21:00",
    venue: "Canggu, Bali, Indonesia",
    description:
      "The ultimate summer party experience in Canggu with live music, food, and drinks.",
    maxCapacity: 200,
    currentAttendees: 156,
  });

  const [extendedEventData, setExtendedEventData] = useState({
    bannerImage:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%5BSPC%5D%201st%20Poster%20-%20IG-n3sOlDEwhDML4dnjhrfIFVyz6zMEfj.png",
    mainPageAnnouncement:
      "🎉 Summer Party Canggu is happening! Join us for the ultimate beach party experience with live music, food, and drinks. Limited spots available!",
    customerPageAnnouncement:
      "Welcome to Summer Party Canggu! Get ready for an unforgettable experience. Don't forget to bring your friends and earn rewards through our referral system!",
    eventHighlights: [
      "Live DJ performances",
      "Beachfront location",
      "Premium food & drinks",
      "Referral rewards system",
      "Exclusive merchandise",
    ],
    socialMediaLinks: {
      instagram: "@summerpartycanggu",
      whatsapp: "+62 812-3456-7890",
    },
  });

  const [editingEvent, setEditingEvent] = useState(false);
  const [editEventData, setEditEventData] = useState<EventData>(eventData);

  const totalExpenses = expenseHistory.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const totalReferralEarnings = leaderboard.reduce(
    (sum, user) => sum + user.earnings,
    0,
  );

  const [pendingRegistrations, setPendingRegistrations] = useState({
    staff: [
      {
        id: "STF001",
        fullName: "Sarah Johnson",
        instagramUsername: "sarahjohnson",
        email: "sarah@example.com",
        whatsappNumber: "+62 812-3456-7890",
        appliedAt: "2024-01-15 14:30",
        loginMethod: "Google",
      },
      {
        id: "STF002",
        fullName: "Mike Chen",
        instagramUsername: "mikechen",
        email: "mike@example.com",
        whatsappNumber: "+62 813-4567-8901",
        appliedAt: "2024-01-15 16:45",
        loginMethod: "Instagram",
      },
    ],
    admin: [
      {
        id: "ADM001",
        fullName: "Alex Rodriguez",
        instagramUsername: "alexrodriguez",
        email: "alex@example.com",
        whatsappNumber: "+62 814-5678-9012",
        appliedAt: "2024-01-14 10:20",
        loginMethod: "Google",
      },
    ],
  });

  const [approvedRegistrations, setApprovedRegistrations] = useState({
    staff: [
      {
        id: "STF003",
        fullName: "Emma Wilson",
        instagramUsername: "emmawilson",
        approvedAt: "2024-01-10 09:15",
      },
      {
        id: "STF004",
        fullName: "David Kim",
        instagramUsername: "davidkim",
        approvedAt: "2024-01-12 11:30",
      },
    ],
    admin: [
      {
        id: "ADM002",
        fullName: "Lisa Thompson",
        instagramUsername: "lisathompson",
        approvedAt: "2024-01-08 14:45",
      },
    ],
  });

  const handleApproval = (
    id: string,
    type: "staff" | "admin",
    action: "approved" | "denied",
  ) => {
    console.log(`[v0] ${action} ${type} registration:`, id);

    if (action === "approved") {
      // Move from pending to approved
      const pendingItem = pendingRegistrations[type].find(
        (item) => item.id === id,
      );
      if (pendingItem) {
        setApprovedRegistrations((prev) => ({
          ...prev,
          [type]: [
            ...prev[type],
            {
              id: pendingItem.id,
              fullName: pendingItem.fullName,
              instagramUsername: pendingItem.instagramUsername,
              approvedAt: new Date().toLocaleString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        }));
      }
    }

    // Remove from pending regardless of action
    setPendingRegistrations((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== id),
    }));
  };

  const handleApproval_old = (
    id: string,
    type: "staff" | "admin",
    action: "approved" | "denied",
  ) => {
    if (type === "staff") {
      const registration = pendingRegistrations.staff.find(
        (staff) => staff.id === id,
      );
      if (registration) {
        setPendingRegistrations((prev) => ({
          ...prev,
          staff: prev.staff.filter((staff) => staff.id !== id),
        }));

        if (action === "approved") {
          setApprovedRegistrations((prev: any) => ({
            ...prev,
            staff: [...prev.staff, registration],
          }));
        }
      }
    } else if (type === "admin") {
      const registration = pendingRegistrations.admin.find(
        (admin) => admin.id === id,
      );
      if (registration) {
        setPendingRegistrations((prev) => ({
          ...prev,
          admin: prev.admin.filter((admin) => admin.id !== id),
        }));

        if (action === "approved") {
          setApprovedRegistrations((prev: any) => ({
            ...prev,
            admin: [...prev.admin, registration],
          }));
        }
      }
    }
  };

  // Simulate phone OTP login
  const handlePhoneLogin = () => {
    if (!phoneNumber) return;
    setShowOtpInput(true);
  };

  const handleOtpVerification = () => {
    if (otpCode.length === 6) {
      setAdminData((prev) => ({
        ...prev,
        phone: phoneNumber,
        whatsapp: phoneNumber,
        email: "",
      }));
      setCurrentStep("form");
    }
  };

  // Simulate Google login
  const handleGoogleLogin = () => {
    const mockGoogleData = {
      phone: "+62 812-3456-7890",
      email: "admin@summerpartycanggu.com",
      whatsapp: "+62 812-3456-7890",
    };
    setAdminData((prev) => ({
      ...prev,
      ...mockGoogleData,
    }));
    setCurrentStep("form");
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = `ADM${Date.now().toString().slice(-6)}`;
    setAdminData((prev) => ({ ...prev, adminId }));
    setCurrentStep("approval");
  };

  const [approvalStatus, setApprovalStatus] = useState<
    "pending" | "approved" | "denied"
  >("pending");

  const simulateApprovalCheck = () => {
    // Simulate approval check - in real app, this would be an API call
    const statuses: ("pending" | "approved" | "denied")[] = [
      "approved",
      "denied",
      "pending",
    ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setApprovalStatus(randomStatus);
  };

  const handleSaveEvent = () => {
    setEventData(editEventData);
    setEditingEvent(false);
  };

  const handleCancelEdit = () => {
    setEditEventData(eventData);
    setEditingEvent(false);
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
              <span className="text-coral">ADMIN</span>{" "}
              <span className="text-teal italic">Portal</span>
            </h1>
            <p className="text-charcoal/70">Summer Party Canggu Management</p>
            <p className="text-sm text-charcoal/60 mt-2">
              Admin access required
            </p>
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
              Admin access only. Unauthorized access is prohibited.
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
              Admin Details
            </h1>
            <p className="text-charcoal/70">Complete your admin profile</p>
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
                value={adminData.fullName}
                onChange={(e) =>
                  setAdminData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
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
                  value={adminData.instagram}
                  onChange={(e) =>
                    setAdminData((prev) => ({
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
                value={adminData.whatsapp}
                onChange={(e) =>
                  setAdminData((prev) => ({
                    ...prev,
                    whatsapp: e.target.value,
                  }))
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
                value={adminData.email}
                onChange={(e) =>
                  setAdminData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent ${
                  adminData.email ? "bg-gray-50" : ""
                }`}
                placeholder="admin@summerpartycanggu.com"
              />
              {adminData.email && (
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from your Google account
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-coral text-white p-4 rounded-lg font-medium hover:bg-coral/90 transition-colors flex items-center justify-center gap-2"
            >
              Access Admin Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentStep === "approval") {
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
              <span className="text-coral">ADMIN</span>{" "}
              <span className="text-teal italic">Approval</span>
            </h1>
            <p className="text-charcoal/70">Registration Status</p>
          </div>

          {/* Approval Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            {approvalStatus === "pending" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Approval Pending
                </h2>
                <p className="text-charcoal/70">
                  Your admin registration is being reviewed by the owner. Please
                  wait for approval.
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Admin ID:</strong> {adminData.adminId}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Name:</strong> {adminData.fullName}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Instagram:</strong> @{adminData.instagram}
                  </p>
                </div>
                <button
                  onClick={simulateApprovalCheck}
                  className="w-full bg-yellow-500 text-white p-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  Check Approval Status
                </button>
              </div>
            )}

            {approvalStatus === "approved" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Registration Approved!
                </h2>
                <p className="text-charcoal/70">
                  Congratulations! Your admin registration has been approved by
                  the owner.
                </p>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Admin ID:</strong> {adminData.adminId}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Status:</strong> Active Administrator
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep("dashboard")}
                  className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Access Admin Dashboard
                </button>
              </div>
            )}

            {approvalStatus === "denied" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Registration Denied
                </h2>
                <p className="text-charcoal/70">
                  Unfortunately, your admin registration has been denied by the
                  owner.
                </p>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800">
                    Please contact the event organizer for more information or
                    to reapply.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentStep("login");
                    setAdminData({
                      phone: "",
                      email: "",
                      fullName: "",
                      instagram: "",
                      whatsapp: "",
                      adminId: "",
                    });
                    setApprovalStatus("pending");
                  }}
                  className="w-full bg-red-600 text-white p-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>

          {/* Back to Form */}
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentStep("form")}
              className="text-teal hover:text-teal/80 text-sm font-medium"
            >
              ← Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
                  <span className="text-coral">Admin</span>{" "}
                  <span className="text-teal italic">Dashboard</span>
                </h1>
                <p className="text-charcoal/70">
                  Welcome back, {adminData.fullName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-charcoal/60">Admin ID</p>
                <p className="font-mono font-bold text-charcoal">
                  {adminData.adminId}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-coral" />
              <h3 className="text-xl font-semibold text-charcoal">
                Staff & Admin Management
              </h3>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-2xl font-bold text-amber-600">
                  {pendingRegistrations.staff.length}
                </p>
                <p className="text-sm text-charcoal/70">Pending Staff</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">
                  {approvedRegistrations.staff.length}
                </p>
                <p className="text-sm text-charcoal/70">Active Staff</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">
                  {pendingRegistrations.admin.length}
                </p>
                <p className="text-sm text-charcoal/70">Pending Admins</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-2xl font-bold text-green-600">
                  {approvedRegistrations.admin.length}
                </p>
                <p className="text-sm text-charcoal/70">Active Admins</p>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="space-y-6">
              {/* Staff Pending */}
              {pendingRegistrations.staff.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Pending Staff Approvals ({pendingRegistrations.staff.length}
                    )
                  </h4>
                  <div className="space-y-3">
                    {pendingRegistrations.staff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium text-charcoal">
                                {staff.fullName}
                              </p>
                              <p className="text-sm text-charcoal/60">
                                @{staff.instagramUsername}
                              </p>
                            </div>
                            <div className="text-sm text-charcoal/70">
                              <p>{staff.email}</p>
                              <p>{staff.whatsappNumber}</p>
                            </div>
                            <div className="text-xs text-charcoal/50">
                              <p>Applied: {staff.appliedAt}</p>
                              <p>Login: {staff.loginMethod}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproval(staff.id, "staff", "approved")
                            }
                            className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApproval(staff.id, "staff", "denied")
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Pending */}
              {pendingRegistrations.admin.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    Pending Admin Approvals ({pendingRegistrations.admin.length}
                    )
                  </h4>
                  <div className="space-y-3">
                    {pendingRegistrations.admin.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium text-charcoal">
                                {admin.fullName}
                              </p>
                              <p className="text-sm text-charcoal/60">
                                @{admin.instagramUsername}
                              </p>
                            </div>
                            <div className="text-sm text-charcoal/70">
                              <p>{admin.email}</p>
                              <p>{admin.whatsappNumber}</p>
                            </div>
                            <div className="text-xs text-charcoal/50">
                              <p>Applied: {admin.appliedAt}</p>
                              <p>Login: {admin.loginMethod}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproval(admin.id, "admin", "approved")
                            }
                            className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApproval(admin.id, "admin", "denied")
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Staff & Admins */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Staff */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Active Staff ({approvedRegistrations.staff.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {approvedRegistrations.staff.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div>
                          <p className="font-medium text-charcoal text-sm">
                            {staff.fullName}
                          </p>
                          <p className="text-xs text-charcoal/60">
                            @{staff.instagramUsername}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-charcoal/70">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Admins */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Active Admins ({approvedRegistrations.admin.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {approvedRegistrations.admin.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div>
                          <p className="font-medium text-charcoal text-sm">
                            {admin.fullName}
                          </p>
                          <p className="text-xs text-charcoal/60">
                            @{admin.instagramUsername}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-charcoal/70">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-semibold text-charcoal">
                Expense Leaderboard
              </h3>
            </div>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
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
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">
                        @{user.username}
                      </p>
                      <p className="text-sm text-charcoal/60">
                        {user.referrals} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal">
                      IDR {user.expenses.toLocaleString()}
                    </p>
                    <p className="text-sm text-lime">
                      +IDR {user.earnings.toLocaleString()} earned
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Log */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-teal" />
              <h3 className="text-xl font-semibold text-charcoal">
                Expense Log
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-charcoal">
                      User ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-charcoal">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-charcoal">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-charcoal">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-charcoal">
                      Staff
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-charcoal">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenseHistory.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        {entry.userId}
                      </td>
                      <td className="py-3 px-4">@{entry.username}</td>
                      <td className="py-3 px-4 font-semibold text-teal">
                        IDR {entry.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-charcoal/70">
                        {entry.timestamp}
                      </td>
                      <td className="py-3 px-4 text-sm">{entry.staffName}</td>
                      <td className="py-3 px-4">
                        <button className="text-coral hover:text-coral/80 text-sm flex items-center gap-1">
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-coral" />
                <h3 className="text-xl font-semibold text-charcoal">
                  Event Management
                </h3>
              </div>
              {!editingEvent && (
                <button
                  onClick={() => setEditingEvent(true)}
                  className="bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-coral/90 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Event
                </button>
              )}
            </div>

            {editingEvent ? (
              <div className="space-y-6">
                {/* Basic Event Info */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Event Name
                      </label>
                      <input
                        type="text"
                        value={editEventData.name}
                        onChange={(e) =>
                          setEditEventData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editEventData.date}
                        onChange={(e) =>
                          setEditEventData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Time
                      </label>
                      <input
                        type="text"
                        value={editEventData.time}
                        onChange={(e) =>
                          setEditEventData((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        placeholder="14:00-21:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        value={editEventData.venue}
                        onChange={(e) =>
                          setEditEventData((prev) => ({
                            ...prev,
                            venue: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        value={editEventData.maxCapacity}
                        onChange={(e) =>
                          setEditEventData((prev) => ({
                            ...prev,
                            maxCapacity: Number.parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Current Attendees
                      </label>
                      <input
                        type="number"
                        value={editEventData.currentAttendees}
                        onChange={(e) =>
                          setEditEventData((prev) => ({
                            ...prev,
                            currentAttendees: Number.parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Description
                    </label>
                    <textarea
                      value={editEventData.description}
                      onChange={(e) =>
                        setEditEventData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Banner Management */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3">
                    Event Banner
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={extendedEventData.bannerImage}
                        onChange={(e) =>
                          setExtendedEventData((prev) => ({
                            ...prev,
                            bannerImage: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-charcoal/70 mb-2">
                        Current Banner Preview:
                      </p>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden">
                        <Image
                          src={
                            extendedEventData.bannerImage || "/placeholder.svg"
                          }
                          alt="Event Banner"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcements */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3">
                    Announcements
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Main Page Announcement
                      </label>
                      <textarea
                        value={extendedEventData.mainPageAnnouncement}
                        onChange={(e) =>
                          setExtendedEventData((prev) => ({
                            ...prev,
                            mainPageAnnouncement: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        placeholder="Announcement shown on the main homepage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Customer Page Announcement
                      </label>
                      <textarea
                        value={extendedEventData.customerPageAnnouncement}
                        onChange={(e) =>
                          setExtendedEventData((prev) => ({
                            ...prev,
                            customerPageAnnouncement: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        placeholder="Announcement shown on customer/event pages"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Highlights */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3">
                    Event Highlights
                  </h4>
                  <div className="space-y-2">
                    {extendedEventData.eventHighlights.map(
                      (highlight, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => {
                              const newHighlights = [
                                ...extendedEventData.eventHighlights,
                              ];
                              newHighlights[index] = e.target.value;
                              setExtendedEventData((prev) => ({
                                ...prev,
                                eventHighlights: newHighlights,
                              }));
                            }}
                            className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                          />
                          <button
                            onClick={() => {
                              const newHighlights =
                                extendedEventData.eventHighlights.filter(
                                  (_, i) => i !== index,
                                );
                              setExtendedEventData((prev) => ({
                                ...prev,
                                eventHighlights: newHighlights,
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                    <button
                      onClick={() => {
                        setExtendedEventData((prev) => ({
                          ...prev,
                          eventHighlights: [
                            ...prev.eventHighlights,
                            "New highlight",
                          ],
                        }));
                      }}
                      className="text-teal hover:text-teal/80 text-sm font-medium"
                    >
                      + Add Highlight
                    </button>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-lg font-semibold text-charcoal mb-3">
                    Social Media
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={extendedEventData.socialMediaLinks.instagram}
                        onChange={(e) =>
                          setExtendedEventData((prev) => ({
                            ...prev,
                            socialMediaLinks: {
                              ...prev.socialMediaLinks,
                              instagram: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        placeholder="@summerpartycanggu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={extendedEventData.socialMediaLinks.whatsapp}
                        onChange={(e) =>
                          setExtendedEventData((prev) => ({
                            ...prev,
                            socialMediaLinks: {
                              ...prev.socialMediaLinks,
                              whatsapp: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        placeholder="+62 812-3456-7890"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveEvent}
                    className="bg-lime text-white px-6 py-2 rounded-lg font-medium hover:bg-lime/90 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save All Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal" />
                    <div>
                      <p className="font-medium text-charcoal">
                        {eventData.name}
                      </p>
                      <p className="text-sm text-charcoal/70">
                        {eventData.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal" />
                    <p className="text-charcoal">{eventData.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal" />
                    <p className="text-charcoal">{eventData.venue}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-coral" />
                    <div>
                      <p className="font-medium text-charcoal">
                        {eventData.currentAttendees} / {eventData.maxCapacity}
                      </p>
                      <p className="text-sm text-charcoal/70">Attendees</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-charcoal/70 mb-2">Description</p>
                    <p className="text-charcoal">{eventData.description}</p>
                  </div>
                </div>
              </div>
            )}
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

  return null;
}
