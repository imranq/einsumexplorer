// Code-based question for element-wise multiplication
const question = {
    description: "Simplify this element-wise multiplication code using einsum:",
    difficulty: "easy",
    code: `// Element-wise multiplication of two matrices
const A = tf.tensor2d([[1, 2], [3, 4]]);
const B = tf.tensor2d([[5, 6], [7, 8]]);

// Current implementation
const result = tf.zeros([2, 2]);
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 2; j++) {
    result.arraySync()[i][j] = A.arraySync()[i][j] * B.arraySync()[i][j];
  }
}`,
    inputTensors: [
        { shape: [2, 2], data: [[1, 2], [3, 4]] },
        { shape: [2, 2], data: [[5, 6], [7, 8]] }
    ],
    outputTensor: { shape: [2, 2], data: [[5, 12], [21, 32]] },
    einsumString: "ij,ij->ij",
    explanation: "Element-wise multiplication can be expressed with einsum using 'ij,ij->ij' where the same indices 'ij' in both inputs and the output indicate we're multiplying corresponding elements.",
    hint: "When the same indices appear in both inputs and the output, we're doing element-wise operations.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3, 2], data: [[1, 2], [3, 4], [5, 6]] },
                { shape: [3, 2], data: [[7, 8], [9, 10], [11, 12]] }
            ],
            outputTensor: { shape: [3, 2], data: [[7, 16], [27, 40], [55, 72]] }
        },
        {
            inputTensors: [
                { shape: [2, 3], data: [[10, 20, 30], [40, 50, 60]] },
                { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] }
            ],
            outputTensor: { shape: [2, 3], data: [[10, 40, 90], [160, 250, 360]] }
        }
    ]
};

export default question;
