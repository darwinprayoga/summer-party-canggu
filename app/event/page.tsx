"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";

type Step = "login" | "form" | "phone-verify" | "success";

interface UserData {
  phone: string;
  email: string;
  fullName: string;
  instagram: string;
  userId: string;
  isRSVP?: boolean;
  rsvpAt?: string;
  createdAt?: string;
}

interface DashboardData {
  user: {
    id: number;
    userId: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    instagram: string;
    referralCode: string;
    isRSVP: boolean;
    rsvpAt: string | null;
    createdAt: string;
  };
  expenseStats: {
    totalExpenses: number;
    expenseCount: number;
    expenses: Array<{
      id: string;
      expenseId: string;
      amount: number;
      description: string;
      category: string;
      timestamp: string;
      photoUrl: string | null;
      staff: {
        fullName: string;
        staffId: string;
      } | null;
    }>;
  };
  referralStats: {
    totalReferrals: number;
    referralEarnings: number;
    referrals: Array<{
      id: number;
      fullName: string;
      instagram: string;
      joinedAt: string;
    }>;
  };
  referrer: {
    fullName: string;
    instagram: string;
    userId: string;
  } | null;
  leaderboard: {
    topSpenders: Array<{
      userId: string;
      username: string;
      fullName: string;
      totalExpenses: number;
      rank: number;
    }>;
    currentUserRank: number | null;
    currentUserExpenses: number;
  };
  qrCode: {
    data: string;
    url: string;
  };
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
  const { data: session } = useSession();

