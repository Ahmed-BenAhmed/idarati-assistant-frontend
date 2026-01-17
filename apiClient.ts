import { StructuredResponse } from "./types";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

export interface AskRequest {
  prompt: string;
  match_threshold?: number;
  match_count?: number;
  embedding_model?: string;
}

export interface RetrieveResponse {
  results: any[];
  count: number;
}

export interface HealthResponse {
  status: string;
}

export const apiClient = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },

  async retrieve(request: AskRequest): Promise<RetrieveResponse> {
    const response = await fetch(`${API_BASE_URL}/retrieve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        match_threshold: request.match_threshold ?? 0.5,
        match_count: request.match_count ?? 3,
        embedding_model: request.embedding_model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Retrieve failed: ${response.statusText}`);
    }

    return response.json();
  },

  async ask(request: AskRequest): Promise<StructuredResponse> {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        match_threshold: request.match_threshold ?? 0.5,
        match_count: request.match_count ?? 5,
        embedding_model: request.embedding_model,
        "generation_provider": "qwen",
        "generation_model": "qwen"
      }),
    });

    if (!response.ok) {
      throw new Error(`Ask failed: ${response.statusText}`);
    }

    return response.json();
  },
};
