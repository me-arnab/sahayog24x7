import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { loginCitizen } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Email/Consumer ID and password are required");
      return;
    }

    setIsLoading(true);
    try {
      await loginCitizen({ identifier: identifier.trim(), password });
      navigate("/user/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
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
            <h2 className="text-2xl font-bold text-navy">Citizen Login</h2>
            <p className="text-sm text-text-muted mt-1">
              Sign in to submit and track your complaints
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-error text-sm p-3 rounded-xl mb-5 border border-red-200 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Email or Consumer ID
              </label>
              <input
                type="text"
                placeholder="you@example.com or CON123456"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent-cyan text-white
                rounded-xl font-semibold text-sm cursor-pointer
                shadow-md shadow-blue-500/20 transition-all
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </span>
              )}
            </button>
          </form>

          <div className="text-center mt-6 flex flex-col gap-3">
            <div className="flex justify-between px-2">
              <Link
                to="/forgot-password"
                className="text-primary text-sm font-semibold no-underline hover:text-primary-light transition-colors"
              >
                Forgot Password?
              </Link>
              
              <Link
                to="/register"
                className="text-primary text-sm font-semibold no-underline hover:text-primary-light transition-colors"
              >
                Register
              </Link>
            </div>
            
            <Link
              to="/"
              className="text-text-muted text-sm font-medium no-underline hover:text-navy transition-colors inline-block mt-2"
            >
              <i className="fas fa-arrow-left mr-1.5"></i> Back to Home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
