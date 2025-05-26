
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JobBasicInfo from "./JobBasicInfo";
import JobActions from "./JobActions";

interface JobManagementSectionProps {
  jobName: string;
  customerName: string;
  quoteBy: string;
  onJobNameChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onQuoteByChange: (value: string) => void;
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

const JobManagementSection: React.FC<JobManagementSectionProps> = ({
  jobName,
  customerName,
  quoteBy,
  onJobNameChange,
  onCustomerNameChange,
  onQuoteByChange,
  isNewJob,
  hasUnsavedChanges,
  canSave,
  onSave,
  onSaveAs,
  onCreateNew,
  onDelete,
  currentJobName,
  isSaving
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ข้อมูลงาน</CardTitle>
          <JobActions
            isNewJob={isNewJob}
            hasUnsavedChanges={hasUnsavedChanges}
            canSave={canSave}
            onSave={onSave}
            onSaveAs={onSaveAs}
            onCreateNew={onCreateNew}
            onDelete={onDelete}
            currentJobName={currentJobName}
            isSaving={isSaving}
          />
        </div>
      </CardHeader>
      <CardContent>
        <JobBasicInfo
          jobName={jobName}
          customerName={customerName}
          quoteBy={quoteBy}
          onJobNameChange={onJobNameChange}
          onCustomerNameChange={onCustomerNameChange}
          onQuoteByChange={onQuoteByChange}
        />
      </CardContent>
    </Card>
  );
};

export default JobManagementSection;
