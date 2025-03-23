// Tensor contraction (generalized matrix multiplication)
const question = {
    description: "Tensor contraction (generalized matrix multiplication)",
    difficulty: "hard",
    inputTensors: [
        {
            shape: [2, 3, 4], data: [
                [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],
                [[13, 14, 15, 16], [17, 18, 19, 20], [21, 22, 23, 24]]
            ]
        },
        {
            shape: [4, 3, 2], data: [
                [[25, 26], [27, 28], [29, 30]],
                [[31, 32], [33, 34], [35, 36]],
                [[37, 38], [39, 40], [41, 42]],
                [[43, 44], [45, 46], [47, 48]]
            ]
        }
    ],
    outputTensor: { shape: [2, 2], data: [[3302, 3392], [8878, 9136]] },
    einsumString: "ijk,kjl->il",
    explanation: "The 'ijk,kjl->il' string performs a contraction over the 'j' and 'k' indices, which appear in both tensors. The 'i' and 'l' indices remain in the output.",
    hint: "In tensor contraction, indices that appear in both input tensors are summed over. The remaining indices form the output shape.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                {
                    shape: [2, 2, 3], data: [
                        [[1, 2, 3], [4, 5, 6]],
                        [[7, 8, 9], [10, 11, 12]]
                    ]
                },
                {
                    shape: [3, 2, 2], data: [
                        [[13, 14], [15, 16]],
                        [[17, 18], [19, 20]],
                        [[21, 22], [23, 24]]
                    ]
                }
            ],
            outputTensor: { shape: [2, 2], data: [[312, 330], [780, 834]] }
        },
        {
            inputTensors: [
                {
                    shape: [3, 2, 2], data: [
                        [[1, 2], [3, 4]],
                        [[5, 6], [7, 8]],
                        [[9, 10], [11, 12]]
                    ]
                },
                {
                    shape: [2, 2, 3], data: [
                        [[13, 14, 15], [16, 17, 18]],
                        [[19, 20, 21], [22, 23, 24]]
                    ]
                }
            ],
            outputTensor: { shape: [3, 3], data: [[103, 110, 117], [247, 262, 277], [391, 414, 437]] }
        }
    ]
};

export default question;
