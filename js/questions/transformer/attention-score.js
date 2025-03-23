// Code-based question for transformer attention score computation
const question = {
    description: "Simplify this attention score computation in a transformer using einsum. The attention score is computed by multiplying query and key tensors:",
    difficulty: "hard",
    code: `// Computing attention scores in a transformer
// Query shape: [batch_size, seq_length, head_dim]
const query = tf.tensor3d([
  [[1, 2, 3], [4, 5, 6]],
  [[7, 8, 9], [10, 11, 12]]
]); // Shape: [2, 2, 3]

// Key shape: [batch_size, seq_length, head_dim]
const key = tf.tensor3d([
  [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
  [[0.7, 0.8, 0.9], [1.0, 1.1, 1.2]]
]); // Shape: [2, 2, 3]

// Current implementation (without einsum)
const batchSize = query.shape[0];
const querySeqLength = query.shape[1];
const keySeqLength = key.shape[1];
const headDim = query.shape[2];

// Initialize attention scores tensor
let attentionScores = tf.zeros([batchSize, querySeqLength, keySeqLength]);

// Compute attention scores
for (let b = 0; b < batchSize; b++) {
  for (let i = 0; i < querySeqLength; i++) {
    for (let j = 0; j < keySeqLength; j++) {
      let dotProduct = 0;
      for (let h = 0; h < headDim; h++) {
        dotProduct += query.arraySync()[b][i][h] * key.arraySync()[b][j][h];
      }
      attentionScores.arraySync()[b][i][j] = dotProduct;
    }
  }
}

// Scale the attention scores
const scalingFactor = Math.sqrt(headDim);
attentionScores = attentionScores.div(tf.scalar(scalingFactor));`,
    inputTensors: [
        { 
            shape: [2, 2, 3], 
            data: [
                [[1, 2, 3], [4, 5, 6]],
                [[7, 8, 9], [10, 11, 12]]
            ] 
        },
        { 
            shape: [2, 2, 3], 
            data: [
                [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
                [[0.7, 0.8, 0.9], [1.0, 1.1, 1.2]]
            ] 
        }
    ],
    outputTensor: { 
        shape: [2, 2, 2], 
        data: [
            [
                [1.4, 3.2],
                [3.2, 7.7]
            ],
            [
                [13.9, 19.5],
                [19.5, 27.3]
            ]
        ] 
    },
    einsumString: "bih,bjh->bij",
    explanation: "In transformer architectures, the attention score is computed by taking the dot product between query and key tensors. The einsum notation 'bih,bjh->bij' represents this operation where 'b' is the batch dimension, 'i' is the query sequence position, 'j' is the key sequence position, and 'h' is the head dimension. We're summing over the head dimension 'h' to get the attention score between each query-key pair. Note that in practice, we also scale the attention scores by dividing by the square root of the head dimension, but this scaling is not part of the einsum operation itself.",
    hint: "Think about how attention works: for each query token, we compute its similarity with every key token. The dimensions involved are: batch (b), query sequence position (i), key sequence position (j), and head dimension (h). You need to sum over the head dimension to get the dot product.",
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
                    shape: [1, 3, 2], 
                    data: [
                        [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]
                    ] 
                }
            ],
            outputTensor: { 
                shape: [1, 3, 3], 
                data: [
                    [
                        [0.5, 1.1, 1.7],
                        [1.3, 2.5, 3.7],
                        [2.1, 3.9, 5.7]
                    ]
                ] 
            }
        }
    ]
};

export default question;
