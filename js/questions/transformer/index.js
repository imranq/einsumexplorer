// Import all transformer-related questions
import queryComputation from './query-computation.js';
import keyComputation from './key-computation.js';
import valueComputation from './value-computation.js';
import attentionScore from './attention-score.js';
import attentionOutput from './attention-output.js';
import multiheadConcat from './multihead-concat.js';
import feedForward from './feed-forward.js';

// Export the transformer questions in a logical sequence
export const transformerQuestions = [
    queryComputation,
    keyComputation,
    valueComputation,
    attentionScore,
    attentionOutput,
    multiheadConcat,
    feedForward
];

export default transformerQuestions;
