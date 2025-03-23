// Transpose the matrix
const question = {
    description: "Transpose the matrix.",
    difficulty: "easy",
    inputTensors: [
        { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] },
    ],
    outputTensor: { shape: [3, 2], data: [[1, 4], [2, 5], [3, 6]] },
    einsumString: "ij->ji",
    explanation: "The 'ij->ji' string swaps the axes of the matrix, effectively transposing it. The first dimension becomes the second, and vice versa.",
    hint: "To transpose a matrix, simply swap the order of indices after the arrow.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3, 2], data: [[1, 2], [3, 4], [5, 6]] }
            ],
            outputTensor: { shape: [2, 3], data: [[1, 3, 5], [2, 4, 6]] }
        },
        {
            inputTensors: [
                { shape: [1, 4], data: [[10, 20, 30, 40]] }
            ],
            outputTensor: { shape: [4, 1], data: [[10], [20], [30], [40]] }
        }
    ]
};

export default question;
