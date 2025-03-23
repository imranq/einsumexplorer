// Code-based question for outer product
const question = {
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
    hint: "The outer product creates a matrix where each element is the product of elements from each vector.",
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
                { shape: [4], data: [1, 2, 3, 4] },
                { shape: [3], data: [5, 6, 7] }
            ],
            outputTensor: { shape: [4, 3], data: [[5, 6, 7], [10, 12, 14], [15, 18, 21], [20, 24, 28]] }
        }
    ]
};

export default question;
