// Code-based question for matrix multiplication
const question = {
    description: "Simplify this matrix multiplication code using einsum:",
    difficulty: "medium",
    code: `// Matrix multiplication of A (2x3) and B (3x2)
const A = tf.tensor2d([[1, 2, 3], [4, 5, 6]]);
const B = tf.tensor2d([[7, 8], [9, 10], [11, 12]]);

// Current implementation
let result = tf.zeros([2, 2]);
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 2; j++) {
    let sum = 0;
    for (let k = 0; k < 3; k++) {
      sum += A.arraySync()[i][k] * B.arraySync()[k][j];
    }
    result.arraySync()[i][j] = sum;
  }
}`,
    inputTensors: [
        { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] },
        { shape: [3, 2], data: [[7, 8], [9, 10], [11, 12]] }
    ],
    outputTensor: { shape: [2, 2], data: [[58, 64], [139, 154]] },
    einsumString: "ik,kj->ij",
    explanation: "Matrix multiplication can be expressed with einsum using 'ik,kj->ij' where 'i' represents rows of the first matrix, 'k' is the shared dimension that we sum over, and 'j' represents columns of the second matrix.",
    hint: "In matrix multiplication, we sum over the shared dimension (columns of first matrix, rows of second matrix).",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3, 2], data: [[1, 2], [3, 4], [5, 6]] },
                { shape: [2, 4], data: [[7, 8, 9, 10], [11, 12, 13, 14]] }
            ],
            outputTensor: { shape: [3, 4], data: [[29, 32, 35, 38], [65, 72, 79, 86], [101, 112, 123, 134]] }
        },
        {
            inputTensors: [
                { shape: [2, 4], data: [[1, 2, 3, 4], [5, 6, 7, 8]] },
                { shape: [4, 3], data: [[9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20]] }
            ],
            outputTensor: { shape: [2, 3], data: [[150, 160, 170], [366, 392, 418]] }
        }
    ]
};

export default question;
