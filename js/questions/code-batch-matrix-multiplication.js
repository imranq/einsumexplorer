// Code-based question for batch matrix multiplication
const question = {
    description: "Simplify this batch matrix multiplication code using einsum:",
    difficulty: "hard",
    code: `// Batch matrix multiplication
const batchA = tf.tensor3d([
  [[1, 2], [3, 4]],
  [[5, 6], [7, 8]]
]);
const batchB = tf.tensor3d([
  [[9, 10], [11, 12]],
  [[13, 14], [15, 16]]
]);

// Current implementation
const batchSize = 2;
const result = tf.zeros([2, 2, 2]);
for (let b = 0; b < batchSize; b++) {
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let sum = 0;
      for (let k = 0; k < 2; k++) {
        sum += batchA.arraySync()[b][i][k] * batchB.arraySync()[b][k][j];
      }
      result.arraySync()[b][i][j] = sum;
    }
  }
}`,
    inputTensors: [
        { shape: [2, 2, 2], data: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]] },
        { shape: [2, 2, 2], data: [[[9, 10], [11, 12]], [[13, 14], [15, 16]]] }
    ],
    outputTensor: { shape: [2, 2, 2], data: [[[31, 34], [71, 78]], [[123, 134], [179, 196]]] },
    einsumString: "bij,bjk->bik",
    explanation: "Batch matrix multiplication can be expressed with einsum using 'bij,bjk->bik' where 'b' is the batch dimension, 'i' represents rows, 'j' is the shared dimension we sum over, and 'k' represents columns.",
    hint: "In batch operations, the batch dimension is preserved while the matrix multiplication happens for each item in the batch.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3, 2, 3], data: [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]], [[13, 14, 15], [16, 17, 18]]] },
                { shape: [3, 3, 2], data: [[[19, 20], [21, 22], [23, 24]], [[25, 26], [27, 28], [29, 30]], [[31, 32], [33, 34], [35, 36]]] }
            ],
            outputTensor: { shape: [3, 2, 2], data: [[[134, 140], [332, 347]], [[566, 593], [764, 800]], [[998, 1046], [1196, 1253]]] }
        },
        {
            inputTensors: [
                { shape: [2, 1, 4], data: [[[1, 2, 3, 4]], [[5, 6, 7, 8]]] },
                { shape: [2, 4, 3], data: [[[9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20]], [[21, 22, 23], [24, 25, 26], [27, 28, 29], [30, 31, 32]]] }
            ],
            outputTensor: { shape: [2, 1, 3], data: [[[150, 160, 170]], [[510, 534, 558]]] }
        }
    ]
};

export default question;
