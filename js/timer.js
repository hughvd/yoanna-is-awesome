/**
 * Pomodoro Study Timer
 * Manages study sessions with configurable work/break intervals
 */

const Timer = {
    // DOM elements
    elements: {
        display: null,
        startBtn: null,
        pauseBtn: null,
        resetBtn: null,
        modeSelect: null,
        sessionsCount: null,
        circle: null,
        workDurationInput: null,
        breakDurationInput: null,
        applySettingsBtn: null
    },

    // Timer state
    state: {
        isRunning: false,
        isPaused: false,
        mode: 'work', // 'work' or 'break'
        timeRemaining: 25 * 60, // seconds
        interval: null,
        startTime: null, // Track actual start time for accuracy
        pausedTime: 0 // Track time spent paused
    },

    // Timer durations (in seconds) - will be set from config
    durations: {
        work: 25 * 60,  // 25 minutes (default)
        break: 5 * 60   // 5 minutes (default)
    },

    // Audio for notifications (optional)
    audioContext: null,

    /**
     * Initialize timer
     */
    init() {
        // Cache DOM elements
        this.elements.display = document.getElementById('timerDisplay');
        this.elements.startBtn = document.getElementById('startTimer');
        this.elements.pauseBtn = document.getElementById('pauseTimer');
        this.elements.resetBtn = document.getElementById('resetTimer');
        this.elements.modeSelect = document.getElementById('timerMode');
        this.elements.sessionsCount = document.getElementById('sessionsCount');
        this.elements.circle = document.getElementById('timerCircle');
        this.elements.workDurationInput = document.getElementById('workDuration');
        this.elements.breakDurationInput = document.getElementById('breakDuration');
        this.elements.applySettingsBtn = document.getElementById('applyTimerSettings');

        // Set up event listeners
        this.setupEventListeners();

        // Load timer data
        this.loadTimerData();

        // Initial display
        this.updateDisplay();

        // Update immediately when tab becomes visible (important for mobile Safari)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.state.isRunning) {
                this.tick(); // Immediately recalculate time
            }
        });
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.modeSelect.addEventListener('change', (e) => this.changeMode(e.target.value));

        // Timer settings
        if (this.elements.applySettingsBtn) {
            this.elements.applySettingsBtn.addEventListener('click', () => this.applySettings());
        }
    },

    /**
     * Apply custom timer duration settings
     */
    applySettings() {
        const workMinutes = parseInt(this.elements.workDurationInput.value);
        const breakMinutes = parseInt(this.elements.breakDurationInput.value);

        if (workMinutes > 0 && breakMinutes > 0) {
            this.setDurations(workMinutes, breakMinutes);

            // Update the select options display
            this.elements.modeSelect.options[0].text = `Study (${workMinutes} min)`;
            this.elements.modeSelect.options[1].text = `Break (${breakMinutes} min)`;

            // Show confirmation
            this.elements.applySettingsBtn.textContent = '✓ Applied!';
            setTimeout(() => {
                this.elements.applySettingsBtn.textContent = 'Apply';
            }, 2000);
        }
    },

    /**
     * Load timer data from storage
     */
    loadTimerData() {
        const data = Storage.getTimerData();
        this.elements.sessionsCount.textContent = data.sessionsToday;
    },

    /**
     * Start timer
     */
    start() {
        if (this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.isPaused = false;

        // Record start time (or resume time)
        if (!this.state.startTime) {
            // First start - record the target end time
            this.state.startTime = Date.now();
            this.state.endTime = this.state.startTime + (this.state.timeRemaining * 1000);
        } else {
            // Resuming from pause - adjust end time
            this.state.endTime = Date.now() + (this.state.timeRemaining * 1000);
        }

        // Update button states
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;

        // Start countdown
        this.state.interval = setInterval(() => this.tick(), 1000);
    },

    /**
     * Pause timer
     */
    pause() {
        if (!this.state.isRunning) return;

        this.state.isRunning = false;
        this.state.isPaused = true;

        // Update button states
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;

        // Stop interval
        if (this.state.interval) {
            clearInterval(this.state.interval);
            this.state.interval = null;
        }
    },

    /**
     * Reset timer to current mode's duration
     */
    reset() {
        // Stop timer
        this.pause();

        // Reset time and clear start time
        this.state.timeRemaining = this.durations[this.state.mode];
        this.state.startTime = null;
        this.state.endTime = null;
        this.state.isPaused = false;

        // Update button states
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;

        // Update display
        this.updateDisplay();
    },

    /**
     * Change timer mode (work/break)
     * @param {string} mode - 'work' or 'break'
     */
    changeMode(mode) {
        // Stop current timer
        this.pause();

        // Update mode
        this.state.mode = mode;
        this.state.timeRemaining = this.durations[mode];

        // Reset timing state
        this.state.startTime = null;
        this.state.endTime = null;
        this.state.isPaused = false;

        // Update display
        this.updateDisplay();
    },

    /**
     * Timer tick (every second)
     */
    tick() {
        // Calculate time remaining based on actual time (not just decrementing)
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((this.state.endTime - now) / 1000));

        this.state.timeRemaining = timeLeft;

        // Update display
        this.updateDisplay();

        // Check if timer completed
        if (this.state.timeRemaining <= 0) {
            this.complete();
        }
    },

    /**
     * Handle timer completion
     */
    complete() {
        // Stop timer
        this.pause();

        // Play notification sound
        this.playNotification();

        // If work session completed, increment counter
        if (this.state.mode === 'work') {
            Storage.incrementSession();
            Storage.addStudyTime(this.durations.work / 60);
            this.loadTimerData();

            // Suggest break
            this.showCompletionMessage('Work session complete! Time for a break? 🎉');

            // Auto-switch to break mode
            this.elements.modeSelect.value = 'break';
            this.changeMode('break');
        } else {
            // Break completed, switch back to work
            this.showCompletionMessage('Break complete! Ready to get back to studying? 💪');

            // Auto-switch to work mode
            this.elements.modeSelect.value = 'work';
            this.changeMode('work');
        }
    },

    /**
     * Show completion message
     * @param {string} message - Message to display
     */
    showCompletionMessage(message) {
        // Trigger event that app.js can handle
        const event = new CustomEvent('timerComplete', {
            detail: { message, mode: this.state.mode }
        });
        document.dispatchEvent(event);
    },

    /**
     * Update timer display
     */
    updateDisplay() {
        const minutes = Math.floor(this.state.timeRemaining / 60);
        const seconds = this.state.timeRemaining % 60;

        this.elements.display.textContent =
            `${this.formatNumber(minutes)}:${this.formatNumber(seconds)}`;

        // Update circle color based on mode
        if (this.state.mode === 'work') {
            this.elements.circle.style.background =
                'linear-gradient(135deg, var(--primary-light), var(--secondary-color))';
        } else {
            this.elements.circle.style.background =
                'linear-gradient(135deg, var(--success-color), var(--primary-color))';
        }
    },

    /**
     * Format number with leading zero
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        return num.toString().padStart(2, '0');
    },

    /**
     * Play notification sound when timer completes
     */
    playNotification() {
        // Use Web Audio API for a simple beep
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not available:', error);
        }

        // Also try browser notification if permitted
        this.showBrowserNotification();
    },

    /**
     * Show browser notification
     */
    showBrowserNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = this.state.mode === 'work'
                ? 'Study Session Complete!'
                : 'Break Time Over!';

            const body = this.state.mode === 'work'
                ? 'Great job! Time for a break.'
                : 'Ready to get back to studying?';

            new Notification(title, {
                body: body,
                icon: '📚',
                badge: '✅'
            });
        }
    },

    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    /**
     * Get session statistics
     * @returns {Object} Session statistics
     */
    getStats() {
        return Storage.getTimerData();
    },

    /**
     * Set custom durations
     * @param {number} workMinutes - Work duration in minutes
     * @param {number} breakMinutes - Break duration in minutes
     */
    setDurations(workMinutes, breakMinutes) {
        this.durations.work = workMinutes * 60;
        this.durations.break = breakMinutes * 60;

        // Update input fields if they exist
        if (this.elements.workDurationInput) {
            this.elements.workDurationInput.value = workMinutes;
        }
        if (this.elements.breakDurationInput) {
            this.elements.breakDurationInput.value = breakMinutes;
        }

        // Update select options display
        if (this.elements.modeSelect) {
            this.elements.modeSelect.options[0].text = `Study (${workMinutes} min)`;
            this.elements.modeSelect.options[1].text = `Break (${breakMinutes} min)`;
        }

        // Reset timer with new duration
        this.reset();
    }
};
