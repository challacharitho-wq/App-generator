import type { ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
  entityName?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive shadow-sm">
          <p className="text-sm font-medium">Something went wrong while rendering {this.props.entityName ?? "this view"}.</p>
          <p className="mt-2 text-sm opacity-90">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;