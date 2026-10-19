import axios from 'axios';

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown; title?: unknown } | undefined;
    if (typeof data?.detail === 'string' && data.detail.length > 0) {
      return data.detail;
    }
    if (typeof data?.title === 'string' && data.title.length > 0) {
      return data.title;
    }
    if (error.response?.status === 404) {
      return 'That recipe or user was not found.';
    }
    if (error.response?.status === 503) {
      return 'The recipe source is unavailable right now.';
    }
    return 'The recipe service could not complete that request.';
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'Something went wrong.';
}
