// Medqueue Frontend JavaScript - Complete Enhanced Version with Navigation & Calendar
const API_BASE = 'http://localhost:3000/api';

// Global state
let selectedDoctor = {};
let selectedDate = '';
let selectedTime = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let navigationHistory = ['home']; // Track navigation history for back button

// Sample doctor data (this would normally come from your backend)
const sampleDoctors = [
    {
        doctorId: 'DOC001',
        name: 'Dr. Bob Smith',
        specialty: 'General Practitioner (GP) / Family Doctor',
        experience: '5',
        availability: 'Mon-Fri, 9am-3pm',
        avatar: 'B'
    },
    {
        doctorId: 'DOC002',
        name: 'Dr. Alice Johnson',
        specialty: 'Pediatrics Specialist',
        experience: '8',
        availability: 'Mon-Wed-Fri, 10am-4pm',
        avatar: 'A'
    },
    {
        doctorId: 'DOC003',
        name: 'Dr. David Wilson',
        specialty: 'Cardiology Specialist',
        experience: '12',
        availability: 'Tue-Thu, 8am-2pm',
        avatar: 'D'
    }
];

// Run on page load
window.addEventListener('DOMContentLoaded', () => {
    const patientId = localStorage.getItem('patientId');

    if (patientId) {
        // User is logged in → show home page
        showPage('home');
    } else {
        // User is not logged in → show login page
        showPage('login');
    }
});

// --- Login ---
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent page refresh

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Simple validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // TODO: call your backend API for login here
    console.log('Logging in with:', email, password);

    // For now, simulate successful login
    alert('Login successful!');

    // Show home page after login
    showPage('home');
});

// --- Signup ---
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent page refresh

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    // Simple validation
    if (!name || !email || !password) {
        alert('Please fill out all fields.');
        return;
    }

    // TODO: call your backend API for signup here
    console.log('Signing up with:', name, email, password)

    // For now, simulate successful signup
    alert('Signup successful! Please login.');

    // Switch to login page after signup
    showPage('login');
});



// Make functions globally accessible
window.showPage = showPage;
window.selectDoctor = selectDoctor;
window.showDoctorInfo = showDoctorInfo;
window.goBackToPrevious = goBackToPrevious;
window.goToTimeSlots = goToTimeSlots;
window.selectDate = selectDate;
window.changeMonth = changeMonth;
window.selectTimeSlot = selectTimeSlot;
window.confirmAppointment = confirmAppointment;
window.searchAppointments = searchAppointments;
window.cancelAppointment = cancelAppointment;
window.modifyAppointment = modifyAppointment;
window.checkInPatient = checkInPatient;
window.closeModal = closeModal;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing app...');

    // Initialize the app
    setupEventListeners();
    generateCalendar();
    loadQueueList();

    // Show home page by default and ensure it's active
    showPage('home');

    // Ensure doctors are visible on home page
    const homeDiv = document.getElementById('home');
    if (homeDiv) {
        homeDiv.classList.add('active');
        console.log('Home page activated');
    }

    // Log doctor cards for debugging
    const doctorCards = document.querySelectorAll('.doctor-card');
    console.log('Found doctor cards:', doctorCards.length);
});

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Navigation click handlers - use event delegation
    document.addEventListener('click', function (e) {
        // Handle navigation links
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (page) {
                console.log('Navigation clicked:', page);
                showPage(page);
                updateActiveNavLink(e.target);
            }
        }

        // Handle logo click
        if (e.target.closest('.logo')) {
            e.preventDefault();
            console.log('Logo clicked');
            showPage('home');
        }
    });

    // Close modal when clicking outside
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
}

// Enhanced Navigation functions
function showPage(pageId) {
    console.log('Showing page:', pageId);

    // Add to navigation history if not going back
    if (navigationHistory[navigationHistory.length - 1] !== pageId) {
        navigationHistory.push(pageId);
        console.log('Navigation history:', navigationHistory);
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log('Page activated:', pageId);
    } else {
        console.error('Page not found:', pageId);
    }

    // Update navigation active states
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });

    // Load data based on page
    switch (pageId) {
        case 'queue':
            loadQueueList();
            break;
        case 'home':
            // Doctors are already in HTML, no need to load
            console.log('Home page loaded');
            break;
        case 'booking':
            generateCalendar();
            break;
        case 'login':
            console.log('Login page shown');
            break;
        case 'signup':
            console.log('Signup page shown');
            break;
    }
}

