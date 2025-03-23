// Extract the diagonal elements of a matrix
const question = {
    description: "Extract the diagonal elements of a matrix.",
    difficulty: "medium",
    inputTensors: [
        {
            shape: [4, 4], data: [
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]
        }
    ],
    outputTensor: { shape: [4], data: [1, 6, 11, 16] },
    einsumString: "ii->i",
    explanation: "The 'ii->i' extracts the elements where the row and column indices are equal (the diagonal). Unlike 'ii->' which sums these elements, 'ii->i' keeps them as a vector.",
    hint: "Using the same index twice in input but once in output extracts diagonal elements without summing them.",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                {
                    shape: [3, 3], data: [
                        [10, 20, 30],
                        [40, 50, 60],
                        [70, 80, 90]
                    ]
                }
            ],
            outputTensor: { shape: [3], data: [10, 50, 90] }
        },
        {
            inputTensors: [
                {
                    shape: [5, 5], data: [
                        [1, 0, 0, 0, 0],
                        [0, 2, 0, 0, 0],
                        [0, 0, 3, 0, 0],
                        [0, 0, 0, 4, 0],
                        [0, 0, 0, 0, 5]
                    ]
                }
            ],
            outputTensor: { shape: [5], data: [1, 2, 3, 4, 5] }
        }
    ]
};

export default question;
