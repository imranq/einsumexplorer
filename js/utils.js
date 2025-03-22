/**
 * Format tensor data for display
 * @param {Object} tensor - The tensor to format
 * @returns {string} HTML string for displaying the tensor
 */
function formatTensorData(tensor) {
    if (tensor.shape.length === 0) {
        // Scalar
        return `<div class="matrix-display">${Number(tensor.data).toFixed(2)}</div>`;
    } else if (tensor.shape.length === 1) {
        // Vector
        return `<div class="tensor-row">
            ${tensor.data.map(val => `<div class="matrix-display">${Number(val).toFixed(2)}</div>`).join('')}
        </div>`;
    } else if (tensor.shape.length === 2) {
        // Matrix
        return `<div class="matrix-container">
            ${tensor.data.map(row => {
                return `<div class="tensor-row">
                    ${row.map(val => `<div class="matrix-display">${Number(val).toFixed(2)}</div>`).join('')}
                </div>`;
            }).join('')}
        </div>`;
    } else {
        // Higher-dimensional tensor
        return `<div class="tensor-3d-container">
            ${tensor.data.map((matrix, idx) => {
                return `
                    <div class="tensor-slice mb-3">
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Slice ${idx + 1}</div>
                        <div class="matrix-container bg-white dark:bg-gray-750 p-2 rounded-lg">
                            ${matrix.map(row => {
                    return `<div class="tensor-row">
                                    ${row.map(val => `<div class="matrix-display">${Number(val).toFixed(2)}</div>`).join('')}
                                </div>`;
                }).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>`;
    }
}

/**
 * Compare tensor data for equality
 * @param {*} calculated - The calculated tensor data
 * @param {*} expected - The expected tensor data
 * @returns {boolean} Whether the tensors are equal
 */
function compareTensorData(calculated, expected) {
    // Handle scalar values
    if (!Array.isArray(calculated) && !Array.isArray(expected)) {
        return Math.abs(calculated - expected) < 1e-6;
    }

    // Handle arrays
    if (Array.isArray(calculated) && Array.isArray(expected)) {
        if (calculated.length !== expected.length) {
            return false;
        }

        for (let i = 0; i < calculated.length; i++) {
            if (!compareTensorData(calculated[i], expected[i])) {
                return false;
            }
        }

        return true;
    }

    // One is array, one is not
    return false;
}

/**
 * Get shape of an array (recursively)
 * @param {Array|*} arr - The array to get the shape of
 * @returns {Array} The shape of the array
 */
function getShape(arr) {
    if (!Array.isArray(arr)) {
        return [];
    }

    const shape = [arr.length];

    if (arr.length > 0) {
        const firstElement = arr[0];
        if (Array.isArray(firstElement)) {
            const restShape = getShape(firstElement);
            shape.push(...restShape);
        }
    }

    return shape;
}

/**
 * Generate detailed hint for a question
 * @param {Object} question - The question to generate a hint for
 * @returns {string} HTML string for the hint
 */
function generateDetailedHint(question) {
    // Base hint from the question
    const baseHint = question.hint;

    // Additional detailed hints based on the question type
    let detailedHint = '';

    if (question.einsumString.includes('->')) {
        const parts = question.einsumString.split('->');
        const inputPart = parts[0];
        const outputPart = parts[1];

        // Analyze the pattern
        if (inputPart.includes(',')) {
            // Multiple input tensors
            detailedHint += "This operation involves multiple tensors. Think about which dimensions should align and which should be summed over. ";
        }

        if (inputPart.includes('i') && inputPart.includes('j')) {
            // Likely a matrix operation
            detailedHint += "Remember that 'i' typically represents rows and 'j' typically represents columns in matrix notation. ";
        }

        if (inputPart.match(/([a-z])\1/)) {
            // Repeated indices in input
            detailedHint += "When the same index appears twice in an input, it often refers to diagonal elements. ";
        }

        if (outputPart === '') {
            // Reduction to scalar
            detailedHint += "When the output has no indices, all dimensions are summed over, producing a scalar. ";
        }
    }

    return `<p class="hint-primary">${baseHint}</p>
        <p class="hint-secondary mt-2">${detailedHint}</p>
        <p class="hint-example mt-2">Format example: For matrix multiplication, use "ij,jk->ik"</p>`;
}

/**
 * Get explanation for wrong answers
 * @param {string} userInput - The user's einsum string
 * @param {*} calculatedOutput - The calculated output
 * @param {*} expectedOutput - The expected output
 * @param {string} expectedEinsum - The expected einsum string
 * @returns {string} Explanation for the wrong answer
 */
function getWrongAnswerExplanation(userInput, calculatedOutput, expectedOutput, expectedEinsum) {
    // Basic validation
    if (!userInput) {
        return "Please provide an einsum string.";
    }

    try {
        // Check einsum string format
        const parts = userInput.split('->');
        if (parts.length !== 2) {
            return "Invalid einsum string format. It should be in the form 'input_indices->output_indices'.";
        }

        const inputIndices = parts[0].split(',');
        const outputIndices = parts[1];

        // Check for invalid characters
        const validChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (!inputIndices.every(s => [...s].every(c => validChars.includes(c))) ||
            ![...outputIndices].every(c => validChars.includes(c))) {
            return "Invalid characters in einsum string. Use only letters (a-zA-Z).";
        }

        // Check output shape
        if (calculatedOutput) {
            const calculatedShape = getShape(calculatedOutput);
            const expectedShape = getShape(expectedOutput);

            if (calculatedShape.length !== expectedShape.length) {
                return `Output tensor has incorrect number of dimensions. Expected ${expectedShape.length}, got ${calculatedShape.length}.`;
            }

            // Check if shapes match
            for (let i = 0; i < calculatedShape.length; i++) {
                if (calculatedShape[i] !== expectedShape[i]) {
                    return `Output tensor has incorrect shape. Expected [${expectedShape.join(', ')}], got [${calculatedShape.join(', ')}].`;
                }
            }

            // If shapes match but values don't
            return "Your einsum string produces a tensor with the correct shape, but the values are incorrect. Check your understanding of which indices are being summed over.";
        }

        // If the einsum string is correct but calculation failed
        if (userInput === expectedEinsum) {
            return "Your einsum string is correct, but there was an error in the calculation.";
        }

        return "The einsum string does not produce the correct result. Please review the einsum operation and try again.";
    } catch (e) {
        return "An error occurred while processing your einsum string. Please check the format and try again.";
    }
}

export {
    formatTensorData,
    compareTensorData,
    getShape,
    generateDetailedHint,
    getWrongAnswerExplanation
};
