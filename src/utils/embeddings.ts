// src/utils/embeddings.ts
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';

let extractor: any = null;

export const initEmbeddingModel = async () => {
  if (!extractor) {
    try {
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
        progress_callback: (progress: any) => {
          if (progress.status === 'progress') {
            console.log(`Loading model: ${Math.round(progress.progress)}%`);
          }
        },
      });
      console.log('Embedding model loaded');
    } catch (error) {
      console.error('Failed to load transformer model:', error);
      throw error;
    }
  }
  return extractor;
};

export const getEmbedding = async (text: string): Promise<Float32Array> => {
  const model = await initEmbeddingModel();
  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  });
  return output.data;
};

export const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const findSimilarServices = async (
  currentService: any,
  allServices: any[],
  limit: number = 4
): Promise<any[]> => {
  const currentText = `${currentService.name} ${currentService.description} ${currentService.category}`;
  const currentEmbedding = await getEmbedding(currentText);

  const similarities = await Promise.all(
    allServices
      .filter((s) => s.id !== currentService.id)
      .map(async (service) => {
        const serviceText = `${service.name} ${service.description} ${service.category}`;
        const embedding = await getEmbedding(serviceText);
        const similarity = cosineSimilarity(currentEmbedding, embedding);
        return { service, similarity };
      })
  );

  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, limit).map((item) => item.service);
};
