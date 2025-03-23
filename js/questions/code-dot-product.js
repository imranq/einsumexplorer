// Code-based question for dot product
const question = {
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
    hint: "For a dot product, we multiply corresponding elements and sum the results.",
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
                { shape: [5], data: [10, 20, 30, 40, 50] },
                { shape: [5], data: [1, 2, 3, 4, 5] }
            ],
            outputTensor: { shape: [], data: 550 }
        }
    ]
};

export default question;
