// Perform a batch matrix multiplication
const question = {
    description: "Perform a batch matrix multiplication.",
    difficulty: "hard",
    inputTensors: [
        { shape: [2, 2, 3], data: [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]] },
        { shape: [2, 3, 4], data: [[[13, 14, 15, 16], [17, 18, 19, 20], [21, 22, 23, 24]], [[25, 26, 27, 28], [29, 30, 31, 32], [33, 34, 35, 36]]] }
    ],
    outputTensor: { shape: [2, 2, 4], data: [[[118, 124, 130, 136], [280, 298, 316, 334]], [[502, 536, 570, 604], [670, 716, 762, 808]]] },
    einsumString: "ijk,ikl->ijl",
    explanation: "The 'ijk,ikl->ijl' performs matrix multiplication for each batch. The 'k' dimension is summed over, while 'i' (batch), 'j' (row), and 'l' (column) remain in the output.",
    hint: "In batch operations, the batch dimension is preserved. For matrix multiplication, the inner dimensions are contracted (summed over).",
    // Additional test cases
    testCases: [
        {
            inputTensors: [
                { shape: [3, 2, 2], data: [[[1, 2], [3, 4]], [[5, 6], [7, 8]], [[9, 10], [11, 12]]] },
                { shape: [3, 2, 2], data: [[[13, 14], [15, 16]], [[17, 18], [19, 20]], [[21, 22], [23, 24]]] }
            ],
            outputTensor: { shape: [3, 2, 2], data: [[[43, 46], [99, 106]], [[147, 158], [211, 226]], [[251, 270], [323, 346]]] }
        },
        {
            inputTensors: [
                { shape: [2, 1, 3], data: [[[1, 2, 3]], [[4, 5, 6]]] },
                { shape: [2, 3, 2], data: [[[7, 8], [9, 10], [11, 12]], [[13, 14], [15, 16], [17, 18]]] }
            ],
            outputTensor: { shape: [2, 1, 2], data: [[[58, 64]], [[175, 190]]] }
        }
    ]
};

export default question;
