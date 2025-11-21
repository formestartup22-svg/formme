import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Image } from 'lucide-react';
import { Design } from '@/data/workflowData';

interface QualityStageProps {
  design: Design;
}

const QualityStage = ({ design }: QualityStageProps) => {
  const qcChecklist = [
    { item: 'Measurements accuracy', status: 'pass', notes: 'Within tolerance' },
    { item: 'Stitch quality', status: 'pass', notes: '12 SPI consistent' },
    { item: 'Fabric defects', status: 'warning', notes: '2 minor pulls found' },
    { item: 'Color consistency', status: 'pass', notes: 'Matches approved lab dip' },
    { item: 'Trim placement', status: 'pass', notes: 'All buttons secure' },
    { item: 'Label attachment', status: 'pass', notes: 'Properly sewn' }
  ];

  const measurements = [
    { size: 'XS', chest: '44cm', length: '66cm', sleeve: '20cm', status: 'pass' },
    { size: 'S', chest: '48cm', length: '68cm', sleeve: '21cm', status: 'pass' },
    { size: 'M', chest: '52cm', length: '70cm', sleeve: '22cm', status: 'warning' },
    { size: 'L', chest: '56cm', length: '72cm', sleeve: '23cm', status: 'pass' },
    { size: 'XL', chest: '60cm', length: '74cm', sleeve: '24cm', status: 'pass' }
  ];

  return (
    <div className="space-y-6">
      {/* QC Checklist */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Quality Control Checklist</CardTitle>
          <CardDescription>Auto-generated based on design specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {qcChecklist.map((check, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {check.status === 'pass' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {check.status === 'fail' && <XCircle className="w-5 h-5 text-rose-500" />}
                  <div>
                    <p className="font-medium text-sm text-foreground">{check.item}</p>
                    <p className="text-xs text-muted-foreground">{check.notes}</p>
                  </div>
                </div>
                <Badge variant="outline" className={
                  check.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  check.status === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }>
                  {check.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Measurement Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Measurement Verification</CardTitle>
          <CardDescription>Factory submitted measurements for all sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Chest Width</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Sleeve Length</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((m) => (
                <TableRow key={m.size}>
                  <TableCell className="font-medium">{m.size}</TableCell>
                  <TableCell>{m.chest}</TableCell>
                  <TableCell>{m.length}</TableCell>
                  <TableCell>{m.sleeve}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      m.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }>
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Size M sleeve length is 0.5cm off spec - within acceptable tolerance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QC Photos */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            <CardTitle>Quality Control Photos</CardTitle>
          </div>
          <CardDescription>Factory uploaded photos of all sizes and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Front View', 'Back View', 'Detail Shot', 'Label'].map((label) => (
              <div key={label} className="space-y-2">
                <div className="aspect-square bg-muted rounded-lg border border-border flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-center text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Defect Report */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Defect Summary</CardTitle>
          <CardDescription>Issues found during quality inspection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-sm text-foreground">Acceptable Units</span>
              <span className="font-bold text-emerald-500">495 / 500 (99%)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="text-sm text-foreground">Minor Defects</span>
              <span className="font-medium text-amber-500">5 units</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm text-foreground">Major Defects</span>
              <span className="font-medium text-foreground">0 units</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval */}
      <Card className="border-border bg-primary/5">
        <CardHeader>
          <CardTitle>Final Quality Approval</CardTitle>
          <CardDescription>Review QC report and approve for shipping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex-1" size="lg">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve QC & Proceed to Shipping
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Request Fixes
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Once approved, factory will begin packaging for shipment
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityStage;
