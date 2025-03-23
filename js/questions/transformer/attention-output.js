// Code-based question for transformer attention output computation
const question = {
    description: "Simplify this attention output computation in a transformer using einsum. The attention output is computed by multiplying attention weights with value tensors:",
    difficulty: "hard",
    code: `// Computing attention output in a transformer
// Attention weights shape: [batch_size, query_seq_length, key_seq_length]
const attentionWeights = tf.tensor3d([
  [[0.6, 0.4], [0.3, 0.7]],
  [[0.8, 0.2], [0.1, 0.9]]
]); // Shape: [2, 2, 2]

// Value shape: [batch_size, value_seq_length, head_dim]
const value = tf.tensor3d([
  [[1, 2, 3], [4, 5, 6]],
  [[7, 8, 9], [10, 11, 12]]
]); // Shape: [2, 2, 3]

// Current implementation (without einsum)
const batchSize = attentionWeights.shape[0];
const querySeqLength = attentionWeights.shape[1];
const valueSeqLength = value.shape[1];
const headDim = value.shape[2];

// Initialize attention output tensor
let attentionOutput = tf.zeros([batchSize, querySeqLength, headDim]);

// Compute attention output
for (let b = 0; b < batchSize; b++) {
  for (let i = 0; i < querySeqLength; i++) {
    for (let h = 0; h < headDim; h++) {
      let weightedSum = 0;
      for (let j = 0; j < valueSeqLength; j++) {
        weightedSum += attentionWeights.arraySync()[b][i][j] * value.arraySync()[b][j][h];
      }
      attentionOutput.arraySync()[b][i][h] = weightedSum;
    }
  }
}`,
    inputTensors: [
        { 
            shape: [2, 2, 2], 
            data: [
                [[0.6, 0.4], [0.3, 0.7]],
                [[0.8, 0.2], [0.1, 0.9]]
            ] 
        },
        { 
            shape: [2, 2, 3], 
            data: [
                [[1, 2, 3], [4, 5, 6]],
                [[7, 8, 9], [10, 11, 12]]
            ] 
        }
    ],
    outputTensor: { 
        shape: [2, 2, 3], 
        data: [
            [
                [2.2, 3.2, 4.2],
                [3.1, 4.1, 5.1]
            ],
            [
                [7.6, 8.6, 9.6],
                [9.7, 10.7, 11.7]
            ]
        ] 
    },
    einsumString: "bij,bjh->bih",
    explanation: "In transformer architectures, the attention output is computed by taking the weighted sum of value vectors, where the weights are the attention weights. The einsum notation 'bij,bjh->bih' represents this operation where 'b' is the batch dimension, 'i' is the query sequence position, 'j' is the key/value sequence position, and 'h' is the head dimension. We're summing over the 'j' dimension to get the weighted sum of value vectors for each query position.",
    hint: "Think about how attention works: for each query token, we compute a weighted sum of value vectors, where the weights come from the attention weights. The dimensions involved are: batch (b), query sequence position (i), key/value sequence position (j), and head dimension (h). You need to sum over the key/value sequence position 'j'.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { 
                    shape: [1, 3, 3], 
                    data: [
                        [
                            [0.1, 0.2, 0.7],
                            [0.4, 0.5, 0.1],
                            [0.3, 0.3, 0.4]
                        ]
                    ] 
                },
                { 
                    shape: [1, 3, 2], 
                    data: [
                        [
                            [1, 2],
                            [3, 4],
                            [5, 6]
                        ]
                    ] 
                }
            ],
            outputTensor: { 
                shape: [1, 3, 2], 
                data: [
                    [
                        [4.2, 5.2],
                        [2.6, 3.6],
                        [3.5, 4.5]
                    ]
                ] 
            }
        }
    ]
};

export default question;
