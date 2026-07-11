import { useState, useEffect, useCallback } from "react";
import { UserPlus, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import apiClient from "../api/client";
import { getWorkers } from "../api/auth";

export default function AddWorker() {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    password: "",
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [workers, setWorkers] = useState<Array<{ id: string; employeeId: string; name: string; role: string; createdAt: string }>>([]);
  const [workersLoading, setWorkersLoading] = useState(true);

  const loadWorkers = useCallback(async () => {
    try {
      setWorkersLoading(true);
      const data = await getWorkers();
      setWorkers(data);
    } catch (error) {
      console.error("Failed to load workers:", error);
    } finally {
      setWorkersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.name || !formData.password) {
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

      const response = await apiClient.post("/auth/seed-worker", formData);

      setStatus("success");
      setMessage(response.data.message || "Worker successfully added!");
      setFormData({ employeeId: "", name: "", password: "" });
      
      loadWorkers();

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
            <UserPlus className="text-primary w-8 h-8" />
            Add Worker
          </h1>
          <p className="text-text-muted mt-2">
            Register a new field worker account into the system.
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
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g. WORKER-001"
                className="w-full p-3 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                disabled={status === "loading"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
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
                  Adding Worker...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Add Worker
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-navy">Registered Workers</h2>
          </div>

          {workersLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No workers registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => (
                <div key={worker.id || worker.employeeId} className="flex items-center justify-between p-4 border border-border rounded-xl bg-bg/50 hover:bg-bg transition-colors">
                  <div>
                    <h3 className="font-bold text-navy">{worker.name}</h3>
                    <p className="text-sm text-text-muted mt-1 font-mono">{worker.employeeId}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-1">
                      {worker.role.replace("_", " ")}
                    </span>
                    <p className="text-[11px] text-text-muted">
                      {new Date(worker.createdAt).toLocaleDateString()}
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
