import * as tf from '@tensorflow/tfjs';

export function ComputeSMA(data: any[], window_size: number) {
    let r_avgs = [], avg_prev = 0;
    for (let i = 0; i <= data.length - window_size; i++) {
        let curr_avg = 0.00, t = i + window_size;
        for (let k = i; k < t && k <= data.length; k++) {
            curr_avg += data[k]['downloads'] / window_size;
        }
        r_avgs.push({ set: data.slice(i, i + window_size), avg: curr_avg });
        avg_prev = curr_avg;
    }
    return r_avgs;
}

export function makePrediction(X: any, model: tf.LayersModel, dict_normalize: any) {
    console.log()
    X = tf.tensor2d(X, [X.length, X[0].length]);

    const normalizedInput = normalizeTensor(X, tf.tensor(dict_normalize["inputMax"]), tf.tensor(dict_normalize["inputMin"]));
    const model_out = model.predict(normalizedInput);
    const predictedResults = unNormalizeTensor(model_out as any, tf.tensor(dict_normalize["labelMax"]), tf.tensor(dict_normalize["labelMin"]));

    return Array.from(predictedResults.dataSync());
}

function normalizeTensorFit(tensor: tf.Tensor) {
    const maxval = tensor.max();
    const minval = tensor.min();
    const normalizedTensor = normalizeTensor(tensor, maxval, minval);
    return [normalizedTensor, maxval, minval];
}

function normalizeTensor(tensor: tf.Tensor, maxval: tf.Tensor, minval: tf.Tensor) {
    const normalizedTensor = tensor.sub(minval).div(maxval.sub(minval));
    return normalizedTensor;
}

function unNormalizeTensor(tensor: tf.Tensor, maxval: tf.Tensor, minval: tf.Tensor) {
    const unNormTensor = tensor.mul(maxval.sub(minval)).add(minval);
    return unNormTensor;
}