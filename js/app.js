/**
 * LSAT Study Companion - Main Application
 * Coordinates all modules and handles configuration
 */

const App = {
    // Configuration data
    config: null,

    // DOM elements
    elements: {
        personalMessage: null,
        personalMessageText: null,
        closeMessageBtn: null,
        quoteText: null,
        newQuoteBtn: null
    },

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load configuration
            await this.loadConfig();

            // Cache DOM elements
            this.cacheElements();

            // Initialize all modules
            this.initializeModules();

            // Set up event listeners
            this.setupEventListeners();

            // Handle personal messages
            this.checkPersonalMessages();

            // Display initial quote
            this.displayRandomQuote();

            // Request notification permission for timer
            Timer.requestNotificationPermission();

            console.log('✅ LSAT Study Companion initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.showError('Failed to load configuration. Please check config.json');
        }
    },

    /**
     * Load configuration from config.json
     */
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error('Failed to fetch config.json');
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
            // Use default config if loading fails
            this.config = this.getDefaultConfig();
        }
    },

    /**
     * Get default configuration
     * @returns {Object} Default config object
     */
    getDefaultConfig() {
        return {
            lsatDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
            targetScore: 170,
            motivationalQuotes: [
                "You've got this! Every practice question brings you closer to your goal.",
                "Believe in yourself and your preparation.",
                "Success is the sum of small efforts repeated day after day.",
                "Your dedication today is building your future tomorrow."
            ],
            personalMessages: [],
            dailyQuestions: []
        };
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements.personalMessage = document.getElementById('personalMessage');
        this.elements.personalMessageText = document.getElementById('personalMessageText');
        this.elements.closeMessageBtn = document.getElementById('closeMessage');
        this.elements.quoteText = document.querySelector('.quote-text');
        this.elements.newQuoteBtn = document.getElementById('newQuote');
    },

    /**
     * Initialize all modules
     */
    initializeModules() {
        // Initialize countdown with LSAT date
        Countdown.init(this.config.lsatDate);

        // Initialize streak tracker
        Streak.init();

        // Initialize timer with custom durations if provided
        Timer.init();
        if (this.config.timerDurations) {
            Timer.setDurations(
                this.config.timerDurations.workMinutes,
                this.config.timerDurations.breakMinutes
            );
        }

        // Initialize questions
        Questions.init(this.config.dailyQuestions);

        // Initialize score goal
        this.initializeScoreGoal();
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Quote button
        this.elements.newQuoteBtn.addEventListener('click', () => this.displayRandomQuote());

        // Personal message close button
        this.elements.closeMessageBtn.addEventListener('click', () => this.closePersonalMessage());

        // Listen for streak milestones
        document.addEventListener('streakMilestone', (e) => this.handleStreakMilestone(e.detail));

        // Listen for timer completion
        document.addEventListener('timerComplete', (e) => this.handleTimerComplete(e.detail));
    },

    /**
     * Initialize score goal display
     */
    initializeScoreGoal() {
        const targetScore = this.config.targetScore || 170;
        const scoreElement = document.getElementById('targetScore');
        const progressElement = document.getElementById('scoreProgress');
        const motivationElement = document.getElementById('scoreMotivation');

        // Display target score
        scoreElement.textContent = targetScore;

        // Calculate progress (example: show as percentage of max score)
        const minScore = 120;
        const maxScore = 180;
        const progress = ((targetScore - minScore) / (maxScore - minScore)) * 100;

        // Update progress bar
        progressElement.style.width = `${progress}%`;

        // Set motivational message based on target score
        let motivation = '';
        if (targetScore >= 170) {
            motivation = 'Aiming high! That\'s an excellent goal! 🌟';
        } else if (targetScore >= 160) {
            motivation = 'Great target! You\'re on the right path! 💪';
        } else {
            motivation = 'Every point counts! Keep pushing forward! 🎯';
        }

        motivationElement.textContent = motivation;
    },

    /**
     * Display random motivational quote
     */
    displayRandomQuote() {
        const quotes = this.config.motivationalQuotes || [];

        if (quotes.length === 0) {
            this.elements.quoteText.textContent = 'You\'re doing great! Keep going!';
            return;
        }

        // Get random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];

        // Display with fade animation
        this.elements.quoteText.style.opacity = '0';

        setTimeout(() => {
            this.elements.quoteText.textContent = quote;
            this.elements.quoteText.style.opacity = '1';
        }, 150);
    },

    /**
     * Check and display personal messages based on triggers
     */
    checkPersonalMessages() {
        const messages = this.config.personalMessages || [];

        for (const message of messages) {
            if (this.shouldShowMessage(message)) {
                this.showPersonalMessage(message);
                break; // Only show one message at a time
            }
        }
    },

    /**
     * Check if a message should be shown
     * @param {Object} message - Message object
     * @returns {boolean} True if message should be shown
     */
    shouldShowMessage(message) {
        // Generate unique message ID
        const messageId = `${message.trigger}_${message.value}`;

        // Check if already dismissed
        if (Storage.isMessageDismissed(messageId)) {
            return false;
        }

        // Check trigger condition
        switch (message.trigger) {
            case 'daysUntil':
                const daysUntil = Countdown.getDaysUntil();
                return daysUntil === message.value;

            case 'streak':
                const currentStreak = Streak.getCurrentStreak();
                return currentStreak === message.value;

            case 'date':
                const today = new Date().toDateString();
                const targetDate = new Date(message.value).toDateString();
                return today === targetDate;

            default:
                return false;
        }
    },

    /**
     * Show personal message banner
     * @param {Object} message - Message object
     */
    showPersonalMessage(message) {
        this.elements.personalMessageText.textContent = message.message;
        this.elements.personalMessage.classList.remove('hidden');

        // Store message ID for dismissal
        this.elements.personalMessage.dataset.messageId =
            `${message.trigger}_${message.value}`;
    },

    /**
     * Close personal message banner
     */
    closePersonalMessage() {
        const messageId = this.elements.personalMessage.dataset.messageId;

        if (messageId) {
            Storage.dismissMessage(messageId);
        }

        this.elements.personalMessage.classList.add('hidden');
    },

    /**
     * Handle streak milestone events
     * @param {Object} detail - Event detail
     */
    handleStreakMilestone(detail) {
        const messages = {
            3: 'Amazing! You\'ve built a 3-day streak! 🎉',
            7: 'Incredible! One week of consistent studying! 🔥',
            14: 'Two weeks strong! Your dedication is inspiring! 💪',
            30: 'WOW! 30 days! You\'re unstoppable! 🌟',
            50: 'FIFTY DAYS! That\'s extraordinary commitment! 🏆',
            100: 'ONE HUNDRED DAYS!!! You\'re a studying legend! 👑'
        };

        const message = messages[detail.streak];
        if (message) {
            // Could show a special celebration modal here
            console.log('Milestone achieved:', message);
        }
    },

    /**
     * Handle timer completion events
     * @param {Object} detail - Event detail
     */
    handleTimerComplete(detail) {
        // Show celebration message for work sessions
        if (detail.mode === 'work') {
            this.showCelebration();
        }
    },

    /**
     * Show celebration message after study session
     */
    showCelebration() {
        const celebrationEl = document.getElementById('celebrationMessage');
        const celebrationTitle = document.getElementById('celebrationTitle');
        const celebrationText = document.getElementById('celebrationText');

        if (!celebrationEl) return;

        // Set celebration message
        celebrationTitle.textContent = 'Great Job!';
        celebrationText.textContent = '25 minutes closer to success!';

        // Show celebration
        celebrationEl.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            celebrationEl.classList.add('hidden');
        }, 5000);
    },

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Create error banner
        const errorBanner = document.createElement('div');
        errorBanner.className = 'personal-message';
        errorBanner.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        errorBanner.innerHTML = `
            <div class="message-content">
                <span class="message-icon">⚠️</span>
                <p>${message}</p>
            </div>
        `;

        // Insert at top of container
        const container = document.querySelector('.container');
        container.insertBefore(errorBanner, container.firstChild);
    },

    /**
     * Refresh configuration (useful for testing)
     */
    async refreshConfig() {
        await this.loadConfig();
        this.initializeModules();
        this.checkPersonalMessages();
        this.displayRandomQuote();
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Make App globally accessible for debugging
window.LSATApp = App;
