import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import NavBar from '@/components/Navbar';
import { MessageSquare, FileDown, Upload, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { ManufacturerStepper } from '@/components/workflow/ManufacturerStepper';

// Mock data for order
const mockOrder = {
  id: '1',
  designName: 'Cotton Pajama Set',
  designerName: 'Emma Johnson',
  status: 'On Track',
  stage: 'Sample Development',
};

const ManufacturerOrderWorkspace = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('techpack');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'Designer',
      text: 'Can you confirm the GSM for the main fabric?',
      timestamp: '2 hours ago',
    },
    {
      sender: 'Manufacturer',
      text: 'Yes, we will use 180 GSM cotton jersey as specified.',
      timestamp: '1 hour ago',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          sender: 'Manufacturer',
          text: message,
          timestamp: 'Just now',
        },
      ]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        {/* Back Button */}
        <Link to="/manufacturer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {mockOrder.designName}
              </h1>
              <p className="text-muted-foreground">Designer: {mockOrder.designerName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {mockOrder.status}
              </Badge>
              <Badge variant="outline">{mockOrder.stage}</Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Message Designer
            </Button>
            <Button className="gap-2">
              Update Status
            </Button>
          </div>
        </div>

        {/* Pipeline Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Pipeline Stepper */}
          <div className="col-span-3">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ManufacturerStepper activeStep={activeTab} onStepChange={setActiveTab} />
              </CardContent>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="col-span-9">
            {/* Tech Pack Content */}
            {activeTab === 'techpack' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tech Pack Details</CardTitle>
                  <Button variant="outline" className="gap-2">
                    <FileDown className="w-4 h-4" />
                    Download Tech Pack
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Garment Overview</h3>
                  <p className="text-sm text-muted-foreground">
                    Cotton pajama set with all-over print design. Includes top and pants.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Measurements</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">S, M, L, XL</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fabric</p>
                      <p className="font-medium">95% Cotton, 5% Elastane</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">GSM</p>
                      <p className="font-medium">180</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Please ensure seams are double-stitched for durability.
                  </p>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Clarifications Content */}
            {activeTab === 'clarifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Clarifications & Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        msg.sender === 'Manufacturer'
                          ? 'bg-primary/10 ml-auto max-w-[80%]'
                          : 'bg-muted max-w-[80%]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Attach File
                    </Button>
                    <Button onClick={handleSendMessage}>Send Message</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Sample Development Content */}
            {activeTab === 'sample' && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Sample Status</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <span className="text-sm">Cutting</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <span className="text-sm">Sewing</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <span className="text-sm">Finishing</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Upload Sample Progress Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <Input type="file" className="hidden" id="sample-photos" multiple />
                    <Label htmlFor="sample-photos" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Select Files</span>
                      </Button>
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Notes / Questions</Label>
                  <Textarea
                    placeholder="Add any notes or questions about the sample..."
                    rows={3}
                  />
                  <Button>Submit Update</Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Production Approval Content */}
            {activeTab === 'production' && (
            <Card>
              <CardHeader>
                <CardTitle>Production Approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Upload Lab Dip Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Input type="file" className="hidden" id="lab-dip" multiple />
                    <Label htmlFor="lab-dip" className="cursor-pointer">
                      <Button variant="outline" className="gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Upload Photos
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>GSM</Label>
                    <Input placeholder="e.g., 180" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shrinkage Data</Label>
                    <Input placeholder="e.g., 3-5%" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Fabric Details</Label>
                  <Textarea placeholder="Add fabric specifications..." rows={3} />
                </div>
                
                <div className="space-y-3">
                  <Label>First Batch Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Input type="file" className="hidden" id="batch-photos" multiple />
                    <Label htmlFor="batch-photos" className="cursor-pointer">
                      <Button variant="outline" className="gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Upload Photos
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant="outline">Waiting for Approval</Badge>
                  </div>
                  <Button className="w-full">Submit for Designer Approval</Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Quality Check Content */}
            {activeTab === 'quality' && (
            <Card>
              <CardHeader>
                <CardTitle>Quality Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Upload QC Photos (by size)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <div key={size} className="space-y-2">
                        <Label className="text-sm">Size {size}</Label>
                        <div className="border border-border rounded-lg p-4 text-center">
                          <Input type="file" className="hidden" id={`qc-${size}`} multiple />
                          <Label htmlFor={`qc-${size}`} className="cursor-pointer">
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                              <span>
                                <Upload className="w-3 h-3" />
                                Upload
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>QC Notes & Defect Counts</Label>
                  <Textarea
                    placeholder="Document any defects or quality concerns..."
                    rows={4}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Overall QC Result</Label>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Passed
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <XCircle className="w-4 h-4" />
                      Needs Fixes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Shipping Content */}
            {activeTab === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping & Logistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Upload Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      'Packing List',
                      'Invoice',
                      'Customs Documents',
                      'Shipping Label',
                    ].map((doc) => (
                      <div key={doc} className="space-y-2">
                        <Label className="text-sm">{doc}</Label>
                        <div className="border border-border rounded-lg p-3 text-center">
                          <Input type="file" className="hidden" id={doc.toLowerCase().replace(' ', '-')} />
                          <Label htmlFor={doc.toLowerCase().replace(' ', '-')} className="cursor-pointer">
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                              <span>
                                <Upload className="w-3 h-3" />
                                Upload
                              </span>
                            </Button>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Tracking Status</Label>
                  <div className="space-y-2">
                    {['In Transit', 'At Customs', 'Delivered'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tracking" className="w-4 h-4" />
                        <span className="text-sm">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Tracking Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order Shipped</p>
                        <p className="text-xs text-muted-foreground">Jan 15, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-muted" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          In Transit
                        </p>
                        <p className="text-xs text-muted-foreground">Expected Jan 20</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </div>

        {/* Matching Controls (shown when relevant) */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Match Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The designer has requested to work with your factory for this order.
            </p>
            <div className="flex gap-3">
              <Button className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Accept Match
              </Button>
              <Button variant="outline" className="gap-2">
                <XCircle className="w-4 h-4" />
                Decline Match
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturerOrderWorkspace;
