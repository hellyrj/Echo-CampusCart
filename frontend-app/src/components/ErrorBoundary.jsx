import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <details className="text-left bg-gray-100 p-4 rounded-lg">
                            <summary className="cursor-pointer font-semibold">Error Details</summary>
                            <pre className="mt-2 text-sm text-gray-600">
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                                    <>
                                        <br />
                                        {this.state.errorInfo.componentStack}
                                    </>
                                )}
                            </pre>
                        </details>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
