document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const statusCard = document.getElementById('statusCard');
    const statusText = document.getElementById('statusText');
    const activeTimer = document.getElementById('activeTimer');
    const totalTimeToday = document.getElementById('totalTimeToday');
    const sessionList = document.getElementById('sessionList');
    
    const playIcon = document.querySelector('.play-icon');
    const stopIcon = document.querySelector('.stop-icon');
    const btnText = document.querySelector('.btn-text');

    let currentSessionStart = null;
    let timerInterval = null;

    // Initialize state
    const today = getTodayDateString();
    let dailySessions = getSessionsForDate(today);

    // Check if there is an active session
    const savedActiveSession = localStorage.getItem('work_current_session');
    if (savedActiveSession) {
        currentSessionStart = parseInt(savedActiveSession, 10);
        startTimerDisplay();
        setUIWorkingState();
    } else {
        setUIStoppedState();
    }
    
    updateSummaryUI();
    renderSessionList();

    // Event Listeners
    toggleBtn.addEventListener('click', () => {
        if (currentSessionStart) {
            clockOut();
        } else {
            clockIn();
        }
    });

    function clockIn() {
        currentSessionStart = Date.now();
        localStorage.setItem('work_current_session', currentSessionStart.toString());
        startTimerDisplay();
        setUIWorkingState();
    }

    function clockOut() {
        const endTime = Date.now();
        const session = {
            start: currentSessionStart,
            end: endTime,
            duration: endTime - currentSessionStart
        };

        dailySessions.push(session);
        saveSessionsForDate(today, dailySessions);
        
        // Clear active session
        currentSessionStart = null;
        localStorage.removeItem('work_current_session');
        stopTimerDisplay();
        
        setUIStoppedState();
        updateSummaryUI();
        renderSessionList();
    }

    function startTimerDisplay() {
        updateTimerDisplay(); // Initial update
        timerInterval = setInterval(updateTimerDisplay, 1000);
    }

    function stopTimerDisplay() {
        clearInterval(timerInterval);
        activeTimer.textContent = '00:00:00';
    }

    function updateTimerDisplay() {
        if (!currentSessionStart) return;
        const now = Date.now();
        const elapsed = now - currentSessionStart;
        activeTimer.textContent = formatDuration(elapsed);
    }

    function setUIWorkingState() {
        statusCard.classList.add('active');
        statusText.textContent = 'Working';
        toggleBtn.classList.remove('start-btn');
        toggleBtn.classList.add('stop-btn');
        btnText.textContent = 'Clock Out';
        playIcon.style.display = 'none';
        stopIcon.style.display = 'block';
    }

    function setUIStoppedState() {
        statusCard.classList.remove('active');
        statusText.textContent = 'Not Working';
        toggleBtn.classList.remove('stop-btn');
        toggleBtn.classList.add('start-btn');
        btnText.textContent = 'Clock In';
        playIcon.style.display = 'block';
        stopIcon.style.display = 'none';
    }

    // --- Helpers ---
    function getTodayDateString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getSessionsForDate(dateStr) {
        const data = localStorage.getItem(`work_sessions_${dateStr}`);
        return data ? JSON.parse(data) : [];
    }

    function saveSessionsForDate(dateStr, sessions) {
        localStorage.setItem(`work_sessions_${dateStr}`, JSON.stringify(sessions));
    }

    function updateSummaryUI() {
        const totalMs = dailySessions.reduce((acc, session) => acc + session.duration, 0);
        if (totalMs === 0) {
            totalTimeToday.textContent = '0h 0m';
            return;
        }
        
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        
        if (hours > 0) {
            totalTimeToday.textContent = `${hours}h ${minutes}m`;
        } else {
            totalTimeToday.textContent = `${minutes}m`;
        }
    }

    function renderSessionList() {
        sessionList.innerHTML = '';
        if (dailySessions.length === 0) {
            sessionList.innerHTML = '<div class="empty-state">No sessions recorded today.</div>';
            return;
        }

        // Render in reverse chronological order
        const reversedSessions = [...dailySessions].reverse();
        
        reversedSessions.forEach(session => {
            const start = new Date(session.start);
            const end = new Date(session.end);
            
            const el = document.createElement('div');
            el.className = 'session-item';
            
            const timeRange = `${formatTime(start)} - ${formatTime(end)}`;
            const durationStr = formatDurationShort(session.duration);
            
            el.innerHTML = `
                <div class="session-times">
                    <span class="session-time-range">${timeRange}</span>
                    <span class="session-date">Today</span>
                </div>
                <div class="session-duration">${durationStr}</div>
            `;
            sessionList.appendChild(el);
        });
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatDuration(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return [hours, minutes, seconds]
            .map(val => String(val).padStart(2, '0'))
            .join(':');
    }

    function formatDurationShort(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
});
