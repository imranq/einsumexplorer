// Code-based question for transformer feed-forward network computation
const question = {
    description: "Simplify this feed-forward network computation in a transformer using einsum. The feed-forward network applies two linear transformations with a ReLU activation in between:",
    difficulty: "medium",
    code: `// Feed-forward network in a transformer
// Input shape: [batch_size, seq_length, model_dim]
const input = tf.tensor3d([
  [[1, 2, 3, 4], [5, 6, 7, 8]],
  [[9, 10, 11, 12], [13, 14, 15, 16]]
]); // Shape: [2, 2, 4]

// First weight matrix: [model_dim, ff_dim]
const W1 = tf.tensor2d([
  [0.1, 0.2],
  [0.3, 0.4],
  [0.5, 0.6],
  [0.7, 0.8]
]); // Shape: [4, 2]

// Second weight matrix: [ff_dim, model_dim]
const W2 = tf.tensor2d([
  [0.1, 0.2, 0.3, 0.4],
  [0.5, 0.6, 0.7, 0.8]
]); // Shape: [2, 4]

// Current implementation (without einsum)
const batchSize = input.shape[0];
const seqLength = input.shape[1];
const modelDim = input.shape[2];
const ffDim = W1.shape[1];

// First linear transformation
let intermediate = tf.zeros([batchSize, seqLength, ffDim]);
for (let b = 0; b < batchSize; b++) {
  for (let s = 0; s < seqLength; s++) {
    for (let f = 0; f < ffDim; f++) {
      let sum = 0;
      for (let m = 0; m < modelDim; m++) {
        sum += input.arraySync()[b][s][m] * W1.arraySync()[m][f];
      }
      intermediate.arraySync()[b][s][f] = sum;
    }
  }
}

// Apply ReLU activation
intermediate = tf.relu(intermediate);

// Second linear transformation
let output = tf.zeros([batchSize, seqLength, modelDim]);
for (let b = 0; b < batchSize; b++) {
  for (let s = 0; s < seqLength; s++) {
    for (let m = 0; m < modelDim; m++) {
      let sum = 0;
      for (let f = 0; f < ffDim; f++) {
        sum += intermediate.arraySync()[b][s][f] * W2.arraySync()[f][m];
      }
      output.arraySync()[b][s][m] = sum;
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
            shape: [4, 2], 
            data: [
                [0.1, 0.2],
                [0.3, 0.4],
                [0.5, 0.6],
                [0.7, 0.8]
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
        shape: [2, 2, 4], 
        data: [
            [
                [1.5, 1.8, 2.1, 2.4],
                [4.3, 5.2, 6.1, 7.0]
            ],
            [
                [7.1, 8.6, 10.1, 11.6],
                [9.9, 12.0, 14.1, 16.2]
            ]
        ] 
    },
    einsumString: "bsm,mf->bsf",
    explanation: "In transformer architectures, the feed-forward network consists of two linear transformations with a ReLU activation in between. The first linear transformation can be expressed with the einsum notation 'bsm,mf->bsf' where 'b' is the batch dimension, 's' is the sequence length, 'm' is the model dimension, and 'f' is the feed-forward dimension. We're summing over the model dimension 'm' to get the intermediate representation. After applying ReLU, the second linear transformation would use 'bsf,fm->bsm' to transform back to the model dimension.",
    hint: "The feed-forward network has two linear transformations. Focus on the first one for this question. The dimensions involved are: batch (b), sequence length (s), model dimension (m), and feed-forward dimension (f). You need to sum over the model dimension 'm' for the first transformation.",
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
                    shape: [2, 3], 
                    data: [
                        [0.1, 0.2, 0.3],
                        [0.4, 0.5, 0.6]
                    ] 
                },
                { 
                    shape: [3, 2], 
                    data: [
                        [0.1, 0.2],
                        [0.3, 0.4],
                        [0.5, 0.6]
                    ] 
                }
            ],
            outputTensor: { 
                shape: [1, 3, 2], 
                data: [
                    [
                        [0.9, 1.2],
                        [2.1, 2.8],
                        [3.3, 4.4]
                    ]
                ] 
            }
        }
    ]
};

export default question;
