import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import logo from "../assets/logo.png";
import apiClient from "../api/client";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setStep("otp");
      setResendCooldown(30); // 30 seconds cooldown
    } catch (err: any) {
      setError(err.response?.data?.message || "User with this email does not exist.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/verify-otp", { email: email.trim(), otp: otp.trim() });
      setStep("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setResendCooldown(30);
      setOtp("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-[420px] shadow-lg shadow-blue-500/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-cyan/10 flex items-center justify-center">
              <img src={logo} className="w-10 h-10" alt="logo" />
            </div>
            <h2 className="text-2xl font-bold text-navy">
              {step === "email" && "Reset Password"}
              {step === "otp" && "Verify OTP"}
              {step === "reset" && "New Password"}
              {step === "success" && "Success!"}
            </h2>
            <p className="text-sm text-text-muted mt-1.5">
              {step === "email" && "Enter your email to receive a 6-digit verification code"}
              {step === "otp" && `Enter the OTP code sent to ${email}`}
              {step === "reset" && "Create a secure new password for your account"}
              {step === "success" && "Your password has been changed successfully"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-error text-sm p-3 rounded-xl mb-5 border border-red-200 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* STEP 1: ENTER EMAIL */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent-cyan text-white
                  rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 transition-all
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending OTP...
                  </span>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-center tracking-[8px] font-bold text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent-cyan text-white
                  rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 transition-all
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Verifying...
                  </span>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-primary text-xs font-semibold hover:text-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Verification Code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent-cyan text-white
                  rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 transition-all
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Updating password...
                  </span>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "success" && (
            <div className="flex flex-col gap-5 text-center items-center">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl mb-2 border border-green-200">
                <i className="fas fa-check"></i>
              </div>
              <p className="text-sm text-text-secondary">
                Your password has been successfully reset. You can now use your new password to sign in.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent-cyan text-white
                  rounded-xl font-semibold text-sm cursor-pointer shadow-md shadow-blue-500/20 transition-all
                  hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                Go to Login
              </button>
            </div>
          )}

          {step !== "success" && (
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/login")}
                className="text-text-muted text-sm font-semibold hover:text-navy transition-colors bg-transparent border-none cursor-pointer"
              >
                <i className="fas fa-arrow-left mr-1.5"></i> Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
