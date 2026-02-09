/**
 * LocalStorage Utilities
 * Handles all data persistence for the LSAT Study Companion
 */

const Storage = {
    // Storage keys
    KEYS: {
        STREAK_DATA: 'lsat_streak_data',
        TIMER_DATA: 'lsat_timer_data',
        ANSWERED_QUESTIONS: 'lsat_answered_questions',
        DISMISSED_MESSAGES: 'lsat_dismissed_messages',
        VERSION: 'lsat_app_version'
    },

    // Current version for data migration
    VERSION: '1.0.0',

    /**
     * Initialize storage and handle migrations
     */
    init() {
        const storedVersion = this.get(this.KEYS.VERSION);
        if (!storedVersion) {
            // First time setup
            this.set(this.KEYS.VERSION, this.VERSION);
        } else if (storedVersion !== this.VERSION) {
            // Handle migrations if needed
            this.migrate(storedVersion, this.VERSION);
        }
    },

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
        }
    },

    /**
     * Clear all app data
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    // =============================
    // Streak Data Methods
    // =============================

    /**
     * Get streak data
     * @returns {Object} Streak data object
     */
    getStreakData() {
        return this.get(this.KEYS.STREAK_DATA, {
            currentStreak: 0,
            longestStreak: 0,
            totalDays: 0,
            lastVisit: null,
            startDate: new Date().toISOString()
        });
    },

    /**
     * Save streak data
     * @param {Object} data - Streak data object
     */
    setStreakData(data) {
        this.set(this.KEYS.STREAK_DATA, data);
    },

    // =============================
    // Timer Data Methods
    // =============================

    /**
     * Get timer data
     * @returns {Object} Timer data object
     */
    getTimerData() {
        return this.get(this.KEYS.TIMER_DATA, {
            sessionsToday: 0,
            totalSessions: 0,
            totalMinutes: 0,
            lastSession: null
        });
    },

    /**
     * Save timer data
     * @param {Object} data - Timer data object
     */
    setTimerData(data) {
        this.set(this.KEYS.TIMER_DATA, data);
    },

    /**
     * Increment session count
     */
    incrementSession() {
        const data = this.getTimerData();
        const today = new Date().toDateString();

        // Reset daily count if it's a new day
        if (data.lastSession !== today) {
            data.sessionsToday = 0;
        }

        data.sessionsToday++;
        data.totalSessions++;
        data.lastSession = today;

        this.setTimerData(data);
    },

    /**
     * Add minutes to total
     * @param {number} minutes - Minutes to add
     */
    addStudyTime(minutes) {
        const data = this.getTimerData();
        data.totalMinutes += minutes;
        this.setTimerData(data);
    },

    // =============================
    // Question Data Methods
    // =============================

    /**
     * Get answered questions
     * @returns {Object} Object with question IDs as keys and dates as values
     */
    getAnsweredQuestions() {
        return this.get(this.KEYS.ANSWERED_QUESTIONS, {});
    },

    /**
     * Mark question as answered
     * @param {number} questionId - Question ID
     */
    markQuestionAnswered(questionId) {
        const answered = this.getAnsweredQuestions();
        answered[questionId] = new Date().toISOString();
        this.set(this.KEYS.ANSWERED_QUESTIONS, answered);
    },

    /**
     * Check if question was answered
     * @param {number} questionId - Question ID
     * @returns {boolean} True if answered
     */
    isQuestionAnswered(questionId) {
        const answered = this.getAnsweredQuestions();
        return !!answered[questionId];
    },

    // =============================
    // Message Data Methods
    // =============================

    /**
     * Get dismissed messages
     * @returns {Array} Array of dismissed message IDs
     */
    getDismissedMessages() {
        return this.get(this.KEYS.DISMISSED_MESSAGES, []);
    },

    /**
     * Mark message as dismissed
     * @param {string} messageId - Message ID
     */
    dismissMessage(messageId) {
        const dismissed = this.getDismissedMessages();
        if (!dismissed.includes(messageId)) {
            dismissed.push(messageId);
            this.set(this.KEYS.DISMISSED_MESSAGES, dismissed);
        }
    },

    /**
     * Check if message was dismissed
     * @param {string} messageId - Message ID
     * @returns {boolean} True if dismissed
     */
    isMessageDismissed(messageId) {
        return this.getDismissedMessages().includes(messageId);
    },

    // =============================
    // Migration Methods
    // =============================

    /**
     * Handle data migration between versions
     * @param {string} fromVersion - Old version
     * @param {string} toVersion - New version
     */
    migrate(fromVersion, toVersion) {
        console.log(`Migrating data from ${fromVersion} to ${toVersion}`);

        // Add migration logic here when needed
        // For now, just update the version
        this.set(this.KEYS.VERSION, toVersion);
    },

    // =============================
    // Utility Methods
    // =============================

    /**
     * Get today's date string (for comparison)
     * @returns {string} Date string
     */
    getTodayString() {
        return new Date().toDateString();
    },

    /**
     * Check if a date is today
     * @param {string} dateString - Date string to check
     * @returns {boolean} True if date is today
     */
    isToday(dateString) {
        if (!dateString) return false;
        return new Date(dateString).toDateString() === this.getTodayString();
    },

    /**
     * Get days between two dates
     * @param {Date|string} date1 - First date
     * @param {Date|string} date2 - Second date
     * @returns {number} Number of days
     */
    getDaysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Initialize storage on load
if (Storage.isAvailable()) {
    Storage.init();
} else {
    console.warn('localStorage is not available. Data will not persist.');
}
