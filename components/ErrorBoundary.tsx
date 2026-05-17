"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary for the entire app
 */
export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-specific Error Boundary
 * Wraps individual components with error handling
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    if (resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, i) => key !== prevProps.resetKeys?.[i]
      );
      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <Bug className="h-4 w-4" />
            <span className="font-medium">Component Error</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {this.state.error?.message || "An error occurred"}
          </p>
          <Button size="sm" variant="outline" onClick={this.reset}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for data fetching
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  loading?: ReactNode;
  error?: ReactNode;
}

interface AsyncErrorBoundaryState {
  loading: boolean;
  error: Error | null;
}

export class AsyncErrorBoundary extends Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = { loading: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return { loading: false, error };
  }

  reset = (): void => {
    this.setState({ loading: false, error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.error) {
        return this.props.error;
      }

      return (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground mb-3">
            Failed to load content
          </p>
          <Button size="sm" onClick={this.reset}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (this.state.loading) {
      return (
        this.props.loading || (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Suspense-like loading wrapper
 */
export function LoadingWrapper({
  loading,
  children,
}: {
  loading?: ReactNode;
  children: ReactNode;
}) {
  return <>{children}</>;
}