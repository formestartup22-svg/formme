import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Ruler, Package, Send } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface TechPackStageProps {
  design: Design;
}

const TechPackStage = ({ design }: TechPackStageProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <CardTitle>Upload Design File</CardTitle>
          </div>
          <CardDescription>Add your design sketch, image, or drawing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
          </div>
          <Button className="w-full">Upload Design</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            <CardTitle>Enter Measurements</CardTitle>
          </div>
          <CardDescription>Add garment specifications and dimensions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Chest width</span>
              <span className="text-sm font-medium text-muted-foreground">Not set</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Length</span>
              <span className="text-sm font-medium text-muted-foreground">Not set</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Sleeve length</span>
              <span className="text-sm font-medium text-muted-foreground">Not set</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">Add Measurements</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Add Size Chart</CardTitle>
          </div>
          <CardDescription>Define sizing for your garment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No size chart added yet</p>
          </div>
          <Button variant="outline" className="w-full">Create Size Chart</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle>Construction Notes</CardTitle>
          </div>
          <CardDescription>Add special instructions and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea 
            className="w-full min-h-[100px] p-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Add construction details, fabric preferences, trim specifications..."
          />
          <Button variant="outline" className="w-full">Save Notes</Button>
        </CardContent>
      </Card>

      <Card className="border-border md:col-span-2 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            <CardTitle>Generate Tech Pack</CardTitle>
          </div>
          <CardDescription>Review and send your complete tech pack to manufacturers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button className="flex-1">Generate Tech Pack PDF</Button>
            <Button variant="outline" className="flex-1">Preview Tech Pack</Button>
            <Button variant="outline" className="flex-1">Send to Manufacturer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechPackStage;
