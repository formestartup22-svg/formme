import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/context/WorkflowContext';
import { FileText, Download, Image as ImageIcon, Video } from 'lucide-react';

export const FactoryDocuments = () => {
  const { workflowData } = useWorkflow();

  const documents = [
    { name: 'Tech Pack.pdf', type: 'pdf', size: '2.4 MB', date: 'Nov 18, 2025' },
    { name: 'Material Specs.pdf', type: 'pdf', size: '1.1 MB', date: 'Nov 19, 2025' },
  ];

  const media = workflowData.manufacturerSamples || [];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Documents & Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Documents */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Documents</p>
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Media from Manufacturer */}
        {media.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Manufacturer Uploads
            </p>
            <div className="grid grid-cols-2 gap-2">
              {media.map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {workflowData.invoices.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Invoices</p>
            <div className="space-y-2">
              {workflowData.invoices.map((invoice, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Invoice #{idx + 1}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
