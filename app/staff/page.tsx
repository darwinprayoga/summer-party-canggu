"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
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
  CheckCircle,
  Loader2,
  ArrowRight,
  Camera,
  Upload,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { staffRegistrationSchema } from "@/types";
import QRScanner from "@/components/QRScanner";
import Webcam from "react-webcam";

type Step = "login" | "form" | "approval" | "dashboard";
type LoginMethod = "phone" | "google";

interface StaffData {
  phone: string;
  email: string;
  fullName: string;
  instagram: string;
  staffId: string;
  id?: string;
  registrationStatus?: string;
  isActive?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
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
  photoUrl?: string;
}

export default function StaffPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>("login");
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

  // Field-specific error states
  const [fieldErrors, setFieldErrors] = useState({
    instagram: "",
    email: "",
    phone: "",
  });
  const [staffData, setStaffData] = useState<StaffData>({
    phone: "",
    email: "",
    fullName: "",
    instagram: "",
    staffId: "",
  });
  const [isPhonePrefilled, setIsPhonePrefilled] = useState(false);
  const [hasExplicitlyLoggedOut, setHasExplicitlyLoggedOut] = useState(() => {
    if (typeof window !== "undefined") {
      const logoutFlag = localStorage.getItem("staff_explicitly_logged_out");
      console.log("🔍 Initial logout flag check:", logoutFlag);
      return logoutFlag === "true";
    }
    return false;
  });

  // Check for existing auth token on load
  useEffect(() => {
    console.log("🔍 Staff page loading - checking tokens...");
    const staffToken = localStorage.getItem("staff_token");
    const userToken = localStorage.getItem("user_token");
    const adminToken = localStorage.getItem("admin_token");

    console.log("📋 Token status:", {
      staffToken: !!staffToken,
      userToken: !!userToken,
      adminToken: !!adminToken,
    });

    // Security check: if user has non-staff tokens, prevent access
    if (!staffToken && (userToken || adminToken)) {
      // User is trying to access staff page with user/admin credentials
      if (userToken) {
        console.warn(
          "🚨 Security: User token detected on staff page - access denied",
        );
      }
      if (adminToken) {
        console.warn(
          "🚨 Security: Admin token detected on staff page - access denied",
        );
      }
      console.log("❌ No staff token found - showing login page");
      setCurrentStep("dashboard");
      setAuthToken("");
      setStaffData({
        phone: "",
        email: "",
        fullName: "",
        instagram: "",
        staffId: "",
      });
      return;
    }

    if (staffToken) {
      console.log("✅ Valid staff token found - proceeding to dashboard");
      setAuthToken(staffToken);
      setCurrentStep("dashboard");
      validateAndLoadStaff(staffToken);
    } else {
      // No token found, default to dashboard but will show login page
      console.log("ℹ️ No staff token found - showing login page");
      setCurrentStep("dashboard");
      setAuthToken("");
      setStaffData({
        phone: "",
        email: "",
        fullName: "",
        instagram: "",
        staffId: "",
      });
    }
  }, []);

  // Handle Google OAuth session
  useEffect(() => {
    console.log("🔍 Google OAuth useEffect triggered:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      hasExplicitlyLoggedOut,
      currentStep,
      logoutFlagInStorage: localStorage.getItem("staff_explicitly_logged_out"),
    });

    if (session && session.user) {
      // Don't auto-login if user explicitly logged out
      if (hasExplicitlyLoggedOut) {
        console.log(
          "🚫 User explicitly logged out - not auto-logging in via Google OAuth",
        );
        return;
      }

      // Don't auto-authenticate during registration process
      if (
        currentStep === "form" ||
        currentStep === "phone-verify" ||
        currentStep === "approval"
      ) {
        console.log(
          `🔄 User is in ${currentStep} step - skipping auto-authentication to avoid interrupting registration flow`,
        );
        return;
      }

      // Only process Google OAuth if user doesn't have non-staff tokens
      const userToken = localStorage.getItem("user_token");
      const adminToken = localStorage.getItem("admin_token");

      if (userToken || adminToken) {
        console.warn(
          "🚨 Security: Google OAuth session detected but user has non-staff tokens - ignoring OAuth for staff page",
        );
        return;
      }

      // Only process if no conflicting tokens exist and user hasn't explicitly logged out
      console.log("✅ Proceeding with Google OAuth login flow");
      handleGoogleLoginFlow();
    } else {
      console.log("ℹ️  No Google session detected");
    }
  }, [session, hasExplicitlyLoggedOut, currentStep]);

  // Load dashboard data when authenticated
  useEffect(() => {
    if (currentStep === "dashboard" && authToken) {
      fetchDashboardData();
    }
  }, [currentStep, authToken]);

  // Auto-check approval status when on approval step
  useEffect(() => {
    if (currentStep === "approval" && authToken) {
      console.log(
        "🔄 Auto-checking approval status since user is on approval step",
      );
      // Delay the check slightly to avoid immediate redirect loops
      setTimeout(() => {
        checkApprovalStatus();
      }, 500);
    }
  }, [currentStep, authToken]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // API call functions with token expiration handling
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

      // Handle token expiration
      if (!data.success && data.message === "Token expired") {
        // Try to refresh the token
        const currentToken = localStorage.getItem("staff_token");
        if (currentToken) {
          const refreshSuccess = await refreshToken(currentToken);
          if (refreshSuccess) {
            // Retry the original request with new token
            return apiCall(endpoint, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${localStorage.getItem("staff_token")}`,
              },
            });
          }
        }

        // If refresh failed, clear auth
        localStorage.removeItem("staff_token");
        setAuthToken("");
        setCurrentStep("login");
        setError("Your session has expired. Please log in again.");
        return data;
      }

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
      return true;
    } else {
      setError(response.message);

      // Handle rate limiting
      if (response.data?.nextResendAt) {
        const nextResendTime = new Date(response.data.nextResendAt);
        const secondsUntilNext = Math.ceil(
          (nextResendTime.getTime() - Date.now()) / 1000,
        );
        setResendTimer(Math.max(0, secondsUntilNext));
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
      return response.data.tempToken;
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
      // Mark that user explicitly logged out (persist in localStorage)
      console.log("🚪 Setting logout flag in localStorage");
      setHasExplicitlyLoggedOut(true);
      localStorage.setItem("staff_explicitly_logged_out", "true");
      console.log(
        "🔍 Logout flag after setting:",
        localStorage.getItem("staff_explicitly_logged_out"),
      );

      // Clear local storage
      localStorage.removeItem("staff_token");

      // Clear app state
      setAuthToken("");
      setCurrentStep("login");
      setStaffData({
        phone: "",
        email: "",
        fullName: "",
        instagram: "",
        staffId: "",
      });

      // Clear Google OAuth session
      await signOut({ redirect: false });

      console.log(
        "✅ Logout successful - logout flag set to prevent auto-login",
      );
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Even if signOut fails, still clear local state
      setHasExplicitlyLoggedOut(true);
      localStorage.setItem("staff_explicitly_logged_out", "true");
      localStorage.removeItem("staff_token");
      setAuthToken("");
      setCurrentStep("login");
    }
  };

  const refreshToken = async (expiredToken: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/staff/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.token) {
        // Update token in localStorage and state
        localStorage.setItem("staff_token", data.data.token);
        setAuthToken(data.data.token);

        // Update staff data if available
        if (data.data.staff) {
          setStaffData(data.data.staff);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  const attemptStaffLogin = async (
    identifier: string,
    otp?: string,
  ): Promise<StaffData | "OTP_SENT" | null> => {
    setLoading(true);
    setError("");

    const body: any = { identifier };
    if (otp) {
      body.otp = otp;
    } else {
      body.requestOtp = true;
    }

    const response = await apiCall("/api/auth/staff/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (response.success && response.data.token) {
      // Login successful
      const token = response.data.token;
      const staff = response.data.staff;

      localStorage.setItem("staff_token", token);
      setAuthToken(token);

      return staff;
    } else if (response.data?.requireOtp) {
      // OTP required
      setShowOtpInput(true);
      return "OTP_SENT";
    } else {
      setError(response.message);
      return null;
    }
  };

  const checkExistingStaffProfile = async (
    token: string,
  ): Promise<StaffData | null> => {
    try {
      const response = await apiCall("/api/auth/staff/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Error checking existing staff profile:", error);
      return null;
    }
  };

  const registerStaff = async (
    staffData: Partial<StaffData>,
  ): Promise<boolean> => {
    console.log("🔵 registerStaff called with authToken:", authToken);

    if (!authToken) {
      console.log("❌ No authToken - registration failed");
      setError("Authentication required");
      return false;
    }

    setLoading(true);
    setError("");

    const registrationData = {
      fullName: staffData.fullName,
      email: staffData.email,
      instagram: staffData.instagram,
      phone: staffData.phone,
      loginMethod: loginMethod?.toUpperCase() || "PHONE",
    };

    const response = await apiCall("/api/auth/staff/register", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(registrationData),
    });

    setLoading(false);

    if (response.success) {
      setStaffData((prev) => ({ ...prev, ...response.data }));
      return true;
    } else {
      setError(response.message);
      return false;
    }
  };

  const handleGoogleStaffAuth = async (): Promise<StaffData | null> => {
    setLoading(true);
    setError("");

    try {
      const response = await apiCall("/api/auth/google/staff", {
        method: "POST",
      });

      if (response.success && response.data.token) {
        // Staff exists and logged in successfully (direct token means no verification needed)
        const token = response.data.token;
        const staff = response.data.staff;

        localStorage.setItem("staff_token", token);
        setAuthToken(token);

        return staff;
      } else if (response.data?.requiresPhoneVerification) {
        // Existing staff needs phone verification
        const verificationToken = response.data.verificationToken;
        const staff = response.data.staff;

        localStorage.setItem("staff_verification_token", verificationToken);
        setStaffData(staff);
        setPhoneNumber(staff.phone || "");
        setCurrentStep("phone-verify");
        return null;
      } else if (response.data?.requireRegistration) {
        // Staff needs to register - store temp token for registration
        if (response.data.tempToken) {
          console.log("🔵 Google OAuth: storing temp token for registration");
          localStorage.setItem("staff_token", response.data.tempToken);
          setAuthToken(response.data.tempToken);
        }
        return null;
      } else {
        setError(response.message);
        return null;
      }
    } catch (error) {
      console.error("Google staff auth error:", error);
      setError("Failed to authenticate with Google");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFlow = async () => {
    if (!session) {
      return;
    }

    setLoading(true);

    try {
      const staff = await handleGoogleStaffAuth();

      if (staff) {
        setStaffData(staff);
        if (staff.phone) {
          setIsPhonePrefilled(true);
        }
        if (staff.registrationStatus === "APPROVED" && staff.isActive) {
          setCurrentStep("dashboard");
        } else {
          setCurrentStep("approval");
        }
      } else {
        // Need to register - go to form step
        setLoginMethod("google");
        setStaffData((prev) => ({
          ...prev,
          email: session.user?.email || "",
          fullName: session.user?.name || "",
        }));
        setCurrentStep("form");
      }
    } catch (error) {
      console.error("Google login flow error:", error);
      setError("Failed to process Google login");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseHistory = async (page: number = 1, search: string = "") => {
    const token = localStorage.getItem("staff_token");
    if (!token) return;

    setExpenseLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: expenseLimit.toString(),
        ...(search && { search }),
      });

      const response = await apiCall(`/api/expenses?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success) {
        // Transform API response to match ExpenseEntry interface
        const transformedExpenses = response.data.map((expense: any) => ({
          id: expense.expenseId,
          customerId: expense.customerId,
          customerName: expense.customerName,
          customerInstagram: expense.customerInstagram,
          amount: expense.amount,
          timestamp: new Date(expense.timestamp),
          staffId: expense.staff?.staffId || staffData.staffId,
          description: expense.description,
          photoUrl: expense.photoUrl,
        }));

        if (page === 1) {
          setExpenseHistory(transformedExpenses);
        } else {
          setExpenseHistory((prev) => [...prev, ...transformedExpenses]);
        }

        setExpenseTotal(response.pagination?.total || 0);
        setExpensePage(page);
      } else {
        toast.error("Failed to load expenses", {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Expense fetch error:", error);
      toast.error("Error loading expenses", {
        description: "Please try again later",
      });
    } finally {
      setExpenseLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("staff_token");
    if (!token) return;

    setDashboardLoading(true);
    try {
      const response = await apiCall("/api/staff/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📊 Dashboard API response:", response);

      if (response.success) {
        setDashboardData(response.data);

        // Update staff data from dashboard response
        if (response.data?.currentStaff) {
          setStaffData((prev) => ({ ...prev, ...response.data.currentStaff }));
        }

        // Fetch expense history after dashboard loads
        await fetchExpenseHistory();
      } else {
        console.error("❌ Dashboard API failed:", response.message);
        // Don't redirect if dashboard fails - user should stay on dashboard page
        // Just show an error message or empty state
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      // Don't redirect on dashboard error - user should stay on dashboard page
    } finally {
      setDashboardLoading(false);
    }
  };

  const validateAndLoadStaff = async (token: string): Promise<void> => {
    // First, check if user has a complete staff profile
    try {
      // Decode token to get phone number and role
      let decoded: any = null;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        decoded = payload;
        console.log("🔍 Token decoded:", {
          role: decoded.role,
          id: decoded.id,
          staffId: decoded.staffId,
        });
      } catch (decodeError) {
        console.error("Failed to decode token:", decodeError);
      }

      // Verify this is actually a staff token
      if (decoded?.role !== "STAFF") {
        console.log("❌ Invalid token role for staff page:", decoded?.role);
        localStorage.removeItem("staff_token");
        setAuthToken("");
        setCurrentStep("login");
        return;
      }

      const profileResponse = await apiCall("/api/auth/staff/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📋 Staff profile API response:", profileResponse);

      if (profileResponse.success && profileResponse.data) {
        // User has a complete profile, check approval status
        const staff = profileResponse.data;
        console.log("👤 Staff profile loaded:", {
          staffId: staff.staffId,
          status: staff.registrationStatus,
          isActive: staff.isActive,
          hasCompleteData: !!(staff.fullName && staff.instagram && staff.phone),
        });

        setStaffData(staff);

        if (staff.registrationStatus === "APPROVED" && staff.isActive) {
          // Approved staff, go to dashboard
          console.log("✅ Approved staff - loading dashboard");
          setCurrentStep("dashboard");
          await fetchDashboardData();
        } else if (staff.registrationStatus === "PENDING") {
          // Pending approval, show approval page
          console.log("⏳ Pending staff - showing approval page");
          setCurrentStep("approval");
        } else if (staff.registrationStatus === "DENIED") {
          // Denied staff
          console.log("❌ Denied staff - showing approval page");
          setCurrentStep("approval");
        } else {
          // Other cases (inactive, etc.)
          console.log("❓ Staff status unclear - showing approval page");
          setCurrentStep("approval");
        }
      } else {
        // Profile API failed - check if it's a 404 (no profile) vs other errors
        if (
          profileResponse.message?.includes("not found") ||
          profileResponse.message?.includes("404")
        ) {
          console.log("📝 No staff profile found - showing registration form");
          // No profile exists, show form
          if (decoded && decoded.phone) {
            setStaffData((prev) => ({
              ...prev,
              phone: decoded.phone,
            }));
          }
          setCurrentStep("form");
        } else {
          // Other API error - likely authentication issue, try dashboard which will show login
          console.log(
            "🔧 Staff profile API error - showing login:",
            profileResponse.message,
          );
          localStorage.removeItem("staff_token");
          setAuthToken("");
          setCurrentStep("login");
        }
      }
    } catch (error) {
      console.error("❌ Staff token validation error:", error);
      localStorage.removeItem("staff_token");
      setAuthToken("");
      setCurrentStep("dashboard"); // Will show login page
    }
  };

  // Staff dashboard states
  const [scannedCustomerId, setScannedCustomerId] = useState("");
  const [scannedCustomerData, setScannedCustomerData] = useState<any>(null);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expensePhoto, setExpensePhoto] = useState<File | null>(null);
  const [expensePhotoPreview, setExpensePhotoPreview] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualCustomerId, setManualCustomerId] = useState("");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [addExpenseLoading, setAddExpenseLoading] = useState(false);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Real expense history data
  const [expenseHistory, setExpenseHistory] = useState<ExpenseEntry[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expensePage, setExpensePage] = useState(1);
  const [expenseLimit] = useState(10);

  const handlePhoneLogin = async () => {
    if (!phoneNumber) return;

    // Reset logout flag when user explicitly chooses to login
    setHasExplicitlyLoggedOut(false);
    localStorage.removeItem("staff_explicitly_logged_out");

    setLoading(true);
    setError("");

    try {
      // First try to request OTP for staff login
      const result = await attemptStaffLogin(phoneNumber);

      if (result === "OTP_SENT") {
        // Staff exists and OTP was sent by backend
        setLoading(false);
        return;
      }

      if (result && typeof result === "object") {
        // Staff exists and logged in successfully (shouldn't happen without OTP)
        setStaffData(result);
        if (result.registrationStatus === "APPROVED" && result.isActive) {
          setCurrentStep("dashboard");
        } else {
          setCurrentStep("approval");
        }
        setLoading(false);
        return;
      }

      // Staff doesn't exist, send OTP for registration flow
      const otpSent = await sendOTP(phoneNumber);
      if (otpSent) {
        setShowOtpInput(true);
      }
    } catch (error) {
      console.error("Staff phone login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otpCode.length !== 6) return;

    // First, try staff login with OTP (for existing staff)
    const result = await attemptStaffLogin(phoneNumber, otpCode);

    if (result && typeof result === "object") {
      setStaffData(result);
      if (result.registrationStatus === "APPROVED" && result.isActive) {
        setCurrentStep("dashboard");
      } else {
        setCurrentStep("approval");
      }
      return;
    }

    // If staff doesn't exist, verify OTP and authenticate for new registration
    const tempToken = await verifyOTP(phoneNumber, otpCode);

    if (tempToken) {
      // Store the temp token as auth token (user is now authenticated)
      localStorage.setItem("staff_token", tempToken);
      setAuthToken(tempToken);

      // Set user data with phone
      setStaffData((prev) => ({
        ...prev,
        phone: phoneNumber,
      }));
      setIsPhonePrefilled(true);
      setLoginMethod("phone");

      // Check if this phone already has a profile (partial registration)
      const existingStaff = await checkExistingStaffProfile(tempToken);

      if (existingStaff) {
        setStaffData(existingStaff);
        if (
          existingStaff.registrationStatus === "APPROVED" &&
          existingStaff.isActive
        ) {
          setCurrentStep("dashboard");
        } else {
          setCurrentStep("approval");
        }
      } else {
        setCurrentStep("form");
      }
    }
  };

  const handleGoogleLogin = async () => {
    // Reset logout flag when user explicitly chooses to login
    setHasExplicitlyLoggedOut(false);
    localStorage.removeItem("staff_explicitly_logged_out");

    setLoading(true);
    setError("");

    try {
      await signIn("google", {
        callbackUrl: "/staff",
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to initiate Google login");
      setLoading(false);
    }
  };

  // Handle QR scan with customer validation
  const handleQRScan = async (scannedData: string) => {
    console.log("🔍 QR Scanned:", scannedData);

    let customerIdToCheck = scannedData;

    // Extract customer ID from QR data if it's a URL or complex format
    if (scannedData.includes("SP")) {
      const match = scannedData.match(/SP\d+/);
      if (match) {
        customerIdToCheck = match[0];
      }
    }

    setLoading(true);
    try {
      const response = await apiCall(
        `/api/user/verify-qr?userId=${customerIdToCheck}`,
      );

      if (response.success) {
        const customerData = response.data.user;
        setScannedCustomerId(customerIdToCheck);
        setScannedCustomerData(customerData);
        setManualCustomerId(""); // Clear manual input

        toast.success("Customer verified!", {
          description: `${customerData.fullName} (@${customerData.instagram})`,
        });
      } else {
        // Customer not found, but allow manual entry
        setScannedCustomerId(customerIdToCheck);
        setScannedCustomerData(null);
        setManualCustomerId(""); // Clear manual input

        toast.warning("Customer not found in system", {
          description: "You can still add expense with manual entry",
        });
      }
    } catch (error) {
      console.error("QR verification error:", error);

      // Allow manual entry even if verification fails
      setScannedCustomerId(customerIdToCheck);
      setScannedCustomerData(null);
      setManualCustomerId(""); // Clear manual input

      toast.warning("Unable to verify customer", {
        description: "Proceeding with manual entry",
      });
    } finally {
      setLoading(false);
      setShowScanner(false);
    }
  };

  // Handle test scan (for demo purposes)
  const handleTestScan = async () => {
    const testUserId = `SP${Math.floor(Math.random() * 900000) + 100000}`;
    await handleQRScan(testUserId);
  };

  // Helper function to convert File to base64 string with compression
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const htmlImage = new window.Image(); // Use window.Image to avoid conflict

      htmlImage.onload = () => {
        // Calculate new dimensions (max 800x600 to reduce size)
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = htmlImage;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(htmlImage, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
        resolve(compressedDataUrl);
      };

      htmlImage.onerror = reject;

      // Convert file to data URL first
      const reader = new FileReader();
      reader.onload = (e) => {
        htmlImage.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle photo upload from file input
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (3MB = 3 * 1024 * 1024 bytes)
      const maxSize = 3 * 1024 * 1024; // 3MB in bytes
      if (file.size > maxSize) {
        toast.error("Photo too large", {
          description: "Please select a photo smaller than 3MB",
        });
        // Clear the input
        if (event.target) {
          event.target.value = "";
        }
        return;
      }

      setExpensePhoto(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setExpensePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    setShowCamera(true);
  };

  // Handle photo from camera
  const handlePhotoFromCamera = (photoFile: File) => {
    // Check file size (3MB = 3 * 1024 * 1024 bytes)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (photoFile.size > maxSize) {
      toast.error("Photo too large", {
        description: "Please capture a smaller photo (max 3MB)",
      });
      setShowCamera(false);
      return;
    }

    setExpensePhoto(photoFile);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setExpensePhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(photoFile);
    setShowCamera(false);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setExpensePhoto(null);
    setExpensePhotoPreview("");
  };

  // Add new expense entry
  const handleAddExpense = async () => {
    if (!scannedCustomerId || !expenseAmount) return;

    setAddExpenseLoading(true);
    try {
      const token = localStorage.getItem("staff_token");
      if (!token) {
        toast.error("Authentication required", {
          description: "Please log in again",
        });
        return;
      }

      // First, validate if customer exists by checking QR
      let customerData = null;
      try {
        const qrResponse = await apiCall(
          `/api/user/verify-qr?userId=${scannedCustomerId}`,
        );
        if (qrResponse.success) {
          customerData = qrResponse.data.user;
        }
      } catch (error) {
        // Customer doesn't exist, we'll use manual entry
        console.log("Customer not found in system, using manual entry");
      }

      // Convert photo to base64 if exists
      let photoUrl = null;
      if (expensePhoto) {
        try {
          photoUrl = await fileToBase64(expensePhoto);
        } catch (error) {
          console.error("Error converting photo to base64:", error);
          toast.error("Photo processing failed", {
            description: "Please try again or skip the photo",
          });
          return;
        }
      }

      const expenseData = {
        customerId: scannedCustomerId,
        customerName: customerData?.fullName || `Customer ${scannedCustomerId}`,
        customerInstagram:
          customerData?.instagram || `@${scannedCustomerId.toLowerCase()}`,
        amount: Number.parseInt(expenseAmount),
        description: expenseDescription || undefined, // Optional description
        category: "General", // You can add category selection later
        photoUrl: photoUrl,
      };

      const response = await apiCall("/api/expenses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      if (response.success) {
        toast.success("Expense added successfully", {
          description: `IDR ${expenseAmount} for ${expenseData.customerName}`,
        });

        // Clear form
        setScannedCustomerId("");
        setExpenseAmount("");
        setExpenseDescription("");
        setExpensePhoto(null);
        setExpensePhotoPreview("");
        setScannedCustomerData(null);

        // Refresh expense history to show the new expense
        await fetchExpenseHistory(1, searchTerm);
      } else {
        toast.error("Failed to add expense", {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Add expense error:", error);
      toast.error("Error adding expense", {
        description: "Please try again later",
      });
    } finally {
      setAddExpenseLoading(false);
    }
  };

  // Update expense entry
  const handleUpdateExpense = async (
    entryId: string,
    newAmount: number,
    newDescription: string,
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("staff_token");
      if (!token) {
        toast.error("Authentication required", {
          description: "Please log in again",
        });
        return;
      }

      const updateData = {
        amount: newAmount,
        description: newDescription,
      };

      const response = await apiCall(`/api/expenses/${entryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        toast.success("Expense updated successfully");

        // Update local state optimistically
        setExpenseHistory(
          expenseHistory.map((entry) =>
            entry.id === entryId
              ? { ...entry, amount: newAmount, description: newDescription }
              : entry,
          ),
        );
        setEditingEntry(null);
      } else {
        toast.error("Failed to update expense", {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Update expense error:", error);
      toast.error("Error updating expense", {
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== "") {
        fetchExpenseHistory(1, searchTerm);
      } else {
        fetchExpenseHistory(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Use expenseHistory directly (no local filtering since API handles search)
  const filteredHistory = expenseHistory;

  const handleFormSubmit = async () => {
    console.log("🔵 Complete Setup button clicked!");
    console.log("🔵 Current staffData:", {
      fullName: staffData.fullName,
      instagram: staffData.instagram,
      phone: staffData.phone,
      loginMethod: loginMethod,
    });

    // Clear any existing field errors
    setFieldErrors({ instagram: "", email: "", phone: "" });
    setError("");

    // Validate form data using Zod schema
    try {
      const validationData = {
        fullName: staffData.fullName,
        email: staffData.email || undefined,
        phone: staffData.phone || undefined,
        instagram: staffData.instagram,
        loginMethod: loginMethod === "phone" ? "PHONE" : ("GOOGLE" as const),
      };

      console.log("🔍 Validating form data:", validationData);
      const validatedData = staffRegistrationSchema.parse(validationData);
      console.log("✅ Form validation passed:", validatedData);
    } catch (validationError: any) {
      console.log("❌ Form validation failed:", validationError);

      // Handle Zod validation errors
      if (validationError.errors) {
        validationError.errors.forEach((error: any) => {
          const field = error.path[0];
          const message = error.message;

          if (field === "instagram") {
            setFieldErrors((prev) => ({ ...prev, instagram: message }));
          } else if (field === "email") {
            setFieldErrors((prev) => ({ ...prev, email: message }));
          } else if (field === "phone") {
            setFieldErrors((prev) => ({ ...prev, phone: message }));
          }

          // Show toast for the first error
          toast.error("Validation Error", {
            description: message,
          });
        });
      }
      return;
    }

    // For Google OAuth users, verify phone number first
    if (loginMethod === "google") {
      console.log(
        "🔵 Google OAuth user - validating staff data before sending SMS",
      );

      // Extract phone number from phone field (remove formatting)
      const phoneNumber = staffData.phone.replace(/[^\d+]/g, "");

      // First, validate that staff doesn't already exist
      setLoading(true);
      try {
        const validationResponse = await apiCall("/api/auth/staff/validate", {
          method: "POST",
          body: JSON.stringify({
            instagram: staffData.instagram,
            email: staffData.email,
            phone: phoneNumber,
          }),
        });

        if (!validationResponse.success) {
          setLoading(false);

          // Show toast notification
          toast.error("Registration Error", {
            description: validationResponse.message,
          });

          // Set field-specific error if available
          if (validationResponse.data?.conflictField) {
            const field = validationResponse.data.conflictField;
            if (field === "instagram_handle") {
              setFieldErrors((prev) => ({
                ...prev,
                instagram: validationResponse.message,
              }));
            } else if (field === "email") {
              setFieldErrors((prev) => ({
                ...prev,
                email: validationResponse.message,
              }));
            } else if (field === "phone_number") {
              setFieldErrors((prev) => ({
                ...prev,
                phone: validationResponse.message,
              }));
            }
          }

          return;
        }

        console.log(
          "✅ Validation passed - sending SMS verification to phone number",
        );

        // Show success toast for validation
        toast.success("Validation passed", {
          description: "Sending SMS verification code...",
        });

        // Validation passed, now send SMS OTP to phone number
        const otpSent = await sendOTP(phoneNumber);
        if (otpSent) {
          setPhoneNumber(phoneNumber);
          setCurrentStep("phone-verify");
        }
      } catch (error) {
        console.error("Validation error:", error);
        setError("Failed to validate staff data");
      } finally {
        setLoading(false);
      }
    } else {
      // For phone/OTP users, proceed with registration directly
      console.log("✅ Phone login user - proceeding with registration");
      const success = await registerStaff(staffData);

      console.log("🔵 Registration result:", success);
      if (success) {
        setCurrentStep("approval");
      }
    }
  };

  const [approvalStatus, setApprovalStatus] = useState<
    "pending" | "approved" | "denied"
  >("pending");

  const checkApprovalStatus = async () => {
    if (!authToken) {
      console.log("❌ No auth token for approval check");
      return;
    }

    console.log("🔍 Checking approval status...");
    setLoading(true);

    try {
      const response = await apiCall("/api/auth/staff/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log("📋 Approval check response:", response);

      if (response.success && response.data) {
        const staff = response.data;
        console.log("👤 Staff data from approval check:", {
          staffId: staff.staffId,
          status: staff.registrationStatus,
          isActive: staff.isActive,
          fullName: staff.fullName,
        });

        setStaffData(staff);

        if (staff.registrationStatus === "APPROVED" && staff.isActive) {
          console.log(
            "✅ Staff is approved and active - redirecting to dashboard",
          );
          setApprovalStatus("approved");
          // Immediate redirect to dashboard (no delay)
          setCurrentStep("dashboard");
          await fetchDashboardData();
        } else if (staff.registrationStatus === "DENIED") {
          console.log("❌ Staff registration denied");
          setApprovalStatus("denied");
        } else {
          console.log("⏳ Staff still pending approval");
          setApprovalStatus("pending");
        }
      } else {
        console.error("❌ Failed to check approval status:", response.message);
        setError("Failed to check approval status");
      }
    } catch (error) {
      console.error("❌ Error checking approval status:", error);
      setError("Error checking approval status");
    } finally {
      setLoading(false);
    }
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

                        {/* Remaining attempts and resend button */}
                        {remainingAttempts > 0 && (
                          <p className="text-xs text-amber-600 text-center">
                            {remainingAttempts} resend attempts remaining
                          </p>
                        )}

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
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-teal/50 text-charcoal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Authenticating...</span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
                  value={staffData.instagram}
                  onChange={(e) =>
                    setStaffData((prev) => ({
                      ...prev,
                      instagram: e.target.value,
                    }))
                  }
                  onFocus={() =>
                    setFieldErrors((prev) => ({ ...prev, instagram: "" }))
                  }
                  placeholder="@your_instagram"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    fieldErrors.instagram
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-teal"
                  }`}
                />
                {fieldErrors.instagram && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.instagram}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={staffData.fullName}
                  onChange={(e) =>
                    setStaffData((prev) => ({
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={staffData.phone}
                  onFocus={() => {
                    setIsPhonePrefilled(false);
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  onChange={(e) =>
                    setStaffData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+62 812-3456-7890"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    fieldErrors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : isPhonePrefilled
                      ? "border-gray-200 focus:ring-teal bg-gray-50"
                      : "border-gray-200 focus:ring-teal bg-white"
                  }`}
                  readOnly={isPhonePrefilled}
                />
                {fieldErrors.phone ? (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.phone}
                  </p>
                ) : (
                  <p className="text-xs text-charcoal/60 mt-1">
                    {isPhonePrefilled
                      ? "Auto-filled from login method"
                      : "Enter your phone number"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={staffData.email}
                  onFocus={() =>
                    setFieldErrors((prev) => ({ ...prev, email: "" }))
                  }
                  onChange={(e) =>
                    setStaffData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your.email@example.com"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-teal"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
                {staffData.email && (
                  <p className="text-xs text-charcoal/60 mt-1">
                    Auto-filled from login method
                  </p>
                )}
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={
                  !staffData.fullName ||
                  !staffData.instagram ||
                  !staffData.phone ||
                  loading
                }
                className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Complete Setup"
                )}
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

  if (currentStep === "phone-verify") {
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
              {localStorage.getItem("staff_verification_token")
                ? "Phone Verification"
                : "Verify Phone Number"}
            </h1>
            <p className="text-charcoal/70">
              {localStorage.getItem("staff_verification_token")
                ? "Enter the SMS code to verify your identity and access your staff account"
                : "We've sent an SMS verification code to your phone number"}
            </p>
          </div>

          {/* Phone Number Verification Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {error && (
              <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-lg">
                <p className="text-coral text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm text-charcoal/70 mb-3">
                  Enter the 6-digit SMS code sent to {phoneNumber}
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
              </div>

              <button
                onClick={async () => {
                  // Check if this is existing staff verification or new registration
                  const verificationToken = localStorage.getItem(
                    "staff_verification_token",
                  );

                  if (verificationToken) {
                    // Existing staff verification
                    console.log(
                      "🔵 Verifying existing staff phone verification",
                    );
                    setLoading(true);

                    try {
                      const response = await apiCall(
                        "/api/auth/staff/verify-existing",
                        {
                          method: "POST",
                          body: JSON.stringify({
                            phone: phoneNumber,
                            code: otpCode,
                            verificationToken: verificationToken,
                          }),
                        },
                      );

                      if (response.success && response.data.token) {
                        console.log(
                          "✅ Existing staff phone verification successful",
                        );
                        const token = response.data.token;
                        const staff = response.data.staff;

                        localStorage.setItem("staff_token", token);
                        localStorage.removeItem("staff_verification_token");
                        setAuthToken(token);
                        setStaffData(staff);

                        if (
                          staff.registrationStatus === "APPROVED" &&
                          staff.isActive
                        ) {
                          setCurrentStep("dashboard");
                        } else {
                          setCurrentStep("approval");
                        }
                      } else {
                        setError(response.message);
                      }
                    } catch (error) {
                      console.error(
                        "Existing staff verification error:",
                        error,
                      );
                      setError("Failed to verify existing staff");
                    } finally {
                      setLoading(false);
                    }
                  } else {
                    // New staff registration flow
                    console.log(
                      "🔵 Verifying SMS OTP for Google OAuth user registration",
                    );
                    const tempToken = await verifyOTP(phoneNumber, otpCode);
                    if (tempToken) {
                      console.log(
                        "✅ Phone number verified via SMS - proceeding with registration",
                      );
                      // Update temp token with verified phone number
                      setAuthToken(tempToken);
                      localStorage.setItem("staff_token", tempToken);

                      // Now proceed with registration
                      const success = await registerStaff({
                        ...staffData,
                        phone: phoneNumber, // Add verified phone number
                      });

                      if (success) {
                        setCurrentStep("approval");
                      }
                    }
                  }
                }}
                disabled={otpCode.length !== 6 || loading}
                className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : localStorage.getItem("staff_verification_token") ? (
                  "Verify Phone & Login"
                ) : (
                  "Verify SMS & Complete Registration"
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal/60">
                  Didn't receive the code?
                </span>
                <button
                  onClick={() => resendOTP()}
                  disabled={resendTimer > 0}
                  className="text-teal hover:text-teal/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                </button>
              </div>
            </div>

            {/* Back to Form */}
            <div className="text-center mt-6">
              <button
                onClick={() => setCurrentStep("form")}
                className="text-teal hover:text-teal/80 text-sm font-medium"
              >
                ← Back to form
              </button>
            </div>
          </div>
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
              <span className="text-coral">STAFF</span>{" "}
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
                  Your staff registration is being reviewed by the owner. Please
                  wait for approval.
                </p>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Staff ID:</strong> {staffData.staffId}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Name:</strong> {staffData.fullName}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <strong>Instagram:</strong> @{staffData.instagram}
                  </p>
                </div>
                <button
                  onClick={checkApprovalStatus}
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white p-3 rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Approval Status"
                  )}
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
                  Congratulations! Your staff registration has been approved by
                  the owner.
                </p>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Staff ID:</strong> {staffData.staffId}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Status:</strong> Active Staff Member
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setCurrentStep("dashboard");
                    await fetchDashboardData();
                  }}
                  className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Access Staff Dashboard
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
                  Unfortunately, your staff registration has been denied by the
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
    // If not authenticated, redirect to login step
    if (!authToken) {
      setCurrentStep("login");
      return null;
    }

    // If authenticated, show dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-mint/20 to-teal/10 p-4">
        {/* Camera Modal */}
        {showCamera && (
          <CameraModal
            isOpen={showCamera}
            onCapture={handlePhotoFromCamera}
            onClose={() => setShowCamera(false)}
          />
        )}

        {/* QR Scanner Component */}
        <QRScanner
          isOpen={showScanner}
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-charcoal">
                  Staff Dashboard
                </h1>
                <p className="text-charcoal/70">
                  Welcome, {staffData.fullName}
                </p>
                <p className="text-sm text-charcoal/60">
                  Staff ID: {staffData.staffId}
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

                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-2 bg-coral text-white rounded-lg hover:bg-coral/90 transition-colors text-sm"
                >
                  Logout
                </button>
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
                {/* Manual Customer ID Entry */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-charcoal">
                    Enter Customer ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCustomerId}
                      onChange={(e) =>
                        setManualCustomerId(e.target.value.toUpperCase())
                      }
                      placeholder="SP123456"
                      className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent w-20"
                    />
                    <button
                      onClick={() => handleQRScan(manualCustomerId)}
                      disabled={!manualCustomerId || loading}
                      className="bg-teal text-white px-4 py-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      Verify
                    </button>
                  </div>
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

                {/* QR Scanner */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-teal text-white p-4 rounded-lg font-medium hover:bg-teal/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-5 h-5" />
                    Start QR Scanner
                  </button>

                  {/* Demo/Test Scan Button */}
                  <button
                    onClick={handleTestScan}
                    disabled={loading}
                    className="w-full bg-gray-500 text-white p-3 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        Test Scan (Demo)
                      </>
                    )}
                  </button>
                </div>

                {scannedCustomerId && (
                  <div className="bg-lime/10 rounded-lg p-4 border border-lime/20">
                    {scannedCustomerData ? (
                      // Customer found - show full details
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-lime" />
                          <p className="text-sm font-medium text-lime">
                            Customer Verified
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-charcoal/60 uppercase tracking-wide">
                              Customer ID
                            </p>
                            <p className="font-bold text-lime text-lg">
                              {scannedCustomerId}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-charcoal/60 uppercase tracking-wide">
                              Full Name
                            </p>
                            <p className="font-semibold text-charcoal">
                              {scannedCustomerData.fullName}
                            </p>
                          </div>

                          <div className="flex gap-4">
                            <div>
                              <p className="text-xs text-charcoal/60 uppercase tracking-wide">
                                Instagram
                              </p>
                              <p className="font-medium text-charcoal">
                                @{scannedCustomerData.instagram}
                              </p>
                            </div>

                            {scannedCustomerData.phone && (
                              <div>
                                <p className="text-xs text-charcoal/60 uppercase tracking-wide">
                                  Phone
                                </p>
                                <p className="font-medium text-charcoal">
                                  {scannedCustomerData.phone}
                                </p>
                              </div>
                            )}
                          </div>

                          {scannedCustomerData.registrationStatus && (
                            <div>
                              <p className="text-xs text-charcoal/60 uppercase tracking-wide">
                                Registration Status
                              </p>
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  scannedCustomerData.registrationStatus ===
                                  "APPROVED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {scannedCustomerData.registrationStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Customer not found - show ID only
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-amber-600" />
                          <p className="text-sm font-medium text-amber-600">
                            Customer Not Found
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-charcoal/60 uppercase tracking-wide">
                            Customer ID
                          </p>
                          <p className="font-bold text-amber-600 text-lg">
                            {scannedCustomerId}
                          </p>
                        </div>
                        <p className="text-xs text-charcoal/60">
                          Proceeding with manual entry
                        </p>
                      </div>
                    )}
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
                    Photo{" "}
                    <span className="text-charcoal/50 font-normal">
                      (max 3MB)
                    </span>
                  </label>
                  <div className="space-y-3">
                    {/* Photo Preview */}
                    {expensePhotoPreview && (
                      <div className="relative">
                        <div className="w-full h-48 border border-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src={expensePhotoPreview}
                            alt="Expense photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={handleRemovePhoto}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Photo Actions */}
                    {!expensePhotoPreview && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCameraCapture}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Camera className="w-5 h-5 text-charcoal/60" />
                          <span className="text-sm text-charcoal">
                            Take Photo
                          </span>
                        </button>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="flex-1 flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Upload className="w-5 h-5 text-charcoal/60" />
                          <span className="text-sm text-charcoal">
                            Upload Photo
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Notes{" "}
                    <span className="text-charcoal/50 font-normal">
                      (optional)
                    </span>
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
                    !scannedCustomerId || !expenseAmount || addExpenseLoading
                  }
                  className="w-full bg-coral text-white p-3 rounded-lg font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {addExpenseLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add Expense
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-2 md:gap-0 mb-6">
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
              {expenseLoading && expenseHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal" />
                  <p className="text-charcoal/60">Loading expenses...</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-charcoal/60">
                  <History className="w-12 h-12 mx-auto mb-4 text-charcoal/40" />
                  <p>No expense records found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">
                      Try adjusting your search terms
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {filteredHistory.map((entry) => (
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
                        <div className="flex items-center justify-between flex-col md:flex-row">
                          <div className="flex-1">
                            <div className="flex md:items-center gap-4 mb-2 flex-col md:flex-row">
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

                            <div className="md:hidden">
                              <div className="flex justify-between gap-4">
                                <div className="flex md:items-center gap-2 text-sm text-charcoal/70 flex-col md:flex-row">
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
                                {entry.photoUrl && (
                                  <div>
                                    <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                      <Image
                                        src={entry.photoUrl}
                                        alt="Expense photo"
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <p className="text-sm text-charcoal/80 mt-1">
                                {entry.description}
                              </p>
                            </div>

                            <div className="hidden md:flex flex-col">
                              <div className="flex md:items-center gap-4 text-sm text-charcoal/70 flex-col md:flex-row">
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
                              {entry.photoUrl && (
                                <div className="mt-2">
                                  <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                    <Image
                                      src={entry.photoUrl}
                                      alt="Expense photo"
                                      width={96}
                                      height={96}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
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
                  ))}

                  {/* Load More Button */}
                  {expenseTotal > expenseHistory.length && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() =>
                          fetchExpenseHistory(expensePage + 1, searchTerm)
                        }
                        disabled={expenseLoading}
                        className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        {expenseLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4" />
                            Load More ({expenseTotal -
                              expenseHistory.length}{" "}
                            remaining)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="text-center mt-6">
            <button
              onClick={handleLogout}
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

// Camera Modal Component using react-webcam
interface CameraModalProps {
  isOpen: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
}

function CameraModal({ isOpen, onCapture, onClose }: CameraModalProps) {
  const webcamRef = useRef<any>(null);
  const [cameraError, setCameraError] = useState<string>("");

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            // Check file size (3MB = 3 * 1024 * 1024 bytes)
            const maxSize = 3 * 1024 * 1024;
            if (blob.size > maxSize) {
              toast.error("Photo too large", {
                description: "Please capture a smaller photo (max 3MB)",
              });
              return;
            }

            const file = new File([blob], "expense-photo.jpg", {
              type: "image/jpeg",
            });
            onCapture(file);
          })
          .catch((error) => {
            console.error("Error converting image:", error);
            setCameraError("Failed to capture photo");
          });
      }
    }
  };

  const handleUserMediaError = (error: any) => {
    console.error("Camera error:", error);
    setCameraError("Cannot access camera. Please check permissions.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="p-4">
          <div className="relative">
            <div className="w-full h-64 bg-black rounded-lg overflow-hidden">
              {cameraError ? (
                <div className="w-full h-full flex items-center justify-center text-center text-white">
                  <div>
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{cameraError}</p>
                  </div>
                </div>
              ) : (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.7}
                  videoConstraints={{
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                  }}
                  onUserMediaError={handleUserMediaError}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>

          {/* Capture Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={capturePhoto}
              disabled={!!cameraError}
              className="w-16 h-16 bg-coral rounded-full flex items-center justify-center hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-4 pb-4">
          {cameraError ? (
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">
                Camera access failed. Please check permissions.
              </p>
              <button
                onClick={() => {
                  setCameraError("");
                  // Force webcam to retry
                  if (webcamRef.current) {
                    webcamRef.current = null;
                  }
                }}
                className="bg-coral text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-coral/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-600 text-sm">
              Position the camera and tap the button to capture
            </p>
          )}
        </div>
      </div>
    </div>
  );
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
      <div className="flex md:items-center flex-col md:flex-row gap-4 mb-2">
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
