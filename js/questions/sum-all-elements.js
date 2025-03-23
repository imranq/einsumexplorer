// Sum all elements of the matrix
const question = {
    description: "Sum all elements of the matrix.",
    difficulty: "easy",
    inputTensors: [
        { shape: [3, 3], data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }
    ],
    outputTensor: { shape: [], data: 45 },
    einsumString: "ij->",
    explanation: "The 'ij->' string means that we are summing over both the i and j indices. This results in a scalar value containing the sum of all elements.",
    hint: "When no indices appear after the arrow, all indices are summed over.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [2, 2], data: [[1, 2], [3, 4]] }
            ],
            outputTensor: { shape: [], data: 10 }
        },
        {
            inputTensors: [
                { shape: [2, 3], data: [[5, 6, 7], [8, 9, 10]] }
            ],
            outputTensor: { shape: [], data: 45 }
        }
    ]
};

export default question;
