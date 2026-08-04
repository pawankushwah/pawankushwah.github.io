/**
 * Tiffin Manager App Logic
 * Vanilla JS with LocalStorage for Data Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let today = new Date();
    
    let isUnlocked = false;
    
    // Data Structure:
    // data = {
    //   passcode: "1234",
    //   records: {
    //      "2026-08-01": { status: "arrived", desc: "Test", tags: ["Spicy"] }
    //   }
    // }
    let appData = loadData();

    // Elements
    const calendarTitle = document.getElementById('calendar-title');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const daysList = document.getElementById('days-list');
    
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const markTodayBtn = document.getElementById('mark-today-btn');
    
    // Modals
    const authModal = document.getElementById('auth-modal');
    const editModal = document.getElementById('edit-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    // Auth Elements
    const authBtn = document.getElementById('auth-btn');
    const authText = document.getElementById('auth-text');
    const lockIcon = document.getElementById('lock-icon');
    const pinInputs = document.querySelectorAll('.pin-box');
    const authError = document.getElementById('auth-error');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authModalDesc = document.getElementById('auth-modal-desc');

    // Edit Modal Elements
    const editForm = document.getElementById('edit-form');
    const editDateKey = document.getElementById('edit-date-key');
    const editDesc = document.getElementById('edit-desc');
    const editTags = document.getElementById('edit-tags');
    const editModalTitle = document.getElementById('edit-modal-title');

    // Import/Export Elements
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const viewIcon = document.getElementById('view-icon');
    let isGridView = localStorage.getItem('tiffinViewMode') !== 'list';

    // Stats
    const statArrived = document.getElementById('stat-arrived');
    const statNotArrived = document.getElementById('stat-not-arrived');

    // --- Initialization ---
    initApp();

    function initApp() {
        updateAuthUI();
        updateViewMode();
        renderCalendar();
    }

    function updateViewMode() {
        if (!viewToggleBtn) return;
        if (isGridView) {
            daysList.classList.add('grid-view');
            viewIcon.innerHTML = '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>';
        } else {
            daysList.classList.remove('grid-view');
            viewIcon.innerHTML = '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>';
        }
    }

    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            isGridView = !isGridView;
            localStorage.setItem('tiffinViewMode', isGridView ? 'grid' : 'list');
            updateViewMode();
        });
    }

    // --- Data Management ---
    function loadData() {
        const stored = localStorage.getItem('tiffinData');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Error parsing stored data", e);
            }
        }
        return { passcode: null, records: {} };
    }

    function saveData() {
        localStorage.setItem('tiffinData', JSON.stringify(appData));
        updateStats();
    }
    
    function saveRecord(key, record) {
        appData.records[key] = record;
        saveData();
    }

    function getDayKey(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function getRecord(key) {
        return appData.records[key] || { status: 'pending', desc: '', tags: [] };
    }

    // --- Calendar Rendering ---
    function renderCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            currentMonthDisplay.textContent = "Current Month";
        } else {
            currentMonthDisplay.textContent = "Past/Future Month";
        }

        daysList.innerHTML = '';
        
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const key = getDayKey(currentYear, currentMonth, i);
            const record = getRecord(key);
            
            const isToday = date.getDate() === today.getDate() && 
                            date.getMonth() === today.getMonth() && 
                            date.getFullYear() === today.getFullYear();
                            
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[date.getDay()];

            // Check lock status: if it's not today, and we are not unlocked, it's locked.
            const isEditable = isUnlocked || isToday;

            // Background classes
            let bgClass = '';
            if (record.status === 'arrived') {
                bgClass = 'bg-arrived';
            } else if (record.status === 'not-arrived') {
                bgClass = 'bg-not-arrived';
            }

            const div = document.createElement('div');
            div.className = `day-item ${isToday ? 'today' : ''} ${!isEditable ? 'locked' : ''} ${bgClass}`;
            div.dataset.key = key;

            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Status label formatting
            let statusClass = 'status-pending';
            let statusText = 'Pending';
            let showStatus = true;
            
            if (record.status === 'arrived') {
                statusClass = 'status-arrived';
                statusText = 'Arrived';
            } else if (record.status === 'not-arrived') {
                statusClass = 'status-not-arrived';
                statusText = 'Not Arrived';
            } else if (isPast) {
                showStatus = false;
            }

            // Tags formatting
            let tagsHtml = '';
            if (record.tags && record.tags.length > 0) {
                tagsHtml = `<div class="day-tags">${record.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
            }

            // Description formatting
            let descHtml = record.desc 
                ? `<div class="day-desc">${record.desc}</div>` 
                : `<div class="day-empty">No description</div>`;

            div.innerHTML = `
                <div class="day-date">
                    <span class="day-num">${i}</span>
                    <span class="day-name">${dayName}</span>
                </div>
                <div class="day-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                        ${descHtml}
                        ${showStatus ? `<span class="day-status ${statusClass}">
                            ${statusClass === 'status-arrived' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                            ${statusClass === 'status-not-arrived' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' : ''}
                            ${statusText}
                        </span>` : ''}
                    </div>
                    ${tagsHtml}
                </div>
                <div class="day-action" style="display: flex; gap: 0.5rem;">
                    <button class="edit-btn quick-arrived-btn" data-key="${key}" title="Mark Arrived" ${!isEditable ? 'disabled' : ''} style="${record.status === 'arrived' ? 'background: rgba(16, 185, 129, 0.2); color: #10B981; border-color: #10B981;' : ''}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button class="edit-btn quick-not-arrived-btn" data-key="${key}" title="Mark Not Arrived" ${!isEditable ? 'disabled' : ''} style="${record.status === 'not-arrived' ? 'background: rgba(239, 68, 68, 0.2); color: #EF4444; border-color: #EF4444;' : ''}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <button class="edit-btn" data-key="${key}" title="Edit Details" ${!isEditable ? 'disabled' : ''} onclick="openEditModal('${key}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </div>
            `;
            daysList.appendChild(div);
        }

        // Attach event listeners for quick actions
        document.querySelectorAll('.quick-arrived-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                const record = getRecord(key);
                // Toggle if already arrived, else set arrived
                record.status = record.status === 'arrived' ? 'pending' : 'arrived';
                saveRecord(key, record);
                renderCalendar();
                showToast('Status updated');
            });
        });

        document.querySelectorAll('.quick-not-arrived-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                const record = getRecord(key);
                // Toggle if already not arrived, else set not arrived
                record.status = record.status === 'not-arrived' ? 'pending' : 'not-arrived';
                saveRecord(key, record);
                renderCalendar();
                showToast('Status updated');
            });
        });

        updateStats();
    }

    function updateStats() {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        let arrived = 0, notArrived = 0;

        for (let i = 1; i <= daysInMonth; i++) {
            const key = getDayKey(currentYear, currentMonth, i);
            const record = getRecord(key);
            if (record.status === 'arrived') arrived++;
            else if (record.status === 'not-arrived') notArrived++;
        }

        statArrived.textContent = arrived;
        statNotArrived.textContent = notArrived;
    }

    // --- Navigation ---
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    markTodayBtn.addEventListener('click', () => {
        const key = getDayKey(today.getFullYear(), today.getMonth(), today.getDate());
        let record = getRecord(key);
        record.status = 'arrived';
        appData.records[key] = record;
        saveData();
        renderCalendar();
        showToast('Today marked as arrived!');
    });

    // --- Modals General ---
    function openModal(modal) {
        modalOverlay.classList.add('active');
        modal.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        authModal.classList.remove('active');
        editModal.classList.remove('active');
        // Reset forms
        pinInputs.forEach(input => input.value = '');
        authError.style.display = 'none';
    }

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    modalOverlay.addEventListener('click', closeModal);

    // --- Authentication ---
    function updateAuthUI() {
        if (!appData.passcode) {
            // No passcode set yet
            authText.textContent = "Set Passcode";
            lockIcon.innerHTML = '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>';
            isUnlocked = true; // Implicitly unlocked if no passcode
        } else if (isUnlocked) {
            authText.textContent = "Lock Settings";
            lockIcon.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>';
        } else {
            authText.textContent = "Unlock Settings";
            lockIcon.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';
        }
        renderCalendar();
    }

    authBtn.addEventListener('click', () => {
        if (!appData.passcode) {
            // Setup flow
            authModalTitle.textContent = "Set Passcode";
            authModalDesc.textContent = "Create a 4-digit passcode to protect past records.";
            openModal(authModal);
            setTimeout(() => pinInputs[0].focus(), 100);
        } else if (isUnlocked) {
            // Lock flow
            isUnlocked = false;
            updateAuthUI();
            showToast('Settings locked.');
        } else {
            // Unlock flow
            authModalTitle.textContent = "Unlock Settings";
            authModalDesc.textContent = "Enter your 4-digit passcode to edit past records.";
            openModal(authModal);
            setTimeout(() => pinInputs[0].focus(), 100);
        }
    });

    // PIN input logic
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                } else {
                    submitPin();
                }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '') {
                if (index > 0) {
                    pinInputs[index - 1].focus();
                    pinInputs[index - 1].value = '';
                }
            }
        });
    });

    function submitPin() {
        const pin = Array.from(pinInputs).map(i => i.value).join('');
        if (pin.length !== 4) return;

        if (!appData.passcode) {
            // Set new passcode
            appData.passcode = pin;
            saveData();
            isUnlocked = true;
            closeModal();
            updateAuthUI();
            showToast('Passcode set successfully!');
        } else {
            // Check existing passcode
            if (pin === appData.passcode) {
                isUnlocked = true;
                closeModal();
                updateAuthUI();
                showToast('Unlocked successfully!');
            } else {
                authError.style.display = 'block';
                pinInputs.forEach(i => i.value = '');
                pinInputs[0].focus();
            }
        }
    }

    // --- Edit Day Logic ---
    window.openEditModal = function(key) {
        const record = getRecord(key);
        editDateKey.value = key;
        
        // Populate form
        const radio = document.querySelector(`input[name="status"][value="${record.status}"]`);
        if (radio) radio.checked = true;
        
        editDesc.value = record.desc || '';
        editTags.value = record.tags ? record.tags.join(', ') : '';
        
        const dateObj = new Date(key);
        editModalTitle.textContent = `Edit: ${dateObj.toDateString()}`;
        
        openModal(editModal);
    };

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const key = editDateKey.value;
        const status = document.querySelector('input[name="status"]:checked').value;
        const desc = editDesc.value.trim();
        const tags = editTags.value.split(',').map(t => t.trim()).filter(t => t);
        
        appData.records[key] = { status, desc, tags };
        saveData();
        closeModal();
        renderCalendar();
        showToast('Day updated successfully!');
    });

    // --- Import / Export ---
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(appData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tiffin_backup_${today.getFullYear()}_${today.getMonth()+1}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!');
    });

    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed && typeof parsed === 'object') {
                    appData = parsed;
                    if (!appData.records) appData.records = {};
                    saveData();
                    isUnlocked = false; // Relock after import
                    updateAuthUI();
                    showToast('Data imported successfully!');
                }
            } catch (err) {
                alert('Invalid JSON file.');
            }
            importFile.value = ''; // Reset
        };
        reader.readAsText(file);
    });

    // --- Toast Utility ---
    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.error('Service Worker registration failed', err));
        });
    }
});
