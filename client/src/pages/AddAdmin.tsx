import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import apiClient from "../api/client";
import { getAdmins } from "../api/auth";

export default function AddAdmin() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [admins, setAdmins] = useState<Array<{ id: string; email: string; name: string; role: string; createdAt: string }>>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);

  const loadAdmins = useCallback(async () => {
    try {
      setAdminsLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Failed to load admins:", error);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      setStatus("error");
      setMessage("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const response = await apiClient.post("/auth/seed-admin", formData);

      setStatus("success");
      setMessage(response.data.message || "Admin successfully added!");
      setFormData({ name: "", email: "", password: "" });
      
      loadAdmins();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response?.data?.message || error.message || "An error occurred.");
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1500px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy flex items-center gap-3">
            <Shield className="text-primary w-8 h-8" />
            Add Administrator
          </h1>
          <p className="text-text-muted mt-2">
            Register a new system administrator account into the system.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 items-start">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          {status === "success" && (
            <div className="mb-6 p-4 bg-green-50/50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-green-800">Success</h4>
                <p className="text-sm text-green-700 mt-1">{message}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={status === "loading"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. admin@sahayog24x7.com"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={status === "loading"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={status === "loading"}
              />
              <p className="text-xs text-text-muted mt-2">
                Password must be at least 6 characters long.
              </p>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Admin...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Add Admin
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-navy">Existing Admins</h2>
          </div>

          {adminsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No admins registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-bg/50 hover:bg-bg transition-colors">
                  <div>
                    <h3 className="font-bold text-navy">{admin.name}</h3>
                    <p className="text-sm text-text-muted mt-1 font-mono">{admin.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md mb-1">
                      {admin.role.toUpperCase()}
                    </span>
                    <p className="text-[11px] text-text-muted">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
