// Code-based question for transformer value computation
const question = {
    description: "Simplify this value computation in a transformer using einsum. The value is computed by multiplying the input with a weight matrix:",
    difficulty: "medium",
    code: `// Computing value in a transformer
// Input shape: [batch_size, seq_length, embedding_dim]
const input = tf.tensor3d([
  [[1, 2, 3, 4], [5, 6, 7, 8]],
  [[9, 10, 11, 12], [13, 14, 15, 16]]
]); // Shape: [2, 2, 4]

// Value weight matrix shape: [embedding_dim, head_dim]
const W_v = tf.tensor2d([
  [0.1, 0.2, 0.3],
  [0.4, 0.5, 0.6],
  [0.7, 0.8, 0.9],
  [1.0, 1.1, 1.2]
]); // Shape: [4, 3]

// Current implementation (without einsum)
const batchSize = input.shape[0];
const seqLength = input.shape[1];
const embeddingDim = input.shape[2];
const headDim = W_v.shape[1];

// Initialize value tensor
let value = tf.zeros([batchSize, seqLength, headDim]);

// Compute value for each token in each batch
for (let b = 0; b < batchSize; b++) {
  for (let s = 0; s < seqLength; s++) {
    for (let h = 0; h < headDim; h++) {
      let sum = 0;
      for (let e = 0; e < embeddingDim; e++) {
        sum += input.arraySync()[b][s][e] * W_v.arraySync()[e][h];
      }
      value.arraySync()[b][s][h] = sum;
    }
  }
}`,
    inputTensors: [
        { 
            shape: [2, 2, 4], 
            data: [
                [[1, 2, 3, 4], [5, 6, 7, 8]],
                [[9, 10, 11, 12], [13, 14, 15, 16]]
            ] 
        },
        { 
            shape: [4, 3], 
            data: [
                [0.1, 0.2, 0.3],
                [0.4, 0.5, 0.6],
                [0.7, 0.8, 0.9],
                [1.0, 1.1, 1.2]
            ] 
        }
    ],
    outputTensor: { 
        shape: [2, 2, 3], 
        data: [
            [
                [5.0, 6.0, 7.0],
                [13.0, 15.4, 17.8]
            ],
            [
                [21.0, 24.8, 28.6],
                [29.0, 34.2, 39.4]
            ]
        ] 
    },
    einsumString: "bse,eh->bsh",
    explanation: "In transformer architectures, the value is computed similarly to the query and key, by multiplying the input tensor with a weight matrix. The einsum notation 'bse,eh->bsh' represents this operation where 'b' is the batch dimension, 's' is the sequence length, 'e' is the embedding dimension, and 'h' is the head dimension. We're summing over the embedding dimension 'e' to get the value representation for each token in the sequence.",
    hint: "The value computation follows the same pattern as query and key computations. Consider the dimensions: batch (b), sequence length (s), embedding dimension (e), and head dimension (h). You need to sum over the embedding dimension.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { 
                    shape: [1, 3, 2], 
                    data: [
                        [[1, 2], [3, 4], [5, 6]]
                    ] 
                },
                { 
                    shape: [2, 4], 
                    data: [
                        [0.1, 0.2, 0.3, 0.4],
                        [0.5, 0.6, 0.7, 0.8]
                    ] 
                }
            ],
            outputTensor: { 
                shape: [1, 3, 4], 
                data: [
                    [
                        [1.1, 1.4, 1.7, 2.0],
                        [3.1, 3.8, 4.5, 5.2],
                        [5.1, 6.2, 7.3, 8.4]
                    ]
                ] 
            }
        }
    ]
};

export default question;
