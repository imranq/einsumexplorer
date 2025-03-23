// Code-based question for transformer multi-head attention concatenation
const question = {
    description: "Simplify this multi-head attention concatenation in a transformer using einsum. We need to concatenate multiple attention heads:",
    difficulty: "hard",
    code: `// Concatenating multiple attention heads in a transformer
// Attention outputs from multiple heads: [num_heads, batch_size, seq_length, head_dim]
const headOutputs = tf.tensor4d([
  // Head 1
  [
    [[1, 2], [3, 4]],
    [[5, 6], [7, 8]]
  ],
  // Head 2
  [
    [[9, 10], [11, 12]],
    [[13, 14], [15, 16]]
  ],
  // Head 3
  [
    [[17, 18], [19, 20]],
    [[21, 22], [23, 24]]
  ]
]); // Shape: [3, 2, 2, 2]

// Current implementation (without einsum)
const numHeads = headOutputs.shape[0];
const batchSize = headOutputs.shape[1];
const seqLength = headOutputs.shape[2];
const headDim = headOutputs.shape[3];
const modelDim = numHeads * headDim;

// Initialize concatenated output tensor
let concatenatedOutput = tf.zeros([batchSize, seqLength, modelDim]);

// Concatenate head outputs
for (let b = 0; b < batchSize; b++) {
  for (let s = 0; s < seqLength; s++) {
    for (let h = 0; h < numHeads; h++) {
      for (let d = 0; d < headDim; d++) {
        const modelDimIndex = h * headDim + d;
        concatenatedOutput.arraySync()[b][s][modelDimIndex] = 
          headOutputs.arraySync()[h][b][s][d];
      }
    }
  }
}`,
    inputTensors: [
        { 
            shape: [3, 2, 2, 2], 
            data: [
                // Head 1
                [
                    [[1, 2], [3, 4]],
                    [[5, 6], [7, 8]]
                ],
                // Head 2
                [
                    [[9, 10], [11, 12]],
                    [[13, 14], [15, 16]]
                ],
                // Head 3
                [
                    [[17, 18], [19, 20]],
                    [[21, 22], [23, 24]]
                ]
            ] 
        }
    ],
    outputTensor: { 
        shape: [2, 2, 6], 
        data: [
            [
                [1, 2, 9, 10, 17, 18],
                [3, 4, 11, 12, 19, 20]
            ],
            [
                [5, 6, 13, 14, 21, 22],
                [7, 8, 15, 16, 23, 24]
            ]
        ] 
    },
    einsumString: "hbsd->bshd",
    explanation: "In transformer architectures, the outputs from multiple attention heads need to be concatenated. The einsum notation 'hbsd->bshd' represents this operation where 'h' is the head dimension, 'b' is the batch dimension, 's' is the sequence length, and 'd' is the head dimension. This operation rearranges the dimensions to prepare for concatenation along the head dimension. Note that einsum itself doesn't perform the concatenation - after this operation, you would reshape the tensor to combine the 'h' and 'd' dimensions to get the final concatenated output with shape [batch_size, seq_length, num_heads * head_dim].",
    hint: "This is primarily a dimension reordering operation. The dimensions involved are: head (h), batch (b), sequence length (s), and head dimension (d). You need to reorder these dimensions to prepare for concatenation along the head dimension.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { 
                    shape: [2, 1, 3, 2], 
                    data: [
                        // Head 1
                        [
                            [[1, 2], [3, 4], [5, 6]]
                        ],
                        // Head 2
                        [
                            [[7, 8], [9, 10], [11, 12]]
                        ]
                    ] 
                }
            ],
            outputTensor: { 
                shape: [1, 3, 4], 
                data: [
                    [
                        [1, 2, 7, 8],
                        [3, 4, 9, 10],
                        [5, 6, 11, 12]
                    ]
                ] 
            }
        }
    ]
};

export default question;
