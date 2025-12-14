 // Enhanced mock complaint data - SHARED ACROSS BOTH DASHBOARDS
        let allComplaints = [
            {
                id: 'COMP-001',
                citizenName: 'Ramesh Kumar',
                phone: '+91-9876543210',
                location: 'Ward 5, Street 3',
                zone: 'ward-5',
                issueType: 'Power Outage',
                description: 'Complete blackout since 10 PM. Entire street affected. Kids studying for exams.',
                priority: 'high',
                status: 'received',
                createdAt: '2025-12-14T01:30:00',
                photoUrls: [],
                assignedTeam: null,
                isNew: false
            },
            {
                id: 'COMP-002',
                citizenName: 'Priya Sharma',
                phone: '+91-9876543211',
                location: 'Ward 2, Park Road',
                zone: 'ward-2',
                issueType: 'Low Voltage',
                description: 'Voltage fluctuations causing appliances to malfunction. Fridge stopped working.',
                priority: 'medium',
                status: 'in-progress',
                createdAt: '2025-12-13T22:45:00',
                photoUrls: [],
                assignedTeam: 'Line Team 3',
                isNew: false
            },
            {
                id: 'COMP-003',
                citizenName: 'Suresh Patel',
                phone: '+91-9876543212',
                location: 'Ward 1, Market Area',
                zone: 'ward-1',
                issueType: 'Sparking Transformer',
                description: 'Sparks from pole transformer. Safety hazard near school. Urgent attention needed.',
                priority: 'high',
                status: 'received',
                createdAt: '2025-12-14T02:00:00',
                photoUrls: ['photo1.jpg'],
                assignedTeam: null,
                isNew: false
            },
            {
                id: 'COMP-004',
                citizenName: 'Anita Devi',
                phone: '+91-9876543213',
                location: 'Ward 3, Sector 12',
                zone: 'ward-3',
                issueType: 'Meter Fault',
                description: 'Meter reading incorrect. Shows high usage despite no appliances running.',
                priority: 'low',
                status: 'resolved',
                createdAt: '2025-12-13T10:30:00',
                photoUrls: [],
                assignedTeam: 'Metering Unit',
                isNew: false
            }
        ];

        let currentComplaints = [...allComplaints];
        let currentUserComplaints = allComplaints.slice(0, 3);
        let selectedComplaint = null;
        let currentDashboard = 'user';

        // Notification system
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }

        // Switch dashboards
        function switchDashboard(type) {
            currentDashboard = type;

            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');

            document.querySelectorAll('.dashboard').forEach(dash => dash.classList.remove('active'));
            document.getElementById(type + '-dashboard').classList.add('active');

            if (type === 'admin') {
                renderAdminComplaints();
                updateAdminStats();
            } else {
                renderUserComplaints();
            }
        }

        // Filter complaints (Admin)
        function applyFilters() {
            let filtered = [...allComplaints];

            const statusFilter = document.getElementById('status-filter').value;
            if (statusFilter !== 'all') {
                filtered = filtered.filter(c => c.status === statusFilter);
            }

            const priorityFilter = document.getElementById('priority-filter').value;
            if (priorityFilter !== 'all') {
                filtered = filtered.filter(c => c.priority === priorityFilter);
            }

            const zoneFilter = document.getElementById('zone-filter').value;
            if (zoneFilter !== 'all') {
                filtered = filtered.filter(c => c.zone === zoneFilter);
            }

            const dateFrom = document.getElementById('date-from').value;
            const dateTo = document.getElementById('date-to').value;
            if (dateFrom) {
                filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(dateFrom));
            }
            if (dateTo) {
                filtered = filtered.filter(c => new Date(c.createdAt) <= new Date(dateTo + 'T23:59:59'));
            }

            currentComplaints = filtered;
            renderAdminComplaints();
        }

        // Clear all filters
        function clearFilters() {
            document.getElementById('status-filter').value = 'all';
            document.getElementById('priority-filter').value = 'all';
            document.getElementById('zone-filter').value = 'all';
            document.getElementById('date-from').value = '';
            document.getElementById('date-to').value = '';
            currentComplaints = [...allComplaints];
            renderAdminComplaints();
        }

        // ✅ FIXED: Proper DOM ready handling
        function initEventListeners() {
            // Search functionality
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', function (e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const filtered = currentComplaints.filter(c =>
                        c.id.toLowerCase().includes(searchTerm) ||
                        c.citizenName.toLowerCase().includes(searchTerm) ||
                        c.issueType.toLowerCase().includes(searchTerm) ||
                        c.description.toLowerCase().includes(searchTerm) ||
                        c.location.toLowerCase().includes(searchTerm)
                    );
                    renderComplaintsList(filtered);
                    document.getElementById('results-count').textContent = `(${filtered.length} results)`;
                });
            }

            // Filter event listeners
            const filters = ['status-filter', 'priority-filter', 'zone-filter', 'date-from', 'date-to'];
            filters.forEach(filterId => {
                const filter = document.getElementById(filterId);
                if (filter) {
                    filter.addEventListener('change', applyFilters);
                }
            });

            // User form submission
            const complaintForm = document.getElementById('complaintForm');
            if (complaintForm) {
                complaintForm.addEventListener('submit', function (e) {
                    e.preventDefault();

                    const submitBtn = document.getElementById('submit-btn');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Submitting...';

                    setTimeout(() => {
                        const issueSelect = document.getElementById('user-issue-type');
                        const formData = {
                            id: 'COMP-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
                            citizenName: document.getElementById('user-name').value || 'Anonymous',
                            phone: document.getElementById('user-phone').value,
                            location: document.getElementById('user-location').value,
                            zone: 'ward-' + Math.floor(Math.random() * 5 + 1),
                            issueType: issueSelect.options[issueSelect.selectedIndex].text,
                            description: document.getElementById('user-description').value,
                            priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
                            status: 'received',
                            createdAt: new Date().toISOString(),
                            photoUrls: [],
                            assignedTeam: null,
                            isNew: true
                        };

                        allComplaints.unshift(formData);
                        currentComplaints.unshift(formData);
                        currentUserComplaints.unshift(formData);

                        renderUserComplaints();
                        if (currentDashboard === 'admin') {
                            renderAdminComplaints();
                            updateAdminStats();
                        }

                        this.reset();
                        showNotification(`✅ New complaint ${formData.id} submitted! We will resolve it as soon as possible!`);

                        setTimeout(() => {
                            formData.isNew = false;
                            if (currentDashboard === 'admin') {
                                renderAdminComplaints();
                            }
                        }, 10000);

                        submitBtn.disabled = false;
                        submitBtn.textContent = '🚀 Submit Complaint';
                    }, 1500);
                });
            }
        }

        // Render admin complaints
        function renderAdminComplaints(filteredComplaints = currentComplaints) {
            renderComplaintsList(filteredComplaints);
            document.getElementById('results-count').textContent = `(${filteredComplaints.length} results)`;
        }

        function renderComplaintsList(complaints) {
            const container = document.getElementById('complaintsList');
            if (complaints.length === 0) {
                container.innerHTML = '<div class="no-results">No complaints found matching your filters 🔍</div>';
                return;
            }

            container.innerHTML = complaints.map(complaint => {
                const timeAgo = getTimeAgo(new Date(complaint.createdAt));
                const resolvedClass = complaint.status === 'resolved' ? 'resolved' : '';
                const newClass = complaint.isNew ? 'new' : '';
                return `
                    <div class="complaint-card ${resolvedClass} ${newClass}" onclick="openComplaintModal('${complaint.id}')">
                        <div class="complaint-avatar">${complaint.id.slice(-3)}</div>
                        <div class="complaint-info">
                            <div class="complaint-title">${complaint.issueType} - ${complaint.id}</div>
                            <div class="complaint-meta">
                                <span class="priority-badge priority-${complaint.priority}">${complaint.priority.toUpperCase()}</span>
                                <span class="status-badge status-${complaint.status}">${complaint.status.replace('-', ' ').toUpperCase()}</span>
                                <span>${complaint.location}</span>
                                <span>${timeAgo}</span>
                            </div>
                            <p style="color: #64748b; margin-top: 10px; line-height: 1.5;">${complaint.description}</p>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="event.stopPropagation(); openComplaintModal('${complaint.id}')">View</button>
                            ${complaint.status !== 'resolved' && !complaint.assignedTeam ? `<button class="action-btn" onclick="event.stopPropagation(); assignTeam('${complaint.id}')">Assign</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render user complaints
        function renderUserComplaints() {
            const container = document.getElementById('user-complaints-list');
            container.innerHTML = currentUserComplaints.map(c => `
                <div class="complaint-card ${c.status === 'resolved' ? 'resolved' : ''}">
                    <div class="complaint-avatar">${c.id.slice(-3)}</div>
                    <div class="complaint-info">
                        <div class="complaint-title">${c.issueType} (${c.status})</div>
                        <div class="complaint-meta">
                            <span class="priority-badge priority-${c.priority}">${c.priority.toUpperCase()}</span>
                            <span>${c.location}</span>
                        </div>
                        <p>${c.description.substring(0, 100)}...</p>
                    </div>
                </div>
            `).join('') || '<div class="no-results">No complaints yet. Submit your first one below! 🎉</div>';
        }

        // ✅ FIXED: Dynamic modal buttons based on status
        function openComplaintModal(complaintId) {
            selectedComplaint = allComplaints.find(c => c.id === complaintId);
            if (!selectedComplaint) return;

            document.getElementById('modal-title').textContent = `${selectedComplaint.issueType} - ${selectedComplaint.id}`;
            document.getElementById('modal-body').innerHTML = `
                <div style="line-height: 1.6; color: #475569;">
                    <p><strong>👤 Citizen:</strong> ${selectedComplaint.citizenName}</p>
                    <p><strong>📞 Phone:</strong> ${selectedComplaint.phone}</p>
                    <p><strong>📍 Location:</strong> ${selectedComplaint.location}</p>
                    <p><strong>🏷️ Priority:</strong> <span class="priority-badge priority-${selectedComplaint.priority}">${selectedComplaint.priority.toUpperCase()}</span></p>
                    <p><strong>📋 Status:</strong> <span class="status-badge status-${selectedComplaint.status}">${selectedComplaint.status.replace('-', ' ').toUpperCase()}</span></p>
                    <p><strong>📅 Created:</strong> ${new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                    <hr style="margin: 25px 0; border: none; height: 1px; background: #e2e8f0;">
                    <p><strong>📝 Description:</strong></p>
                    <p style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #4ecdc4;">${selectedComplaint.description}</p>
                    ${selectedComplaint.assignedTeam ? `<p><strong>👥 Assigned Team:</strong> ${selectedComplaint.assignedTeam}</p>` : ''}
                </div>
            `;

            // ✅ DYNAMIC BUTTONS: Hide actions for resolved complaints and already assigned teams
            const modalActions = document.getElementById('modal-actions');
            if (selectedComplaint.status === 'resolved') {
                modalActions.innerHTML = '<p style="text-align: center; color: #059669; font-weight: 600; margin: 20px 0;">✅ This complaint is RESOLVED and cannot be reassigned</p>';
            } else {
                let assignButton = '';
                if (!selectedComplaint.assignedTeam) {
                    assignButton = '<button class="action-btn" onclick="assignTeam()">👥 Assign Team</button>';
                } else {
                    assignButton = '<p style="text-align: center; color: #f59e0b; font-weight: 600; margin: 10px 0;">⚠️ Team already assigned: ' + selectedComplaint.assignedTeam + '</p>';
                }
                modalActions.innerHTML = `
                    <button class="action-btn" onclick="updateStatus('in-progress')">🔄 Mark In Progress</button>
                    <button class="action-btn" onclick="updateStatus('resolved')">✅ Mark Resolved</button>
                    <button class="action-btn danger" onclick="updateStatus('escalated')">🚨 Escalate</button>
                    ${assignButton}
                `;
            }

            document.getElementById('complaint-modal').style.display = 'flex';
        }

        // Close modal
        function closeModal() {
            document.getElementById('complaint-modal').style.display = 'none';
        }

        // ✅ FIXED: Prevent reassignment of resolved complaints
        function updateStatus(newStatus) {
            if (!selectedComplaint) return;

            // Prevent changing resolved complaints
            if (selectedComplaint.status === 'resolved' && newStatus !== 'resolved') {
                showNotification('❌ Resolved complaints cannot be reassigned or changed!', 'error');
                return;
            }

            selectedComplaint.status = newStatus;
            if (newStatus === 'in-progress' && !selectedComplaint.assignedTeam) {
                selectedComplaint.assignedTeam = 'Field Team ' + Math.floor(Math.random() * 5);
            }
            selectedComplaint.isNew = false;

            closeModal();
            renderAdminComplaints();
            applyFilters();
            renderUserComplaints();
            showNotification(`✅ Status updated to ${newStatus.replace('-', ' ').toUpperCase()}`);
        }

        // ✅ FIXED: Prevent reassignment - can only assign team once
        function assignTeam(complaintId = null) {
            if (!complaintId && selectedComplaint) {
                complaintId = selectedComplaint.id;
            }
            const complaint = allComplaints.find(c => c.id === complaintId);
            if (!complaint) return;

            if (complaint.status === 'resolved') {
                showNotification('❌ Cannot assign resolved complaints!', 'error');
                return;
            }

            // ✅ Prevent reassignment if team is already assigned
            if (complaint.assignedTeam) {
                showNotification(`❌ Team already assigned! This complaint is already assigned to ${complaint.assignedTeam}. Cannot reassign.`, 'error');
                return;
            }

            complaint.assignedTeam = `Team ${Math.floor(Math.random() * 5 + 1)}`;
            complaint.status = 'in-progress';
            complaint.isNew = false;

            showNotification(`✅ ${complaint.id} assigned to ${complaint.assignedTeam}`);
            renderAdminComplaints();
            applyFilters();
            renderUserComplaints();
        }

        // User stats click
        function showUserStats(type) {
            showNotification(`📊 Showing ${type} complaint details`);
        }

        // Time ago helper
        function getTimeAgo(date) {
            const now = new Date();
            const diff = now - new Date(date);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (days > 0) return `${days}d ago`;
            if (hours > 0) return `${hours}h ago`;
            return `${minutes}m ago`;
        }

        // Live stats updates
        function updateAdminStats() {
            document.getElementById('admin-total').textContent = allComplaints.length;
            document.getElementById('admin-open').textContent = allComplaints.filter(c => c.status !== 'resolved').length;
            document.getElementById('admin-sla').textContent = Math.floor(Math.random() * 5);
        }

        setInterval(() => {
            document.getElementById('user-total-complaints').textContent = currentUserComplaints.length;
            document.getElementById('user-pending').textContent = currentUserComplaints.filter(c => c.status !== 'resolved').length;
            document.getElementById('user-resolved').textContent = currentUserComplaints.filter(c => c.status === 'resolved').length;
            updateAdminStats();
        }, 5000);

        // Close modal on outside click
        function initModal() {
            const modal = document.getElementById('complaint-modal');
            modal.addEventListener('click', function (e) {
                if (e.target === this) closeModal();
            });
        }

        // Initialize everything properly
        document.addEventListener('DOMContentLoaded', function () {
            initEventListeners();
            initModal();
            renderUserComplaints();
            renderAdminComplaints();
        });