import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Ruler, FileText, Package, Send } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Upload Design File */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Design File</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Measurements</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {['Chest width', 'Length', 'Sleeve length'].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Label className="text-xs w-24">{field}</Label>
              <Input type="number" placeholder="0" className="flex-1 h-8 text-sm" />
              <span className="text-xs text-muted-foreground w-12">inches</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Size Chart */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Size Chart</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">No size chart added</p>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3">Create Size Chart</Button>
        </CardContent>
      </Card>

      {/* Construction Notes */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Construction Notes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea 
            className="min-h-[80px] text-sm resize-none"
            placeholder="Add construction details, fabric preferences..."
          />
        </CardContent>
      </Card>

      {/* Generate Tech Pack */}
      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base">Generate Tech Pack</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Generate PDF</Button>
            <Button variant="outline" size="sm">Preview</Button>
            <Button variant="outline" size="sm">Send to Factory</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechPackStage;
