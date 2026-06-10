import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createClient, type DataCanvasClient } from "./client";

const DataCanvasContext = createContext<DataCanvasClient | null>(null);

export interface DataCanvasProviderProps {
  /** Base URL of the DataCanvas API, e.g. "/api/datacanvas". */
  baseUrl: string;
  /** Bring your own QueryClient if the app already uses TanStack Query. */
  queryClient?: QueryClient;
  children: ReactNode;
}

export function DataCanvasProvider({ baseUrl, queryClient, children }: DataCanvasProviderProps) {
  const [client] = useState(() => createClient(baseUrl));
  const [internalQueryClient] = useState(
    () =>
      queryClient ??
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <QueryClientProvider client={internalQueryClient}>
      <DataCanvasContext.Provider value={client}>{children}</DataCanvasContext.Provider>
    </QueryClientProvider>
  );
}

export function useDataCanvas(): DataCanvasClient {
  const client = useContext(DataCanvasContext);
  if (!client) {
    throw new Error("DataCanvas components must be rendered inside a <DataCanvasProvider>.");
  }
  return client;
}
