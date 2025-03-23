// Compute the dot product of two vectors
const question = {
    description: "Compute the dot product of two vectors.",
    difficulty: "easy",
    inputTensors: [
        { shape: [3], data: [1, 2, 3] },
        { shape: [3], data: [4, 5, 6] }
    ],
    outputTensor: { shape: [], data: 32 },
    einsumString: "i,i->",
    explanation: "The 'i,i->' string computes the dot product by summing the element-wise products of the two vectors: (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32.",
    hint: "The dot product multiplies corresponding elements and sums the results. No indices remain after the arrow.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [4], data: [1, 2, 3, 4] },
                { shape: [4], data: [5, 6, 7, 8] }
            ],
            outputTensor: { shape: [], data: 70 }
        },
        {
            inputTensors: [
                { shape: [2], data: [10, 20] },
                { shape: [2], data: [30, 40] }
            ],
            outputTensor: { shape: [], data: 1100 }
        }
    ]
};

export default question;
