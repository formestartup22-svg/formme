
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Maximize2, Minimize2, Loader2 } from 'lucide-react';

interface RealisticPreviewOutputProps {
  output: any;
  isFullWidth: boolean;
  onClose: () => void;
  onToggleFullWidth: () => void;
  isGenerating?: boolean;
  generationProgress?: number;
  generationStatus?: string;
}

const RealisticPreviewOutput = ({ 
  output, 
  isFullWidth, 
  onClose, 
  onToggleFullWidth,
  isGenerating = false,
  generationProgress = 0,
  generationStatus = ''
}: RealisticPreviewOutputProps) => {
  console.warn("🐛 RealisticPreviewOutput output:", output, typeof output);

  return (
    <div className={`
      ${isFullWidth ? 'fixed inset-0 z-40' : 'w-1/3'} 
      bg-white border-l border-gray-200 flex flex-col transition-all duration-300
    `}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Realistic Preview</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullWidth}
            className="h-8 w-8 p-0"
          >
            {isFullWidth ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Loading UI */}
        {isGenerating && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Generating AI Real Preview</h3>
                  <p className="text-gray-600">{generationStatus}</p>
                </div>
                
                <div className="space-y-2">
                  <Progress value={generationProgress} className="w-full h-2" />
                  <p className="text-sm text-gray-500">{generationProgress}% complete</p>
                </div>
                
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                  <p className="font-medium mb-1">This may take 1-2 minutes</p>
                  <p>Our AI is creating a realistic mannequin view of your design</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results UI - only show when not generating */}
        {!isGenerating && (
          <div className="space-y-4">
            <div>
            {typeof output === 'string' && output?.startsWith('http') && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Generated Image</h4>
                <div className="rounded-lg border border-gray-200 shadow overflow-hidden">
                  <img 
                    src={output} 
                    alt="Generated Realistic Preview" 
                    className="w-full max-h-[600px] object-contain bg-white"
                  />
                </div>
              </div>
            )}

              <h4 className="font-medium text-gray-700 mb-2">API Response</h4>
              <div className="bg-gray-100 rounded-lg p-4">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </div>
            </div>

            {/* Task ID Display */}
            {output?.data?.taskId && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Task ID</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <code className="text-blue-800 text-sm font-mono">
                    {output.data.taskId}
                  </code>
                </div>
              </div>
            )}

            {/* Status Display */}
            {output?.code && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                <div className={`
                  rounded-lg p-3 
                  ${output.code === 200 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                  }
                `}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Code:</span>
                    <span>{output.code}</span>
                  </div>
                  {output.msg && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">Message:</span>
                      <span>{output.msg}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="font-medium text-yellow-800 mb-1">Next Steps:</p>
              <p>Your realistic preview is being generated. You can use the Task ID above to check the status or retrieve the results once processing is complete.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealisticPreviewOutput;
