import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="absolute bottom-8 right-8 z-20 w-96 p-6 hud-glass flex flex-col h-[400px] pointer-events-auto border border-[#ff3366]/40 text-center justify-center items-center">
          <div className="w-12 h-12 rounded-full bg-[#ff3366]/10 flex items-center justify-center mb-4 border border-[#ff3366]/30">
            <span className="text-[#ff3366] text-xl font-bold">!</span>
          </div>
          <h2 className="text-sm font-black tracking-widest uppercase text-white mb-2">Cognitive Fault Detected</h2>
          <p className="text-[10px] font-mono opacity-60 text-[#ff3366] mb-4">Agent Herald Subsystem Crashed</p>
          <div className="text-[9px] font-mono bg-black/40 p-2 rounded border border-white/5 max-h-24 overflow-y-auto text-left w-full text-white/50 mb-4">
            {this.state.error?.message || 'Unknown cognitive exception'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-[#ff3366]/20 hover:bg-[#ff3366]/30 text-white rounded text-[9px] uppercase font-bold tracking-widest border border-[#ff3366]/40 transition-all"
          >
            Re-Initialize Core
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
