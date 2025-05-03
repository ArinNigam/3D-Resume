"use client";
import LoadingFallback from '@/components/LoadingFallback';
import { FullResume } from '@/components/resume/FullResume';
import { EditResume } from '@/components/resume/editing/EditResume';
import { useUserActions } from '@/hooks/useUserActions';
import { ResumeData } from '@/lib/server/redisActions';
import { getSelfSoUrl } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Eye, Edit, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { toast } from 'sonner';

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { user } = useUser();
  const {
    resumeQuery,
    toggleStatusMutation,
    usernameQuery,
    saveResumeDataMutation,
  } = useUserActions();
  const [showModalSiteLive, setModalSiteLive] = useState(false);
  const [localResumeData, setLocalResumeData] = useState<ResumeData>();
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);

  useEffect(() => {
    if (resumeQuery.data?.resume?.resumeData) {
      setLocalResumeData(resumeQuery.data?.resume?.resumeData);
    }
  }, [resumeQuery.data?.resume?.resumeData]);

  console.log('resumeQuery', resumeQuery.data);

  const handleSaveChanges = async () => {
    if (!localResumeData) {
      toast.error('No resume data to save');
      return;
    }

    try {
      await saveResumeDataMutation.mutateAsync(localResumeData);
      toast.success('Changes saved successfully');
      setHasUnsavedChanges(false);
      setIsEditMode(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to save changes: ${error.message}`);
      } else {
        toast.error('Failed to save changes');
      }
    }
  };

  const handleDiscardChanges = () => {
    // Show confirmation dialog instead of immediately discarding
    setShowDiscardConfirmation(true);
  };

  const confirmDiscardChanges = () => {
    // Reset to original data
    if (resumeQuery.data?.resume?.resumeData) {
      setLocalResumeData(resumeQuery.data?.resume?.resumeData);
    }
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setShowDiscardConfirmation(false);
    toast.info('Changes discarded');
  };

  const handleResumeChange = (newResume: ResumeData) => {
    setLocalResumeData(newResume);
    setHasUnsavedChanges(true);
  };

  if (
    resumeQuery.isLoading ||
    usernameQuery.isLoading ||
    !usernameQuery.data ||
    !localResumeData
  ) {
    return <LoadingFallback message="Loading..." />;
  }

  const CustomLiveToast = () => (
    <div className="w-fit min-w-[360px] h-[44px] items-center justify-between relative rounded-md bg-[#eaffea] border border-[#009505] shadow-md flex flex-row gap-2 px-2">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
        preserveAspectRatio="none"
      >
        <rect width="24" height="24" rx="4" fill="#EAFFEA"></rect>
        <path
          d="M16.6668 8.5L10.2502 14.9167L7.3335 12"
          stroke="#009505"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>
      </svg>
      <p className="text-sm text-left text-[#003c02] mr-2">
        <span className="hidden md:block"> Your website has been updated!</span>
        <span className="md:hidden"> Website updated!</span>
      </p>
      <a
        href={getSelfSoUrl(usernameQuery.data.username)}
        target="_blank"
        className="flex justify-center items-center overflow-hidden gap-1 px-3 py-1 rounded bg-[#009505] h-[26px]"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-grow-0 flex-shrink-0 w-2.5 h-2.5 relative"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M6.86768 2.39591L1.50684 7.75675L2.2434 8.49331L7.60425 3.13248V7.60425H8.64591V1.35425H2.39591V2.39591H6.86768Z"
            fill="white"
          ></path>
        </svg>
        <p className="flex-grow-0 flex-shrink-0 text-sm font-medium text-left text-white">
          View
        </p>
      </a>
    </div>
  );
return (
  <div className="w-full h-screen bg-background flex flex-col">
  <div className="max-w-3xl mx-auto w-full flex flex-col md:flex-row justify-between items-center px-4 md:px-0 gap-4">
          <ToggleGroup
            type="single"
            value={isEditMode ? 'edit' : 'preview'}
            onValueChange={(value) => setIsEditMode(value === 'edit')}
            aria-label="View mode"
          >
            <ToggleGroupItem value="preview" aria-label="Preview mode">
              <Eye className="h-4 w-4 mr-1" />
              <span>Preview</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="edit" aria-label="Edit mode">
              <Edit className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </ToggleGroupItem>
          </ToggleGroup>
  
          {isEditMode && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                className="flex items-center gap-1"
                disabled={!hasUnsavedChanges || saveResumeDataMutation.isPending}
              >
                <X className="h-4 w-4" />
                <span>Discard</span>
              </Button>
              <Button
                onClick={handleSaveChanges}
                className="flex items-center gap-1"
                disabled={!hasUnsavedChanges || saveResumeDataMutation.isPending}
              >
                {saveResumeDataMutation.isPending ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>
                  {saveResumeDataMutation.isPending ? 'Saving...' : 'Save'}
                </span>
              </Button>
            </div>
          )}
  </div>
  <div className="max-w-5xl mx-auto w-full md:rounded-lg border-[0.5px] border-neutral-300 flex items-center justify-between px-4">
        {isEditMode ? (
          <EditResume
            resume={localResumeData}
            onChangeResume={handleResumeChange}
          />
        ) : (
          <FullResume
            resume={localResumeData}
          />
        )}
  </div>
  </div>
  );
}