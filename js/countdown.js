/**
 * LSAT Countdown Timer
 * Displays and updates countdown to the LSAT test date
 */

const Countdown = {
    // DOM elements
    elements: {
        days: null,
        hours: null,
        minutes: null,
        seconds: null,
        progressBar: null,
        progressText: null
    },

    // Countdown data
    targetDate: null,
    startDate: null,
    interval: null,

    /**
     * Initialize countdown
     * @param {string} lsatDate - ISO date string for LSAT test
     */
    init(lsatDate) {
        // Cache DOM elements
        this.elements.days = document.getElementById('days');
        this.elements.hours = document.getElementById('hours');
        this.elements.minutes = document.getElementById('minutes');
        this.elements.seconds = document.getElementById('seconds');
        this.elements.progressBar = document.getElementById('progressBar');
        this.elements.progressText = document.getElementById('progressText');

        // Set dates
        this.targetDate = new Date(lsatDate);
        this.startDate = new Date(); // You can customize this to track from a specific start date

        // Start countdown
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    },

    /**
     * Update countdown display
     */
    update() {
        const now = new Date();
        const timeDiff = this.targetDate - now;

        // Check if countdown has ended
        if (timeDiff <= 0) {
            this.displayCompleted();
            clearInterval(this.interval);
            return;
        }

        // Calculate time units
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        // Update display
        this.elements.days.textContent = this.formatNumber(days);
        this.elements.hours.textContent = this.formatNumber(hours);
        this.elements.minutes.textContent = this.formatNumber(minutes);
        this.elements.seconds.textContent = this.formatNumber(seconds);

        // Update progress bar
        this.updateProgress(now);
    },

    /**
     * Update progress bar
     * @param {Date} now - Current date
     */
    updateProgress(now) {
        // Calculate progress percentage
        const totalTime = this.targetDate - this.startDate;
        const elapsed = now - this.startDate;
        const percentage = Math.min((elapsed / totalTime) * 100, 100);

        // Update progress bar
        this.elements.progressBar.style.width = `${percentage}%`;

        // Update progress text
        const daysTotal = Math.floor(totalTime / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        const daysRemaining = daysTotal - daysElapsed;

        this.elements.progressText.textContent =
            `${daysElapsed} days completed • ${daysRemaining} days remaining • ${percentage.toFixed(1)}% of study period`;
    },

    /**
     * Display when countdown is complete
     */
    displayCompleted() {
        this.elements.days.textContent = '00';
        this.elements.hours.textContent = '00';
        this.elements.minutes.textContent = '00';
        this.elements.seconds.textContent = '00';
        this.elements.progressBar.style.width = '100%';
        this.elements.progressText.textContent = 'It\'s test day! You\'ve got this! 🎉';
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
     * Get days until test
     * @returns {number} Days remaining
     */
    getDaysUntil() {
        const now = new Date();
        const timeDiff = this.targetDate - now;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    },

    /**
     * Get formatted date string
     * @returns {string} Formatted date
     */
    getFormattedDate() {
        return this.targetDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Stop countdown
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    /**
     * Restart countdown with new date
     * @param {string} newDate - New ISO date string
     */
    restart(newDate) {
        this.stop();
        this.init(newDate);
    }
};
