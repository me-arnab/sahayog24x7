import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!employeeId || !password) {
      setError("Employee ID and password are required");
      return;
    }

    setIsLoading(true);
    try {
      await login({ employeeId, password });
      navigate("/worker/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="bg-white/20 backdrop-blur-sm p-[30px] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.84)] w-[400px]">
          <div className="text-center mb-8">
            <img
              src="/frontend/assets/logo.png"
              className="w-[60px] h-[60px] mx-auto mb-3"
              alt="logo"
            />
            <h2 className="text-2xl font-bold text-[#1e293b]">Worker Login</h2>
            <p className="text-sm text-[#64748b] mt-1">
              Sign in to view your assigned complaints
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <label className="text-[14px] font-bold text-[#334155]">
              Employee ID
            </label>
            <input
              type="text"
              placeholder="e.g. WB001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <label className="text-[14px] font-bold text-[#334155]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-black text-white text-lg rounded-lg cursor-pointer
                transition-all hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-5">
            <Link to="/" className="text-[#048009] no-underline text-sm hover:underline">
              <i className="fas fa-home"></i> Back to Home
            </Link>
          </div>

          <div className="text-center mt-4 text-sm text-[#64748b]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#048009] font-bold no-underline hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
