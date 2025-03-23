// Questions with difficulty levels
const questions = [
    {
        description: "Sum all elements of the matrix.",
        difficulty: "easy",
        inputTensors: [
            { shape: [3, 3], data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }
        ],
        outputTensor: { shape: [], data: 45 },
        einsumString: "ij->",
        explanation: "The 'ij->' string means that we are summing over both the i and j indices. This results in a scalar value containing the sum of all elements.",
        hint: "When no indices appear after the arrow, all indices are summed over."
    },
    {
        description: "Compute the trace of the matrix (sum of diagonal elements).",
        difficulty: "easy",
        inputTensors: [
            { shape: [3, 3], data: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }
        ],
        outputTensor: { shape: [], data: 15 },
        einsumString: "ii->",
        explanation: "The 'ii->' string means that we are summing over the diagonal elements (where the row and column indices are the same). In this case: 1 + 5 + 9 = 15.",
        hint: "When the same index appears twice in the input, it means we're only considering elements where those dimensions are equal (the diagonal)."
    },
    {
        description: "Multiply a matrix by a vector.",
        difficulty: "medium",
        inputTensors: [
            { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] },
            { shape: [3], data: [7, 8, 9] }
        ],
        outputTensor: { shape: [2], data: [50, 122] },
        einsumString: "ij,j->i",
        explanation: "The 'ij,j->i' string performs matrix-vector multiplication. The 'j' index appears in both the matrix and vector and is summed over, while the 'i' index remains in the output.",
        hint: "For matrix-vector multiplication, the shared dimension is summed over, and the other dimension remains."
    },
    {
        description: "Compute the dot product of two vectors.",
        difficulty: "easy",
        inputTensors: [
            { shape: [3], data: [1, 2, 3] },
            { shape: [3], data: [4, 5, 6] }
        ],
        outputTensor: { shape: [], data: 32 },
        einsumString: "i,i->",
        explanation: "The 'i,i->' string computes the dot product by summing the element-wise products of the two vectors: (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32.",
        hint: "The dot product multiplies corresponding elements and sums the results. No indices remain after the arrow."
    },
    {
        description: "Transpose the matrix.",
        difficulty: "easy",
        inputTensors: [
            { shape: [2, 3], data: [[1, 2, 3], [4, 5, 6]] },
        ],
        outputTensor: { shape: [3, 2], data: [[1, 4], [2, 5], [3, 6]] },
        einsumString: "ij->ji",
        explanation: "The 'ij->ji' string swaps the axes of the matrix, effectively transposing it. The first dimension becomes the second, and vice versa.",
        hint: "To transpose a matrix, simply swap the order of indices after the arrow."
    },
    {
        description: "Perform a batch matrix multiplication.",
        difficulty: "hard",
        inputTensors: [
            { shape: [2, 2, 3], data: [[[1, 2, 3], [4, 5, 6]], [[7, 8, 9], [10, 11, 12]]] },
            { shape: [2, 3, 4], data: [[[13, 14, 15, 16], [17, 18, 19, 20], [21, 22, 23, 24]], [[25, 26, 27, 28], [29, 30, 31, 32], [33, 34, 35, 36]]] }
        ],
        outputTensor: { shape: [2, 2, 4], data: [[[118, 124, 130, 136], [280, 298, 316, 334]], [[502, 536, 570, 604], [670, 716, 762, 808]]] },
        einsumString: "ijk,ikl->ijl",
        explanation: "The 'ijk,ikl->ijl' performs matrix multiplication for each batch. The 'k' dimension is summed over, while 'i' (batch), 'j' (row), and 'l' (column) remain in the output.",
        hint: "In batch operations, the batch dimension is preserved. For matrix multiplication, the inner dimensions are contracted (summed over)."
    },
    {
        description: "Compute the outer product of two vectors.",
        difficulty: "medium",
        inputTensors: [
            { shape: [2], data: [1, 2] },
            { shape: [3], data: [3, 4, 5] },
        ],
        outputTensor: { shape: [2, 3], data: [[3, 4, 5], [6, 8, 10]] },
        einsumString: "i,j->ij",
        explanation: "The 'i,j->ij' string computes the outer product where each element in the first vector is multiplied by each element in the second vector, creating a matrix.",
        hint: "The outer product creates a new dimension for each input dimension, with no summing."
    },
    {
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
        hint: "Any index that appears in the input but not in the output is summed over."
    },
    {
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
        hint: "Using the same index twice in input but once in output extracts diagonal elements without summing them."
    },
    {
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
        hint: "In tensor contraction, indices that appear in both input tensors are summed over. The remaining indices form the output shape."
    }
];

export default questions;
