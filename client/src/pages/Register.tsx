import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    consumerId: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.consumerId) {
      setError("Consumer ID is required!");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    // TODO: Connect to backend register endpoint
    alert("Registration successful!\nConsumer ID: " + form.consumerId);
    navigate("/user/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="bg-white/20 backdrop-blur-sm p-[30px] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.84)] w-[400px]">
          <div
            className="text-center p-7 mb-[30px] rounded-[18px] border border-white/25
              shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(235,156,37,0.35), rgba(34,197,94,0.35))",
              backdropFilter: "blur(12px)",
            }}
          >
            <h2 className="text-[30px] font-bold text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-sm text-white/90">
              Please fill in the details below to register
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-2.5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <label className="text-[14px] font-bold text-[#334155]">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <label className="text-[14px] font-bold text-[#334155]">
              Consumer ID *
            </label>
            <input
              id="consumerId"
              type="text"
              placeholder="e.g., CON123456"
              value={form.consumerId}
              onChange={handleChange}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <label className="text-[14px] font-bold text-[#334155]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <label className="text-[14px] font-bold text-[#334155]">
              Mobile Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <label className="text-[14px] font-bold text-[#334155]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <label className="text-[14px] font-bold text-[#334155]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-2.5 my-1.5 mb-3.5 rounded-lg border border-[#cbd5e1] focus:outline-none focus:border-[#047a3d] focus:shadow-[0_4px_12px_rgba(77,76,76,0.44)]"
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-[#00662ac1] border-2 border-[#026a25] text-white/80
                text-lg rounded-lg cursor-pointer transition-all hover:bg-[#018237]
                hover:shadow-[0_4px_12px_rgb(1,68,48)]"
            >
              Register
            </button>
          </form>

          <div className="text-center mt-4 text-lg">
            Already have an account?{" "}
            <Link to="/login" className="text-[#048009] font-bold no-underline hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
