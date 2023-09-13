import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const ErrorBoundary = ({ fallback, children }) => {
  fallback = fallback || (
    <div className="p-6 text-red-500">Oops! Something went wrong.</div>
  );
  return (
    <ReactErrorBoundary fallback={fallback}>{children}</ReactErrorBoundary>
  );
};

export default ErrorBoundary;
