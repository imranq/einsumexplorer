/**
 * Creates and manages the combined tutorial and cheatsheet modal for the Einsum Explorer
 */
class Tutorial {
    constructor() {
        this.createCombinedModal();
        this.setupEventListeners();
    }

    /**
     * Creates the combined tutorial and cheatsheet modal HTML and adds it to the document
     */
    createCombinedModal() {
        const combinedHTML = `
            <div id="learning-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Einsum Learning Resources</h2>
                        <button id="close-learning-modal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Tab Navigation -->
                    <div class="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                        <button id="tutorial-tab" class="px-4 py-2 font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400">
                            Tutorial
                        </button>
                        <button id="cheatsheet-tab" class="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                            Notation Cheatsheet
                        </button>
                    </div>
                    
                    <!-- Tutorial Content -->
                    <div id="tutorial-content" class="space-y-4">
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
                    
                    <!-- Cheatsheet Content -->
                    <div id="cheatsheet-content" class="hidden space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Basic Operations</h3>
                                <ul class="space-y-2 text-sm">
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ij-></code>: Sum all
                                        elements in a matrix</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ii-></code>: Trace of
                                        a matrix (sum of diagonal elements)</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ij->ji</code>:
                                        Transpose a matrix</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">i,i-></code>: Dot
                                        product of two vectors</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">i,j->ij</code>: Outer
                                        product of two vectors</li>
                                </ul>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-2">Matrix Operations</h3>
                                <ul class="space-y-2 text-sm">
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ij,jk->ik</code>:
                                        Matrix multiplication</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ij,j->i</code>:
                                        Matrix-vector multiplication</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ijk->ik</code>: Sum
                                        along the j axis</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ii->i</code>: Extract
                                        diagonal elements</li>
                                    <li><code class="monospace bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">ijk,ikl->ijl</code>:
                                        Batch matrix multiplication</li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            <p>In einsum notation, repeated indices are summed over. Indices that appear in the output are kept,
                                while those that don't appear are reduced.</p>
                        </div>
                    </div>
                    
                    <button id="start-practice" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg w-full">
                        Start Practicing
                    </button>
                </div>
            </div>
        `;

        // Add to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = combinedHTML;
        document.body.appendChild(modalContainer);
    }

    /**
     * Sets up event listeners for the combined modal
     */
    setupEventListeners() {
        // Learning resources button event listener
        const learningButton = document.getElementById('learning-resources-btn');
        if (learningButton) {
            learningButton.addEventListener('click', () => {
                document.getElementById('learning-modal').classList.remove('hidden');
            });
        }

        // Close button event listener
        document.getElementById('close-learning-modal').addEventListener('click', () => {
            document.getElementById('learning-modal').classList.add('hidden');
        });

        // Start practice button event listener
        document.getElementById('start-practice').addEventListener('click', () => {
            document.getElementById('learning-modal').classList.add('hidden');
        });

        // Tab switching event listeners
        document.getElementById('tutorial-tab').addEventListener('click', () => {
            // Update tab styling
            document.getElementById('tutorial-tab').classList.add('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
            document.getElementById('tutorial-tab').classList.remove('text-gray-500', 'dark:text-gray-400');
            
            document.getElementById('cheatsheet-tab').classList.remove('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
            document.getElementById('cheatsheet-tab').classList.add('text-gray-500', 'dark:text-gray-400');
            
            // Show/hide content
            document.getElementById('tutorial-content').classList.remove('hidden');
            document.getElementById('cheatsheet-content').classList.add('hidden');
        });

        document.getElementById('cheatsheet-tab').addEventListener('click', () => {
            // Update tab styling
            document.getElementById('cheatsheet-tab').classList.add('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
            document.getElementById('cheatsheet-tab').classList.remove('text-gray-500', 'dark:text-gray-400');
            
            document.getElementById('tutorial-tab').classList.remove('text-blue-600', 'dark:text-blue-400', 'border-b-2', 'border-blue-600', 'dark:border-blue-400');
            document.getElementById('tutorial-tab').classList.add('text-gray-500', 'dark:text-gray-400');
            
            // Show/hide content
            document.getElementById('tutorial-content').classList.add('hidden');
            document.getElementById('cheatsheet-content').classList.remove('hidden');
        });
    }
}

export default Tutorial;
