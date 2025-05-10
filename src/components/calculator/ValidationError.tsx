
import React from "react";

interface ValidationErrorProps {
  error: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
      <span className="font-medium">ข้อผิดพลาด: </span>
      {error}
    </div>
  );
};

export default ValidationError;
