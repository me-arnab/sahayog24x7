import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#fee2e2', borderRadius: '8px', margin: '20px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong.</h1>
          <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
