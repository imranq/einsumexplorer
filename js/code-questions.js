// Code-based questions for Einsum Explorer
const codeQuestions = [
    {
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
        hint: "In matrix multiplication, we sum over the shared dimension (columns of first matrix, rows of second matrix)."
    },
    {
        description: "Simplify this dot product calculation using einsum:",
        difficulty: "easy",
        code: `// Dot product of two vectors
const v1 = tf.tensor1d([1, 2, 3]);
const v2 = tf.tensor1d([4, 5, 6]);

// Current implementation
let dotProduct = 0;
for (let i = 0; i < 3; i++) {
  dotProduct += v1.arraySync()[i] * v2.arraySync()[i];
}`,
        inputTensors: [
            { shape: [3], data: [1, 2, 3] },
            { shape: [3], data: [4, 5, 6] }
        ],
        outputTensor: { shape: [], data: 32 },
        einsumString: "i,i->",
        explanation: "The dot product of two vectors can be expressed with einsum using 'i,i->' where 'i' is the index we sum over. Since no indices appear after the arrow, we get a scalar result.",
        hint: "For a dot product, we multiply corresponding elements and sum the results."
    },
    {
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
        hint: "In batch operations, the batch dimension is preserved while the matrix multiplication happens for each item in the batch."
    },
    {
        description: "Simplify this outer product calculation using einsum:",
        difficulty: "medium",
        code: `// Outer product of two vectors
const v1 = tf.tensor1d([1, 2]);
const v2 = tf.tensor1d([3, 4, 5]);

// Current implementation
const result = tf.zeros([2, 3]);
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < 3; j++) {
    result.arraySync()[i][j] = v1.arraySync()[i] * v2.arraySync()[j];
  }
}`,
        inputTensors: [
            { shape: [2], data: [1, 2] },
            { shape: [3], data: [3, 4, 5] }
        ],
        outputTensor: { shape: [2, 3], data: [[3, 4, 5], [6, 8, 10]] },
        einsumString: "i,j->ij",
        explanation: "The outer product of two vectors can be expressed with einsum using 'i,j->ij' where 'i' and 'j' are the indices of the input vectors. This creates a new matrix where each element is the product of the corresponding elements from each vector.",
        hint: "The outer product creates a matrix where each element is the product of elements from each vector."
    },
    {
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
        hint: "To transpose a matrix, simply swap the order of indices after the arrow."
    },
    {
        description: "Simplify this diagonal extraction code using einsum:",
        difficulty: "medium",
        code: `// Extract diagonal elements from a matrix
const matrix = tf.tensor2d([
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
]);

// Current implementation
const size = 4;
const diagonal = tf.zeros([size]);
for (let i = 0; i < size; i++) {
  diagonal.arraySync()[i] = matrix.arraySync()[i][i];
}`,
        inputTensors: [
            { shape: [4, 4], data: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]] }
        ],
        outputTensor: { shape: [4], data: [1, 6, 11, 16] },
        einsumString: "ii->i",
        explanation: "Extracting diagonal elements can be expressed with einsum using 'ii->i' where the repeated index 'i' indicates we're only considering elements where row and column indices are equal.",
        hint: "Using the same index twice in input but once in output extracts diagonal elements without summing them."
    },
    {
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
        hint: "When an index appears in the input but not in the output, it is summed over."
    },
    {
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
        hint: "When the same indices appear in both inputs and the output, we're doing element-wise operations."
    }
];

export default codeQuestions;
