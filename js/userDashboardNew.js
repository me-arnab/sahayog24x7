// Dummy data to simulate the user's past complaints being fetched from the database
let myComplaints = [
    {
        complaintId: "CMP-2026-042",
        issueCategory: "Street Light",
        description: "Street light pole sparking near the entrance gate.",
        date: "06 Jul 2026",
        status: "IN-PROGRESS"
    },
    {
        complaintId: "CMP-2026-015",
        issueCategory: "Power Outage",
        description: "Complete blackout in the entire block since morning.",
        date: "01 Jul 2026",
        status: "COMPLETED"
    },
    {
        complaintId: "CMP-2026-088",
        issueCategory: "Meter Fault",
        description: "Smart meter display is blank and smells like burning plastic.",
        date: "08 Jul 2026",
        status: "PENDING"
    }
];

// 1. Render the complaints list on the right side
function renderComplaints() {
    const listContainer = document.getElementById("complaintsList");
    listContainer.innerHTML = "";

    if (myComplaints.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No complaints lodged yet.</p>`;
        return;
    }

    myComplaints.forEach(complaint => {
        // Format the status for display (removes the hyphen for CSS matching)
        const statusClass = complaint.status.replace(" ", "-");
        const statusText = complaint.status.replace("-", " ");

        const card = document.createElement("div");
        card.className = "ticket-card";
        card.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-id"><i class="fas fa-hashtag"></i> ${complaint.complaintId}</span>
                <span class="ticket-date"><i class="far fa-calendar-alt"></i> ${complaint.date}</span>
            </div>
            <div class="ticket-body">
                <div class="ticket-issue"><i class="fas fa-exclamation-circle"></i> ${complaint.issueCategory}</div>
                <p style="font-size: 13px; color: var(--text-muted); margin-left: 22px;">${complaint.description}</p>
            </div>
            <div class="ticket-footer">
                <span class="status-badge status-${statusClass}">${statusText}</span>
                <button class="logout-btn" style="font-size: 11px; padding: 4px 10px;">Track</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// 2. Handle the Form Submission
document.getElementById("complaintForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Gather data from the form fields
    const newComplaint = {
        consumerName: document.getElementById("consumerName").value,
        phoneNo: document.getElementById("phoneNo").value,
        consumerId: document.getElementById("consumerId").value,
        issueCategory: document.getElementById("issueCategory").value,
        description: document.getElementById("description").value
    };

    // --- TODO: REPLACE THIS BLOCK WITH YOUR FETCH API TO BACKEND ---
    // Simulate a successful API request and response
    const fakeApiResponse = {
        complaintId: "CMP-2026-" + Math.floor(Math.random() * 900 + 100),
        issueCategory: newComplaint.issueCategory,
        description: newComplaint.description,
        date: "08 Jul 2026", // Simulated current date
        status: "PENDING"
    };

    // Add it to our local array to show the UI update instantly
    myComplaints.unshift(fakeApiResponse); 
    
    // Reset form and re-render the list
    document.getElementById("complaintForm").reset();
    renderComplaints();
    
    alert("Complaint lodged successfully! Your Tracking ID is: " + fakeApiResponse.complaintId);
    // -----------------------------------------------------------------
});

// Initial render when the page loads
document.addEventListener("DOMContentLoaded", () => {
    renderComplaints();
});