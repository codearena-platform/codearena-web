"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface EditorErrorBoundaryProps {
  children: ReactNode;
}

interface EditorErrorBoundaryState {
  error: Error | null;
}

/** Keeps a Blockly/editor render failure from taking down the workspace. */
export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  state: EditorErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Editor render failed", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="p-4 border border-red-500/30 rounded bg-red-500/10 text-sm text-red-300">
        <p className="font-bold mb-1">The editor could not be displayed.</p>
        <p className="text-xs opacity-80 mb-3">{error.message}</p>
        <button
          type="button"
          className="px-3 py-1 border border-red-400 rounded text-xs hover:bg-red-400 hover:text-black"
          onClick={() => this.setState({ error: null })}
        >
          Retry
        </button>
      </div>
    );
  }
}
