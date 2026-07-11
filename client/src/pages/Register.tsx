import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { registerCitizen } from "../api/auth";

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
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Full name is required!");
      return;
    }
    if (!form.consumerId) {
      setError("Consumer ID is required!");
      return;
    }
    if (!form.email.trim()) {
      setError("Email address is required!");
      return;
    }
    if (!form.phone.trim()) {
      setError("Mobile number is required!");
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

    setIsSubmitting(true);
    try {
      const response = await registerCitizen({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        consumerId: form.consumerId.trim(),
        password: form.password,
      });

      setSuccess(response.message || "Registration successful!");
      setForm({
        name: "",
        consumerId: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/login", { state: { mode: "citizen" } });
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : error instanceof Error
          ? error.message
          : "Registration failed";

      setError(message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-[460px] shadow-lg shadow-blue-500/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent-cyan/10 flex items-center justify-center">
              <i className="fas fa-user-plus text-2xl text-primary"></i>
            </div>
            <h2 className="text-2xl font-bold text-navy">Create Your Account</h2>
            <p className="text-sm text-text-muted mt-1">
              Please fill in the details below to register
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-error text-sm p-3 rounded-xl mb-5 border border-red-200 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-success text-sm p-3 rounded-xl mb-5 border border-green-200 flex items-center gap-2">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Consumer ID *</label>
              <input
                id="consumerId"
                type="text"
                placeholder="e.g., CON123456"
                value={form.consumerId}
                onChange={handleChange}
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Mobile Number *</label>
              <input
                id="phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                maxLength={10}
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent-cyan text-white
                rounded-xl font-semibold text-sm cursor-pointer mt-2
                shadow-md shadow-blue-500/20 transition-all
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </span>
              ) : (
                <>
                  <i className="fas fa-check-circle mr-2"></i>
                  Register
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold no-underline hover:text-primary-light transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
