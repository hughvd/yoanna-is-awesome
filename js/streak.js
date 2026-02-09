/**
 * Study Streak Tracker
 * Tracks daily visit streaks and study statistics
 */

const Streak = {
    // DOM elements
    elements: {
        currentStreak: null,
        longestStreak: null,
        totalDays: null,
        flame: null
    },

    // Streak data
    data: null,

    /**
     * Initialize streak tracker
     */
    init() {
        // Cache DOM elements
        this.elements.currentStreak = document.getElementById('currentStreak');
        this.elements.longestStreak = document.getElementById('longestStreak');
        this.elements.totalDays = document.getElementById('totalDays');
        this.elements.flame = document.querySelector('.streak-flame');

        // Load and update streak
        this.loadStreak();
        this.checkStreak();
        this.updateDisplay();
    },

    /**
     * Load streak data from storage
     */
    loadStreak() {
        this.data = Storage.getStreakData();
    },

    /**
     * Check and update streak based on last visit
     */
    checkStreak() {
        const today = Storage.getTodayString();
        const lastVisit = this.data.lastVisit;

        // If this is the first visit
        if (!lastVisit) {
            this.startStreak();
            return;
        }

        // If already visited today, do nothing
        if (Storage.isToday(lastVisit)) {
            return;
        }

        // Calculate days since last visit
        const daysSinceLastVisit = Storage.getDaysBetween(lastVisit, today);

        if (daysSinceLastVisit === 1) {
            // Visited yesterday - continue streak
            this.incrementStreak();
        } else if (daysSinceLastVisit > 1) {
            // Missed a day - reset streak
            this.resetStreak();
        }
    },

    /**
     * Start a new streak
     */
    startStreak() {
        this.data.currentStreak = 1;
        this.data.longestStreak = Math.max(1, this.data.longestStreak);
        this.data.totalDays = 1;
        this.data.lastVisit = new Date().toISOString();
        this.saveStreak();
        this.celebrateMilestone(1);
    },

    /**
     * Increment current streak
     */
    incrementStreak() {
        this.data.currentStreak++;
        this.data.totalDays++;
        this.data.lastVisit = new Date().toISOString();

        // Update longest streak if current is higher
        if (this.data.currentStreak > this.data.longestStreak) {
            this.data.longestStreak = this.data.currentStreak;
        }

        this.saveStreak();
        this.celebrateMilestone(this.data.currentStreak);
    },

    /**
     * Reset streak to 1
     */
    resetStreak() {
        this.data.currentStreak = 1;
        this.data.totalDays++;
        this.data.lastVisit = new Date().toISOString();
        this.saveStreak();
    },

    /**
     * Save streak data to storage
     */
    saveStreak() {
        Storage.setStreakData(this.data);
    },

    /**
     * Update display with current streak data
     */
    updateDisplay() {
        this.elements.currentStreak.textContent = this.data.currentStreak;
        this.elements.longestStreak.textContent = this.data.longestStreak;
        this.elements.totalDays.textContent = this.data.totalDays;

        // Update flame based on streak
        this.updateFlame();
    },

    /**
     * Update flame emoji based on streak length
     */
    updateFlame() {
        const streak = this.data.currentStreak;

        if (streak >= 100) {
            this.elements.flame.textContent = '🔥🔥🔥';
        } else if (streak >= 30) {
            this.elements.flame.textContent = '🔥🔥';
        } else if (streak >= 7) {
            this.elements.flame.textContent = '🔥';
        } else if (streak >= 3) {
            this.elements.flame.textContent = '🔥';
        } else {
            this.elements.flame.textContent = '✨';
        }
    },

    /**
     * Celebrate milestone achievements
     * @param {number} streak - Current streak count
     */
    celebrateMilestone(streak) {
        const milestones = [3, 7, 14, 30, 50, 100];

        if (milestones.includes(streak)) {
            // Trigger milestone event that app.js can handle
            const event = new CustomEvent('streakMilestone', {
                detail: { streak }
            });
            document.dispatchEvent(event);
        }
    },

    /**
     * Get current streak
     * @returns {number} Current streak count
     */
    getCurrentStreak() {
        return this.data.currentStreak;
    },

    /**
     * Get longest streak
     * @returns {number} Longest streak count
     */
    getLongestStreak() {
        return this.data.longestStreak;
    },

    /**
     * Get total study days
     * @returns {number} Total days studied
     */
    getTotalDays() {
        return this.data.totalDays;
    },

    /**
     * Reset all streak data (for testing/debugging)
     */
    resetAll() {
        this.data = {
            currentStreak: 0,
            longestStreak: 0,
            totalDays: 0,
            lastVisit: null,
            startDate: new Date().toISOString()
        };
        this.saveStreak();
        this.updateDisplay();
    },

    /**
     * Check if streak is at risk (last visit was today or yesterday)
     * @returns {boolean} True if streak is at risk
     */
    isStreakAtRisk() {
        if (!this.data.lastVisit) return false;

        const daysSinceLastVisit = Storage.getDaysBetween(
            this.data.lastVisit,
            new Date()
        );

        return daysSinceLastVisit === 0; // Same day, streak safe
    }
};
