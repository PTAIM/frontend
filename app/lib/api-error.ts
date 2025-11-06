import axios from "axios";

/**
 * Função utilitária para extrair a mensagem de erro real
 * de uma exceção do Axios.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const backendDetail = error.response.data?.detail;
      const backendMessage = error.response.data?.message;

      return (
        backendDetail ||
        backendMessage ||
        `Erro ${error.response.status}: ${error.response.statusText}`
      );
    } else if (error.request) {
      return "Erro de rede. Por favor, verifique sua conexão.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}
