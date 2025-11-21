import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileCheck } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  const { workflowData, updateWorkflowData } = useWorkflow();

  const handleNext = () => {
    // Allow progression without validation
    return true;
  };

  return (
    <div>
      <StageHeader
        icon={FileCheck}
        title="Create Your Tech Pack"
        description="Start by uploading your design and adding measurements. This information will be sent to the factory for production."
      />

      <div className="space-y-6">
        {/* Design Upload */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Design File</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Upload your design sketch or mockup
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, or PDF • Max 10MB
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Measurements */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Garment Measurements</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'chestWidth', label: 'Chest Width' },
                  { key: 'length', label: 'Length' },
                  { key: 'sleeveLength', label: 'Sleeve Length' }
                ].map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs mb-1.5 block">{field.label}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={workflowData.measurements[field.key as keyof typeof workflowData.measurements]}
                        onChange={(e) =>
                          updateWorkflowData({
                            measurements: {
                              ...workflowData.measurements,
                              [field.key]: e.target.value
                            }
                          })
                        }
                        className="h-9 text-sm"
                      />
                      <div className="w-16 flex items-center justify-center bg-muted rounded text-xs text-muted-foreground">
                        inches
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Construction Notes */}
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">Construction Notes</h3>
          <Card className="border-border">
            <CardContent className="p-6">
              <Textarea
                placeholder="Add any special instructions about fabric, stitching, trim, etc..."
                value={workflowData.constructionNotes}
                onChange={(e) => updateWorkflowData({ constructionNotes: e.target.value })}
                className="min-h-[100px] text-sm resize-none"
              />
            </CardContent>
          </Card>
        </section>

        <StageNavigation 
          onNext={handleNext}
          nextLabel="Continue to Factory Match"
          showBack={false}
        />
      </div>
    </div>
  );
};

export default TechPackStage;
