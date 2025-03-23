// Sum across the middle axis (reduction)
const question = {
    description: "Sum across the middle axis (reduction).",
    difficulty: "medium",
    inputTensors: [
        {
            shape: [2, 3, 4], data: [
                [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],
                [[13, 14, 15, 16], [17, 18, 19, 20], [21, 22, 23, 24]]
            ]
        }
    ],
    outputTensor: { shape: [2, 4], data: [[15, 18, 21, 24], [51, 54, 57, 60]] },
    einsumString: "ijk->ik",
    explanation: "The 'ijk->ik' string sums the elements along the second axis (j), resulting in a tensor with shape [2, 4]. Each element in the output is the sum of elements along the j axis.",
    hint: "Any index that appears in the input but not in the output is summed over.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                {
                    shape: [2, 2, 3], data: [
                        [[1, 2, 3], [4, 5, 6]],
                        [[7, 8, 9], [10, 11, 12]]
                    ]
                }
            ],
            outputTensor: { shape: [2, 3], data: [[5, 7, 9], [17, 19, 21]] }
        },
        {
            inputTensors: [
                {
                    shape: [3, 2, 2], data: [
                        [[1, 2], [3, 4]],
                        [[5, 6], [7, 8]],
                        [[9, 10], [11, 12]]
                    ]
                }
            ],
            outputTensor: { shape: [3, 2], data: [[4, 6], [12, 14], [20, 22]] }
        }
    ]
};

export default question;