function goBackToPrevious() {
    console.log('Going back, history:', navigationHistory);
    if (navigationHistory.length > 1) {
        // Remove current page
        navigationHistory.pop();
        // Get previous page
        const previousPage = navigationHistory[navigationHistory.length - 1];
        showPage(previousPage);
    } else {
        showPage('home');
    }
}

function goToTimeSlots() {
    console.log('Going to time slots, selected date:', selectedDate);
    if (!selectedDate) {
        showModal('Select Date', 'Please select an appointment date first.', 'error');
        return;
    }
    showPage('time-slots');
}

function updateActiveNavLink(clickedLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    clickedLink.classList.add('active');
}

// Calendar Functions
function generateCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.getElementById('calendar-month');

    if (!calendarDays || !calendarMonth) return;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    calendarMonth.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    let calendarHTML = '';
    const today = new Date();

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        calendarHTML += `<div class="calendar-day other-month disabled">${day}</div>`;
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toISOString().split('T')[0];
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today.setHours(0, 0, 0, 0);
        const isSelected = selectedDate === dateStr;

        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (isPast) classes += ' disabled';
        if (isSelected) classes += ' selected';

        calendarHTML += `<div class="${classes}" onclick="selectDate('${dateStr}', this)" ${isPast ? '' : `data-date="${dateStr}"`}>${day}</div>`;
    }

    // Next month's leading days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells && remainingCells < 7; day++) {
        calendarHTML += `<div class="calendar-day other-month disabled">${day}</div>`;
    }

    calendarDays.innerHTML = calendarHTML;
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function selectDate(dateStr, element) {
    if (element.classList.contains('disabled')) return;

    // Remove selected class from all days
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });

    // Add selected class to clicked day
    element.classList.add('selected');
    selectedDate = dateStr;

    // Show success message
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Update the "Go to pick time" button to show selected date
    const goToTimeBtn = document.querySelector('.go-to-time');
    if (goToTimeBtn) {
        goToTimeBtn.innerHTML = `Selected: ${formattedDate} - Go to pick time →`;
        goToTimeBtn.style.color = '#28a745';
    }
}

// Doctor management functions
function loadDoctors() {
    const doctorsContainer = document.getElementById('doctors-list');
    if (!doctorsContainer) return;

    doctorsContainer.innerHTML = '';

    sampleDoctors.forEach(doctor => {
        const doctorCard = createDoctorCard(doctor);
        doctorsContainer.appendChild(doctorCard);
    });
}

function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.onclick = () => selectDoctor(doctor);

    card.innerHTML = `
        <div class="doctor-info">
            <div class="doctor-avatar">${doctor.avatar}</div>
            <div class="doctor-details">
                <h3>${doctor.name}</h3>
                <div class="doctor-specialty">${doctor.specialty}</div>
                <div class="doctor-experience">Years of experience: ${doctor.experience}</div>
                <div class="doctor-availability">Available: ${doctor.availability}</div>
            </div>
        </div>
        <a href="#" class="learn-more" onclick="event.stopPropagation(); showDoctorInfo('${doctor.doctorId}')">
            Learn more about the doctor ℹ️
        </a>
    `;

    return card;
}

function selectDoctor(doctor) {
    console.log('Doctor selected:', doctor);
    selectedDoctor = doctor;
    updateSelectedDoctorInfo(doctor);
    showPage('booking'); // This will take to date picker page
}

function updateSelectedDoctorInfo(doctor) {
    // Update all instances of selected doctor info
    const elements = {
        'selected-doctor-name': doctor.name,
        'selected-doctor-specialty': doctor.specialty,
        'selected-doctor-experience': doctor.experience,
        'selected-doctor-availability': doctor.availability,
        'selected-avatar': doctor.avatar
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'selected-avatar') {
                element.textContent = value;
            } else {
                element.textContent = value;
            }
        }
    });

    // Update time slots page
    const elements2 = {
        'selected-doctor-name-2': doctor.name,
        'selected-doctor-specialty-2': doctor.specialty,
        'selected-doctor-experience-2': doctor.experience,
        'selected-doctor-availability-2': doctor.availability,
        'selected-avatar-2': doctor.avatar
    };

    Object.entries(elements2).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'selected-avatar-2') {
                element.textContent = value;
            } else {
                element.textContent = value;
            }
        }
    });
}

