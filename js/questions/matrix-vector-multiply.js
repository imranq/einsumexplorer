// Multiply a matrix by a vector
const question = {
    description: "Multiply a matrix by a vector.",
    difficulty: "medium",
    inputTensors: [
        { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] },
        { shape: [3], data: [7, 8, 9] }
    ],
    outputTensor: { shape: [2], data: [50, 122] },
    einsumString: "ij,j->i",
    explanation: "The 'ij,j->i' string performs matrix-vector multiplication. The 'j' index appears in both the matrix and vector and is summed over, while the 'i' index remains in the output.",
    hint: "For matrix-vector multiplication, the shared dimension is summed over, and the other dimension remains.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3, 2], data: [[1, 2], [3, 4], [5, 6]] },
                { shape: [2], data: [7, 8] }
            ],
            outputTensor: { shape: [3], data: [23, 53, 83] }
        },
        {
            inputTensors: [
                { shape: [2, 4], data: [[1, 2, 3, 4], [5, 6, 7, 8]] },
                { shape: [4], data: [9, 10, 11, 12] }
            ],
            outputTensor: { shape: [2], data: [110, 278] }
        }
    ]
};

export default question;
