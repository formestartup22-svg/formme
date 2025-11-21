import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WorkflowData {
  // Tech Pack
  designFile?: File;
  measurements: {
    chestWidth: string;
    length: string;
    sleeveLength: string;
  };
  sizeChart?: any;
  constructionNotes: string;
  
  // Factory Match
  quantity: string;
  leadTime: string;
  location: string;
  priceRange: string;
  selectedFactory?: {
    id: string;
    name: string;
    location: string;
    leadTime: string;
    priceRange: string;
  };
  
  // Production Details
  deliveryDate: string;
  materialSource: 'factory' | 'designer';
  
  // Sample
  fitPhotos?: File[];
  fitNotes: string;
  sampleApproved: boolean;
  
  // Production
  labDipsApproved: boolean;
  materialsApproved: boolean;
  firstBatchApproved: boolean;
  
  // Quality
  qcApproved: boolean;
  
  // Shipping
  trackingNumber: string;
  deliveryConfirmed: boolean;
}

interface WorkflowContextType {
  workflowData: WorkflowData;
  updateWorkflowData: (data: Partial<WorkflowData>) => void;
  currentStage: string;
  setCurrentStage: (stage: string) => void;
  completedStages: string[];
  markStageComplete: (stage: string) => void;
  getProgress: () => number;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialData: WorkflowData = {
  measurements: { chestWidth: '', length: '', sleeveLength: '' },
  constructionNotes: '',
  quantity: '',
  leadTime: '',
  location: '',
  priceRange: '',
  deliveryDate: '',
  materialSource: 'factory',
  fitNotes: '',
  sampleApproved: false,
  labDipsApproved: false,
  materialsApproved: false,
  firstBatchApproved: false,
  qcApproved: false,
  trackingNumber: '',
  deliveryConfirmed: false,
};

export const WorkflowProvider = ({ children }: { children: ReactNode }) => {
  const [workflowData, setWorkflowData] = useState<WorkflowData>(initialData);
  const [currentStage, setCurrentStage] = useState('tech-pack');
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  const updateWorkflowData = (data: Partial<WorkflowData>) => {
    setWorkflowData(prev => ({ ...prev, ...data }));
  };

  const markStageComplete = (stage: string) => {
    if (!completedStages.includes(stage)) {
      setCompletedStages(prev => [...prev, stage]);
    }
  };

  const getProgress = () => {
    const totalStages = 7;
    return Math.round((completedStages.length / totalStages) * 100);
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflowData,
        updateWorkflowData,
        currentStage,
        setCurrentStage,
        completedStages,
        markStageComplete,
        getProgress,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};