function showDoctorInfo(doctorId) {
    const doctor = sampleDoctors.find(d => d.doctorId === doctorId);
    if (doctor) {
        showModal('Doctor Information', `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; margin: 0 auto 15px;">${doctor.avatar}</div>
                <h3>${doctor.name}</h3>
            </div>
            <div style="text-align: left;">
                <p><strong>Specialty:</strong> ${doctor.specialty}</p>
                <p><strong>Experience:</strong> ${doctor.experience} years</p>
                <p><strong>Availability:</strong> ${doctor.availability}</p>
                <p><strong>Doctor ID:</strong> ${doctor.doctorId}</p>
            </div>
        `);
    }
}

// Time slot functions
function selectTimeSlot(slot) {
    // Remove selected class from all slots
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('selected');
    });

    // Add selected class to clicked slot
    slot.classList.add('selected');
    selectedTime = slot.dataset.time;
}

// Enhanced appointment booking with redirect to check appointments
async function confirmAppointment() {
    const patientId = document.getElementById('patient-id-input').value.trim();

    // Validation
    if (!patientId) {
        showModal('Validation Error', 'Please enter a Patient ID.', 'error');
        return;
    }

    if (!selectedDoctor.doctorId) {
        showModal('Validation Error', 'Please select a doctor.', 'error');
        return;
    }

    if (!selectedDate) {
        showModal('Validation Error', 'Please select an appointment date.', 'error');
        return;
    }

    if (!selectedTime) {
        showModal('Validation Error', 'Please select a time slot.', 'error');
        return;
    }

    // Create datetime string
    const dateTime = `${selectedDate}T${selectedTime}:00`;

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/appointments/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patientId: patientId,
                doctorId: selectedDoctor.doctorId,
                dateTime: dateTime
            })
        });

        const data = await response.json();
        hideLoading();

        if (response.ok && data.success) {
            // Generate queue number automatically
            await generateQueue(data.appointmentId);

            showModal('Appointment Confirmed! 🎉', `
                <div class="message-success">
                    <p><strong>Appointment booked successfully!</strong></p>
                    <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
                    <p><strong>Doctor:</strong> ${selectedDoctor.name}</p>
                    <p><strong>Date:</strong> ${selectedDate}</p>
                    <p><strong>Time:</strong> ${selectedTime}</p>
                    <p><strong>Patient ID:</strong> ${patientId}</p>
                </div>
                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                    You will be redirected to your appointments page.
                </p>
            `, 'success');

            // Reset form and redirect to check appointments page
            resetBookingForm();
            setTimeout(() => {
                showPage('check-appointments');
                updateActiveNavLink(document.querySelector('[data-page="check-appointments"]'));
            }, 2000);

        } else {
            showModal('Booking Failed', data.message || 'Failed to book appointment.', 'error');
        }

    } catch (error) {
        hideLoading();
        showModal('Network Error', 'Unable to connect to server. Please try again later.', 'error');
        console.error('Booking error:', error);
    }
}

