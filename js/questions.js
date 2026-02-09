/**
 * Daily LSAT Question System
 * Manages daily questions, answers, and question navigation
 */

const Questions = {
    // DOM elements
    elements: {
        questionType: null,
        questionText: null,
        answerSection: null,
        answerText: null,
        explanationText: null,
        showAnswerBtn: null,
        hideAnswerBtn: null,
        prevBtn: null,
        nextBtn: null,
        questionDate: null
    },

    // Question data
    allQuestions: [],
    currentQuestionIndex: 0,
    currentQuestion: null,

    /**
     * Initialize questions system
     * @param {Array} questions - Array of question objects from config
     */
    init(questions) {
        // Store questions
        this.allQuestions = questions || [];
        console.log('Questions.init called with', this.allQuestions.length, 'questions');

        // Cache DOM elements
        this.elements.questionType = document.getElementById('questionType');
        this.elements.questionText = document.getElementById('questionText');
        this.elements.answerSection = document.getElementById('answerSection');
        this.elements.answerText = document.getElementById('answerText');
        this.elements.explanationText = document.getElementById('explanationText');
        this.elements.showAnswerBtn = document.getElementById('showAnswer');
        this.elements.hideAnswerBtn = document.getElementById('hideAnswer');
        this.elements.prevBtn = document.getElementById('prevQuestion');
        this.elements.nextBtn = document.getElementById('nextQuestion');
        this.elements.questionDate = document.getElementById('questionDate');

        // Set up event listeners
        this.setupEventListeners();

        // Load today's question
        this.loadDailyQuestion();
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.elements.showAnswerBtn.addEventListener('click', () => this.showAnswer());
        this.elements.hideAnswerBtn.addEventListener('click', () => this.hideAnswer());
        this.elements.prevBtn.addEventListener('click', () => this.navigateQuestion(-1));
        this.elements.nextBtn.addEventListener('click', () => this.navigateQuestion(1));
    },

    /**
     * Load today's question based on date
     */
    loadDailyQuestion() {
        console.log('loadDailyQuestion: questions count =', this.allQuestions.length);

        if (this.allQuestions.length === 0) {
            console.log('No questions available, showing no questions message');
            this.showNoQuestions();
            return;
        }

        // Get today's question index using date-based hash
        this.currentQuestionIndex = this.getDailyQuestionIndex();
        console.log('Today\'s question index:', this.currentQuestionIndex);

        // Load and display the question
        this.displayQuestion(this.currentQuestionIndex);
    },

    /**
     * Get question index for today using date-based hash
     * @returns {number} Question index
     */
    getDailyQuestionIndex() {
        // Use days since epoch as seed for consistent daily questions
        const today = new Date();
        const epochStart = new Date(2024, 0, 1); // January 1, 2024
        const daysSinceEpoch = Math.floor((today - epochStart) / (1000 * 60 * 60 * 24));

        // Use modulo to cycle through questions
        return daysSinceEpoch % this.allQuestions.length;
    },

    /**
     * Display question by index
     * @param {number} index - Question index
     */
    displayQuestion(index) {
        // Ensure index is within bounds
        if (index < 0 || index >= this.allQuestions.length) {
            return;
        }

        this.currentQuestionIndex = index;
        this.currentQuestion = this.allQuestions[index];

        // Update question display
        this.elements.questionType.textContent = this.formatQuestionType(this.currentQuestion.type);
        this.elements.questionText.textContent = this.currentQuestion.question;

        // Update answer section
        this.elements.answerText.textContent = this.currentQuestion.answer;
        this.elements.explanationText.textContent = this.currentQuestion.explanation;

        // Hide answer section by default
        this.hideAnswer();

        // Update navigation
        this.updateNavigation();

        // Check if question was already answered
        if (Storage.isQuestionAnswered(this.currentQuestion.id)) {
            // Could add visual indicator here
        }
    },

    /**
     * Format question type for display
     * @param {string} type - Question type
     * @returns {string} Formatted type
     */
    formatQuestionType(type) {
        const typeMap = {
            'logic_puzzle': '🧩 Logic Puzzle',
            'logical_reasoning': '💭 Logical Reasoning',
            'reading_comp': '📖 Reading Comprehension',
            'analytical_reasoning': '🎯 Analytical Reasoning',
            'riddle': '🤔 Riddle',
            'argument': '⚖️ Argument Analysis'
        };

        return typeMap[type] || '📝 Question';
    },

    /**
     * Show answer section
     */
    showAnswer() {
        this.elements.answerSection.classList.remove('hidden');
        this.elements.showAnswerBtn.classList.add('hidden');
        this.elements.hideAnswerBtn.classList.remove('hidden');

        // Mark question as answered
        Storage.markQuestionAnswered(this.currentQuestion.id);
    },

    /**
     * Hide answer section
     */
    hideAnswer() {
        this.elements.answerSection.classList.add('hidden');
        this.elements.showAnswerBtn.classList.remove('hidden');
        this.elements.hideAnswerBtn.classList.add('hidden');
    },

    /**
     * Navigate to previous or next question
     * @param {number} direction - -1 for previous, 1 for next
     */
    navigateQuestion(direction) {
        const newIndex = this.currentQuestionIndex + direction;

        if (newIndex >= 0 && newIndex < this.allQuestions.length) {
            this.displayQuestion(newIndex);
        }
    },

    /**
     * Update navigation button states and date display
     */
    updateNavigation() {
        // Update button states
        this.elements.prevBtn.disabled = this.currentQuestionIndex === 0;
        this.elements.nextBtn.disabled = this.currentQuestionIndex === this.allQuestions.length - 1;

        // Calculate and display question date
        const questionDate = this.getQuestionDate(this.currentQuestionIndex);
        this.elements.questionDate.textContent = this.formatDate(questionDate);

        // Highlight if this is today's question
        const isToday = this.currentQuestionIndex === this.getDailyQuestionIndex();
        if (isToday) {
            this.elements.questionDate.textContent = 'Today\'s Challenge';
            this.elements.questionDate.style.fontWeight = 'bold';
            this.elements.questionDate.style.color = 'var(--primary-color)';
        } else {
            this.elements.questionDate.style.fontWeight = 'normal';
            this.elements.questionDate.style.color = 'var(--text-secondary)';
        }
    },

    /**
     * Get date for a question index
     * @param {number} index - Question index
     * @returns {Date} Date object
     */
    getQuestionDate(index) {
        const epochStart = new Date(2024, 0, 1);
        const todayIndex = this.getDailyQuestionIndex();
        const daysDifference = index - todayIndex;

        const date = new Date();
        date.setDate(date.getDate() + daysDifference);

        return date;
    },

    /**
     * Format date for display
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    },

    /**
     * Show message when no questions available
     */
    showNoQuestions() {
        this.elements.questionType.textContent = '';
        this.elements.questionText.textContent =
            'No questions available yet. Check back soon!';
        this.elements.showAnswerBtn.disabled = true;
        this.elements.prevBtn.disabled = true;
        this.elements.nextBtn.disabled = true;
    },

    /**
     * Get random question
     * @returns {Object} Random question object
     */
    getRandomQuestion() {
        if (this.allQuestions.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * this.allQuestions.length);
        return this.allQuestions[randomIndex];
    },

    /**
     * Jump to today's question
     */
    goToToday() {
        const todayIndex = this.getDailyQuestionIndex();
        this.displayQuestion(todayIndex);
    },

    /**
     * Get answered questions count
     * @returns {number} Count of answered questions
     */
    getAnsweredCount() {
        const answered = Storage.getAnsweredQuestions();
        return Object.keys(answered).length;
    },

    /**
     * Get total questions count
     * @returns {number} Total number of questions
     */
    getTotalCount() {
        return this.allQuestions.length;
    }
};
