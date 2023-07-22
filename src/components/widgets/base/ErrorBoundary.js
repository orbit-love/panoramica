import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const WithErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-red-500">Oops! Something went wrong.</div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default WithErrorBoundary;
