import questions from './questions.js';
import codeQuestions from './code-questions.js';
import { 
    formatTensorData, 
    compareTensorData, 
    generateDetailedHint, 
    getWrongAnswerExplanation,
    getShape
} from './utils.js';

class EinsumGame {
    constructor() {
        // DOM Elements
        this.gameContent = document.getElementById('game-content');
        this.feedback = document.getElementById('feedback');
        this.nextQuestionButton = document.getElementById('next-question');
        this.prevQuestionButton = document.getElementById('prev-question');
        this.hintButton = document.getElementById('hint-button');
        this.hintText = document.getElementById('hint-text');
        this.questionCounter = document.getElementById('question-counter');
        this.scoreDisplay = document.getElementById('score-display');
        this.progressFill = document.getElementById('progress-fill');
        this.difficultyBadge = document.getElementById('difficulty-badge');
        this.cheatsheet = document.getElementById('cheatsheet');
        this.standardModeBtn = document.getElementById('standard-mode');
        this.codeModeBtn = document.getElementById('code-mode');

        // Game State
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.currentQuestion = null;
        this.hintShown = false;
        this.darkMode = true;
        this.gameMode = 'standard'; // 'standard', 'code', or 'random'
        this.currentQuestions = [...questions].sort(() => Math.random() - 0.5); // Default to randomized standard questions

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
        this.prevQuestionButton.addEventListener('click', () => this.prevQuestion());
        this.hintButton.addEventListener('click', () => this.toggleHint());
        // this.cheatsheetToggle.addEventListener('click', () => this.toggleCheatsheet());
        
        // Game mode selection
        this.standardModeBtn.addEventListener('click', () => this.setGameMode('standard'));
        this.codeModeBtn.addEventListener('click', () => this.setGameMode('code'));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const checkAnswerButton = document.getElementById('check-answer');
                if (checkAnswerButton && !checkAnswerButton.disabled) {
                    checkAnswerButton.click();
                }
            // } else if (e.key === 'ArrowRight' && !this.nextQuestionButton.disabled) {
            //     this.nextQuestionButton.click();
            // } else if (e.key === 'ArrowLeft' && !this.prevQuestionButton.disabled) {
            //     this.prevQuestionButton.click();
            // } 
            } else if (e.key === 'h' && e.ctrlKey) {
                e.preventDefault();
                this.hintButton.click();
            }
        });
    }
    
    setGameMode(mode) {
        // Reset game state
        this.gameMode = mode;
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // Update active button styling
        this.standardModeBtn.classList.remove('active');
        this.codeModeBtn.classList.remove('active');
        
        // Set active button based on mode
        if (mode === 'standard') {
            this.standardModeBtn.classList.add('active');
            this.currentQuestions = [...questions].sort(() => Math.random() - 0.5);
        } else if (mode === 'code') {
            this.codeModeBtn.classList.add('active');
            this.currentQuestions = [...codeQuestions].sort(() => Math.random() - 0.5);
        }
        
        // Update display
        this.updateScoreDisplay();
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        this.currentQuestion = question;
        this.hintShown = false;

        // Update progress indicators
        this.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}`;
        this.progressFill.style.width = `${((this.currentQuestionIndex) / this.currentQuestions.length) * 100}%`;

        // Set difficulty badge
        this.difficultyBadge.textContent = question.difficulty.toUpperCase();
        this.difficultyBadge.className = `difficulty-badge difficulty-${question.difficulty}`;

        // Reset hint
        this.hintText.classList.remove('show');
        this.hintText.textContent = question.hint;
        
        // Manage previous button state
        if (this.currentQuestionIndex === 0) {
            this.prevQuestionButton.disabled = true;
            this.prevQuestionButton.classList.add('opacity-50', 'cursor-not-allowed');
            this.prevQuestionButton.classList.remove('hover:bg-blue-700');
        } else {
            this.prevQuestionButton.disabled = false;
            this.prevQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
            this.prevQuestionButton.classList.add('hover:bg-blue-700');
        }

        // Generate HTML for input tensors - only show in standard mode
        let inputTensorHTML = '';
        let outputTensorHTML = '';
        
        if (this.gameMode === 'standard') {
            inputTensorHTML = question.inputTensors.map((tensor, index) => {
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

            // Generate HTML for output tensor - only show in standard mode
            outputTensorHTML = `
                <div class="mb-4">
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Output Tensor</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">Shape: [${question.outputTensor.shape.join(', ')}]</p>
                    <div class="tensor-container bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-auto">
                        ${formatTensorData(question.outputTensor)}
                    </div>
                </div>
            `;
        }

        // Create the question HTML
        let questionHTML = '';
        
        // For code mode, display the code block
        if (question.code) {
            questionHTML = `
                <div class="mb-6">
                    <p class="text-xl text-gray-800 dark:text-gray-200 mb-2">${question.description}</p>
                    <div class="code-block">
                        <pre>${this.formatCodeWithSyntaxHighlighting(question.code)}</pre>
                    </div>
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
        } else {
            // Standard mode
            questionHTML = `
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
        }

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

        // Enable the next question button (allow navigation without answering)
        this.nextQuestionButton.disabled = false;
        this.nextQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
        this.nextQuestionButton.classList.add('hover:bg-green-700');
        
        // Focus on the input field when a new question is loaded
        einsumInput.focus();
    }

    async checkAnswer() {
        const userInput = document.getElementById('einsum-input').value.trim();

        if (!userInput) {
            this.feedback.innerHTML = `<div class="feedback-message wrong-answer">Please enter an einsum string.</div>`;
            return;
        }

        let isCorrect = false;
        let calculatedOutput;
        let failedTestCase = null;

        try {
            if (this.gameMode === 'code') {
                // For code mode, test multiple tensors and stop at the first failure
                const testResult = this.testMultipleTensors(userInput);
                isCorrect = testResult.isCorrect;
                failedTestCase = testResult.failedTestCase;
            } else {
                // Standard mode - test only the current question's tensors
                // Convert input tensors to TensorFlow tensors
                const tfInputTensors = this.currentQuestion.inputTensors.map(tensor => tf.tensor(tensor.data, tensor.shape));

                // Calculate the output using the user's einsum string
                calculatedOutput = tf.einsum(userInput, ...tfInputTensors).arraySync();

                // Compare with the expected output
                isCorrect = compareTensorData(calculatedOutput, this.currentQuestion.outputTensor.data);

                // Clean up tensors to prevent memory leaks
                tfInputTensors.forEach(tensor => tensor.dispose());
            }
        } catch (error) {
            console.error("TensorFlow.js error:", error);
            this.feedback.innerHTML = `<div class="feedback-message wrong-answer">
                <p class="font-semibold">Invalid einsum string</p>
                <p class="text-sm mt-1">Please check the format (e.g., 'ij,jk->ik'). ${error.message}</p>
            </div>`;

            // Enable the navigation buttons
            this.nextQuestionButton.disabled = false;
            this.nextQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
            this.nextQuestionButton.classList.add('hover:bg-green-700');
            
            // Enable the previous button if not on the first question
            if (this.currentQuestionIndex > 0) {
                this.prevQuestionButton.disabled = false;
                this.prevQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
                this.prevQuestionButton.classList.add('hover:bg-blue-700');
            }
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
                </div>`;
                
            // For code mode, show all test cases that passed
            if (this.gameMode === 'code') {
                feedbackHTML += `
                <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p class="font-medium text-gray-700 dark:text-gray-300 mb-2">All test cases passed!</p>
                    <p class="text-gray-600 dark:text-gray-400">Your einsum string works correctly for all test cases.</p>
                </div>`;
            }
            
            feedbackHTML += `
                <div class="game-explanation mt-4">
                    <p class="font-medium mb-2">Explanation:</p>
                    <p>${this.currentQuestion.explanation}</p>
                </div>
            `;
            this.score++;
            this.updateScoreDisplay();
        } else {
            // Wrong answer
            if (this.gameMode === 'code' && failedTestCase) {
                // Show the failed test case details for code mode
                feedbackHTML = `
                    <div class="feedback-message wrong-answer">
                        <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <p class="font-semibold">Test Case Failed</p>
                        </div>
                    </div>
                    <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div class="mb-4">
                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-2">Input Tensors:</p>
                            ${failedTestCase.inputTensors.map((tensor, index) => `
                                <div class="mb-3">
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Input Tensor ${index + 1} - Shape: [${tensor.shape.join(', ')}]</p>
                                    <div class="tensor-container bg-white dark:bg-gray-800 p-2 rounded-lg overflow-auto">
                                        ${formatTensorData(tensor)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Output:</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Shape: [${failedTestCase.expectedOutput.shape.join(', ')}]</p>
                                <div class="tensor-container bg-white dark:bg-gray-800 p-2 rounded-lg overflow-auto">
                                    ${formatTensorData(failedTestCase.expectedOutput)}
                                </div>
                            </div>
                            <div>
                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Your Output:</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Shape: [${getShape(failedTestCase.actualOutput).join(', ')}]</p>
                                <div class="tensor-container bg-white dark:bg-gray-800 p-2 rounded-lg overflow-auto">
                                    ${formatTensorData({data: failedTestCase.actualOutput, shape: getShape(failedTestCase.actualOutput)})}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Error Explanation:</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${failedTestCase.explanation}</p>
                        </div>
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
                `;
            } else {
                // Standard mode or code mode without specific test case
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
        }

        // Update the feedback
        this.feedback.innerHTML = feedbackHTML;

        // Enable the navigation buttons
        this.nextQuestionButton.disabled = false;
        this.nextQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
        this.nextQuestionButton.classList.add('hover:bg-green-700');
        
        // Enable the previous button if not on the first question
        if (this.currentQuestionIndex > 0) {
            this.prevQuestionButton.disabled = false;
            this.prevQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
            this.prevQuestionButton.classList.add('hover:bg-blue-700');
        }

        // Scroll to the feedback
        this.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Focus on the next question button after checking the answer
        this.nextQuestionButton.focus();
    }

    formatCodeWithSyntaxHighlighting(code) {
        // Simple syntax highlighting for JavaScript
        return code
            .replace(/\/\/.*/g, match => `<span class="code-comment">${match}</span>`) // Comments
            .replace(/\b(const|let|var|for|if|else|function|return)\b/g, match => `<span class="code-keyword">${match}</span>`) // Keywords
            .replace(/\b(tf\.[a-zA-Z0-9_]+)\b/g, match => `<span class="code-function">${match}</span>`) // TensorFlow functions
            .replace(/\b(\d+)\b/g, match => `<span class="code-number">${match}</span>`); // Numbers
    }

    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.currentQuestions.length) {
            // Display the next question
            this.displayQuestion();

            // Scroll to the top of the game content
            this.gameContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Game over
            this.showGameOver();
        }
    }
    
    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            
            // Display the previous question
            this.displayQuestion();
            
            // Scroll to the top of the game content
            this.gameContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showGameOver() {
        // Calculate percentage score
        const percentage = Math.round((this.score / this.currentQuestions.length) * 100);

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
                    <p class="text-lg text-gray-600 dark:text-gray-400">Your score: ${this.score} out of ${this.currentQuestions.length}</p>
                </div>
                <p class="text-xl text-gray-700 dark:text-gray-300 mb-8">${message}</p>
                <div class="flex flex-wrap justify-center gap-4">
                    <button id="restart-game" class="btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg">
                        Play Again
                    </button>
                    <button id="change-mode" class="btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg">
                        Try Different Mode
                    </button>
                </div>
            </div>
        `;

        // Update the game content
        this.gameContent.innerHTML = gameOverHTML;
        this.feedback.innerHTML = '';

        // Hide the navigation buttons and hint button
        this.nextQuestionButton.style.display = 'none';
        this.prevQuestionButton.style.display = 'none';
        this.hintButton.style.display = 'none';

        // Add event listeners to the buttons
        const restartButton = document.getElementById('restart-game');
        restartButton.addEventListener('click', () => this.restartGame());
        
        const changeModeButton = document.getElementById('change-mode');
        changeModeButton.addEventListener('click', () => {
            // Scroll to the game mode selection section
            document.querySelector('.game-mode-btn').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Show the navigation buttons and hint button again
            this.nextQuestionButton.style.display = 'flex';
            this.prevQuestionButton.style.display = 'flex';
            this.hintButton.style.display = 'flex';
        });
    }

    restartGame() {
        // Reset game state
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // Randomize questions again
        if (this.gameMode === 'standard') {
            this.currentQuestions = [...questions].sort(() => Math.random() - 0.5);
        } else if (this.gameMode === 'code') {
            this.currentQuestions = [...codeQuestions].sort(() => Math.random() - 0.5);
        }

        // Show the navigation buttons and hint button
        this.nextQuestionButton.style.display = 'flex';
        this.prevQuestionButton.style.display = 'flex';
        this.hintButton.style.display = 'flex';

        // Update the score display
        this.updateScoreDisplay();

        // Display the first question
        this.displayQuestion();
    }

    updateScoreDisplay() {
        this.scoreDisplay.textContent = `Score: ${this.score}/${this.currentQuestions.length}`;
    }

    toggleCheatsheet() {
        this.cheatsheet.classList.toggle('show');
    }

    randomizeQuestions() {
        // Reset game state
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // Shuffle the current questions
        this.currentQuestions = [...this.currentQuestions].sort(() => Math.random() - 0.5);
        
        // Update display
        this.updateScoreDisplay();
        this.displayQuestion();
        
        // Show a brief notification
        this.feedback.innerHTML = `
            <div class="feedback-message correct-answer">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p class="font-semibold">Questions have been randomized!</p>
                </div>
            </div>
        `;
        
        // Clear the feedback after a delay
        setTimeout(() => {
            this.feedback.innerHTML = '';
        }, 2000);
    }
    
    testMultipleTensors(userInput) {
        // Generate multiple test cases based on the current question
        const testCases = this.generateTestCases();
        
        // Test each case with the user's einsum string
        for (const testCase of testCases) {
            try {
                // Convert input tensors to TensorFlow tensors
                const tfInputTensors = testCase.inputTensors.map(tensor => 
                    tf.tensor(tensor.data, tensor.shape));
                
                // Calculate the output using the user's einsum string
                const calculatedOutput = tf.einsum(userInput, ...tfInputTensors).arraySync();
                
                // Compare with the expected output
                const isCorrect = compareTensorData(calculatedOutput, testCase.expectedOutput.data);
                
                // Clean up tensors to prevent memory leaks
                tfInputTensors.forEach(tensor => tensor.dispose());
                
                // If this test case failed, return the details
                if (!isCorrect) {
                    return {
                        isCorrect: false,
                        failedTestCase: {
                            inputTensors: testCase.inputTensors,
                            expectedOutput: testCase.expectedOutput,
                            actualOutput: calculatedOutput,
                            explanation: getWrongAnswerExplanation(
                                userInput,
                                calculatedOutput,
                                testCase.expectedOutput.data,
                                this.currentQuestion.einsumString
                            )
                        }
                    };
                }
            } catch (error) {
                // If there was an error, return it as a failed test case
                return {
                    isCorrect: false,
                    failedTestCase: {
                        inputTensors: testCase.inputTensors,
                        expectedOutput: testCase.expectedOutput,
                        actualOutput: null,
                        explanation: `Error: ${error.message}`
                    }
                };
            }
        }
        
        // If all test cases passed, return success
        return {
            isCorrect: true,
            failedTestCase: null
        };
    }
    
    generateTestCases() {
        const question = this.currentQuestion;
        const testCases = [];
        
        // Always include the original test case from the question
        testCases.push({
            inputTensors: question.inputTensors,
            expectedOutput: question.outputTensor
        });
        
        // Generate additional test cases based on the question type
        const einsumParts = question.einsumString.split('->');
        const inputPart = einsumParts[0];
        const outputPart = einsumParts[1];
        
        // Determine the type of operation based on the einsum string
        if (inputPart.includes(',')) {
            // Multiple input tensors (e.g., matrix multiplication, dot product)
            
            // For matrix multiplication (ik,kj->ij)
            if (question.einsumString === 'ik,kj->ij') {
                // Add a test case with different dimensions
                testCases.push(this.generateMatrixMultiplicationTestCase(3, 4, 2));
                testCases.push(this.generateMatrixMultiplicationTestCase(4, 2, 5));
            } 
            // For dot product (i,i->)
            else if (question.einsumString === 'i,i->') {
                testCases.push(this.generateDotProductTestCase(5));
                testCases.push(this.generateDotProductTestCase(7));
            }
            // For outer product (i,j->ij)
            else if (question.einsumString === 'i,j->ij') {
                testCases.push(this.generateOuterProductTestCase(3, 4));
                testCases.push(this.generateOuterProductTestCase(4, 3));
            }
            // For element-wise multiplication (ij,ij->ij)
            else if (question.einsumString === 'ij,ij->ij') {
                testCases.push(this.generateElementWiseMultiplicationTestCase(3, 4));
                testCases.push(this.generateElementWiseMultiplicationTestCase(4, 3));
            }
            // For batch matrix multiplication (bij,bjk->bik)
            else if (question.einsumString === 'bij,bjk->bik') {
                testCases.push(this.generateBatchMatrixMultiplicationTestCase(3, 4, 3, 2));
                testCases.push(this.generateBatchMatrixMultiplicationTestCase(2, 3, 2, 4));
            }
        } else {
            // Single input tensor operations
            
            // For transpose (ij->ji)
            if (question.einsumString === 'ij->ji') {
                testCases.push(this.generateTransposeTestCase(4, 3));
                testCases.push(this.generateTransposeTestCase(5, 2));
            }
            // For diagonal extraction (ii->i)
            else if (question.einsumString === 'ii->i') {
                testCases.push(this.generateDiagonalTestCase(5));
                testCases.push(this.generateDiagonalTestCase(6));
            }
            // For row sum (ij->i)
            else if (question.einsumString === 'ij->i') {
                testCases.push(this.generateRowSumTestCase(4, 3));
                testCases.push(this.generateRowSumTestCase(3, 5));
            }
        }
        
        return testCases;
    }
    
    // Helper methods to generate specific test cases
    
    generateMatrixMultiplicationTestCase(m, n, p) {
        // Generate m x n and n x p matrices for matrix multiplication
        const A = { 
            shape: [m, n], 
            data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        const B = { 
            shape: [n, p], 
            data: Array(n).fill().map(() => Array(p).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        // Calculate expected output
        const result = Array(m).fill().map(() => Array(p).fill(0));
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < p; j++) {
                for (let k = 0; k < n; k++) {
                    result[i][j] += A.data[i][k] * B.data[k][j];
                }
            }
        }
        
        return {
            inputTensors: [A, B],
            expectedOutput: { shape: [m, p], data: result }
        };
    }
    
    generateDotProductTestCase(n) {
        // Generate two vectors of length n for dot product
        const v1 = { 
            shape: [n], 
            data: Array(n).fill().map(() => Math.floor(Math.random() * 10)) 
        };
        
        const v2 = { 
            shape: [n], 
            data: Array(n).fill().map(() => Math.floor(Math.random() * 10)) 
        };
        
        // Calculate expected output
        let result = 0;
        for (let i = 0; i < n; i++) {
            result += v1.data[i] * v2.data[i];
        }
        
        return {
            inputTensors: [v1, v2],
            expectedOutput: { shape: [], data: result }
        };
    }
    
    generateOuterProductTestCase(m, n) {
        // Generate vectors of length m and n for outer product
        const v1 = { 
            shape: [m], 
            data: Array(m).fill().map(() => Math.floor(Math.random() * 10)) 
        };
        
        const v2 = { 
            shape: [n], 
            data: Array(n).fill().map(() => Math.floor(Math.random() * 10)) 
        };
        
        // Calculate expected output
        const result = Array(m).fill().map(() => Array(n).fill(0));
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                result[i][j] = v1.data[i] * v2.data[j];
            }
        }
        
        return {
            inputTensors: [v1, v2],
            expectedOutput: { shape: [m, n], data: result }
        };
    }
    
    generateElementWiseMultiplicationTestCase(m, n) {
        // Generate two m x n matrices for element-wise multiplication
        const A = { 
            shape: [m, n], 
            data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        const B = { 
            shape: [m, n], 
            data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        // Calculate expected output
        const result = Array(m).fill().map(() => Array(n).fill(0));
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                result[i][j] = A.data[i][j] * B.data[i][j];
            }
        }
        
        return {
            inputTensors: [A, B],
            expectedOutput: { shape: [m, n], data: result }
        };
    }
    
    generateBatchMatrixMultiplicationTestCase(b, m, n, p) {
        // Generate batch of b matrices of size m x n and n x p
        const batchA = {
            shape: [b, m, n],
            data: Array(b).fill().map(() => 
                Array(m).fill().map(() => 
                    Array(n).fill().map(() => Math.floor(Math.random() * 10))
                )
            )
        };
        
        const batchB = {
            shape: [b, n, p],
            data: Array(b).fill().map(() => 
                Array(n).fill().map(() => 
                    Array(p).fill().map(() => Math.floor(Math.random() * 10))
                )
            )
        };
        
        // Calculate expected output
        const result = Array(b).fill().map(() => 
            Array(m).fill().map(() => Array(p).fill(0))
        );
        
        for (let batch = 0; batch < b; batch++) {
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < p; j++) {
                    for (let k = 0; k < n; k++) {
                        result[batch][i][j] += batchA.data[batch][i][k] * batchB.data[batch][k][j];
                    }
                }
            }
        }
        
        return {
            inputTensors: [batchA, batchB],
            expectedOutput: { shape: [b, m, p], data: result }
        };
    }
    
    generateTransposeTestCase(m, n) {
        // Generate an m x n matrix for transpose
        const A = { 
            shape: [m, n], 
            data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        // Calculate expected output
        const result = Array(n).fill().map(() => Array(m).fill(0));
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                result[j][i] = A.data[i][j];
            }
        }
        
        return {
            inputTensors: [A],
            expectedOutput: { shape: [n, m], data: result }
        };
    }
    
    generateDiagonalTestCase(n) {
        // Generate an n x n matrix for diagonal extraction
        const A = { 
            shape: [n, n], 
            data: Array(n).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        // Calculate expected output
        const result = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            result[i] = A.data[i][i];
        }
        
        return {
            inputTensors: [A],
            expectedOutput: { shape: [n], data: result }
        };
    }
    
    generateRowSumTestCase(m, n) {
        // Generate an m x n matrix for row sum
        const A = { 
            shape: [m, n], 
            data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
        };
        
        // Calculate expected output
        const result = Array(m).fill(0);
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                result[i] += A.data[i][j];
            }
        }
        
        return {
            inputTensors: [A],
            expectedOutput: { shape: [m], data: result }
        };
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
