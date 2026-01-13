import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, AskRequest } from "../apiClient";

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: apiClient.checkHealth,
    refetchInterval: 30000, // Check health every 30 seconds
    retry: 3,
  });
};

export const useRetrieve = () => {
  return useMutation({
    mutationFn: (request: AskRequest) => apiClient.retrieve(request),
  });
};

export const useAsk = () => {
  return useMutation({
    mutationFn: (request: AskRequest) => apiClient.ask(request),
  });
};
