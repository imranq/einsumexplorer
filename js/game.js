import { questions, codeQuestions, transformerQuestions } from './questions/index.js';
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
        
        // Get mode and difficulty buttons
        this.adaptiveBtn = document.getElementById('adaptive-mode');
        this.transformerBtn = document.getElementById('transformer-mode');
        this.easyBtn = document.getElementById('easy-mode');
        this.mediumBtn = document.getElementById('medium-mode');
        this.hardBtn = document.getElementById('hard-mode');
        this.standardProblemsBtn = document.getElementById('standard-problems');
        this.codeProblemsBtn = document.getElementById('code-problems');
        this.bothProblemsBtn = document.getElementById('both-problems');
        this.resetLevelBtn = document.getElementById('reset-level');

        // Game State
        this.currentQuestion = null;
        this.hintShown = false;
        this.darkMode = true;
        
        // Adaptive difficulty system
        this.userLevel = 1; // Starting level
        this.correctStreak = 0; // Track consecutive correct answers
        this.incorrectStreak = 0; // Track consecutive incorrect answers
        this.levelUpThreshold = 3; // Number of correct answers needed to level up
        this.levelDownThreshold = 2; // Number of incorrect answers needed to level down
        
        // Question selection
        this.selectedMode = 'adaptive'; // 'adaptive', 'transformer', 'easy', 'medium', or 'hard'
        this.problemTypes = ['standard', 'code']; // 'standard', 'code', or both
        
        // Transformer mode
        this.transformerQuestionIndex = 0; // For sequential progression through transformer questions
        
        // Performance tracking
        this.totalAnswered = 0;
        this.totalCorrect = 0;
        
        // Question pools by difficulty
        this.easyQuestions = {
            standard: questions.filter(q => q.difficulty === 'easy'),
            code: codeQuestions.filter(q => q.difficulty === 'easy')
        };
        this.mediumQuestions = {
            standard: questions.filter(q => q.difficulty === 'medium'),
            code: codeQuestions.filter(q => q.difficulty === 'medium')
        };
        this.hardQuestions = {
            standard: questions.filter(q => q.difficulty === 'hard'),
            code: codeQuestions.filter(q => q.difficulty === 'hard')
        };
        
        // Track used questions to avoid repetition
        this.usedQuestions = new Set();
        
        // Initialize
        this.init();
    }

    init() {
        // Apply dark mode if saved
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Set up event listeners for mode and difficulty selection
        if (this.adaptiveBtn) this.adaptiveBtn.addEventListener('click', () => this.setMode('adaptive'));
        if (this.transformerBtn) this.transformerBtn.addEventListener('click', () => this.setMode('transformer'));
        if (this.easyBtn) this.easyBtn.addEventListener('click', () => this.setMode('easy'));
        if (this.mediumBtn) this.mediumBtn.addEventListener('click', () => this.setMode('medium'));
        if (this.hardBtn) this.hardBtn.addEventListener('click', () => this.setMode('hard'));
        
        if (this.standardProblemsBtn) this.standardProblemsBtn.addEventListener('click', () => this.setProblemTypes(['standard']));
        if (this.codeProblemsBtn) this.codeProblemsBtn.addEventListener('click', () => this.setProblemTypes(['code']));
        if (this.bothProblemsBtn) this.bothProblemsBtn.addEventListener('click', () => this.setProblemTypes(['standard', 'code']));
        
        if (this.resetLevelBtn) this.resetLevelBtn.addEventListener('click', () => this.resetLevel());

        // Event listeners for game navigation
        this.nextQuestionButton.addEventListener('click', () => this.nextQuestion());
        this.prevQuestionButton.disabled = true; // Disable previous button in continuous mode
        this.hintButton.addEventListener('click', () => this.toggleHint());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const checkAnswerButton = document.getElementById('check-answer');
                if (checkAnswerButton && !checkAnswerButton.disabled) {
                    checkAnswerButton.click();
                }
            } else if (e.key === 'h' && e.ctrlKey) {
                e.preventDefault();
                this.hintButton.click();
            }
        });
        
        // Get the first question
        this.updateScoreDisplay();
        this.getNextQuestion();
    }
    
    // Set the mode (adaptive, transformer, or specific difficulty)
    setMode(mode) {
        this.selectedMode = mode;
        
        // Update UI to show active mode
        if (this.adaptiveBtn) this.adaptiveBtn.classList.remove('active');
        if (this.transformerBtn) this.transformerBtn.classList.remove('active');
        if (this.easyBtn) this.easyBtn.classList.remove('active');
        if (this.mediumBtn) this.mediumBtn.classList.remove('active');
        if (this.hardBtn) this.hardBtn.classList.remove('active');
        
        if (mode === 'adaptive' && this.adaptiveBtn) this.adaptiveBtn.classList.add('active');
        if (mode === 'transformer' && this.transformerBtn) this.transformerBtn.classList.add('active');
        if (mode === 'easy' && this.easyBtn) this.easyBtn.classList.add('active');
        if (mode === 'medium' && this.mediumBtn) this.mediumBtn.classList.add('active');
        if (mode === 'hard' && this.hardBtn) this.hardBtn.classList.add('active');
        
        // Reset transformer index when switching to transformer mode
        if (mode === 'transformer') {
            this.transformerQuestionIndex = 0;
        }
        // If switching to a specific difficulty, reset level
        else if (mode !== 'adaptive') {
            this.userLevel = 1;
            this.correctStreak = 0;
            this.incorrectStreak = 0;
        }
        
        // Get a new question with the selected mode
        this.getNextQuestion();
    }
    
    // Set the problem types
    setProblemTypes(types) {
        this.problemTypes = types;
        
        // Update UI to show active problem types
        if (this.standardProblemsBtn) this.standardProblemsBtn.classList.remove('active');
        if (this.codeProblemsBtn) this.codeProblemsBtn.classList.remove('active');
        if (this.bothProblemsBtn) this.bothProblemsBtn.classList.remove('active');
        
        if (types.includes('standard') && !types.includes('code') && this.standardProblemsBtn) {
            this.standardProblemsBtn.classList.add('active');
        } else if (!types.includes('standard') && types.includes('code') && this.codeProblemsBtn) {
            this.codeProblemsBtn.classList.add('active');
        } else if (types.includes('standard') && types.includes('code') && this.bothProblemsBtn) {
            this.bothProblemsBtn.classList.add('active');
        }
        
        // Get a new question with the selected problem types
        this.getNextQuestion();
    }
    
    // Reset the user's level
    resetLevel() {
        this.userLevel = 1;
        this.correctStreak = 0;
        this.incorrectStreak = 0;
        
        // Show notification
        this.feedback.innerHTML = `
            <div class="feedback-message correct-answer">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p class="font-semibold">Level reset to 1!</p>
                </div>
            </div>
        `;
        
        // Clear the feedback after a delay
        setTimeout(() => {
            this.feedback.innerHTML = '';
        }, 2000);
        
        // Get a new question at the reset level
        this.getNextQuestion();
    }
    
    // Get the next question based on mode, difficulty, and problem types
    getNextQuestion() {
        // Handle transformer mode separately
        if (this.selectedMode === 'transformer') {
            // In transformer mode, we present questions in a specific sequence
            if (this.transformerQuestionIndex >= transformerQuestions.length) {
                // If we've gone through all transformer questions, start over
                this.transformerQuestionIndex = 0;
            }
            
            this.currentQuestion = transformerQuestions[this.transformerQuestionIndex];
            this.transformerQuestionIndex++;
        } else {
            // For other modes, determine the difficulty level to use
            let difficultyToUse = this.selectedMode;
            
            if (difficultyToUse === 'adaptive') {
                // In adaptive mode, use the user's level to determine difficulty
                if (this.userLevel <= 3) {
                    difficultyToUse = 'easy';
                } else if (this.userLevel <= 6) {
                    difficultyToUse = 'medium';
                } else {
                    difficultyToUse = 'hard';
                }
            }
            
            // Get the question pool based on difficulty
            let questionPool = [];
            if (difficultyToUse === 'easy') {
                this.problemTypes.forEach(type => {
                    questionPool = questionPool.concat(this.easyQuestions[type]);
                });
            } else if (difficultyToUse === 'medium') {
                this.problemTypes.forEach(type => {
                    questionPool = questionPool.concat(this.mediumQuestions[type]);
                });
            } else {
                this.problemTypes.forEach(type => {
                    questionPool = questionPool.concat(this.hardQuestions[type]);
                });
            }
            
            // Filter out recently used questions if possible
            let availableQuestions = questionPool.filter(q => !this.usedQuestions.has(q));
            
            // If we've used all questions, reset the used questions set
            if (availableQuestions.length === 0) {
                this.usedQuestions.clear();
                availableQuestions = questionPool;
            }
            
            // Select a random question from the available pool
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            this.currentQuestion = availableQuestions[randomIndex];
            
            // Mark this question as used
            this.usedQuestions.add(this.currentQuestion);
        }
        
        // Display the question
        this.displayQuestion();
    }
    
    // Update the user's level based on performance
    updateUserLevel(isCorrect) {
        if (isCorrect) {
            this.correctStreak++;
            this.incorrectStreak = 0;
            
            // Level up if the user has answered enough questions correctly
            if (this.correctStreak >= this.levelUpThreshold) {
                this.userLevel++;
                this.correctStreak = 0;
                
                // Show level up notification
                this.feedback.innerHTML += `
                    <div class="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p class="font-medium text-green-800 dark:text-green-200">
                            <span class="font-bold">Level Up!</span> You've advanced to level ${this.userLevel}.
                        </p>
                    </div>
                `;
            }
        } else {
            this.incorrectStreak++;
            this.correctStreak = 0;
            
            // Level down if the user has answered enough questions incorrectly
            if (this.incorrectStreak >= this.levelDownThreshold && this.userLevel > 1) {
                this.userLevel--;
                this.incorrectStreak = 0;
                
                // Show level down notification
                this.feedback.innerHTML += `
                    <div class="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <p class="font-medium text-yellow-800 dark:text-yellow-200">
                            <span class="font-bold">Level Adjusted.</span> You're now at level ${this.userLevel}.
                        </p>
                    </div>
                `;
            }
        }
        
        // Update the score display to show the user's level
        this.updateScoreDisplay();
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
        const question = this.currentQuestion;
        this.hintShown = false;

        // Update progress indicators based on mode
        if (this.selectedMode === 'transformer') {
            // For transformer mode, show progress through the sequence
            const progress = Math.round((this.transformerQuestionIndex / transformerQuestions.length) * 100);
            this.questionCounter.textContent = `Transformer ${this.transformerQuestionIndex} of ${transformerQuestions.length}`;
            this.progressFill.style.width = `${progress}%`;
        } else {
            // For other modes, show level and difficulty
            this.questionCounter.textContent = `Level ${this.userLevel} - ${question.difficulty.toUpperCase()}`;
            this.progressFill.style.width = `${Math.min(this.userLevel * 10, 100)}%`;
        }

        // Set difficulty badge
        this.difficultyBadge.textContent = question.difficulty.toUpperCase();
        this.difficultyBadge.className = `difficulty-badge difficulty-${question.difficulty}`;

        // Reset hint
        this.hintText.classList.remove('show');
        this.hintText.textContent = question.hint;
        
        // In continuous mode, previous button is always disabled
        this.prevQuestionButton.disabled = true;
        this.prevQuestionButton.classList.add('opacity-50', 'cursor-not-allowed');
        this.prevQuestionButton.classList.remove('hover:bg-blue-700');

        // Generate HTML for input tensors - only show for standard problems
        let inputTensorHTML = '';
        let outputTensorHTML = '';
        
        if (!question.code) {
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

            // Generate HTML for output tensor - only show for standard problems
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
        
        // For code problems, display the code block
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
            // Standard problem
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

        // Enable the next question button (for skipping)
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
        // Determine if this is a code problem by checking if it has a code property
        const isCodeProblem = !!this.currentQuestion.code;

        try {
            
            if (isCodeProblem) {
                // For code problems, test multiple tensors and stop at the first failure
                const testResult = this.testMultipleTensors(userInput);
                isCorrect = testResult.isCorrect;
                failedTestCase = testResult.failedTestCase;
            } else {
                // Standard problem - test only the current question's tensors
                // Convert input tensors to TensorFlow tensors
                const tfInputTensors = this.currentQuestion.inputTensors.map(tensor => tf.tensor(tensor.data, tensor.shape));

                // Special handling for trace operation (any repeated indices like ii->, aa->, etc.) to avoid duplicate axes error
                // Check if the input is a trace operation (same letter repeated)
                const isTraceOperation = (() => {
                    // Remove the arrow part if present
                    const inputPart = userInput.split('->')[0];
                    // Check if it's a single letter repeated (e.g., 'ii', 'aa', etc.)
                    return inputPart.length === 2 && inputPart[0] === inputPart[1];
                })();
                
                if (isTraceOperation) {
                    // For trace operation, manually calculate the sum of diagonal elements
                    const matrix = tfInputTensors[0];
                    
                    // Extract diagonal elements and sum them
                    const matrixShape = matrix.shape;
                    const minDim = Math.min(matrixShape[0], matrixShape[1]);
                    let diagSum = 0;
                    
                    // Get the matrix data as a regular JavaScript array
                    const matrixData = matrix.arraySync();
                    
                    // Sum the diagonal elements
                    for (let i = 0; i < minDim; i++) {
                        diagSum += matrixData[i][i];
                    }
                    
                    calculatedOutput = diagSum;
                    
                    // Calculate the expected output using the correct einsum string
                    const expectedTfInputTensors = this.currentQuestion.inputTensors.map(tensor => 
                        tf.tensor(tensor.data, tensor.shape));
                    const expectedOutput = tf.einsum(this.currentQuestion.einsumString, ...expectedTfInputTensors).arraySync();
                    
                    // Compare with the expected output
                    isCorrect = compareTensorData(calculatedOutput, expectedOutput);
                    
                    // Clean up tensors to prevent memory leaks
                    expectedTfInputTensors.forEach(tensor => tensor.dispose());
                } else {
                    // For other operations, use tf.einsum
                    calculatedOutput = tf.einsum(userInput, ...tfInputTensors).arraySync();

                    // Calculate the expected output using the correct einsum string
                    const expectedTfInputTensors = this.currentQuestion.inputTensors.map(tensor => 
                        tf.tensor(tensor.data, tensor.shape));
                    const expectedOutput = tf.einsum(this.currentQuestion.einsumString, ...expectedTfInputTensors).arraySync();
                    
                    // Compare with the expected output
                    isCorrect = compareTensorData(calculatedOutput, expectedOutput);

                    // Clean up tensors to prevent memory leaks
                    expectedTfInputTensors.forEach(tensor => tensor.dispose());
                }

                // Clean up tensors to prevent memory leaks
                tfInputTensors.forEach(tensor => tensor.dispose());
            }
        } catch (error) {
            console.error("TensorFlow.js error:", error);
            
            // Update performance tracking - count invalid einsum as a wrong answer
            this.totalAnswered++;
            // Update user level based on performance (false = incorrect)
            this.updateUserLevel(false);
            
            this.feedback.innerHTML = `<div class="feedback-message wrong-answer">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p class="font-semibold">Invalid einsum string</p>
                </div>
                <p class="mt-2">Please check the format (e.g., 'ij,jk->ik'). ${error.message}</p>
            </div>`;

            // Add show answer and skip buttons for invalid einsum
            this.feedback.innerHTML += `
                <div class="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                    <button id="show-answer-button" class="btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                        </svg>
                        Show Correct Answer
                    </button>
                    <button id="skip-button" class="btn bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                        Skip to Next Question
                    </button>
                </div>
                
                <div id="correct-answer-container" class="mt-4 hidden">
                    <div class="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Your einsum string:</p>
                                <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${userInput}</code>
                            </div>
                            <div>
                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Correct einsum string:</p>
                                <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${this.currentQuestion.einsumString}</code>
                            </div>
                        </div>
                        <div class="game-explanation mt-2 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                            <p class="font-medium mb-2">Explanation:</p>
                            <p>${this.currentQuestion.explanation}</p>
                        </div>
                    </div>
                </div>
            `;

            // Enable the next question button
            this.nextQuestionButton.disabled = false;
            this.nextQuestionButton.classList.remove('opacity-50', 'cursor-not-allowed');
            this.nextQuestionButton.classList.add('hover:bg-green-700');
            
            // Add event listeners to the buttons
            const showAnswerButton = document.getElementById('show-answer-button');
            const skipButton = document.getElementById('skip-button');
            const correctAnswerContainer = document.getElementById('correct-answer-container');
            
            if (showAnswerButton && correctAnswerContainer) {
                showAnswerButton.addEventListener('click', () => {
                    // Show the correct answer container
                    correctAnswerContainer.classList.remove('hidden');
                    
                    // Change the show answer button to indicate the answer is shown
                    showAnswerButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        Answer Shown
                    `;
                    showAnswerButton.disabled = true;
                    showAnswerButton.classList.add('opacity-50', 'cursor-not-allowed');
                    showAnswerButton.classList.remove('hover:bg-purple-700');
                    
                    // Scroll to the correct answer container
                    correctAnswerContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            }
            
            if (skipButton) {
                skipButton.addEventListener('click', () => this.getNextQuestion());
            }
            
            // Scroll to the feedback
            this.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            return;
        }

        // Update performance tracking
        this.totalAnswered++;
        if (isCorrect) {
            this.totalCorrect++;
        }
        
        // Update user level based on performance
        this.updateUserLevel(isCorrect);

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
                
            // For code problems, show all test cases that passed
            if (isCodeProblem) {
                feedbackHTML += `
                <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p class="font-medium text-gray-700 dark:text-gray-300 mb-2">All test cases passed!</p>
                    <p class="text-gray-600 dark:text-gray-400">Your einsum string works correctly for all test cases.</p>
                </div>`;
            }
            
            feedbackHTML += `
                <div class="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg mt-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Your einsum string:</p>
                            <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${userInput}</code>
                        </div>
                        <div>
                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Correct einsum string:</p>
                            <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${this.currentQuestion.einsumString}</code>
                        </div>
                    </div>
                    <div class="game-explanation mt-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <p class="font-medium mb-2">Explanation:</p>
                        <p>${this.currentQuestion.explanation}</p>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-center">
                    <button id="next-question-button" class="btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                        Next Question
                    </button>
                </div>
            `;
        } else {
            // Wrong answer
            if (isCodeProblem && failedTestCase) {
                // Show the failed test case details for code problems
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
                                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Shape: [${failedTestCase.expectedOutput && failedTestCase.expectedOutput.shape ? failedTestCase.expectedOutput.shape.join(', ') : 'undefined'}]</p>
                                <div class="tensor-container bg-white dark:bg-gray-800 p-2 rounded-lg overflow-auto">
                                    ${failedTestCase.expectedOutput ? formatTensorData(failedTestCase.expectedOutput) : 'No expected output available'}
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
                    
                    <div class="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button id="show-answer-button" class="btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                            Show Correct Answer
                        </button>
                        <button id="next-question-button" class="btn bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                            Next Question
                        </button>
                    </div>
                    
                    <div id="correct-answer-container" class="mt-4 hidden">
                        <div class="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Your einsum string:</p>
                                    <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${userInput}</code>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Correct einsum string:</p>
                                    <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${this.currentQuestion.einsumString}</code>
                                </div>
                            </div>
                            <div class="game-explanation mt-2 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                                <p class="font-medium mb-2">Explanation:</p>
                                <p>${this.currentQuestion.explanation}</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Standard problem or code problem without specific test case
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
                    
                    <div class="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <button id="try-again-button" class="btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                            </svg>
                            Try Again
                        </button>
                        <button id="show-answer-button" class="btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                            Show Correct Answer
                        </button>
                        <button id="skip-button" class="btn bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                            </svg>
                            Skip to Next Question
                        </button>
                    </div>
                    
                    <div id="correct-answer-container" class="mt-4 hidden">
                        <div class="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Your einsum string:</p>
                                    <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${userInput}</code>
                                </div>
                                <div>
                                    <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">Correct einsum string:</p>
                                    <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">${this.currentQuestion.einsumString}</code>
                                </div>
                            </div>
                            <div class="game-explanation mt-2 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                                <p class="font-medium mb-2">Explanation:</p>
                                <p>${this.currentQuestion.explanation}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Update the feedback
        this.feedback.innerHTML = feedbackHTML;

        // Add event listeners to the buttons
        if (isCorrect) {
            const nextQuestionButton = document.getElementById('next-question-button');
            if (nextQuestionButton) {
                nextQuestionButton.addEventListener('click', () => this.getNextQuestion());
            }
        } else {
            const nextQuestionButton = document.getElementById('next-question-button');
            const showAnswerButton = document.getElementById('show-answer-button');
            const correctAnswerContainer = document.getElementById('correct-answer-container');
            
            if (nextQuestionButton) {
                nextQuestionButton.addEventListener('click', () => this.getNextQuestion());
            }
            
            if (showAnswerButton && correctAnswerContainer) {
                showAnswerButton.addEventListener('click', () => {
                    // Show the correct answer container
                    correctAnswerContainer.classList.remove('hidden');
                    
                    // Change the show answer button to indicate the answer is shown
                    showAnswerButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        Answer Shown
                    `;
                    showAnswerButton.disabled = true;
                    showAnswerButton.classList.add('opacity-50', 'cursor-not-allowed');
                    showAnswerButton.classList.remove('hover:bg-purple-700');
                    
                    // Scroll to the correct answer container
                    correctAnswerContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            }
        }

        // Scroll to the feedback
        this.feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        // In continuous mode, just get the next question
        this.getNextQuestion();
        
        // Scroll to the top of the game content
        this.gameContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        // Calculate accuracy if there are answered questions
        let accuracyText = '';
        if (this.totalAnswered > 0) {
            const accuracy = Math.round((this.totalCorrect / this.totalAnswered) * 100);
            accuracyText = ` | Accuracy: ${accuracy}%`;
        }
        
        // Show level and accuracy
        this.scoreDisplay.textContent = `Level: ${this.userLevel}${accuracyText}`;
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
        // Use test cases from the question file if available, otherwise generate them
        const testCases = this.currentQuestion.testCases;
        
        // Test each case with the user's einsum string
        for (const testCase of testCases) {
            try {
                // Convert input tensors to TensorFlow tensors
                const tfInputTensors = testCase.inputTensors.map(tensor => 
                    tf.tensor(tensor.data, tensor.shape));
                
                // Calculate the output using the user's einsum string
                const calculatedOutput = tf.einsum(userInput, ...tfInputTensors).arraySync();
                
                // Calculate the expected output using the correct einsum string
                const expectedTfInputTensors = testCase.inputTensors.map(tensor => 
                    tf.tensor(tensor.data, tensor.shape));
                const expectedOutput = tf.einsum(this.currentQuestion.einsumString, ...expectedTfInputTensors).arraySync();
                console.log(expectedOutput);
                // Compare with the expected output
                const isCorrect = compareTensorData(calculatedOutput, expectedOutput);
                
                // Clean up tensors to prevent memory leaks
                tfInputTensors.forEach(tensor => tensor.dispose());
                expectedTfInputTensors.forEach(tensor => tensor.dispose());
                
                // If this test case failed, return the details
                if (!isCorrect) {
                    return {
                        isCorrect: false,
                        failedTestCase: {
                            inputTensors: testCase.inputTensors,
                            expectedOutput: testCase.outputTensor || { data: expectedOutput, shape: getShape(expectedOutput) },
                            actualOutput: calculatedOutput,
                            explanation: getWrongAnswerExplanation(
                                userInput,
                                calculatedOutput,
                                expectedOutput,
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
                        expectedOutput: testCase.outputTensor,
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
    
    // generateTestCases() {
    //     const question = this.currentQuestion;
    //     const testCases = [];
        
    //     // Always include the original test case from the question
    //     // We'll calculate the expected output using TensorFlow.js with the correct einsum string
    //     const originalCase = {
    //         inputTensors: question.inputTensors,
    //         expectedOutput: question.outputTensor // This will be recalculated in testMultipleTensors
    //     };
    //     testCases.push(originalCase);
        
    //     // Generate additional test cases based on the question type
    //     const einsumParts = question.einsumString.split('->');
    //     const inputPart = einsumParts[0];
    //     const outputPart = einsumParts[1];
        
    //     // Determine the type of operation based on the einsum string
    //     if (inputPart.includes(',')) {
    //         // Multiple input tensors (e.g., matrix multiplication, dot product)
            
    //         // For matrix multiplication (ik,kj->ij)
    //         if (question.einsumString === 'ik,kj->ij') {
    //             // Add a test case with different dimensions
    //             testCases.push(this.generateMatrixMultiplicationTestCase(3, 4, 2));
    //             testCases.push(this.generateMatrixMultiplicationTestCase(4, 2, 5));
    //         } 
    //         // For dot product (i,i->)
    //         else if (question.einsumString === 'i,i->') {
    //             testCases.push(this.generateDotProductTestCase(5));
    //             testCases.push(this.generateDotProductTestCase(7));
    //         }
    //         // For outer product (i,j->ij)
    //         else if (question.einsumString === 'i,j->ij') {
    //             testCases.push(this.generateOuterProductTestCase(3, 4));
    //             testCases.push(this.generateOuterProductTestCase(4, 3));
    //         }
    //         // For element-wise multiplication (ij,ij->ij)
    //         else if (question.einsumString === 'ij,ij->ij') {
    //             testCases.push(this.generateElementWiseMultiplicationTestCase(3, 4));
    //             testCases.push(this.generateElementWiseMultiplicationTestCase(4, 3));
    //         }
    //         // For batch matrix multiplication (bij,bjk->bik)
    //         else if (question.einsumString === 'bij,bjk->bik') {
    //             testCases.push(this.generateBatchMatrixMultiplicationTestCase(3, 4, 3, 2));
    //             testCases.push(this.generateBatchMatrixMultiplicationTestCase(2, 3, 2, 4));
    //         }
    //     } else {
    //         // Single input tensor operations
            
    //         // For transpose (ij->ji)
    //         if (question.einsumString === 'ij->ji') {
    //             testCases.push(this.generateTransposeTestCase(4, 3));
    //             testCases.push(this.generateTransposeTestCase(5, 2));
    //         }
    //         // For diagonal extraction (ii->i)
    //         else if (question.einsumString === 'ii->i') {
    //             testCases.push(this.generateDiagonalTestCase(5));
    //             testCases.push(this.generateDiagonalTestCase(6));
    //         }
    //         // For row sum (ij->i)
    //         else if (question.einsumString === 'ij->i') {
    //             testCases.push(this.generateRowSumTestCase(4, 3));
    //             testCases.push(this.generateRowSumTestCase(3, 5));
    //         }
    //     }
        
    //     return testCases;
    // }
    
    // // Helper methods to generate specific test cases
    
    // generateMatrixMultiplicationTestCase(m, n, p) {
    //     // Generate m x n and n x p matrices for matrix multiplication
    //     const A = { 
    //         shape: [m, n], 
    //         data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     const B = { 
    //         shape: [n, p], 
    //         data: Array(n).fill().map(() => Array(p).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     // Calculate expected output
    //     const result = Array(m).fill().map(() => Array(p).fill(0));
    //     for (let i = 0; i < m; i++) {
    //         for (let j = 0; j < p; j++) {
    //             for (let k = 0; k < n; k++) {
    //                 result[i][j] += A.data[i][k] * B.data[k][j];
    //             }
    //         }
    //     }
        
    //     return {
    //         inputTensors: [A, B],
    //         expectedOutput: { shape: [m, p], data: result }
    //     };
    // }
    
    // generateDotProductTestCase(n) {
    //     // Generate two vectors of length n for dot product
    //     const v1 = { 
    //         shape: [n], 
    //         data: Array(n).fill().map(() => Math.floor(Math.random() * 10)) 
    //     };
        
    //     const v2 = { 
    //         shape: [n], 
    //         data: Array(n).fill().map(() => Math.floor(Math.random() * 10)) 
    //     };
        
    //     // Calculate expected output
    //     let result = 0;
    //     for (let i = 0; i < n; i++) {
    //         result += v1.data[i] * v2.data[i];
    //     }
        
    //     return {
    //         inputTensors: [v1, v2],
    //         expectedOutput: { shape: [], data: result }
    //     };
    // }
    
    // generateOuterProductTestCase(m, n) {
    //     // Generate vectors of length m and n for outer product
    //     const v1 = { 
    //         shape: [m], 
    //         data: Array(m).fill().map(() => Math.floor(Math.random() * 10)) 
    //     };
        
    //     const v2 = { 
    //         shape: [n], 
    //         data: Array(n).fill().map(() => Math.floor(Math.random() * 10)) 
    //     };
        
    //     // Calculate expected output
    //     const result = Array(m).fill().map(() => Array(n).fill(0));
    //     for (let i = 0; i < m; i++) {
    //         for (let j = 0; j < n; j++) {
    //             result[i][j] = v1.data[i] * v2.data[j];
    //         }
    //     }
        
    //     return {
    //         inputTensors: [v1, v2],
    //         expectedOutput: { shape: [m, n], data: result }
    //     };
    // }
    
    // generateElementWiseMultiplicationTestCase(m, n) {
    //     // Generate two m x n matrices for element-wise multiplication
    //     const A = { 
    //         shape: [m, n], 
    //         data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     const B = { 
    //         shape: [m, n], 
    //         data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     // Calculate expected output
    //     const result = Array(m).fill().map(() => Array(n).fill(0));
    //     for (let i = 0; i < m; i++) {
    //         for (let j = 0; j < n; j++) {
    //             result[i][j] = A.data[i][j] * B.data[i][j];
    //         }
    //     }
        
    //     return {
    //         inputTensors: [A, B],
    //         expectedOutput: { shape: [m, n], data: result }
    //     };
    // }
    
    // generateBatchMatrixMultiplicationTestCase(b, m, n, p) {
    //     // Generate batch of b matrices of size m x n and n x p
    //     const batchA = {
    //         shape: [b, m, n],
    //         data: Array(b).fill().map(() => 
    //             Array(m).fill().map(() => 
    //                 Array(n).fill().map(() => Math.floor(Math.random() * 10))
    //             )
    //         )
    //     };
        
    //     const batchB = {
    //         shape: [b, n, p],
    //         data: Array(b).fill().map(() => 
    //             Array(n).fill().map(() => 
    //                 Array(p).fill().map(() => Math.floor(Math.random() * 10))
    //             )
    //         )
    //     };
        
    //     // Calculate expected output
    //     const result = Array(b).fill().map(() => 
    //         Array(m).fill().map(() => Array(p).fill(0))
    //     );
        
    //     for (let batch = 0; batch < b; batch++) {
    //         for (let i = 0; i < m; i++) {
    //             for (let j = 0; j < p; j++) {
    //                 for (let k = 0; k < n; k++) {
    //                     result[batch][i][j] += batchA.data[batch][i][k] * batchB.data[batch][k][j];
    //                 }
    //             }
    //         }
    //     }
        
    //     return {
    //         inputTensors: [batchA, batchB],
    //         expectedOutput: { shape: [b, m, p], data: result }
    //     };
    // }
    
    // generateTransposeTestCase(m, n) {
    //     // Generate an m x n matrix for transpose
    //     const A = { 
    //         shape: [m, n], 
    //         data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     // Calculate expected output
    //     const result = Array(n).fill().map(() => Array(m).fill(0));
    //     for (let i = 0; i < m; i++) {
    //         for (let j = 0; j < n; j++) {
    //             result[j][i] = A.data[i][j];
    //         }
    //     }
        
    //     return {
    //         inputTensors: [A],
    //         expectedOutput: { shape: [n, m], data: result }
    //     };
    // }
    
    // generateDiagonalTestCase(n) {
    //     // Generate an n x n matrix for diagonal extraction
    //     const A = { 
    //         shape: [n, n], 
    //         data: Array(n).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     // Calculate expected output
    //     const result = Array(n).fill(0);
    //     for (let i = 0; i < n; i++) {
    //         result[i] = A.data[i][i];
    //     }
        
    //     return {
    //         inputTensors: [A],
    //         expectedOutput: { shape: [n], data: result }
    //     };
    // }
    
    // generateRowSumTestCase(m, n) {
    //     // Generate an m x n matrix for row sum
    //     const A = { 
    //         shape: [m, n], 
    //         data: Array(m).fill().map(() => Array(n).fill().map(() => Math.floor(Math.random() * 10))) 
    //     };
        
    //     // Calculate expected output
    //     const result = Array(m).fill(0);
    //     for (let i = 0; i < m; i++) {
    //         for (let j = 0; j < n; j++) {
    //             result[i] += A.data[i][j];
    //         }
    //     }
        
    //     return {
    //         inputTensors: [A],
    //         expectedOutput: { shape: [m], data: result }
    //     };
    // }
    
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
