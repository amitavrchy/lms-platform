"use client";

import { Suspense, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { makeStore, type AppStore } from "@/store";
import { AuthBootstrap } from "./AuthBootstrap";

function ProvidersInner({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState<{
    store: AppStore;
    queryClient: QueryClient;
  } | null>(null);

  useEffect(() => {
    setReady({
      store: makeStore(),
      queryClient: new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    });
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-[14px] text-[var(--muted)]">
        Loading Learnora…
      </div>
    );
  }

  return (
    <Provider store={ready.store}>
      <QueryClientProvider client={ready.queryClient}>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: "14px",
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center text-[14px] text-[var(--muted)]">
          Loading Learnora…
        </div>
      }
    >
      <ProvidersInner>{children}</ProvidersInner>
    </Suspense>
  );
}
