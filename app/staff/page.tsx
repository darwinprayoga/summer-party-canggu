"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  QrCode,
  Scan,
  DollarSign,
  History,
  Edit3,
  Search,
  Plus,
  Save,
  X,
  User,
  Calendar,
  Clock,
} from "lucide-react";

type Step = "login" | "form" | "dashboard";

interface UserData {
  phone: string;
  email: string;
  fullName: string;
  instagram: string;
  whatsapp: string;
  userId: string;
}

interface ExpenseEntry {
  id: string;
  customerId: string;
  customerName: string;
  customerInstagram: string;
  amount: number;
  timestamp: Date;
  staffId: string;
  description: string;
}

export default function StaffPage() {
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

  // Staff dashboard states
  const [scannedCustomerId, setScannedCustomerId] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock expense history data
  const [expenseHistory, setExpenseHistory] = useState<ExpenseEntry[]>([
    {
      id: "EXP001",
      customerId: "SP123456",
      customerName: "John Doe",
      customerInstagram: "johndoe_bali",
      amount: 250000,
      timestamp: new Date("2024-01-15T14:30:00"),
      staffId: userData.userId,
      description: "Food & Beverages",
    },
    {
      id: "EXP002",
      customerId: "SP789012",
      customerName: "Sarah Wilson",
      customerInstagram: "sarah_surfs",
      amount: 150000,
      timestamp: new Date("2024-01-15T15:45:00"),
      staffId: userData.userId,
      description: "Merchandise",
    },
    {
      id: "EXP003",
      customerId: "SP345678",
      customerName: "Mike Chen",
      customerInstagram: "mike_nomad",
      amount: 300000,
      timestamp: new Date("2024-01-15T16:20:00"),
      staffId: userData.userId,
      description: "Activities & Games",
    },
  ]);

  // Simulate phone OTP login
  const handlePhoneLogin = () => {
    if (!phoneNumber) return;
    setShowOtpInput(true);
  };

  const handleOtpVerification = () => {
    if (otpCode.length === 6) {
      // Simulate successful OTP verification for staff
      setUserData((prev) => ({
        ...prev,
        phone: phoneNumber,
        whatsapp: phoneNumber,
      }));
      setCurrentStep("form");
    }
  };

  // Simulate Google login
  const handleGoogleLogin = () => {
    // Simulate Google OAuth response for staff
    const mockGoogleData = {
      phone: "+62 812-3456-7890",
      email: "staff@summerpartycanggu.com",
      whatsapp: "+62 812-3456-7890",
      fullName: "",
      instagram: "",
      userId: "",
    };
    setUserData(mockGoogleData);
    setCurrentStep("form");
  };

  // Handle QR scan simulation
  const handleQRScan = () => {
    // Simulate QR scan result
    const mockCustomerId = `SP${Math.floor(Math.random() * 900000) + 100000}`;
    setScannedCustomerId(mockCustomerId);
    setShowScanner(false);
  };

  // Add new expense entry
  const handleAddExpense = () => {
    if (!scannedCustomerId || !expenseAmount || !expenseDescription) return;

    const newEntry: ExpenseEntry = {
      id: `EXP${Date.now().toString().slice(-6)}`,
      customerId: scannedCustomerId,
      customerName: "Customer Name", // In real app, fetch from customer ID
      customerInstagram: "customer_ig", // In real app, fetch from customer ID
      amount: Number.parseInt(expenseAmount),
      timestamp: new Date(),
      staffId: userData.userId,
      description: expenseDescription,
    };

    setExpenseHistory([newEntry, ...expenseHistory]);
    setScannedCustomerId("");
    setExpenseAmount("");
    setExpenseDescription("");
  };

  // Update expense entry
  const handleUpdateExpense = (
    entryId: string,
    newAmount: number,
    newDescription: string,
  ) => {
    setExpenseHistory(
      expenseHistory.map((entry) =>
        entry.id === entryId
          ? { ...entry, amount: newAmount, description: newDescription }
          : entry,
      ),
    );
    setEditingEntry(null);
  };

  // Filter history based on search
  const filteredHistory = expenseHistory.filter(
    (entry) =>
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.customerInstagram
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      entry.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleFormSubmit = () => {
    if (!userData.fullName || !userData.instagram) return;

    // Generate staff ID and complete user data
    const staffId = `STAFF${Date.now().toString().slice(-4)}`;
    setUserData((prev) => ({
      ...prev,
      userId: staffId,
    }));
    setCurrentStep("dashboard");
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
              <span className="text-coral">STAFF</span>{" "}
              <span className="text-teal italic">Portal</span>
            </h1>
            <p className="text-charcoal/70">Summer Party Canggu Staff Access</p>
            <p className="text-sm text-charcoal/60 mt-2">
              Please login to access staff dashboard
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
              Staff access only. By continuing, you agree to our Terms of
              Service and Privacy Policy
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
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%5BSPC%5D%201st%20Poster%20-%20IG-n3sOlDEwhDML4dnjhrfIFVyz6zMEfj.png"
                alt="Summer Party Canggu"
                fill
                className="rounded-2xl object-cover"
              />
            </div>
            <h1 className="text-3xl font-display font-bold text-charcoal mb-2">
              <span className="text-coral">STAFF</span>{" "}
              <span className="text-teal italic">Details</span>
            </h1>
            <p className="text-charcoal/70">Complete your staff profile</p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={userData.instagram}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      instagram: e.target.value,
                    }))
                  }
                  placeholder="@your_instagram"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData.fullName}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  placeholder="Your full name"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={userData.whatsapp}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      whatsapp: e.target.value,
                    }))
                  }
                  placeholder="+62 812-3456-7890"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from login method
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your.email@example.com"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-gray-50"
                  readOnly={!!userData.email}
                />
                {userData.email && (
                  <p className="text-xs text-charcoal/60 mt-1">
                    Auto-filled from login method
                  </p>
                )}
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={!userData.fullName || !userData.instagram}
                className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentStep("login")}
              className="text-teal hover:text-teal/80 text-sm font-medium"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-charcoal">
                  Staff Dashboard
                </h1>
                <p className="text-charcoal/70">Welcome, {userData.fullName}</p>
                <p className="text-sm text-charcoal/60">
                  Staff ID: {userData.userId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-charcoal/60">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-charcoal/60">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* QR Scanner Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Scan className="w-6 h-6 text-teal" />
                <h2 className="text-xl font-semibold text-charcoal">
                  Scan Customer QR
                </h2>
              </div>

              <div className="space-y-4">
                {!showScanner ? (
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-teal text-white p-4 rounded-lg font-medium hover:bg-teal/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Start QR Scanner
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <QrCode className="w-16 h-16 text-charcoal/40 mx-auto mb-4" />
                      <p className="text-charcoal/60 mb-4">
                        Camera scanning simulation
                      </p>
                      <button
                        onClick={handleQRScan}
                        className="bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal/90 transition-colors"
                      >
                        Simulate Scan
                      </button>
                    </div>
                    <button
                      onClick={() => setShowScanner(false)}
                      className="w-full bg-gray-200 text-charcoal p-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {scannedCustomerId && (
                  <div className="bg-lime/10 rounded-lg p-4 border border-lime/20">
                    <p className="text-sm text-charcoal/70">
                      Scanned Customer ID:
                    </p>
                    <p className="text-lg font-bold text-lime">
                      {scannedCustomerId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Expense Input Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-coral" />
                <h2 className="text-xl font-semibold text-charcoal">
                  Add Expense
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={scannedCustomerId}
                    onChange={(e) => setScannedCustomerId(e.target.value)}
                    placeholder="SP123456 or scan QR code"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Amount (IDR)
                  </label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="250000"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="Food & Beverages, Merchandise, etc."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleAddExpense}
                  disabled={
                    !scannedCustomerId || !expenseAmount || !expenseDescription
                  }
                  className="w-full bg-coral text-white p-3 rounded-lg font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Expense
                </button>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-charcoal" />
                <h2 className="text-xl font-semibold text-charcoal">
                  Expense History
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-charcoal/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search history..."
                  className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-charcoal/60">
                  <History className="w-12 h-12 mx-auto mb-4 text-charcoal/40" />
                  <p>No expense records found</p>
                </div>
              ) : (
                filteredHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    {editingEntry === entry.id ? (
                      <EditExpenseForm
                        entry={entry}
                        onSave={(newAmount, newDescription) =>
                          handleUpdateExpense(
                            entry.id,
                            newAmount,
                            newDescription,
                          )
                        }
                        onCancel={() => setEditingEntry(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-charcoal/60" />
                              <span className="font-medium text-charcoal">
                                {entry.customerName}
                              </span>
                              <span className="text-sm text-charcoal/60">
                                @{entry.customerInstagram}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-charcoal/60">
                                ID:
                              </span>
                              <span className="text-sm font-mono text-charcoal">
                                {entry.customerId}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-charcoal/70">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold text-coral">
                                IDR {entry.amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {entry.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {entry.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-charcoal/80 mt-1">
                            {entry.description}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingEntry(entry.id)}
                          className="ml-4 p-2 text-charcoal/60 hover:text-teal hover:bg-teal/10 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setCurrentStep("login");
                setUserData({
                  phone: "",
                  email: "",
                  fullName: "",
                  instagram: "",
                  whatsapp: "",
                  userId: "",
                });
              }}
              className="text-coral hover:text-coral/80 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Edit Expense Form Component
interface EditExpenseFormProps {
  entry: ExpenseEntry;
  onSave: (amount: number, description: string) => void;
  onCancel: () => void;
}

function EditExpenseForm({ entry, onSave, onCancel }: EditExpenseFormProps) {
  const [amount, setAmount] = useState(entry.amount.toString());
  const [description, setDescription] = useState(entry.description);

  const handleSave = () => {
    if (amount && description) {
      onSave(Number.parseInt(amount), description);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-charcoal/60" />
          <span className="font-medium text-charcoal">
            {entry.customerName}
          </span>
          <span className="text-sm text-charcoal/60">
            @{entry.customerInstagram}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-charcoal/60">ID:</span>
          <span className="text-sm font-mono text-charcoal">
            {entry.customerId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-charcoal/70 mb-1">
            Amount (IDR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-charcoal/70 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!amount || !description}
          className="flex items-center gap-1 bg-lime text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-lime/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 bg-gray-200 text-charcoal px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
