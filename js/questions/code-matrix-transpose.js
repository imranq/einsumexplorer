// Code-based question for matrix transpose
const question = {
    description: "Simplify this matrix transpose code using einsum:",
    difficulty: "easy",
    code: `// Matrix transpose
const matrix = tf.tensor2d([[1, 2, 3], [4, 5, 6]]);

// Current implementation
const rows = 2;
const cols = 3;
const transposed = tf.zeros([cols, rows]);
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    transposed.arraySync()[j][i] = matrix.arraySync()[i][j];
  }
}`,
    inputTensors: [
        { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] }
    ],
    outputTensor: { shape: [3, 2], data: [[1, 4], [2, 5], [3, 6]] },
    einsumString: "ij->ji",
    explanation: "Matrix transposition can be expressed with einsum using 'ij->ji' where we simply swap the order of indices in the output. This flips rows and columns.",
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
                { shape: [4, 1], data: [[1], [2], [3], [4]] }
            ],
            outputTensor: { shape: [1, 4], data: [[1, 2, 3, 4]] }
        }
    ]
};

export default question;