  const [currentStep, setCurrentStep] = useState<Step>("login");
  const [loginMethod, setLoginMethod] = useState<"phone" | "google" | null>(
    null,
  );
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // Persist phone number in localStorage to survive hot reloads
    if (typeof window !== "undefined") {
      return localStorage.getItem("temp_phone_number") || "";
    }
    return "";
  });
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [verificationToken, setVerificationToken] = useState<string>("");
  const [userData, setUserData] = useState<UserData>({
    phone: "",
    email: "",
    fullName: "",
    instagram: "",
    userId: "",
  });

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const [referralData, setReferralData] = useState<ReferralData>({
    referrerUsername: "beach_vibes_bali",
    myExpenses: 0, // Will be updated from real data
    myEarnings: 0, // Will be updated from real data
    referredUsers: [], // Will be updated from real data
  });

  const [referrerInfo, setReferrerInfo] = useState<{
    userId: string;
    fullName: string;
    instagram: string;
    memberSince: string;
  } | null>(null);

  const [referralValidated, setReferralValidated] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [hasProcessedOAuth, setHasProcessedOAuth] = useState(false);

  // Field-specific error states
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    instagram: "",
    email: "",
    phone: "",
  });

  // Validate referral code
  const validateReferralCode = async (code: string) => {
    try {
      console.log("🔍 Validating referral code:", code);
      const response = await fetch(
        `/api/referral/validate?code=${encodeURIComponent(code)}`,
      );
      const result = await response.json();

      if (result.success && result.data.referrer) {
        console.log("✅ Valid referral code:", result.data.referrer);
        setReferrerInfo(result.data.referrer);
        setReferralValidated(true);

        // Update referral data with real referrer info
        setReferralData((prev) => ({
          ...prev,
          referrerUsername: result.data.referrer.instagram,
        }));

        toast.success("Referral Code Valid!", {
          description: `You're invited by @${result.data.referrer.instagram}`,
        });
      } else {
        console.log("❌ Invalid referral code:", result.message);
        setReferralValidated(false);
        toast.error("Invalid Referral Code", {
          description: result.message || "The referral code is not valid",
        });
      }
    } catch (error) {
      console.error("Referral validation error:", error);
      setReferralValidated(false);
      toast.error("Referral Validation Failed", {
        description: "Could not validate referral code",
      });
    }
  };

  // Load user profile data from server
  const loadUserProfile = async (token: string) => {
    try {
      const response = await fetch("/api/auth/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        const user = result.data;
        setUserData({
          phone: user.phone || "",
          email: user.email || "",
          fullName: user.fullName,
          instagram: user.instagram,
          userId: user.userId,
        });
      } else {
        // If profile fetch fails, the token might be invalid
        console.error("Failed to load user profile:", result.message);
        localStorage.removeItem("user_token");
        setAuthToken("");
        setCurrentStep("login");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Don't redirect on network errors, keep user authenticated
    }
  };

  // Load real dashboard data
  const loadDashboardData = async (token: string) => {
    setIsLoadingDashboard(true);
    try {
      const response = await fetch("/api/user/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDashboardData(result.data);

        // Update referral data with real API data
        setReferralData({
          referrerUsername:
            result.data.referrer?.instagram || "beach_vibes_bali",
          myExpenses: result.data.expenseStats.totalExpenses,
          myEarnings: result.data.referralStats.referralEarnings,
          referredUsers: result.data.referralStats.referrals.map(
            (referral: any) => ({
              username: referral.instagram,
              expenses: referral.totalSpent || 0,
              earnings: referral.earnings || 0,
            }),
          ),
        });

        // Update leaderboard with real API data
        setLeaderboard(
          result.data.leaderboard.topSpenders.map((spender: any) => ({
            username: spender.username,
            expenses: spender.totalExpenses,
            rank: spender.rank,
          })),
        );

        console.log("✅ Dashboard data loaded successfully", result.data);
      } else {
        console.error("Failed to load dashboard data:", result.message);
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkExistingAuth = () => {
      console.log("🔍 Event page loading - checking tokens...");
      const userToken = localStorage.getItem("user_token");
      const staffToken = localStorage.getItem("staff_token");
      const adminToken = localStorage.getItem("admin_token");

      console.log("📋 Token status:", {
        userToken: !!userToken,
        staffToken: !!staffToken,
        adminToken: !!adminToken,
      });

      // Security check: if user has non-user tokens, prevent access
      if (!userToken && (staffToken || adminToken)) {
        // User is trying to access event page with staff/admin credentials
        if (staffToken) {
          console.warn(
            "🚨 Security: Staff token detected on event page - access denied",
          );
        }
        if (adminToken) {
          console.warn(
            "🚨 Security: Admin token detected on event page - access denied",
          );
        }
        console.log("❌ No user token found - staying on login page");
        setCurrentStep("login");
        return;
      }

      if (userToken) {
        console.log("✅ Valid user token found - proceeding to dashboard");
        // User is already authenticated, go to success page
        setCurrentStep("success");

        // Try to validate the token and load user data
        try {
          // Decode the token to get user info (basic validation)
          const payload = JSON.parse(atob(userToken.split(".")[1]));
          if (payload.id && payload.role === "USER") {
            setAuthToken(userToken);
            // Load complete user data from server
            loadUserProfile(userToken);
            // Load dashboard data
            loadDashboardData(userToken);
          }
        } catch (error) {
          // Invalid token, clear it and stay on login
          console.error("Invalid token found:", error);
          localStorage.removeItem("user_token");
          setCurrentStep("login");
        }
      } else {
        console.log("ℹ️ No user token found - staying on login page");
      }
    };

    checkExistingAuth();
  }, []); // Run only on component mount

  // Debug session changes
  useEffect(() => {
    console.log("🔍 Session changed:", session);
    console.log("🔍 Current step:", currentStep);
  }, [session, currentStep]);

  // Validate referral code on component mount
  useEffect(() => {
    if (referralCode && !referralValidated) {
      validateReferralCode(referralCode);
    }
  }, [referralCode, referralValidated]);

  // Auto-handle Google OAuth return
  useEffect(() => {
    const handleGoogleOAuthReturn = async () => {
      console.log("🔍 Google OAuth handler called with session:", {
        hasSession: !!session?.user?.email,
        email: session?.user?.email,
        hasUserToken: !!localStorage.getItem("user_token"),
        hasProcessedOAuth,
        isLoading,
        currentStep
      });

      // Security check: Only process Google OAuth if user doesn't have non-user tokens
      const staffToken = localStorage.getItem("staff_token");
      const adminToken = localStorage.getItem("admin_token");

      if (staffToken || adminToken) {
        console.warn(
          "🚨 Security: Google OAuth session detected but user has non-user tokens - ignoring OAuth for event page",
        );
        return;
      }

      // Check if we have a session but no user_token and haven't processed this session yet
      if (
        session?.user?.email &&
        !localStorage.getItem("user_token") &&
        !hasProcessedOAuth &&
        !isLoading
      ) {
        console.log("✅ Processing Google OAuth session...");
        setHasProcessedOAuth(true); // Prevent multiple calls
        setIsLoading(true);
        try {
          const response = await fetch("/api/auth/google/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const authResult = await response.json();
          console.log("📋 Google OAuth API result:", authResult);

          if (authResult.success) {
            if (authResult.data.isExisting) {
              console.log("👤 Existing Google OAuth user - skipping phone verification");
              // Existing users with Google OAuth always skip phone verification
              setAuthToken(authResult.data.token);
              localStorage.setItem("user_token", authResult.data.token);
              setUserData({
                phone: authResult.data.user.phone || "",
                email: authResult.data.user.email || "",
                fullName: authResult.data.user.fullName,
                instagram: authResult.data.user.instagram,
                userId: authResult.data.user.userId,
              });
              setCurrentStep("success");
              // Load dashboard data for existing user
              loadDashboardData(authResult.data.token);
              console.log("🔄 Set step to success - no phone verification needed");
            } else {
              // New user - needs to complete registration form
              console.log("🆕 New user detected - going to registration form");
              setTempToken(authResult.data.tempToken);
              setUserData((prev) => ({
                ...prev,
                email: authResult.data.googleUser.email,
                fullName: authResult.data.googleUser.name,
              }));
              setLoginMethod("google");
              setCurrentStep("form"); // Go to registration form for new users
              console.log("🔄 Set step to form");
            }
          } else {
            console.error("❌ Google OAuth API failed:", authResult.message);
            alert(authResult.message || "Google authentication failed");
            setHasProcessedOAuth(false); // Allow retry
          }
        } catch (error) {
          console.error("❌ Google OAuth error:", error);
          alert("Google authentication failed. Please try again.");
          setHasProcessedOAuth(false); // Allow retry
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("ℹ️ Google OAuth handler skipped:", {
          reason: !session?.user?.email ? "no session" :
                  localStorage.getItem("user_token") ? "has user token" :
                  hasProcessedOAuth ? "already processed" :
                  isLoading ? "loading" : "unknown"
        });
      }
    };

    // Small delay to ensure session is ready
    const timer = setTimeout(handleGoogleOAuthReturn, 500);
    return () => clearTimeout(timer);
  }, [session, hasProcessedOAuth]); // Removed isLoading from dependencies

  // Reset OAuth processing state when session changes
  useEffect(() => {
    if (!session?.user?.email && hasProcessedOAuth) {
      console.log("🔄 Session ended - resetting OAuth processing state");
      setHasProcessedOAuth(false);
    }
  }, [session?.user?.email, hasProcessedOAuth]);

  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    const userId = dashboardData?.user.userId || userData.userId;
    return `${baseUrl}/event?referral=${userId}`;
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(generateReferralLink());
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (err) {
      // Silently fail
    }
  };

  // Send OTP to WhatsApp number
  const handlePhoneLogin = async (phoneToUse?: string) => {
    const phone = phoneToUse || phoneNumber;
    console.log("🔍 Attempting to send OTP to:", phone);

    if (!phone || isLoading) {
      console.log("❌ Validation failed:", { phone, isLoading });
      return;
    }

    setIsLoading(true);
    try {
      console.log("📱 Making request to /api/auth/phone/send-otp");
      const response = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone }),
      });

      console.log("📡 Response status:", response.status);
      const result = await response.json();
      console.log("📋 Response data:", result);

      if (result.success) {
        console.log("✅ OTP sent successfully");
        setShowOtpInput(true);
      } else {
        console.log("❌ OTP sending failed:", result.message);
        alert(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("❌ Request error:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (otpCode.length !== 6 || isLoading) return;

    setIsLoading(true);
    try {
      // For Google OAuth users who already filled registration form, we register them after OTP verification
      if (loginMethod === "google" && tempToken) {
        console.log("🔄 Google OAuth user: Verifying OTP and completing registration");

        // First verify the OTP
        const otpVerifyResponse = await fetch("/api/auth/phone/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: userData.phone,
            code: otpCode,
          }),
        });

        const otpResult = await otpVerifyResponse.json();
        console.log("🔍 OTP verification result:", otpResult);

        if (otpResult.success) {
          // OTP verified, now register the user
          const registrationData = {
            fullName: userData.fullName,
            email: userData.email || undefined,
            phone: userData.phone,
            instagram: userData.instagram,
            loginMethod: "GOOGLE",
            referralCode: referralCode || undefined,
          };


          const registerResponse = await fetch("/api/auth/user/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tempToken}`,
            },
            body: JSON.stringify(registrationData),
          });

          const registerResult = await registerResponse.json();

          if (registerResult.success) {
            setAuthToken(registerResult.data.token);
            localStorage.setItem("user_token", registerResult.data.token);
            setUserData((prev) => ({
              ...prev,
              userId: registerResult.data.user.userId,
            }));
            setCurrentStep("success");
            // Load dashboard data for new user
            loadDashboardData(registerResult.data.token);
            toast.success("Registration Complete!", {
              description: "Welcome to Summer Party Canggu!",
            });
          } else {
            throw new Error(registerResult.message || "Registration failed");
          }
        } else {
          toast.error("OTP Verification Failed", {
            description: otpResult.message || "Invalid verification code",
          });
        }
      } else {
        // For phone login users, use the existing login flow
        const phoneFromState = phoneNumber;
        const phoneFromStorage = localStorage.getItem("temp_phone_number");
        console.log("🔄 Phone user: Verifying OTP and handling login/registration");

        const phoneToUse = phoneFromState || phoneFromStorage || "";
        const loginResponse = await fetch("/api/auth/user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phoneToUse,
            code: otpCode,
          }),
        });

        const loginResult = await loginResponse.json();

        if (loginResult.success) {
          if (loginResult.data.isExisting) {
            // Existing user - direct login
            setAuthToken(loginResult.data.token);
            localStorage.setItem("user_token", loginResult.data.token);
            setUserData({
              phone: loginResult.data.user.phone || "",
              email: loginResult.data.user.email || "",
              fullName: loginResult.data.user.fullName,
              instagram: loginResult.data.user.instagram,
              userId: loginResult.data.user.userId,
            });
            setCurrentStep("success");
            localStorage.removeItem("temp_phone_number");
            loadDashboardData(loginResult.data.token);
          } else {
            // New user - need to complete registration form
            setTempToken(loginResult.data.tempToken);
            setUserData((prev) => ({
              ...prev,
              phone: phoneToUse,
            }));
            setCurrentStep("form");
          }
        } else {
          toast.error("Verification Failed", {
            description: loginResult.message || "OTP verification failed",
          });
        }
      }
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      toast.error("Verification Error", {
        description: "Failed to verify OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginOtpVerification = async () => {
    if (otpCode.length !== 6 || isLoading) return;

    setIsLoading(true);
    try {
      // Debug: Check phone number state and localStorage (same as handleOtpVerification)
      const phoneFromState = phoneNumber;
      const phoneFromStorage = localStorage.getItem("temp_phone_number");
      console.log("🔄 LoginOtp: Verifying OTP and handling login/registration");
      console.log("🔍 FRONTEND DEBUG (LoginOtp): Phone state:", phoneFromState);
      console.log("🔍 FRONTEND DEBUG (LoginOtp): Phone from localStorage:", phoneFromStorage);
      console.log("🔍 FRONTEND DEBUG (LoginOtp): Using phone:", phoneFromState || phoneFromStorage);

      const phoneToUse = phoneFromState || phoneFromStorage || "";
      console.log("🔍 FRONTEND DEBUG (LoginOtp): Sending data:", { phone: phoneToUse, code: otpCode });

      const response = await fetch("/api/auth/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneToUse,
          code: otpCode,
        }),
      });

      const result = await response.json();
      console.log("🔍 FRONTEND DEBUG (LoginOtp): Login API response:", result);

      if (result.success) {
        console.log("🔍 FRONTEND DEBUG (LoginOtp): isExisting =", result.data.isExisting);
        if (result.data.isExisting) {
          // Existing user - go to success page
          setAuthToken(result.data.token);
          localStorage.setItem("user_token", result.data.token);
          setUserData({
            phone: result.data.user.phone || "",
            email: result.data.user.email || "",
            fullName: result.data.user.fullName,
            instagram: result.data.user.instagram,
            userId: result.data.user.userId,
          });
          setCurrentStep("success");
          // Load dashboard data for existing user
          loadDashboardData(result.data.token);
        } else {
          // New user - go to registration form
          setTempToken(result.data.tempToken);
          setUserData((prev) => ({
            ...prev,
            phone: phoneToUse,
            email: "", // Will be filled in form
          }));
          setCurrentStep("form");
        }
      } else {
        alert(result.message || "Invalid OTP code");
      }
    } catch (error) {
      alert("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingUserVerification = async () => {
    if (otpCode.length !== 6 || isLoading || !verificationToken) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/user/verify-existing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code: otpCode,
          verificationToken: verificationToken,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Verification successful - go to success page
        setAuthToken(result.data.token);
        localStorage.setItem("user_token", result.data.token);
        setUserData({
          phone: result.data.user.phone || "",
          email: result.data.user.email || "",
          fullName: result.data.user.fullName,
          instagram: result.data.user.instagram,
          userId: result.data.user.userId,
        });
        setCurrentStep("success");
        // Load dashboard data after verification
        loadDashboardData(result.data.token);
      } else {
        alert(result.message || "Invalid verification code");
      }
    } catch (error) {
      alert("Failed to verify phone. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Sign in with NextAuth Google provider - preserve referral code in callback URL
      const callbackUrl = referralCode ? `/event?referral=${referralCode}` : "/event";
      await signIn("google", { callbackUrl });
    } catch (error) {
      alert("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Clear any existing field errors
    setFieldErrors({ fullName: "", instagram: "", email: "", phone: "" });

    // Client-side validation
    if (
      !userData.fullName ||
      !userData.instagram ||
      !userData.phone ||
      !userData.email
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Validate user data for conflicts before proceeding
      const validationResponse = await fetch("/api/auth/user/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instagram: userData.instagram,
          email: userData.email,
          phone: userData.phone,
        }),
      });

      const validationResult = await validationResponse.json();

      if (!validationResult.success) {
        // Show toast notification
        toast.error("Registration Error", {
          description: validationResult.message,
        });

        // Set field-specific error if available
        if (validationResult.data?.conflictField) {
          const field = validationResult.data.conflictField;
          if (field === "instagram_handle") {
            setFieldErrors((prev) => ({
              ...prev,
              instagram: validationResult.message,
            }));
          } else if (field === "email") {
            setFieldErrors((prev) => ({
              ...prev,
              email: validationResult.message,
            }));
          } else if (field === "phone_number") {
            setFieldErrors((prev) => ({
              ...prev,
              phone: validationResult.message,
            }));
          }
        }
        return;
      }

      // All users need phone verification for first-time registration
      if (loginMethod === "phone") {
        // For phone login users, check if phone number matches already verified one
        const phoneNormalized = phoneNumber.replace(/\D/g, "");
        const userPhoneNormalized = userData.phone.replace(/\D/g, "");

        if (phoneNormalized === userPhoneNormalized) {
          // Same number already verified - skip phone verification and register directly
          toast.success("Using verified phone number", {
            description: "Registering with already verified phone number...",
          });

          try {
            const registerResponse = await fetch("/api/auth/user/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tempToken}`,
              },
              body: JSON.stringify({
                fullName: userData.fullName,
                email: userData.email || undefined,
                phone: phoneNumber, // Use the already verified phone number
                instagram: userData.instagram,
                loginMethod: "PHONE",
                referralCode: referralCode || undefined,
              }),
            });

            const registerResult = await registerResponse.json();

            if (registerResult.success) {
              setAuthToken(registerResult.data.token);
              localStorage.setItem("user_token", registerResult.data.token);
              setUserData((prev) => ({
                ...prev,
                userId: registerResult.data.user.userId,
              }));
              setCurrentStep("success");
              // Load dashboard data for new user
              loadDashboardData(registerResult.data.token);
            } else {
              throw new Error(registerResult.message || "Registration failed");
            }
          } catch (error: any) {
            console.error("Registration error:", error);
            toast.error("Registration Error", {
              description:
                error.message || "Failed to register. Please try again.",
            });
          }
        } else {
          // Different number - need WhatsApp verification
          toast.success("Validation passed", {
            description: "Proceeding to WhatsApp verification...",
          });
          setCurrentStep("phone-verify");
        }
      } else {
        // For Google OAuth users, skip phone verification and register directly
        toast.success("Validation passed", {
          description: "Completing registration with Google account...",
        });

        try {
          const registerResponse = await fetch("/api/auth/user/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tempToken}`,
            },
            body: JSON.stringify({
              fullName: userData.fullName,
              email: userData.email || undefined,
              phone: userData.phone,
              instagram: userData.instagram,
              loginMethod: "GOOGLE",
              referralCode: referralCode || undefined,
            }),
          });

          const registerResult = await registerResponse.json();

          if (registerResult.success) {
            setAuthToken(registerResult.data.token);
            localStorage.setItem("user_token", registerResult.data.token);
            setUserData((prev) => ({
              ...prev,
              userId: registerResult.data.user.userId,
            }));
            setCurrentStep("success");
            // Load dashboard data for new user
            loadDashboardData(registerResult.data.token);
            toast.success("Registration Complete!", {
              description: "Welcome to Summer Party Canggu!",
            });
          } else {
            throw new Error(registerResult.message || "Registration failed");
          }
        } catch (error: any) {
          console.error("Google OAuth registration error:", error);
          toast.error("Registration Error", {
            description:
              error.message || "Failed to register. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Validation Error", {
        description: "Failed to validate user data. Please try again.",
      });
    } finally {
      setIsLoading(false);
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
              <span className="text-coral">SUMMER PARTY</span>{" "}
              <span className="text-teal italic">Canggu</span>
            </h1>
            <p className="text-charcoal/70">Saturday, September 27 • 2PM-9PM</p>

            {referralCode ? (
              <div className="bg-lime/10 border border-lime/20 rounded-xl p-4 mt-4">
                {referralValidated && referrerInfo ? (
                  <div>
                    <p className="text-sm text-charcoal/80">
                      🎉 Hey! You're invited by{" "}
                      <span className="font-semibold text-lime">
                        {referrerInfo.fullName} (@{referrerInfo.instagram})
                      </span>
                    </p>
                    <p className="text-xs text-charcoal/60 mt-1">
                      Member since{" "}
                      {new Date(referrerInfo.memberSince).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-charcoal/80">
                      🔍 Validating referral code:{" "}
                      <span className="font-mono text-teal">
                        {referralCode}
                      </span>
                    </p>
                    <p className="text-xs text-charcoal/60 mt-1">
                      Please wait...
                    </p>
                  </div>
                )}
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
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            localStorage.setItem("temp_phone_number", e.target.value);
                          }}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                        />
                        <button
                          onClick={() => handlePhoneLogin()}
                          disabled={!phoneNumber || isLoading}
                          className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
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
                          onClick={handleLoginOtpVerification}
                          disabled={otpCode.length !== 6 || isLoading}
                          className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Continue"
                          )}
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
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-coral/50 text-charcoal transition-all hover:bg-coral/5 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Signing in...</span>
                  </>
                ) : (
                  <span className="font-medium">Continue with Google</span>
                )}
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

          <div className="flex gap-3 mt-4">
            <Link
              href="/staff"
              className="flex-1 text-center py-2 px-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 text-charcoal/70 hover:text-charcoal hover:bg-white/80 transition-all text-sm font-medium"
            >
              Staff Login
            </Link>
            <Link
              href="/admin"
              className="flex-1 text-center py-2 px-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 text-charcoal/70 hover:text-charcoal hover:bg-white/80 transition-all text-sm font-medium"
            >
              Admin Login
            </Link>
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
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-teal" />
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal mb-2">
              Verify Your WhatsApp
            </h1>
            <p className="text-charcoal/70">
              Hi {userData.fullName}! We'll send a verification code to your
              WhatsApp number
            </p>
          </div>

          {/* Phone Verification */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg space-y-4">
            {!showOtpInput ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent bg-gray-50"
                    placeholder="+62 812-3456-7890"
                    readOnly
                  />
                  <p className="text-xs text-charcoal/60 mt-1">
                    We'll send the verification code to this WhatsApp number
                  </p>
                </div>
                <button
                  onClick={() => handlePhoneLogin(userData.phone)}
                  disabled={!userData.phone || isLoading}
                  className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-charcoal/70">
                  Enter the 6-digit code sent to {userData.phone}
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
                  onClick={
                    verificationToken
                      ? handleExistingUserVerification
                      : handleOtpVerification
                  }
                  disabled={otpCode.length !== 6 || isLoading}
                  className="w-full bg-teal text-white p-3 rounded-lg font-medium hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : verificationToken ? (
                    "Verify & Login"
                  ) : (
                    "Verify & Complete Registration"
                  )}
                </button>
                <button
                  onClick={() => {
                    setOtpCode("");
                    setShowOtpInput(false);
                  }}
                  className="w-full text-teal p-2 text-sm font-medium hover:text-teal/80 transition-colors"
                >
                  ← Change Phone Number
                </button>
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
                onFocus={() =>
                  setFieldErrors((prev) => ({ ...prev, fullName: "" }))
                }
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.fullName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-teal"
                }`}
                placeholder="Enter your full name"
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.fullName}
                </p>
              )}
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
                  onFocus={() =>
                    setFieldErrors((prev) => ({ ...prev, instagram: "" }))
                  }
                  className={`w-full p-3 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    fieldErrors.instagram
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:ring-teal"
                  }`}
                  placeholder="your_username"
                />
              </div>
              {fieldErrors.instagram && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.instagram}
                </p>
              )}
            </div>

            {/* Phone Number (Auto-filled) */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={userData.phone}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, phone: e.target.value }))
                }
                onFocus={() =>
                  setFieldErrors((prev) => ({ ...prev, phone: "" }))
                }
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-teal"
                } ${userData.phone ? "bg-gray-50" : ""}`}
                placeholder="+62 812-3456-7890"
              />
              {fieldErrors.phone ? (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.phone}
                </p>
              ) : (
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from your login method
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
                value={userData.email}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, email: e.target.value }))
                }
                onFocus={() =>
                  setFieldErrors((prev) => ({ ...prev, email: "" }))
                }
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-teal"
                } ${userData.email ? "bg-gray-50" : ""}`}
                placeholder="your.email@example.com"
              />
              {fieldErrors.email ? (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              ) : userData.email ? (
                <p className="text-xs text-charcoal/60 mt-1">
                  Auto-filled from your Google account
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-coral text-white p-4 rounded-lg font-medium hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Continue to Verification
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
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
          <div className="text-center mt-6 mb-8">
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
                  {isLoadingDashboard ? (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <div className="animate-spin h-6 w-6 border-2 border-coral border-t-transparent rounded-full"></div>
                    </div>
                  ) : dashboardData?.qrCode ? (
                    <div className="w-32 h-32 mx-auto">
                      <img
                        src={dashboardData.qrCode.url}
                        alt="Event QR Code"
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      <QrCode className="w-16 h-16 text-charcoal/40" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-charcoal/60">Your Event ID</p>
                    <p className="text-2xl font-bold text-charcoal font-mono">
                      {dashboardData?.user.userId || userData.userId}
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
                {isLoadingDashboard ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Loading...</span>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Full Name:</span>
                      <span className="text-charcoal font-medium">
                        {dashboardData?.user.fullName || userData.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Instagram:</span>
                      <span className="text-charcoal font-medium">
                        @{dashboardData?.user.instagram || userData.instagram}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Phone:</span>
                      <span className="text-charcoal font-medium">
                        {dashboardData?.user.phone || userData.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal/60">Email:</span>
                      <span className="text-charcoal font-medium">
                        {dashboardData?.user.email || userData.email}
                      </span>
                    </div>
                    {dashboardData?.user.rsvpAt && (
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">RSVP'd:</span>
                        <span className="text-charcoal font-medium">
                          {new Date(
                            dashboardData.user.rsvpAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Referral Statistics */}
              {dashboardData?.referralStats && (
                <div className="bg-teal/10 rounded-xl p-4 border border-teal/20 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-teal" />
                    <h3 className="font-semibold text-charcoal">
                      Referral Statistics
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal">
                        {dashboardData.referralStats.totalReferrals}
                      </p>
                      <p className="text-xs text-charcoal/60">
                        Friends Referred
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-teal">
                        IDR {dashboardData.referralStats.referralEarnings}
                      </p>
                      <p className="text-xs text-charcoal/60">Earnings</p>
                    </div>
                  </div>
                  {dashboardData.referralStats.referrals.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-charcoal mb-2">
                        Recent Referrals:
                      </p>
                      <div className="space-y-1">
                        {dashboardData.referralStats.referrals
                          .slice(0, 3)
                          .map((referral) => (
                            <div
                              key={referral.id}
                              className="flex justify-between text-xs"
                            >
                              <span className="text-charcoal/70">
                                @{referral.instagram}
                              </span>
                              <span className="text-charcoal/60">
                                {new Date(
                                  referral.joinedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {dashboardData.referrer && (
                    <div className="mt-4 pt-4 border-t border-teal/20">
                      <p className="text-xs text-charcoal/60 mb-1">
                        Referred by:
                      </p>
                      <p className="text-sm font-medium text-charcoal">
                        {dashboardData.referrer.fullName} (@
                        {dashboardData.referrer.instagram})
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-coral/10 rounded-xl p-4 border border-coral/20 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Share2 className="w-6 h-6 text-coral" />
                  <h3 className="font-semibold text-charcoal">
                    Generate Referral Link
                  </h3>
                </div>
                <p className="text-sm text-charcoal/70 mb-4">
                  Invite friends and earn $5 for each successful referral!
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
                  href="https://chat.whatsapp.com/FzBkoiJAlyBBFzjEYmgCeu?mode=ems_copy_t"
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
              {isLoadingDashboard ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.username}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.username === userData.instagram
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
                          <p className="text-xs">#{entry.rank}</p>
                        </div>
                        <p className="font-medium text-charcoal text-xs">
                          @{entry.username}
                          {entry.username === userData.instagram && " (You)"}
                        </p>
                      </div>
                      <b className="font-semibold text-charcoal text-xs">
                        IDR {entry.expenses.toLocaleString()}
                      </b>
                    </div>
                  ))}

                  {/* Show current user's rank if not in top 5 */}
                  {dashboardData?.leaderboard.currentUserRank &&
                    dashboardData.leaderboard.currentUserRank > 5 && (
                      <>
                        <div className="text-center py-2">
                          <span className="text-sm text-charcoal/60">...</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-coral/10 border border-coral/20">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-coral/20 text-coral">
                              #{dashboardData.leaderboard.currentUserRank}
                            </div>
                            <span className="font-medium text-charcoal">
                              @{userData.instagram} (You)
                            </span>
                          </div>
                          <span className="font-semibold text-charcoal">
                            IDR{" "}
                            {dashboardData.leaderboard.currentUserExpenses.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Trophy className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-charcoal/60">No spenders yet</p>
                  <p className="text-sm text-charcoal/50">
                    Be the first to make a purchase at the event!
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              {referralCode && referralValidated && referrerInfo && (
                <div className="bg-lime/10 rounded-lg p-3 border border-lime/20 mb-4">
                  <p className="text-sm text-charcoal/70 text-center">
                    Your account connected to{" "}
                    <span className="font-semibold text-lime">
                      {referrerInfo.fullName} (@{referrerInfo.instagram})
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

            {/* Expense History */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="font-semibold text-charcoal mb-4">
                My Event Expenses
              </h3>
              {isLoadingDashboard ? (
                <div className="text-center py-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : dashboardData?.expenseStats.expenses.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.expenseStats.expenses
                    .slice(0, 5)
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {expense.photoUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              <img
                                src={expense.photoUrl}
                                alt="Expense photo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-charcoal text-sm">
                              {expense.description || expense.category}
                            </p>
                            <p className="text-xs text-charcoal/60">
                              {new Date(expense.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                              {expense.staff &&
                                ` • by ${expense.staff.fullName}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-charcoal text-xs">
                            IDR {expense.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-charcoal/60">
                            #{expense.expenseId}
                          </p>
                        </div>
                      </div>
                    ))}

                  {dashboardData.expenseStats.expenses.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-charcoal/60">
                        and {dashboardData.expenseStats.expenses.length - 5}{" "}
                        more expenses...
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-charcoal">
                        Total Expenses:
                      </span>
                      <span className="text-lg font-bold text-charcoal">
                        IDR{" "}
                        {dashboardData.expenseStats.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/60 mt-1">
                      {dashboardData.expenseStats.expenseCount} transaction
                      {dashboardData.expenseStats.expenseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-charcoal/60">No expenses yet</p>
                  <p className="text-sm text-charcoal/50">
                    Your purchases at the event will appear here
                  </p>
                </div>
              )}
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
                  <strong>Venue:</strong> Canggu, Bali, Indonesia
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
