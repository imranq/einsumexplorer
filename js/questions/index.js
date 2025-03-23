// Import all questions
import sumAllElements from './sum-all-elements.js';
import matrixTrace from './matrix-trace.js';
import matrixVectorMultiply from './matrix-vector-multiply.js';
import dotProduct from './dot-product.js';
import matrixTranspose from './matrix-transpose.js';
import batchMatrixMultiplication from './batch-matrix-multiplication.js';
import outerProduct from './outer-product.js';
import sumMiddleAxis from './sum-middle-axis.js';
import extractDiagonal from './extract-diagonal.js';
import tensorContraction from './tensor-contraction.js';

// Import all code questions
import codeMatrixMultiplication from './code-matrix-multiplication.js';
import codeDotProduct from './code-dot-product.js';
import codeBatchMatrixMultiplication from './code-batch-matrix-multiplication.js';
import codeOuterProduct from './code-outer-product.js';
import codeMatrixTranspose from './code-matrix-transpose.js';
import codeDiagonalExtraction from './code-diagonal-extraction.js';
import codeMatrixRowSum from './code-matrix-row-sum.js';
import codeElementWiseMultiplication from './code-element-wise-multiplication.js';

// Import transformer questions
import { transformerQuestions } from './transformer/index.js';

// Standard questions
export const questions = [
    sumAllElements,
    matrixTrace,
    matrixVectorMultiply,
    dotProduct,
    matrixTranspose,
    batchMatrixMultiplication,
    outerProduct,
    sumMiddleAxis,
    extractDiagonal,
    tensorContraction
];

// Code questions
export const codeQuestions = [
    codeMatrixMultiplication,
    codeDotProduct,
    codeBatchMatrixMultiplication,
    codeOuterProduct,
    codeMatrixTranspose,
    codeDiagonalExtraction,
    codeMatrixRowSum,
    codeElementWiseMultiplication
];

// Export all questions combined
export const allQuestions = [...questions, ...codeQuestions, ...transformerQuestions];

// Export transformer questions separately
export { transformerQuestions };

// Default export for backward compatibility
export default questions;
