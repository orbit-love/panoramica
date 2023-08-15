import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const ErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      fallback={
        <div className="p-6 text-red-500">Oops! Something went wrong.</div>
      }
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
