// Centralized API base URL resolver for both browser and tests
export function getApiBaseUrl(): string {
  // Try Vite env via dynamic eval to avoid TS 'import.meta' error under Jest
  const viteUrl = (() => {
    try {
      // eslint-disable-next-line no-eval
      const meta: any = (0, eval)('import.meta');
      return meta?.env?.VITE_API_BASE_URL as string | undefined;
    } catch {
      return undefined;
    }
  })();

  return (
    viteUrl ||
    // Jest / Node tests
    (typeof process !== 'undefined' && (process as any).env?.VITE_API_BASE_URL) ||
    'http://localhost:3000'
  );
}

export const API_BASE_URL = getApiBaseUrl();

