"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";

type Step = "login" | "form" | "approval" | "dashboard";
type LoginMethod = "phone" | "google";

interface AdminData {
  phone: string;
  email: string;
  fullName: string;
  instagram: string;
  adminId: string;
  id?: string;
  registrationStatus?: string;
  isActive?: boolean;
  isSuperAdmin?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
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
  phone: string;
  createdAt: string;
  loginMethod: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>("login");

  // Track explicit logout to prevent automatic re-login
  const [hasExplicitlyLoggedOut, setHasExplicitlyLoggedOut] = useState(() => {
    if (typeof window !== "undefined") {
      const logoutFlag = localStorage.getItem("admin_explicitly_logged_out");
      console.log("🔍 Admin initial logout flag check:", logoutFlag);
      return logoutFlag === "true";
    }
    return false;
  });

  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [adminData, setAdminData] = useState<AdminData>({
    phone: "",
    email: "",
    fullName: "",
    instagram: "",
    adminId: "",
  });

  // Check for existing auth token on load
  useEffect(() => {
    console.log("🔍 Admin page loading - checking tokens...");
    const adminToken = localStorage.getItem("admin_token");
    const userToken = localStorage.getItem("user_token");
    const staffToken = localStorage.getItem("staff_token");

    console.log("📋 Token status:", {
      adminToken: adminToken ? `EXISTS (${adminToken.length} chars)` : "NONE",
      userToken: userToken ? `EXISTS (${userToken.length} chars)` : "NONE",
      staffToken: staffToken ? `EXISTS (${staffToken.length} chars)` : "NONE",
    });

    // Security check: if user has non-admin tokens, clear them for admin page
    if (!adminToken && (userToken || staffToken)) {
      // User is trying to access admin page with user/staff credentials
      // Clear any non-admin tokens to prevent confusion
      if (userToken) {
        console.warn(
          "🚨 Security: User token detected on admin page - access denied",
        );
      }
      if (staffToken) {
        console.warn(
          "🚨 Security: Staff token detected on admin page - access denied",
        );
      }
      console.log("❌ No admin token found - showing login page");
      setCurrentStep("login");
      setAuthToken("");
      setAdminData({
        phone: "",
        email: "",
        fullName: "",
        instagram: "",
        adminId: "",
      });
      return;
    }

    if (adminToken) {
      console.log("✅ Admin token found - validating...");
      setAuthToken(adminToken);
      setCurrentStep("dashboard");
      validateAndLoadAdmin(adminToken);
    } else {
      // No admin token found, show login
      console.log("❌ No tokens found - showing login page");
      setCurrentStep("login");
      setAuthToken("");
      setAdminData({
        phone: "",
        email: "",
        fullName: "",
        instagram: "",
        adminId: "",
      });
    }
  }, []);

  // Handle Google OAuth session
  useEffect(() => {
    if (session && session.user) {
      // Check if user explicitly logged out
      if (hasExplicitlyLoggedOut) {
        console.log(
          "🚫 Admin user explicitly logged out - not auto-logging in via Google OAuth",
        );
        return;
      }

      // Don't auto-authenticate during registration process
      if (currentStep === "form" || currentStep === "approval") {
        console.log(
          `🔄 Admin user is in ${currentStep} step - skipping auto-authentication to avoid interrupting registration flow`,
        );
        return;
      }

      // Only process Google OAuth if user doesn't have non-admin tokens
      const userToken = localStorage.getItem("user_token");
      const staffToken = localStorage.getItem("staff_token");

      if (userToken || staffToken) {
        console.warn(
          "🚨 Security: Google OAuth session detected but user has non-admin tokens - ignoring OAuth for admin page",
        );
        return;
      }

      // Only process if no conflicting tokens exist
      console.log("🔄 Admin auto-login via Google OAuth session");
      handleGoogleLoginFlow();
    }
  }, [session, hasExplicitlyLoggedOut, currentStep]);

