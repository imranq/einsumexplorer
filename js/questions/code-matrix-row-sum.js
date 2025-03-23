// Code-based question for matrix row sum
const question = {
    description: "Simplify this matrix row sum code using einsum:",
    difficulty: "medium",
    code: `// Sum each row of a matrix
const matrix = tf.tensor2d([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]);

// Current implementation
const rows = 3;
const cols = 3;
const rowSums = tf.zeros([rows]);
for (let i = 0; i < rows; i++) {
  let sum = 0;
  for (let j = 0; j < cols; j++) {
    sum += matrix.arraySync()[i][j];
  }
  rowSums.arraySync()[i] = sum;
}`,
    inputTensors: [
        { shape: [3, 3], data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }
    ],
    outputTensor: { shape: [3], data: [6, 15, 24] },
    einsumString: "ij->i",
    explanation: "Summing each row can be expressed with einsum using 'ij->i' where 'j' is summed over (since it doesn't appear in the output) and 'i' is kept.",
    hint: "When an index appears in the input but not in the output, it is summed over.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [2, 4], data: [[1, 2, 3, 4], [5, 6, 7, 8]] }
            ],
            outputTensor: { shape: [2], data: [10, 26] }
        },
        {
            inputTensors: [
                { shape: [4, 2], data: [[10, 20], [30, 40], [50, 60], [70, 80]] }
            ],
            outputTensor: { shape: [4], data: [30, 70, 110, 150] }
        }
    ]
};

export default question;
