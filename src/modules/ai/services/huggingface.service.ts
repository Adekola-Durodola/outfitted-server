import { Injectable } from '@nestjs/common';
import { HfInference } from '@huggingface/inference';
import { AppConfig } from '../../../app.config';

export interface ContentAnalysis {
  tags: string[];
  styles: string[];
  themes: string[];
  confidence: number;
}

export interface SimilarityResult {
  score: number;
  content: string;
}

@Injectable()
export class HuggingFaceService {
  private hf: HfInference;

  constructor() {
    const config = AppConfig();
    this.hf = new HfInference(config.HUGGING_FACE_TOKEN);
  }

  async analyzeContent(text: string): Promise<ContentAnalysis> {
    try {
      const [classificationResult, embeddingResult] = await Promise.all([
        this.classifyContent(text),
        this.generateEmbedding(text)
      ]);

      return {
        tags: classificationResult.tags,
        styles: classificationResult.styles,
        themes: classificationResult.themes,
        confidence: classificationResult.confidence
      };
    } catch (error) {
      console.error('Hugging Face analysis failed:', error);
      return this.getFallbackAnalysis();
    }
  }

  async findSimilarContent(query: string, contentList: string[]): Promise<SimilarityResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      const similarities: SimilarityResult[] = [];

      for (const content of contentList) {
        const contentEmbedding = await this.generateEmbedding(content);
        const similarity = this.calculateCosineSimilarity(queryEmbedding, contentEmbedding);
        
        similarities.push({
          score: similarity,
          content
        });
      }

      return similarities.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Similarity search failed:', error);
      return [];
    }
  }

  async generateUserPreferenceVector(userContent: string[]): Promise<number[]> {
    try {
      if (userContent.length === 0) return [];

      const embeddings = await Promise.all(
        userContent.map(content => this.generateEmbedding(content))
      );

      return this.averageEmbeddings(embeddings);
    } catch (error) {
      console.error('Preference vector generation failed:', error);
      return [];
    }
  }

  private async classifyContent(text: string): Promise<{ tags: string[], styles: string[], themes: string[], confidence: number }> {
    const fashionKeywords = [
      'streetstyle', 'ootd', 'fashion', 'style', 'vintage', 'minimal', 
      'casual', 'formal', 'bohemian', 'chic', 'elegant', 'trendy',
      'outfit', 'clothing', 'dress', 'shirt', 'pants', 'shoes', 'accessories'
    ];

    const styleCategories = [
      'streetwear', 'vintage', 'minimalist', 'bohemian', 'preppy', 
      'gothic', 'punk', 'retro', 'modern', 'classic'
    ];

    const themeCategories = [
      'workwear', 'casual', 'party', 'date', 'travel', 'sport', 
      'beach', 'winter', 'summer', 'spring', 'fall'
    ];

    const tags = this.extractKeywords(text, fashionKeywords);
    const styles = this.extractKeywords(text, styleCategories);
    const themes = this.extractKeywords(text, themeCategories);

    return {
      tags,
      styles,
      themes,
      confidence: Math.min((tags.length + styles.length + themes.length) / 10, 1)
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text
      });
      return result as number[];
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return new Array(384).fill(0);
    }
  }

  private extractKeywords(text: string, keywords: string[]): string[] {
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  private calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private averageEmbeddings(embeddings: number[][]): number[] {
    if (embeddings.length === 0) return [];

    const length = embeddings[0].length;
    const average = new Array(length).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < length; i++) {
        average[i] += embedding[i];
      }
    }

    for (let i = 0; i < length; i++) {
      average[i] /= embeddings.length;
    }

    return average;
  }

  private getFallbackAnalysis(): ContentAnalysis {
    return {
      tags: ['fashion', 'style'],
      styles: ['casual'],
      themes: ['everyday'],
      confidence: 0.1
    };
  }
}
