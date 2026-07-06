/**
 * Sahayog24x7 — Worker Dashboard JS
 * Full API integration with backend
 * Worker login → view assigned complaints → start work → submit work report
 */

const API_BASE = ""; // same origin via Express static, so relative works

let authToken = localStorage.getItem("workerToken");
let workerData = null;
let currentComplaintId = null;

// ─── DOM Ready ───
document.addEventListener("DOMContentLoaded", () => {
  initLoginForm();
  initReportForm();
  initPhotoPreview();
  initModals();

  // Auto-login if token exists
  if (authToken) {
    verifyAndLoadDashboard();
  }
});

// ─── HELPERS ───
function showNotification(message, type = "success") {
  const n = document.getElementById("notification");
  n.textContent = message;
  n.className = `notification ${type} show`;
  setTimeout(() => n.classList.remove("show"), 4000);
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso) {
  if (!iso) return "—";
  const now = new Date();
  const d = new Date(iso);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function toggleLoginSpinner(show) {
  document.getElementById("loginBtnText").style.display = show ? "none" : "inline";
  document.getElementById("loginSpinner").style.display = show ? "inline-block" : "none";
  document.getElementById("loginBtn").disabled = show;
}

function toggleReportSpinner(show) {
  document.getElementById("reportBtnText").style.display = show ? "none" : "inline";
  document.getElementById("reportSpinner").style.display = show ? "inline-block" : "none";
  document.getElementById("reportBtn").disabled = show;
}

// ─── API CALLS ───
async function api(method, path, opts = {}) {
  const headers = { ...opts.headers };
  let body = opts.body;

  // Attach auth token
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  // If it's FormData, don't set Content-Type (browser sets it with boundary)
  const isFormData = body instanceof FormData;
  if (!isFormData && body && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body,
  });

  let data;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const msg = data && data.message ? data.message : `Server error (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ─── LOGIN ───
function initLoginForm() {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const empId = document.getElementById("loginEmpId").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!empId || !password) {
      document.getElementById("loginError").textContent = "Please fill in all fields";
      return;
    }

    toggleLoginSpinner(true);
    document.getElementById("loginError").textContent = "";

    try {
      const res = await api("POST", "/api/auth/login", {
        body: { employeeId: empId, password },
      });

      authToken = res.token;
      workerData = res.worker;
      localStorage.setItem("workerToken", authToken);

      showDashboard();
    } catch (err) {
      document.getElementById("loginError").textContent = err.message;
      toggleLoginSpinner(false);
    }
  });
}

async function verifyAndLoadDashboard() {
  try {
    // Try to fetch complaints to verify token is still valid
    const complaints = await api("GET", "/api/complaints");
    // Token valid — get worker info from token or set basic
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    workerData = { id: payload.id, employeeId: payload.employeeId, role: payload.role };
    showDashboard();
  } catch {
    // Token invalid
    localStorage.removeItem("workerToken");
    authToken = null;
    showLogin();
  }
}

// ─── SCREEN TOGGLE ───
function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("dashboardScreen").style.display = "none";
}

function showDashboard() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("dashboardScreen").style.display = "block";
  toggleLoginSpinner(false);

  // Set worker badge
  document.getElementById("workerBadge").textContent = `👤 ${workerData.employeeId || "Worker"}`;

  // Load complaints
  loadComplaints();
}

function logout() {
  localStorage.removeItem("workerToken");
  authToken = null;
  workerData = null;
  showLogin();
  document.getElementById("loginForm").reset();
}

// ─── USER PROFILE MODAL ───
function openProfileModal() {
  const body = document.getElementById("profileBody");
  
  // Fallback to "Unknown" if data is missing for some reason
  const empId = workerData ? workerData.employeeId : "Unknown";
  const role = workerData && workerData.role ? workerData.role : "WORKER";
  
  body.innerHTML = `
    <div class="profile-avatar">
      <i class="fas fa-user-tie"></i>
    </div>
    <div class="profile-detail">
      <span class="profile-detail-label">Employee ID</span>
      <span class="profile-detail-value">${escapeHtml(empId)}</span>
    </div>
    <div class="profile-detail">
      <span class="profile-detail-label">System Role</span>
      <span class="status-badge status-ASSIGNED" style="font-size: 12px; padding: 6px 14px;">${escapeHtml(role)}</span>
    </div>
  `;
  
  document.getElementById("profileModal").style.display = "flex";
}

function closeProfileModal() {
  document.getElementById("profileModal").style.display = "none";
}

// Add the outside-click closer to your existing initModals function
// Find the initModals() function in your code and update it to look like this:
function initModals() {
  document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("reportModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeReportModal();
  });
  // Add this new line:
  document.getElementById("profileModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeProfileModal();
  });
}

// ─── LOAD COMPLAINTS ───
async function loadComplaints() {
  const container = document.getElementById("complaintsList");
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p style="margin-top: 10px;">Loading complaints...</p>
    </div>
  `;

  try {
    const complaints = await api("GET", "/api/complaints");
    renderComplaints(complaints);
    updateStats(complaints);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 40px; margin-bottom: 15px;">⚠️</div>
        <h3>Failed to Load</h3>
        <p>${escapeHtml(err.message)}</p>
      </div>
    `;
    showNotification("Failed to load complaints: " + err.message, "error");
  }
}

function renderComplaints(complaints) {
  const container = document.getElementById("complaintsList");

  if (!complaints || complaints.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 40px; margin-bottom: 15px;">📭</div>
        <h3>No Complaints Assigned</h3>
        <p>You don't have any complaints assigned yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = complaints
    .map((c) => {
      const isCompleted = c.status === "COMPLETED";
      const isInProgress = c.status === "IN_PROGRESS";
      const isAssigned = c.status === "ASSIGNED";

      return `
        <div class="complaint-card ${isCompleted ? "completed" : ""}">
          <div class="complaint-avatar">${escapeHtml(c.complaintId || c._id.slice(-4).toUpperCase())}</div>
          <div class="complaint-info" onclick="openDetailModal('${c._id}')">
            <div class="complaint-title">${escapeHtml(c.description?.substring(0, 80) || "Complaint")}</div>
            <div class="complaint-meta">
              <span class="priority-badge priority-${escapeHtml(c.priority || "MEDIUM")}">${escapeHtml(c.priority || "MEDIUM")}</span>
              <span class="status-badge status-${escapeHtml(c.status)}">${escapeHtml(c.status.replace(/_/g, " "))}</span>
              <span>👤 ${escapeHtml(c.consumerName || "N/A")}</span>
              <span>📍 ${escapeHtml(c.address || "N/A")}</span>
              <span>🕐 ${timeAgo(c.createdAt)}</span>
            </div>
            <div class="complaint-desc">${escapeHtml(c.description || "")}</div>
          </div>
          <div class="complaint-actions">
            <button class="action-btn" onclick="openDetailModal('${c._id}')">👁 View</button>
            ${isAssigned ? `<button class="action-btn start-btn" onclick="startWork('${c._id}')">🔧 Start</button>` : ""}
            ${isInProgress ? `<button class="action-btn report-btn" onclick="openReportModal('${c._id}')">📝 Report</button>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

function updateStats(complaints) {
  if (!complaints) return;
  const total = complaints.length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const completed = complaints.filter((c) => c.status === "COMPLETED").length;
  const pending = complaints.filter((c) => c.status === "ASSIGNED").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statInProgress").textContent = inProgress;
  document.getElementById("statCompleted").textContent = completed;
  document.getElementById("statPending").textContent = pending;
}

// ─── START WORK ───
async function startWork(complaintId) {
  try {
    const result = await api("PUT", `/api/complaints/${complaintId}/start`);
    showNotification("✅ Work started! Timer is running.", "success");
    loadComplaints();
  } catch (err) {
    showNotification("❌ " + err.message, "error");
  }
}

// ─── COMPLAINT DETAIL MODAL ───
async function openDetailModal(complaintId) {
  try {
    const complaint = await api("GET", `/api/complaints/${complaintId}`);

    document.getElementById("modalTitle").textContent = `${complaint.complaintId || "Complaint"} — Details`;
    document.getElementById("modalBody").innerHTML = `
      <p><strong>🔢 Complaint ID:</strong> ${escapeHtml(complaint.complaintId || complaint._id)}</p>
      <p><strong>👤 Consumer:</strong> ${escapeHtml(complaint.consumerName || "N/A")}</p>
      <p><strong>📍 Address:</strong> ${escapeHtml(complaint.address || "N/A")}</p>
      <p style="margin-top: 10px;"><strong>🏷 Priority:</strong>
        <span class="priority-badge priority-${escapeHtml(complaint.priority)}">${escapeHtml(complaint.priority)}</span>
      </p>
      <p style="margin-top: 10px;"><strong>📋 Status:</strong>
        <span class="status-badge status-${escapeHtml(complaint.status)}">${escapeHtml(complaint.status.replace(/_/g, " "))}</span>
      </p>
      <p style="margin-top: 10px;"><strong>📅 Created:</strong> ${formatDate(complaint.createdAt)}</p>
      ${complaint.startTime ? `<p><strong>🔧 Started:</strong> ${formatDate(complaint.startTime)}</p>` : ""}
      ${complaint.endTime ? `<p><strong>✅ Completed:</strong> ${formatDate(complaint.endTime)}</p>` : ""}
      ${complaint.timeTakenInSeconds ? `<p><strong>⏱ Time Taken:</strong> ${Math.floor(complaint.timeTakenInSeconds / 60)}m ${complaint.timeTakenInSeconds % 60}s</p>` : ""}
      <hr class="detail-divider">
      <p><strong>📝 Description:</strong></p>
      <div class="desc-box">${escapeHtml(complaint.description || "No description")}</div>
    `;

    const actions = document.getElementById("modalActions");
    if (complaint.status === "ASSIGNED") {
      actions.innerHTML = `
        <button class="action-btn start-btn" onclick="startWork('${complaint._id}'); closeModal();">🔧 Start Work</button>
        <button class="action-btn" onclick="closeModal()">Close</button>
      `;
    } else if (complaint.status === "IN_PROGRESS") {
      actions.innerHTML = `
        <button class="action-btn report-btn" onclick="closeModal(); openReportModal('${complaint._id}')">📝 Submit Report</button>
        <button class="action-btn" onclick="closeModal()">Close</button>
      `;
    } else if (complaint.status === "COMPLETED") {
      actions.innerHTML = `
        <p style="color:var(--success);font-weight:600;padding:10px 0;">✅ This complaint is completed.</p>
        <button class="action-btn" onclick="closeModal()">Close</button>
      `;
    } else {
      actions.innerHTML = `<button class="action-btn" onclick="closeModal()">Close</button>`;
    }

    document.getElementById("detailModal").style.display = "flex";
  } catch (err) {
    showNotification("❌ " + err.message, "error");
  }
}

function closeModal() {
  document.getElementById("detailModal").style.display = "none";
}

// ─── WORK REPORT MODAL ───
function openReportModal(complaintId) {
  currentComplaintId = complaintId;
  document.getElementById("reportComplaintId").value = complaintId;
  document.getElementById("reportForm").reset();
  document.getElementById("photoPreview").style.display = "none";
  document.getElementById("reportError").textContent = "";
  document.getElementById("reportModal").style.display = "flex";
}

function closeReportModal() {
  document.getElementById("reportModal").style.display = "none";
  currentComplaintId = null;
}

function initReportForm() {
  document.getElementById("reportForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const complaintId = document.getElementById("reportComplaintId").value;
    const workPerformed = document.getElementById("reportWorkPerformed").value.trim();
    const conditionAfter = document.getElementById("reportConditionAfter").value.trim();
    const photoFile = document.getElementById("reportPhoto").files[0];

    if (!workPerformed) {
      document.getElementById("reportError").textContent = "Please describe the work performed.";
      return;
    }
    if (!conditionAfter) {
      document.getElementById("reportError").textContent = "Please describe the condition after repair.";
      return;
    }
    if (!photoFile) {
      document.getElementById("reportError").textContent = "Please attach an after-repair photo.";
      return;
    }

    toggleReportSpinner(true);
    document.getElementById("reportError").textContent = "";

    try {
      // Build form data with photo
      const formData = new FormData();
      formData.append("complaintId", complaintId);
      formData.append("workPerformed", workPerformed);
      formData.append("conditionAfter", conditionAfter);
      formData.append("afterPhoto", photoFile);

      const result = await api("POST", "/api/work-report", {
        body: formData,
        headers: {}, // let browser set Content-Type for FormData
      });

      toggleReportSpinner(false);
      showNotification(
        `✅ Report submitted! Complaint ${result.complaint?.complaintId || complaintId} completed in ${result.complaint?.timeTakenInSeconds ? Math.floor(result.complaint.timeTakenInSeconds / 60) + "m " + (result.complaint.timeTakenInSeconds % 60) + "s" : ""}`,
        "success"
      );
      closeReportModal();
      loadComplaints();
    } catch (err) {
      toggleReportSpinner(false);
      document.getElementById("reportError").textContent = err.message;
    }
  });
}

// ─── PHOTO PREVIEW ───
function initPhotoPreview() {
  document.getElementById("reportPhoto").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById("previewImg").src = ev.target.result;
        document.getElementById("photoPreview").style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });
}

// ─── MODAL OUTSIDE CLICK ───
function initModals() {
  document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("reportModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeReportModal();
  });
}