async function generateQueue(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/queue`, {
            method: 'POST'
        });

        const data = await response.json();
        if (data.success) {
            console.log('Queue number generated:', data.queueNumber);
        }
    } catch (error) {
        console.error('Queue generation error:', error);
    }
}

function resetBookingForm() {
    document.getElementById('patient-id-input').value = '';

    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });

    selectedDate = '';
    selectedTime = '';
    selectedDoctor = {};

    // Reset the "Go to pick time" button text
    const goToTimeBtn = document.querySelector('.go-to-time');
    if (goToTimeBtn) {
        goToTimeBtn.innerHTML = 'Go to pick time →';
        goToTimeBtn.style.color = '#667eea';
    }

    // Reset navigation history
    navigationHistory = ['home'];
}

// Queue management functions
async function loadQueueList() {
    const queueContainer = document.getElementById('queue-list');
    if (!queueContainer) return;

    // Show loading state
    queueContainer.innerHTML = '<div class="pulse" style="text-align: center; color: white; padding: 40px;">Loading queue information...</div>';

    try {
        // Since we don't have a specific queue endpoint, we'll simulate queue data
        // In a real app, this would fetch from your backend
        const sampleQueue = [
            {
                queueNumber: 'Q' + Math.floor(Math.random() * 1000) + 1,
                waitingTime: '5 min',
                patientId: 'PAT001',
                doctorName: 'Dr. Bob Smith'
            },
            {
                queueNumber: 'Q' + Math.floor(Math.random() * 1000) + 2,
                waitingTime: '10 min',
                patientId: 'PAT002',
                doctorName: 'Dr. Alice Johnson'
            },
            {
                queueNumber: 'Q' + Math.floor(Math.random() * 1000) + 3,
                waitingTime: '15 min',
                patientId: 'PAT003',
                doctorName: 'Dr. David Wilson'
            }
        ];

        setTimeout(() => {
            if (sampleQueue.length === 0) {
                queueContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>No patients in queue</h3>
                        <p>The queue is currently empty.</p>
                    </div>
                `;
            } else {
                queueContainer.innerHTML = '';
                sampleQueue.forEach(item => {
                    const queueItem = createQueueItem(item);
                    queueContainer.appendChild(queueItem);
                });
            }
        }, 1000);

    } catch (error) {
        queueContainer.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load queue</h3>
                <p>Please try again later.</p>
            </div>
        `;
        console.error('Queue loading error:', error);
    }
}

function createQueueItem(queueData) {
    const item = document.createElement('div');
    item.className = 'queue-item';

    item.innerHTML = `
        <div>
            <div class="queue-number">Queue No# ${queueData.queueNumber}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                Doctor: ${queueData.doctorName}
            </div>
        </div>
        <div class="queue-time">Estimated waiting time: ${queueData.waitingTime}</div>
    `;

    return item;
}

// Appointment search functions (enhanced for demo)
async function searchAppointments() {
    const patientId = document.getElementById('search-patient-id').value.trim();
    const appointmentsList = document.getElementById('appointments-list');

    if (!patientId) {
        showModal('Validation Error', 'Please enter a Patient ID to search.', 'error');
        return;
    }

    appointmentsList.innerHTML = '<div class="pulse" style="text-align: center; padding: 40px;">Searching appointments...</div>';

    try {
        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo purposes, show sample appointments for any patient ID
        const sampleAppointments = [
            {
                appointmentId: 'APT1703123456789',
                doctorName: 'Dr. Bob Smith',
                dateTime: '2024-01-15',
                time: '09:00 AM',
                status: 'confirmed',
                queueNumber: 'Q001',
                bookedAt: new Date().toISOString(),
                patientId: patientId
            },
            {
                appointmentId: 'APT1703123456790',
                doctorName: 'Dr. Alice Johnson',
                dateTime: '2024-01-20',
                time: '02:00 PM',
                status: 'completed',
                queueNumber: 'Q002',
                bookedAt: new Date().toISOString(),
                patientId: patientId
            }
        ];

        displayAppointments(sampleAppointments, appointmentsList);

    } catch (error) {
        appointmentsList.innerHTML = `
            <div class="empty-state">
                <h3>Search Failed</h3>
                <p>Unable to search appointments. Please try again.</p>
            </div>
        `;
        console.error('Search error:', error);
    }
}

function displayAppointments(appointments, container) {
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No appointments found</h3>
                <p>No appointments found for this Patient ID.</p>
            </div>
        `;
        return;
    }

    // Keep existing sample appointments and add searched ones
    const existingContent = container.innerHTML;
    if (!existingContent.includes('appointment-card')) {
        container.innerHTML = '';
        appointments.forEach(appointment => {
            const appointmentCard = createAppointmentCard(appointment);
            container.appendChild(appointmentCard);
        });
    }
}

