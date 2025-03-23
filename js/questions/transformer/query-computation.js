// Code-based question for transformer query computation
const question = {
    description: "Simplify this query computation in a transformer using einsum. The query is computed by multiplying the input with a weight matrix:",
    difficulty: "medium",
    code: `// Computing query in a transformer
// Input shape: [batch_size, seq_length, embedding_dim]
const input = tf.tensor3d([
  [[1, 2, 3, 4], [5, 6, 7, 8]],
  [[9, 10, 11, 12], [13, 14, 15, 16]]
]); // Shape: [2, 2, 4]

// Query weight matrix shape: [embedding_dim, head_dim]
const W_q = tf.tensor2d([
  [0.1, 0.2, 0.3],
  [0.4, 0.5, 0.6],
  [0.7, 0.8, 0.9],
  [1.0, 1.1, 1.2]
]); // Shape: [4, 3]

// Current implementation (without einsum)
const batchSize = input.shape[0];
const seqLength = input.shape[1];
const embeddingDim = input.shape[2];
const headDim = W_q.shape[1];

// Initialize query tensor
let query = tf.zeros([batchSize, seqLength, headDim]);

// Compute query for each token in each batch
for (let b = 0; b < batchSize; b++) {
  for (let s = 0; s < seqLength; s++) {
    for (let h = 0; h < headDim; h++) {
      let sum = 0;
      for (let e = 0; e < embeddingDim; e++) {
        sum += input.arraySync()[b][s][e] * W_q.arraySync()[e][h];
      }
      query.arraySync()[b][s][h] = sum;
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
    explanation: "In transformer architectures, the query is computed by multiplying the input tensor with a weight matrix. The einsum notation 'bse,eh->bsh' represents this operation where 'b' is the batch dimension, 's' is the sequence length, 'e' is the embedding dimension, and 'h' is the head dimension. We're essentially doing a matrix multiplication for each token in each batch, where we sum over the embedding dimension 'e'.",
    hint: "Think about the dimensions involved: batch (b), sequence length (s), embedding dimension (e), and head dimension (h). The query computation involves summing over the embedding dimension.",
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
