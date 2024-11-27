import * as tf from '@tensorflow/tfjs';

export async function trainModel() {
  // Create a simple neural network
  const model = tf.sequential();
  
  model.add(tf.layers.dense({
    units: 4,
    inputShape: [2],
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid'
  }));

  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  // Generate training data
  const trainingData = tf.tensor2d([
    [1, 0], [0, 0], [1, 1], [0, 1],
    [1, 2], [0, 2], [1, 3], [0, 3],
    [1, 4], [0, 4], [1, 5], [0, 5],
    [1, 6], [0, 6], [1, 7], [0, 7],
    [1, 8], [0, 8], [1, 9], [0, 9]
  ]);

  // Labels: 1 for needing explanation, 0 for not needing
  const trainingLabels = tf.tensor2d([
    [0], [1], [0], [1],
    [0], [1], [0], [1],
    [0], [1], [0], [1],
    [0], [1], [0], [1],
    [0], [1], [0], [1]
  ]);

  // Train the model
  await model.fit(trainingData, trainingLabels, {
    epochs: 50,
    batchSize: 4
  });

  return model;
}