
import React from "react";

interface ValidationErrorProps {
  error: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 rounded relative mb-4">
      <div className="flex">
        <div className="py-1">
          <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-medium">ข้อผิดพลาด:</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default ValidationError;
