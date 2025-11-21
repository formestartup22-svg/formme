import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Upload, CheckCircle, Clock, Scissors, Package } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface SampleStageProps {
  design: Design;
}

const SampleStage = ({ design }: SampleStageProps) => {
  return (
    <div className="space-y-6">
      {/* Factory Questions */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>Factory Questions</CardTitle>
          </div>
          <CardDescription>Respond to clarifications from the manufacturer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-amber-500/20 bg-amber-500/10 rounded-lg">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground mb-1">Button placement confirmation</p>
                <p className="text-sm text-muted-foreground">Can you confirm the exact placement of the buttons? Should they be centered or offset?</p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline">Add Photo</Button>
              <Button size="sm">Reply</Button>
            </div>
          </div>
          <div className="p-4 border border-border rounded-lg opacity-60">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground mb-1">Fabric weight preference</p>
                <p className="text-sm text-muted-foreground">Your response: Use 180gsm cotton jersey</p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Answered</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Progress */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Sample Production Status</CardTitle>
          <CardDescription>Track the progress of your sample</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Cutting</p>
                <p className="text-xs text-muted-foreground">Completed Nov 15, 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Sewing</p>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-muted-foreground">Finishing</p>
                <p className="text-xs text-muted-foreground">Not started</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fit Photos */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <CardTitle>Upload Fit Photos</CardTitle>
            </div>
            <CardDescription>Add photos of the sample on a fit model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">Upload fit photos</p>
              <p className="text-xs text-muted-foreground">Front, back, and side views recommended</p>
            </div>
            <Button variant="outline" className="w-full">Upload Photos</Button>
          </CardContent>
        </Card>

        {/* Fit Notes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Fit Notes</CardTitle>
            <CardDescription>Add comments about the sample fit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea 
              className="w-full min-h-[120px] p-3 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add notes about fit, sizing, adjustments needed..."
            />
            <Button variant="outline" className="w-full">Save Notes</Button>
          </CardContent>
        </Card>
      </div>

      {/* Approval Section */}
      <Card className="border-border bg-primary/5">
        <CardHeader>
          <CardTitle>Sample Approval</CardTitle>
          <CardDescription>Review and approve the sample or request changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex-1" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Sample
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Request Revisions
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Once approved, production will begin
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleStage;
