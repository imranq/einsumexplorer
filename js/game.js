import questions from './questions.js';
import { 
    formatTensorData, 
    compareTensorData, 
    generateDetailedHint, 
    getWrongAnswerExplanation 
} from './utils.js';

class EinsumGame {
    constructor() {
        // DOM Elements
        this.gameContent = document.getElementById('game-content');
        this.feedback = document.getElementById('feedback');
        this.nextQuestionButton = document.getElementById('next-question');
        this.hintButton = document.getElementById('hint-button');
        this.hintText = document.getElementById('hint-text');
        this.questionCounter = document.getElementById('question-counter');
        this.scoreDisplay = document.getElementById('score-display');
        this.progressFill = document.getElementById('progress-fill');
        this.difficultyBadge = document.getElementById('difficulty-badge');
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.cheatsheetToggle = document.getElementById('cheatsheet-toggle');
        this.cheatsheet = document.getElementById('cheatsheet');

        // Game State
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.currentQuestion = null;
        this.hintShown = false;
        this.darkMode = true;

        // Initialize
        this.init();
    }

    init() {
        // Apply dark mode if saved
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        }

        this.updateScoreDisplay();
        this.displayQuestion();

        // Event listeners
        this.nextQuestionButton.addEventListener('click', () => this.nextQuestion());
        this.hintButton.addEventListener('click', () => this.toggleHint());
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.cheatsheetToggle.addEventListener('click', () => this.toggleCheatsheet());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const checkAnswerButton = document.getElementById('check-answer');
                if (checkAnswerButton && !checkAnswerButton.disabled) {
                    checkAnswerButton.click();
                }
            } else if (e.key === 'ArrowRight' && !this.nextQuestionButton.disabled) {
                this.nextQuestionButton.click();
            } else if (e.key === 'h' && e.ctrlKey) {
                e.preventDefault();
                this.hintButton.click();
            }
        });
    }

    displayQuestion() {
        const question = questions[this.currentQuestionIndex];
        this.currentQuestion = question;
        this.hintShown = false;

        // Update progress indicators
        this.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${questions.length}`;
        this.progressFill.style.width = `${((this.currentQuestionIndex) / questions.length) * 100}%`;

        // Set difficulty badge
        this.difficultyBadge.textContent = question.difficulty.toUpperCase();
        this.difficultyBadge.className = `difficulty-badge difficulty-${question.difficulty}`;

        // Reset hint
        this.hintText.classList.remove('show');
        this.hintText.textContent = question.hint;

        // Generate HTML for input tensors
        let inputTensorHTML = question.inputTensors.map((tensor, index) => {
            let tensorDataHTML = formatTensorData(tensor);

            return `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Input Tensor ${index + 1}</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">Shape: [${tensor.shape.join(', ')}]</p>
                    <div class="tensor-container bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-auto">
                        ${tensorDataHTML}
                    </div>
                </div>
            `;
        }).join('');

        // Generate HTML for output tensor
        let outputTensorHTML = `
            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Output Tensor</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-2">Shape: [${question.outputTensor.shape.join(', ')}]</p>
                <div class="tensor-container bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-auto">
                    ${formatTensorData(question.outputTensor)}
                </div>
            </div>
        `;

        // Create the question HTML
        const questionHTML = `
            <div class="mb-6">
                <p class="text-xl text-gray-800 dark:text-gray-200 mb-2">${question.description}</p>
            </div>
            ${inputTensorHTML}
            ${outputTensorHTML}
            <div class="mt-6">
                <label for="einsum-input" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Your Einsum String:</label>
                <div class="flex">
                    <input type="text" id="einsum-input" placeholder="e.g., ij,jk->ik" 
                        class="flex-grow shadow appearance-none border rounded-l-lg py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 monospace">
                    <button id="check-answer" 
                        class="btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Check Answer
                    </button>
                </div>
            </div>
        `;

        // Update the game content
        this.gameContent.innerHTML = questionHTML;
        this.feedback.innerHTML = '';

        // Add event listener to the check answer button
        const checkAnswerButton = document.getElementById('check-answer');
        const einsumInput = document.getElementById('einsum-input');

        checkAnswerButton.addEventListener('click', () => this.checkAnswer());
        einsumInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Disable the next question button until the answer is checked
        this.nextQuestionButton.disabled = true;
        this.nextQuestionButton.classList.add('opacity-50', 'cursor-not-allowed');
        this.nextQuestionButton.classList.remove('hover:bg-green-700');
    }

    async checkAnswer() {
        const userInput = document.getElementById('einsum-input').value.trim();

        if (!userInput) {
            this.feedback.innerHTML = `<div class="feedback-message wrong-answer">Please enter an einsum string.</div>`;
            return;
        }

        let isCorrect = false;
        let calculatedOutput;

        try {
            // Convert input tensors to TensorFlow tensors
            const tfInputTensors = this.currentQuestion.inputTensors.map(tensor => tf.tensor(tensor.data, tensor.shape));

            // Calculate the output using the user's einsum string
            calculatedOutput = tf.einsum(userInput, ...tfInputTensors).arraySync();

            // Compare with the expected output
            isCorrect = compareTensorData(calculatedOutput, this.currentQuestion.outputTensor.data);

            // Clean up tensors to prevent memory leaks
            tfInputTensors.forEach(tensor => tensor.dispose());
        } catch (error) {
            console.error("TensorFlow.js error:", error);
            this.feedback.innerHTML = `<div class="feedback-message wrong-answer">
                <p class="font-semibold">Invalid einsum string</p>
                <p class="text-sm mt-1">Please check the format (e.g., 'ij,jk->ik'). ${error.message}</p>
            </div>`;

            // Enable the next question button
            this.nextQuestionButton.disabled = false;
            this.nextQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
            this.nextQuestionButton.classList.add('hover:bg-green-700');
            return;
        }

        // Generate feedback HTML
        let feedbackHTML = '';

        if (isCorrect) {
            // Correct answer
            feedbackHTML = `
                <div class="feedback-message correct-answer">
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <p class="font-semibold">Correct!</p>
                    </div>
                </div>
                <div class="game-explanation mt-4">
                    <p class="font-medium mb-2">Explanation:</p>
                    <p>${this.currentQuestion.explanation}</p>
                </div>
            `;
            this.score++;
            this.updateScoreDisplay();
        } else {
            // Wrong answer
            const explanation = getWrongAnswerExplanation(
                userInput, 
                calculatedOutput, 
                this.currentQuestion.outputTensor.data, 
                this.currentQuestion.einsumString
            );

            feedbackHTML = `
                <div class="feedback-message wrong-answer">
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p class="font-semibold">Incorrect</p>
                    </div>
                    <p class="mt-2">${explanation}</p>
                </div>
                <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Your einsum string:</p>
                            <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${userInput}</code>
                        </div>
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Correct einsum string:</p>
                            <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${this.currentQuestion.einsumString}</code>
                        </div>
                    </div>
                </div>
                <div class="game-explanation mt-4">
                    <p class="font-medium mb-2">Explanation:</p>
                    <p>${this.currentQuestion.explanation}</p>
                </div>
            `;
        }

        // Update the feedback
        this.feedback.innerHTML = feedbackHTML;

        // Enable the next question button
        this.nextQuestionButton.disabled = false;
        this.nextQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
        this.nextQuestionButton.classList.add('hover:bg-green-700');

        // Scroll to the feedback
        this.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < questions.length) {
            // Display the next question
            this.displayQuestion();

            // Scroll to the top of the game content
            this.gameContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Game over
            this.showGameOver();
        }
    }

    showGameOver() {
        // Calculate percentage score
        const percentage = Math.round((this.score / questions.length) * 100);

        // Determine message based on score
        let message;
        if (percentage >= 90) {
            message = "Excellent! You've mastered einsum notation!";
        } else if (percentage >= 70) {
            message = "Great job! You have a solid understanding of einsum notation.";
        } else if (percentage >= 50) {
            message = "Good effort! Keep practicing to improve your einsum skills.";
        } else {
            message = "Keep learning! Einsum notation takes practice to master.";
        }

        // Create game over HTML
        const gameOverHTML = `
            <div class="text-center py-8">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Game Complete!</h2>
                <div class="mb-6">
                    <div class="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">${percentage}%</div>
                    <p class="text-lg text-gray-600 dark:text-gray-400">Your score: ${this.score} out of ${questions.length}</p>
                </div>
                <p class="text-xl text-gray-700 dark:text-gray-300 mb-8">${message}</p>
                <button id="restart-game" class="btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg">
                    Play Again
                </button>
            </div>
        `;

        // Update the game content
        this.gameContent.innerHTML = gameOverHTML;
        this.feedback.innerHTML = '';

        // Hide the next question button and hint button
        this.nextQuestionButton.style.display = 'none';
        this.hintButton.style.display = 'none';

        // Add event listener to the restart button
        const restartButton = document.getElementById('restart-game');
        restartButton.addEventListener('click', () => this.restartGame());
    }

    restartGame() {
        // Reset game state
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Show the next question button and hint button
        this.nextQuestionButton.style.display = 'flex';
        this.hintButton.style.display = 'flex';

        // Update the score display
        this.updateScoreDisplay();

        // Display the first question
        this.displayQuestion();
    }

    updateScoreDisplay() {
        this.scoreDisplay.textContent = `Score: ${this.score}/${questions.length}`;
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        this.darkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', this.darkMode);

        // Update the dark mode toggle icon
        if (this.darkMode) {
            this.darkModeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                </svg>
            `;
        } else {
            this.darkModeToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            `;
        }
    }

    toggleCheatsheet() {
        this.cheatsheet.classList.toggle('show');
    }

    toggleHint() {
        this.hintText.classList.toggle('show');

        // Generate an enhanced hint
        if (this.hintText.classList.contains('show') && !this.hintShown) {
            this.hintText.innerHTML = generateDetailedHint(this.currentQuestion);

            this.hintButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
                Hide Hint
            `;
            this.hintShown = true;
        } else if (!this.hintText.classList.contains('show')) {
            this.hintButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Show Hint
            `;
            this.hintShown = false;
        }
    }
}

export default EinsumGame;
