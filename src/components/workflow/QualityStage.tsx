import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CheckCircle } from 'lucide-react';
import { Design } from '@/data/workflowData';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryCommunication } from './FactoryCommunication';
import { FactoryDocuments } from './FactoryDocuments';

interface QualityStageProps { design: Design; }

const QualityStage = ({ design }: QualityStageProps) => {
  const [ratings, setRatings] = useState({ measurements: 8, stitching: 9, fabric: 8, hardware: 7 });
  const [notes, setNotes] = useState('');
  const averageRating = (Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1);

  return (
    <div>
      <StageHeader icon={CheckCircle} title="Quality Check" description="Factory quality control assessment with detailed ratings and notes." />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section>
            <Card className="border-border bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Overall Quality Score (View Only)</p>
                  <p className="text-4xl font-bold text-primary">{averageRating}/10</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Quality Metrics (View Only)</h3>
            <Card className="border-border">
              <CardContent className="p-6 space-y-6">
                {[{ key: 'measurements', label: 'Measurements Accuracy', desc: 'Tolerance within spec' }, { key: 'stitching', label: 'Stitching & Construction', desc: 'Seam quality and durability' }, { key: 'fabric', label: 'Fabric & Colour Consistency', desc: 'Material quality and colour match' }, { key: 'hardware', label: 'Trim or Hardware Function', desc: 'Zippers, buttons, and accessories' }].map(item => (
                  <div key={item.key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <Label className="text-sm font-medium">{item.label}</Label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className="text-lg font-semibold text-primary">{ratings[item.key as keyof typeof ratings]}/10</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${(ratings[item.key as keyof typeof ratings] / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Factory Quality Control Notes (View Only)</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  All measurements are within tolerance. Minor thread trimming needed on 3 units. Overall quality meets production standards.
                </p>
              </CardContent>
            </Card>
          </section>

          <StageNavigation onNext={() => true} nextLabel="Continue to Shipping" showBack={true} />
        </div>
        <div className="space-y-4"><FactoryCommunication /><FactoryDocuments /></div>
      </div>
    </div>
  );
};

export default QualityStage;