  // Force session refresh on page load and after OAuth redirects
  useEffect(() => {
    const checkForOAuthReturn = async () => {
      // Check if we're coming back from OAuth (URL has state and code parameters)
      const urlParams = new URLSearchParams(window.location.search);
      const hasState = urlParams.has("state");
      const hasCode = urlParams.has("code");

      if (hasState && hasCode) {
        // Clear the URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        // Wait a moment for NextAuth to process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Force a session refresh by making a direct request
        try {
          const response = await fetch("/api/auth/session", {
            credentials: "include", // Important for cookies
          });
          const sessionData = await response.json();

          if (sessionData && sessionData.user) {
            // Force component re-render to trigger session hook
            window.location.reload();
          } else {
            setTimeout(async () => {
              try {
                const retryResponse = await fetch("/api/auth/session", {
                  credentials: "include",
                });
                const retrySessionData = await retryResponse.json();

                if (retrySessionData && retrySessionData.user) {
                  window.location.reload();
                }
              } catch (retryError) {
                console.error("Retry session check error:", retryError);
              }
            }, 2000);
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }
    };

    checkForOAuthReturn();
  }, []);

  // Monitor authentication state changes
  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem("admin_token");
    };

    // Check auth state on component mount and when storage changes
    checkAuthState();

    // Listen for storage changes (logout in other tabs)
    window.addEventListener("storage", checkAuthState);

    // Also check periodically in case token is manually removed
    const interval = setInterval(checkAuthState, 1000);

    return () => {
      window.removeEventListener("storage", checkAuthState);
      clearInterval(interval);
    };
  }, [currentStep]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleGoogleLoginFlow = async () => {
    if (!session) {
      return;
    }

    setLoading(true);

    try {
      const admin = await handleGoogleAdminAuth();

      if (admin) {
        setAdminData(admin);
        if (admin.registrationStatus === "APPROVED" && admin.isActive) {
          setCurrentStep("dashboard");
        } else {
          setCurrentStep("approval");
        }
      } else {
        // Need to register - go to form step

        setLoginMethod("google");
        setCurrentStep("form");
      }
    } catch (error) {
      console.error("Google login flow error:", error);
      setError("Google login failed");
      toast.error("Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // API call functions
  const apiCall = async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse> => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  };

  const sendOTP = async (phone: string): Promise<boolean> => {
    setLoading(true);
    setError("");

    const response = await apiCall("/api/auth/phone/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });

    setLoading(false);

    if (response.success) {
      setShowOtpInput(true);
      setRemainingAttempts(response.data?.remainingAttempts ?? 4);
      setResendTimer(60); // 1 minute countdown
      toast.success("OTP sent successfully! Check your phone.");
      return true;
    } else {
      const errorMessage =
        response.message || "Failed to send OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);

      // Handle rate limiting
      if (response.data?.nextResendAt) {
        const nextResendTime = new Date(response.data.nextResendAt);
        const secondsUntilNext = Math.ceil(
          (nextResendTime.getTime() - Date.now()) / 1000,
        );
        setResendTimer(Math.max(0, secondsUntilNext));
      }

      if (response.data?.remainingAttempts !== undefined) {
        setRemainingAttempts(response.data.remainingAttempts);
      }

      return false;
    }
  };

  const verifyOTP = async (
    phone: string,
    otp: string,
  ): Promise<string | null> => {
    setLoading(true);
    setError("");

    const response = await apiCall("/api/auth/phone/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code: otp }),
    });

    setLoading(false);

    if (response.success) {
      setResendTimer(0); // Reset timer on successful verification
      return response.data.token;
    } else {
      setError(response.message);
      return null;
    }
  };

  const resendOTP = async (): Promise<void> => {
    if (resendTimer > 0 || !phoneNumber) return;
    await sendOTP(phoneNumber);
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Admin logout - Setting logout flag in localStorage");

      // Set logout flag to prevent automatic re-login
      setHasExplicitlyLoggedOut(true);
      localStorage.setItem("admin_explicitly_logged_out", "true");

      // Clear local storage
      localStorage.removeItem("admin_token");

      // Clear app state
      setAuthToken("");
      setCurrentStep("login");
      setAdminData({
        phone: "",
        email: "",
        fullName: "",
        instagram: "",
        adminId: "",
      });

      // Clear Google OAuth session
      await signOut({ redirect: false });

      console.log(
        "✅ Admin logout successful - logout flag set to prevent auto-login",
      );
    } catch (error) {
      console.error("❌ Admin logout error:", error);
      // Even if signOut fails, still clear local state and set logout flag
      setHasExplicitlyLoggedOut(true);
      localStorage.setItem("admin_explicitly_logged_out", "true");
      localStorage.removeItem("admin_token");
      setAuthToken("");
      setCurrentStep("login");
    }
  };

  const attemptAdminLogin = async (
    identifier: string,
    otp?: string,
  ): Promise<AdminData | null | "OTP_SENT"> => {
    setLoading(true);
    setError("");

    const body: any = { identifier };
    if (otp) {
      body.otp = otp;
    } else {
      body.requestOtp = true;
    }

    const response = await apiCall("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (response.success && response.data.token) {
      // Login successful
      const token = response.data.token;
      const admin = response.data.admin;

      localStorage.setItem("admin_token", token);
      setAuthToken(token);

      return admin;
    } else if (response.data?.requireOtp) {
      // OTP required - admin exists and OTP was sent
      setShowOtpInput(true);
      return "OTP_SENT";
    } else {
      // Log the full response for debugging
      console.error("Admin login failed:", response);
      setError(response.message || "Admin login failed. Please try again.");
      return null;
    }
  };

  const registerAdmin = async (
    adminData: Partial<AdminData>,
  ): Promise<boolean> => {
    if (!tempToken) {
      setError("Phone verification required");
      return false;
    }

    setLoading(true);
    setError("");

    const response = await apiCall("/api/auth/admin/register", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({
        fullName: adminData.fullName,
        email: adminData.email,
        instagram: adminData.instagram,
        phone: adminData.phone,
        loginMethod: loginMethod?.toUpperCase(),
      }),
    });

    setLoading(false);

    if (response.success) {
      setAdminData((prev) => ({ ...prev, ...response.data }));
      toast.success("Registration successful! Please wait for approval.");
      return true;
    } else {
      const errorMessage =
        response.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  const validateAndLoadAdmin = async (token: string): Promise<void> => {
    try {
      console.log("🔐 Validating admin token...");
      const response = await apiCall("/api/admin/registrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success) {
        console.log("✅ Token valid - loading admin dashboard");
        setCurrentStep("dashboard");
        // Load admin data from response if available
        if (response.data?.currentAdmin) {
          setAdminData((prev) => ({ ...prev, ...response.data.currentAdmin }));
        }
      } else {
        // Token invalid, clear it and show login
        console.log("❌ Token invalid - redirecting to login");
        localStorage.removeItem("admin_token");
        setAuthToken("");
        setCurrentStep("login");
      }
    } catch (error) {
      console.error("❌ Token validation failed:", error);
      localStorage.removeItem("admin_token");
      setAuthToken("");
      setCurrentStep("login");
    }
  };

  // Google OAuth Functions
  const handleGoogleAdminAuth = async (): Promise<AdminData | null> => {
    setLoading(true);
    setError("");

    try {
      const response = await apiCall("/api/auth/google/admin", {
        method: "POST",
      });

      if (response.success && response.data.token) {
        // Admin exists and logged in successfully
        const token = response.data.token;
        const admin = response.data.admin;

        localStorage.setItem("admin_token", token);
        setAuthToken(token);

        return admin;
      } else if (response.data?.admin && !response.data.token) {
        // Admin exists but not approved
        return response.data.admin;
      } else if (response.data?.requiresRegistration) {
        // Admin doesn't exist, needs registration
        const googleUser = response.data.googleUser;
        setAdminData((prev) => ({
          ...prev,
          email: googleUser.email,
          fullName: googleUser.name || "",
        }));
        return null;
      } else {
        setError(response.message);
        return null;
      }
    } catch (error) {
      console.error("Google admin auth error:", error);
      setError("Failed to authenticate with Google");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerGoogleAdmin = async (
    adminData: Partial<AdminData>,
  ): Promise<boolean> => {
    setLoading(true);
    setError("");

    const requestBody = {
      fullName: adminData.fullName,
      instagram: adminData.instagram,
      phone: adminData.phone,
    };

    const response = await apiCall("/api/auth/google/admin/register", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    setLoading(false);

    if (response.success) {
      setAdminData((prev) => ({ ...prev, ...response.data }));
      toast.success("Registration successful! Please wait for approval.");
      return true;
    } else {
      const errorMessage =
        response.message || "Registration failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [registrationsData, setRegistrationsData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Edit expense state
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editExpenseData, setEditExpenseData] = useState({
    amount: "",
    description: "",
    category: "",
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setDashboardLoading(true);
    try {
      const response = await apiCall("/api/admin/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success) {
        setDashboardData(response.data);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Verify token and set authentication state
  const verifyTokenAndSetState = async (token: string) => {
    try {
      console.log("🔐 Verifying admin token...");
      const response = await apiCall("/api/admin/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success) {
        console.log("✅ Token valid - setting auth state");
        setAuthToken(token);
        setCurrentStep("dashboard");
        if (response.data?.currentAdmin) {
          setAdminData((prev) => ({ ...prev, ...response.data.currentAdmin }));
        }
        return true;
      } else {
        console.log("❌ Token invalid - clearing auth state");
        localStorage.removeItem("admin_token");
        setAuthToken("");
        setCurrentStep("login");
        return false;
      }
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      localStorage.removeItem("admin_token");
      setAuthToken("");
      setCurrentStep("login");
      return false;
    }
  };

  // Fetch registrations data
  const fetchRegistrationsData = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await apiCall("/api/admin/registrations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success) {
        setRegistrationsData(response.data);
      } else {
        toast.error("Failed to load registrations data");
      }
    } catch (error) {
      console.error("Registrations fetch error:", error);
      toast.error("Failed to load registrations data");
    }
  };

  // Approve or deny registrations
  const handleRegistrationAction = async (
    type: string,
    id: string,
    action: string,
  ) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const response = await apiCall("/api/admin/registrations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, id, action }),
      });

      if (response.success) {
        toast.success(response.message);
        // Refresh data
        await fetchRegistrationsData();
        await fetchDashboardData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Registration action error:", error);
      toast.error("Failed to update registration");
    }
  };

  // Edit expense functions
  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setEditExpenseData({
      amount: expense.amount.toString(),
      description: expense.description || "",
      category: expense.category || "",
    });
  };

  const handleSaveExpense = async () => {
    if (!editingExpense) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await apiCall(
        `/api/expenses/${editingExpense.expenseId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(editExpenseData.amount),
            description: editExpenseData.description,
            category: editExpenseData.category,
          }),
        },
      );

      if (response.success) {
        toast.success("Expense updated successfully");
        setEditingExpense(null);
        setEditExpenseData({ amount: "", description: "", category: "" });
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        toast.error(response.message || "Failed to update expense");
      }
    } catch (error) {
      console.error("Edit expense error:", error);
      toast.error("Failed to update expense");
    }
  };

  const handleCancelExpenseEdit = () => {
    setEditingExpense(null);
    setEditExpenseData({ amount: "", description: "", category: "" });
  };

  // Load dashboard data when user enters dashboard
  useEffect(() => {
    if (currentStep === "dashboard") {
      const token = localStorage.getItem("admin_token");

      if (authToken && token) {
        fetchDashboardData();
        fetchRegistrationsData();
      } else {
        // If we have a Google session but no admin token, try to authenticate
        if (session && session.user && !token) {
          handleGoogleLoginFlow();
        } else {
          setCurrentStep("login");
        }
      }
    }
  }, [currentStep, authToken, session, status]);

  // Leaderboard data now comes from dashboardData.leaderboard

  // Referral structure data could be added later if needed

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

  // Calculate totals from real data
  const totalExpenses = dashboardData?.stats?.totalExpenses || 0;
  const totalReferralEarnings =
    dashboardData?.leaderboard?.reduce(
      (sum: number, user: any) => sum + user.totalExpenses * 0.15, // Assuming 15% referral earnings
      0,
    ) || 0;

  // Pending registrations now come from registrationsData
  const pendingRegistrations = {
    staff: registrationsData?.pendingStaff || [],
    admin: registrationsData?.pendingAdmins || [],
  };

  // Approved registrations now come from registrationsData
  const approvedRegistrations = {
    staff: registrationsData?.activeStaff || [],
    admin: registrationsData?.activeAdmins || [],
  };

  const handleApproval = async (
    id: string,
    type: "staff" | "admin",
    action: "approved" | "denied",
  ) => {
    await handleRegistrationAction(
      type,
      id,
      action === "approved" ? "approve" : "deny",
    );
  };

  // Old approval handler removed - using real API now

  // Handle phone login flow
  const handlePhoneLogin = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    setError("");

    try {
      // First try to request OTP for admin login
      const result = await attemptAdminLogin(phoneNumber);

      if (result === "OTP_SENT") {
        // Admin exists and OTP was sent by backend

        setLoading(false);
        return;
      }

      if (result && typeof result === "object") {
        // Admin exists and logged in successfully (shouldn't happen without OTP)
        setAdminData(result);
        if (result.registrationStatus === "APPROVED" && result.isActive) {
          setCurrentStep("dashboard");
        } else {
          setCurrentStep("approval");
        }
        setLoading(false);
        return;
      }

      // Admin doesn't exist, send OTP for registration flow
      console.log("💡 Admin not found, sending OTP for new admin registration");
      setError(""); // Clear any previous error

      const otpSent = await sendOTP(phoneNumber);
      if (otpSent) {
        setShowOtpInput(true);
        console.log("✅ OTP sent successfully, showing OTP input");
      } else {
        console.error("❌ Failed to send OTP");
      }
    } catch (error) {
      console.error("Phone login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otpCode.length !== 6) return;

    // First, try admin login with OTP
    const result = await attemptAdminLogin(phoneNumber, otpCode);
    if (result && typeof result === "object") {
      // Successfully logged in as existing admin
      setAdminData(result);
      if (result.registrationStatus === "APPROVED" && result.isActive) {
        setCurrentStep("dashboard");
      } else {
        setCurrentStep("approval");
      }
      return;
    }

    // If admin login failed, try to get temp token for NEW admin registration
    // Note: This uses different OTP purpose (LOGIN vs ADMIN_LOGIN)
    const token = await verifyOTP(phoneNumber, otpCode);
    if (token) {
      setTempToken(token);
      setAdminData((prev) => ({
        ...prev,
        phone: phoneNumber,
      }));
      setCurrentStep("form");
    } else {
      // If both attempts failed, show clearer error message
      setError(
        "Invalid or expired OTP code. Please request a new OTP and try again.",
      );
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    // Reset logout flag when user explicitly chooses to login
    setHasExplicitlyLoggedOut(false);
    localStorage.removeItem("admin_explicitly_logged_out");

    setLoginMethod("google");
    setError("");
    setLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/admin",
        redirect: true,
      });
    } catch (error) {
      setError("Failed to initiate Google login");
      setLoading(false);
    }
  };

  // Handle form submission for registration
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success = false;
    if (loginMethod === "google") {
      success = await registerGoogleAdmin(adminData);
    } else {
      success = await registerAdmin(adminData);
    }

    if (success) {
      setCurrentStep("approval");
    }
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

  const handleCancelEventEdit = () => {
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

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
                          disabled={!phoneNumber || loading}
                          className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send OTP Code"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-charcoal/70">
                          Enter the 6-digit code sent to {phoneNumber}
                        </p>

                        {/* Remaining attempts indicator */}
                        {remainingAttempts > 0 && (
                          <p className="text-xs text-amber-600">
                            {remainingAttempts} resend attempts remaining
                          </p>
                        )}

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
                          disabled={otpCode.length !== 6 || loading}
                          className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Continue"
                          )}
                        </button>

                        {/* Resend OTP button */}
                        <div className="text-center">
                          <button
                            onClick={resendOTP}
                            disabled={
                              loading ||
                              remainingAttempts === 0 ||
                              resendTimer > 0
                            }
                            className="text-teal hover:text-teal/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {remainingAttempts === 0
                              ? "No more attempts"
                              : resendTimer > 0
                              ? `Resend code in ${resendTimer}s`
                              : "Resend Code"}
                          </button>
                        </div>
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

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={adminData.phone}
                onChange={(e) =>
                  setAdminData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent ${
                  loginMethod === "phone" ? "bg-gray-50" : ""
                }`}
                placeholder="+62 812-3456-7890"
                readOnly={loginMethod === "phone"}
              />
              {loginMethod === "phone" && (
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from your phone verification
                </p>
              )}
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
                  loginMethod === "google" ? "bg-gray-50" : ""
                }`}
                placeholder="admin@summerpartycanggu.com"
                readOnly={loginMethod === "google"}
              />
              {loginMethod === "google" && (
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from your Google account
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral text-white p-4 rounded-lg font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
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
            {adminData.registrationStatus === "PENDING" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Approval Pending
                </h2>
                <p className="text-charcoal/70">
                  Your admin registration is being reviewed by a super admin.
                  Please wait for approval.
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
                  <p className="text-sm text-yellow-800">
                    <strong>Status:</strong> {adminData.registrationStatus}
                  </p>
                </div>
                <p className="text-sm text-charcoal/60">
                  You will be notified once your registration is approved. You
                  can also contact the event organizer for updates.
                </p>
              </div>
            )}

            {adminData.registrationStatus === "APPROVED" &&
              adminData.isActive && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal">
                    Registration Approved!
                  </h2>
                  <p className="text-charcoal/70">
                    Congratulations! Your admin registration has been approved
                    by a super admin.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Admin ID:</strong> {adminData.adminId}
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Status:</strong>{" "}
                      {adminData.isSuperAdmin
                        ? "Super Administrator"
                        : "Administrator"}
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Active:</strong>{" "}
                      {adminData.isActive ? "Yes" : "No"}
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

            {adminData.registrationStatus === "REJECTED" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal">
                  Registration Denied
                </h2>
                <p className="text-charcoal/70">
                  Unfortunately, your admin registration has been rejected by a
                  super admin.
                </p>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Admin ID:</strong> {adminData.adminId}
                  </p>
                  <p className="text-sm text-red-800">
                    <strong>Status:</strong> {adminData.registrationStatus}
                  </p>
                  <p className="text-sm text-red-800 mt-2">
                    Please contact the event organizer for more information or
                    to reapply with a different account.
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem("admin_token");
                    setCurrentStep("login");
                    setAdminData({
                      phone: "",
                      email: "",
                      fullName: "",
                      instagram: "",
                      adminId: "",
                    });
                    setAuthToken("");
                    setTempToken("");
                    setError("");
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
    // If not authenticated, show login page instead of dashboard
    if (!authToken) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-display font-bold text-charcoal mb-2">
                <span className="text-coral">Admin</span>{" "}
                <span className="text-teal italic">Login</span>
              </h1>
              <p className="text-charcoal/70">Access your admin dashboard</p>
            </div>

            {/* Login Methods */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentStep("phone_input")}
                  className="w-full bg-teal text-white px-6 py-3 rounded-xl hover:bg-teal/90 transition-colors font-medium"
                >
                  📱 Login with Phone & OTP
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-charcoal/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-charcoal/60">or</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Clear logout flag when user manually chooses to login
                    console.log(
                      "🔄 Admin manual Google login (form) - clearing logout flag",
                    );
                    setHasExplicitlyLoggedOut(false);
                    localStorage.removeItem("admin_explicitly_logged_out");
                    signIn("google", {
                      callbackUrl: "/admin",
                      redirect: true,
                    });
                  }}
                  className="w-full bg-white text-charcoal border-2 border-charcoal/20 px-6 py-3 rounded-xl hover:bg-charcoal/5 transition-colors font-medium flex items-center justify-center gap-2"
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
                  Continue with Google
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-coral/10 border border-coral/20 rounded-lg">
                  <p className="text-coral text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If authenticated, show dashboard
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

                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-coral text-white rounded-lg hover:bg-coral/90 transition-colors text-sm"
                >
                  Logout
                </button>
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
                        className="flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                              <p>{staff.phone}</p>
                            </div>
                            <div className="text-xs text-charcoal/50">
                              <p>
                                Applied:{" "}
                                {new Date(staff.createdAt).toLocaleDateString()}
                              </p>
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
                        className="flex flex-col md:flex-row gap-6 md:gap-0 items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                              <p>{admin.phone}</p>
                            </div>
                            <div className="text-xs text-charcoal/50">
                              <p>
                                Applied:{" "}
                                {new Date(admin.createdAt).toLocaleDateString()}
                              </p>
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
              {dashboardLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-charcoal/60">Loading leaderboard...</p>
                </div>
              ) : dashboardData?.leaderboard?.length > 0 ? (
                dashboardData.leaderboard.map((user: any, index: number) => (
                  <div
                    key={user.userId}
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
                          {user.fullName || user.username}
                        </p>
                        <p className="text-sm text-charcoal/60">
                          {user.expenseCount} expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">
                        IDR {user.totalExpenses.toLocaleString()}
                      </p>
                      <p className="text-sm text-lime">Total spent</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-charcoal/60">No expense data available</p>
                </div>
              )}
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
                      Description
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
                  {dashboardLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-charcoal/60">Loading expenses...</p>
                      </td>
                    </tr>
                  ) : dashboardData?.recentExpenses?.length > 0 ? (
                    dashboardData.recentExpenses.map((entry: any) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-mono text-sm">
                          {entry.userId}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-charcoal">
                              {entry.customerName}
                            </p>
                            <p className="text-sm text-charcoal/60">
                              {entry.customerInstagram}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-teal">
                          IDR {entry.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-charcoal/70">
                          {entry.description || "No description"}
                        </td>
                        <td className="py-3 px-4 text-sm text-charcoal/70">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">{entry.staffName}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleEditExpense(entry)}
                            className="text-coral hover:text-coral/80 text-sm flex items-center gap-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <p className="text-charcoal/60">No recent expenses</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row items-start md:items-center justify-between mb-4">
              <div className="flex md:items-center items-start gap-3">
                <Settings className="w-6 h-6 text-coral" />
                <h3 className="text-xl font-semibold text-charcoal">
                  Event Management
                </h3>
              </div>
              {!editingEvent && (
                <div className="flex flex-col md:flex-row gap-2">
                  <Link
                    href="/admin/event"
                    className="bg-teal text-white px-4 py-2 rounded-lg font-medium hover:bg-teal/90 transition-colors flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Event Check-In
                  </Link>
                  <button
                    onClick={() => setEditingEvent(true)}
                    className="bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-coral/90 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Event
                  </button>
                </div>
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
                        Total RSVP
                      </label>
                      <input
                        type="number"
                        value={dashboardData?.stats?.totalRSVP || 0}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-charcoal/70 mt-1">
                        Read-only: Based on user registrations
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Checked In
                      </label>
                      <input
                        type="number"
                        value={dashboardData?.stats?.totalCheckedIn || 0}
                        readOnly
                        disabled
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-charcoal/70 mt-1">
                        Read-only: Based on event check-ins
                      </p>
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
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={extendedEventData.socialMediaLinks.whatsapp}
                        onChange={(e) =>
                          setExtendedEventData((prev) => ({
                            ...prev,
                            socialMediaLinks: {
                              ...prev.socialMediaLinks,
                              phone: e.target.value,
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
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEventEdit}
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
                        {dashboardData?.eventConfig?.name || eventData.name}
                      </p>
                      <p className="text-sm text-charcoal/70">
                        {dashboardData?.eventConfig?.date || eventData.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal" />
                    <p className="text-charcoal">
                      {dashboardData?.eventConfig?.time || eventData.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal" />
                    <p className="text-charcoal">
                      {dashboardData?.eventConfig?.venue || eventData.venue}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-coral" />
                    <div>
                      <p className="font-medium text-charcoal">
                        {dashboardData?.stats?.totalCheckedIn || 0}
                      </p>
                      <p className="text-sm text-charcoal/70">Checked In</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-charcoal/70 mb-2">Description</p>
                    <p className="text-charcoal">
                      {dashboardData?.eventConfig?.description ||
                        eventData.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Expense Modal */}
          {editingExpense && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-charcoal">
                    Edit Expense
                  </h3>
                  <button
                    onClick={handleCancelExpenseEdit}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={editingExpense.customerName}
                      disabled
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Amount (IDR) *
                    </label>
                    <input
                      type="number"
                      value={editExpenseData.amount}
                      onChange={(e) =>
                        setEditExpenseData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Description
                    </label>
                    <textarea
                      value={editExpenseData.description}
                      onChange={(e) =>
                        setEditExpenseData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      placeholder="Expense description"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Category
                    </label>
                    <select
                      value={editExpenseData.category}
                      onChange={(e) =>
                        setEditExpenseData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Transportation">Transportation</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveExpense}
                    disabled={
                      !editExpenseData.amount ||
                      parseFloat(editExpenseData.amount) <= 0
                    }
                    className="flex-1 bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-coral/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelExpenseEdit}
                    className="flex-1 bg-gray-200 text-charcoal px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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
