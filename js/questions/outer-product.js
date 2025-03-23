// Compute the outer product of two vectors
const question = {
    description: "Compute the outer product of two vectors.",
    difficulty: "medium",
    inputTensors: [
        { shape: [2], data: [1, 2] },
        { shape: [3], data: [3, 4, 5] },
    ],
    outputTensor: { shape: [2, 3], data: [[3, 4, 5], [6, 8, 10]] },
    einsumString: "i,j->ij",
    explanation: "The 'i,j->ij' string computes the outer product where each element in the first vector is multiplied by each element in the second vector, creating a matrix.",
    hint: "The outer product creates a new dimension for each input dimension, with no summing.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3], data: [1, 2, 3] },
                { shape: [2], data: [4, 5] }
            ],
            outputTensor: { shape: [3, 2], data: [[4, 5], [8, 10], [12, 15]] }
        },
        {
            inputTensors: [
                { shape: [2], data: [10, 20] },
                { shape: [4], data: [1, 2, 3, 4] }
            ],
            outputTensor: { shape: [2, 4], data: [[10, 20, 30, 40], [20, 40, 60, 80]] }
        }
    ]
};

export default question;