function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';

    const statusBadge = `<span class="status-badge status-${appointment.status}">${appointment.status}</span>`;

    card.innerHTML = `
        <div class="appointment-info">
            <div>
                <strong>Appointment ID:</strong>
                ${appointment.appointmentId}
            </div>
            <div>
                <strong>Doctor:</strong>
                ${appointment.doctorName}
            </div>
            <div>
                <strong>Date & Time:</strong>
                ${appointment.dateTime} at ${appointment.time}
            </div>
            <div>
                <strong>Status:</strong>
                ${statusBadge}
            </div>
            <div>
                <strong>Queue Number:</strong>
                ${appointment.queueNumber || 'Not assigned'}
            </div>
            <div>
                <strong>Patient ID:</strong>
                ${appointment.patientId}
            </div>
        </div>
        <div class="appointment-actions">
            ${appointment.status === 'confirmed' ? `
                <button class="btn-secondary" onclick="modifyAppointment('${appointment.appointmentId}')">
                    Modify
                </button>
                <button class="btn-danger" onclick="cancelAppointment('${appointment.appointmentId}')">
                    Cancel
                </button>
                <button class="btn-primary" onclick="checkInPatient('${appointment.appointmentId}')">Check In</button>
            ` : `
                <button class="btn-secondary" disabled>
                    ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </button>
            `}
        </div>
    `;

    return card;
}

// Appointment modification functions
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
            method: 'DELETE'
        });

        const data = await response.json();
        hideLoading();

        if (response.ok && data.success) {
            showModal('Appointment Cancelled', 'Your appointment has been cancelled successfully.', 'success');
            // Refresh the appointments list
            setTimeout(() => {
                location.reload(); // Refresh to show updated data
            }, 1500);
        } else {
            showModal('Cancellation Failed', data.message || 'Failed to cancel appointment.', 'error');
        }

    } catch (error) {
        hideLoading();
        showModal('Network Error', 'Unable to connect to server.', 'error');
        console.error('Cancellation error:', error);
    }
}

async function modifyAppointment(appointmentId) {
    const newDateTime = prompt('Enter new date and time (YYYY-MM-DD HH:MM format):');
    if (!newDateTime) return;

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/modify`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newDateTime: newDateTime
            })
        });

        const data = await response.json();
        hideLoading();

        if (response.ok && data.success) {
            showModal('Appointment Modified', 'Your appointment has been modified successfully.', 'success');
            setTimeout(() => {
                location.reload(); // Refresh to show updated data
            }, 1500);
        } else {
            showModal('Modification Failed', data.message || 'Failed to modify appointment.', 'error');
        }

    } catch (error) {
        hideLoading();
        showModal('Network Error', 'Unable to connect to server.', 'error');
        console.error('Modification error:', error);
    }
}

async function checkInPatient(appointmentId) {
    if (!confirm('Check in for this appointment?')) {
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/checkin`, {
            method: 'POST'
        });

        const data = await response.json();
        hideLoading();

        if (response.ok && data.success) {
            showModal('Check-in Successful', `
                <div class="message-success">
                    <p>You have been checked in successfully!</p>
                    <p><strong>Queue Number:</strong> ${data.queueNumber}</p>
                    <p><strong>Check-in Time:</strong> ${new Date(data.checkedInAt).toLocaleString()}</p>
                </div>
            `, 'success');
            setTimeout(() => {
                location.reload(); // Refresh to show updated data
            }, 1500);
        } else {
            showModal('Check-in Failed', data.message || 'Failed to check in.', 'error');
        }

    } catch (error) {
        hideLoading();
        showModal('Network Error', 'Unable to connect to server.', 'error');
        console.error('Check-in error:', error);
    }
}

// UI utility functions
function showLoading() {
    document.getElementById('loading-overlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
}

function showModal(title, content, type = 'info') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('result-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('result-modal').classList.remove('active');
}

// Legacy function support (for backward compatibility with your existing backend calls)
function displayResult(elementId, data, isError = false) {
    console.log('Legacy displayResult called:', { elementId, data, isError });

    if (isError) {
        showModal('Error', `<pre>${JSON.stringify(data, null, 2)}</pre>`, 'error');
    } else {
        showModal('Success', `<pre>${JSON.stringify(data, null, 2)}</pre>`, 'success');
    }
}