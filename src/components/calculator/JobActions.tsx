
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText, Trash2, Plus, Loader2 } from "lucide-react";

interface JobActionsProps {
  isNewJob: boolean;
  hasUnsavedChanges: boolean;
  canSave: boolean;
  onSave: () => void;
  onSaveAs: () => void;
  onCreateNew: () => void;
  onDelete?: () => void;
  currentJobName?: string;
  isSaving?: boolean;
}

const JobActions: React.FC<JobActionsProps> = ({
  isNewJob,
  hasUnsavedChanges,
  canSave,
  onSave,
  onSaveAs,
  onCreateNew,
  onDelete,
  currentJobName,
  isSaving = false
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={onSave}
        disabled={!canSave || isSaving}
        className="flex items-center gap-2"
        variant={hasUnsavedChanges ? "default" : "outline"}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isNewJob ? "บันทึกงาน" : `อัพเดท${hasUnsavedChanges ? " *" : ""}`}
      </Button>

      {!isNewJob && (
        <Button 
          onClick={onSaveAs}
          variant="outline"
          className="flex items-center gap-2"
          disabled={!canSave || isSaving}
        >
          <FileText className="h-4 w-4" />
          บันทึกเป็นงานใหม่
        </Button>
      )}

      <Button 
        onClick={onCreateNew}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        สร้างงานใหม่
      </Button>

      {!isNewJob && onDelete && (
        <Button 
          onClick={onDelete}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          ลบงาน
        </Button>
      )}

      {currentJobName && (
        <div className="flex items-center text-sm text-gray-600 px-2">
          งานปัจจุบัน: <span className="font-medium ml-1">{currentJobName}</span>
        </div>
      )}
    </div>
  );
};

export default JobActions;
