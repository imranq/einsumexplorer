// Compute the trace of the matrix (sum of diagonal elements)
const question = {
    description: "Compute the trace of the matrix (sum of diagonal elements).",
    difficulty: "easy",
    inputTensors: [
        { shape: [3, 3], data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }
    ],
    outputTensor: { shape: [], data: 15 },
    einsumString: "ii->",
    explanation: "The 'ii->' string means that we are summing over the diagonal elements (where the row and column indices are the same). In this case: 1 + 5 + 9 = 15.",
    hint: "When the same index appears twice in the input, it means we're only considering elements where those dimensions are equal (the diagonal).",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [4, 4], data: [[1, 0, 0, 0], [0, 2, 0, 0], [0, 0, 3, 0], [0, 0, 0, 4]] }
            ],
            outputTensor: { shape: [], data: 10 }
        },
        {
            inputTensors: [
                { shape: [2, 2], data: [[5, 6], [7, 8]] }
            ],
            outputTensor: { shape: [], data: 13 }
        }
    ]
};

export default question;
