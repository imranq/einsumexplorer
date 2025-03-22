/**
 * Creates and manages the tutorial modal for the Einsum Explorer
 */
class Tutorial {
    constructor() {
        this.createTutorialModal();
        this.addTutorialButton();
        this.setupEventListeners();
    }

    /**
     * Creates the tutorial modal HTML and adds it to the document
     */
    createTutorialModal() {
        const tutorialHTML = `
            <div id="tutorial-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Einsum Notation Tutorial</h2>
                        <button id="close-tutorial" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-2">What is Einstein Summation?</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                Einstein Summation Notation (einsum) is a concise way to express operations on multi-dimensional arrays. 
                                It's named after Albert Einstein, who introduced a similar notation for tensor operations in physics.
                            </p>
                        </div>
                        
                        <div>
                            <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Basic Format</h3>
                            <p class="text-gray-600 dark:text-gray-400">
                                The general format is: <code class="monospace bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">input_indices->output_indices</code>
                            </p>
                            <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-400">
                                <li>Each input tensor gets a set of indices (e.g., "ij" for a matrix)</li>
                                <li>Multiple input tensors are separated by commas</li>
                                <li>The arrow "->" points to the output indices</li>
                                <li>Repeated indices are summed over</li>
                            </ul>
                        </div>
                        
                        <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <h3 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Examples with Visualizations</h3>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-blue-700 dark:text-blue-300 mb-1">Matrix Multiplication: <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">ij,jk->ik</code></p>
                                    <p class="text-sm text-blue-600 dark:text-blue-400">
                                        Here 'j' is the shared index that gets summed over, while 'i' and 'k' remain in the output.
                                    </p>
                                </div>
                                
                                <div>
                                    <p class="text-blue-700 dark:text-blue-300 mb-1">Transpose: <code class="monospace bg-white dark:bg-gray-800 px-2 py-1 rounded">ij->ji</code></p>
                                    <p class="text-sm text-blue-600 dark:text-blue-400">
                                        Swapping the indices in the output changes the order of dimensions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button id="start-practice" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg w-full">
                        Start Practicing
                    </button>
                </div>
            </div>
        `;

        // Add to the document
        const tutorialContainer = document.createElement('div');
        tutorialContainer.innerHTML = tutorialHTML;
        document.body.appendChild(tutorialContainer);
    }

    /**
     * Adds the tutorial button to the header
     */
    addTutorialButton() {
        const headerDiv = document.querySelector('header > div:last-child');
        const tutorialButton = document.createElement('button');
        tutorialButton.id = 'tutorial-button';
        tutorialButton.className = 'flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg font-medium mr-4';
        tutorialButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Tutorial
        `;
        headerDiv.insertBefore(tutorialButton, headerDiv.firstChild);
    }

    /**
     * Sets up event listeners for the tutorial
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('tutorial-button').addEventListener('click', () => {
                document.getElementById('tutorial-modal').classList.remove('hidden');
            });

            document.getElementById('close-tutorial').addEventListener('click', () => {
                document.getElementById('tutorial-modal').classList.add('hidden');
            });

            document.getElementById('start-practice').addEventListener('click', () => {
                document.getElementById('tutorial-modal').classList.add('hidden');
            });
        });
    }
}

export default Tutorial;
