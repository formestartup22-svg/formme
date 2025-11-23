import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import NavBar from '@/components/Navbar';
import { MessageSquare, FileDown, Upload, CheckCircle, XCircle, ArrowLeft, Clock } from 'lucide-react';
import { ManufacturerStepper } from '@/components/workflow/ManufacturerStepper';
import { FactoryMessaging } from '@/components/workflow/FactoryMessaging';
import { FloatingMessagesWidget } from '@/components/workflow/FloatingMessagesWidget';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ManufacturerOrderWorkspace = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('techpack');
  
  const handleTabChange = (newTab: string) => {
    // Check if trying to access Sample Development without approval
    if (newTab === 'production' && order?.production_params_approved !== true) {
      toast.error('You cannot access Sample Development until the designer approves your production parameters');
      return;
    }
    setActiveTab(newTab);
  };
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchStatus, setMatchStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [productionStartDate, setProductionStartDate] = useState('');
  const [productionCompletionDate, setProductionCompletionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fabricType, setFabricType] = useState('');
  const [gsm, setGsm] = useState('');
  const [shrinkage, setShrinkage] = useState('');
  const [colorFastness, setColorFastness] = useState('');
  const [labDipFiles, setLabDipFiles] = useState<FileList | null>(null);
  const [samplePhotos, setSamplePhotos] = useState<FileList | null>(null);
  const [sampleNotes, setSampleNotes] = useState('');
  const [productionPhotos, setProductionPhotos] = useState<FileList | null>(null);

  useEffect(() => {
  const fetchOrder = async () => {
      if (!id) return;
      
      try {
        // Fetch order with design and design specs
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;

        // Fetch design details
        const { data: designData, error: designError } = await supabase
          .from('designs')
          .select('id, name, category, user_id')
          .eq('id', orderData.design_id)
          .maybeSingle();

        if (designError) console.error('Design error:', designError);

        // Fetch design specs
        const { data: specsData } = await supabase
          .from('design_specs')
          .select('*')
          .eq('design_id', orderData.design_id)
          .maybeSingle();

        // Fetch designer profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', orderData.designer_id)
          .maybeSingle();

        // Fetch match status
        const { data: matchData } = await supabase
          .from('manufacturer_matches')
          .select('status')
          .eq('design_id', orderData.design_id)
          .eq('manufacturer_id', orderData.manufacturer_id)
          .maybeSingle();

        setOrder({
          ...orderData,
          designs: designData,
          design_specs: specsData,
          profiles: profile || { full_name: 'Unknown' }
        });

        // Set timeline dates if they exist
        if (orderData.production_start_date) {
          setProductionStartDate(orderData.production_start_date);
        }
        if (orderData.production_completion_date) {
          setProductionCompletionDate(orderData.production_completion_date);
        }
        // Set fabric specs if they exist
        if (orderData.fabric_type) setFabricType(orderData.fabric_type);
        if (orderData.gsm) setGsm(orderData.gsm);
        if (orderData.shrinkage) setShrinkage(orderData.shrinkage);
        if (orderData.color_fastness) setColorFastness(orderData.color_fastness);

        setMatchStatus((matchData?.status as 'pending' | 'accepted' | 'rejected') || null);
      } catch (err: any) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Real-time subscription for production approval updates
    const channel = supabase
      .channel('order-approval-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setOrder((prev: any) => prev ? { ...prev, ...payload.new } : payload.new);
          // Show toast when designer approves
          if (payload.new.production_params_approved === true && !order?.production_params_approved) {
            toast.success('Designer approved your production parameters! You can now proceed to Sample Development.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAcceptMatch = async () => {
    if (!order || !order.manufacturer_id) return;
    
    setAccepting(true);
    try {
      // Update manufacturer match status only
      const { error: matchError } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'accepted' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (matchError) throw matchError;

      // Don't update order status here - wait for designer to finalize contract

      setMatchStatus('accepted');
      toast.success('Match accepted! The designer will be notified.');
    } catch (error: any) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleSubmitProductionApproval = async () => {
    if (!order?.id) return;
    
    if (!productionStartDate || !productionCompletionDate) {
      toast.error('Please provide both start and completion dates');
      return;
    }

    if (!fabricType || !gsm) {
      toast.error('Please provide fabric type and GSM');
      return;
    }
    
    setSubmitting(true);
    try {
      // Upload lab dip photos if any
      let labDipUrls: string[] = [];
      if (labDipFiles && labDipFiles.length > 0) {
        const uploadPromises = Array.from(labDipFiles).map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${order.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${order.designer_id}/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('design-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('design-files')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        labDipUrls = await Promise.all(uploadPromises);
      }

      const { error } = await supabase
        .from('orders')
        .update({
          production_start_date: productionStartDate,
          production_completion_date: productionCompletionDate,
          fabric_type: fabricType,
          gsm: gsm,
          shrinkage: shrinkage || null,
          color_fastness: colorFastness || null,
          lab_dip_photos: labDipUrls.length > 0 ? labDipUrls : null,
          production_params_submitted_at: new Date().toISOString(),
          status: 'production_approval'
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Production parameters submitted successfully!');
      // Refresh order data
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();
      
      if (updatedOrder) {
        setOrder({ ...order, ...updatedOrder });
      }
    } catch (error: any) {
      console.error('Error submitting production approval:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineMatch = async () => {
    if (!order || !order.manufacturer_id) return;
    
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'rejected' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (error) throw error;

      setMatchStatus('rejected');
      alert('Match declined.');
    } catch (error: any) {
      console.error('Error declining match:', error);
      alert('Failed to decline match. Please try again.');
    }
  };

  const handleSubmitSampleUpdate = async () => {
    if (!order?.id) return;
    
    setSubmitting(true);
    try {
      // Upload sample photos if any
      let sampleUrls: string[] = [];
      if (samplePhotos && samplePhotos.length > 0) {
        const uploadPromises = Array.from(samplePhotos).map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${order.id}-sample-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${order.designer_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('design-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('design-files')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        sampleUrls = await Promise.all(uploadPromises);
      }

      // Get existing sample URLs from database
      const existingSampleUrls = order.production_timeline_data?.sample_photos || [];
      const allSampleUrls = [...existingSampleUrls, ...sampleUrls];

      const { error } = await supabase
        .from('orders')
        .update({
          production_timeline_data: {
            ...order.production_timeline_data,
            sample_photos: allSampleUrls,
            sample_notes: sampleNotes || order.production_timeline_data?.sample_notes,
            sample_last_updated: new Date().toISOString()
          },
          status: 'sample_development'
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Sample update submitted successfully!');
      
      // Refresh order data
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order.id)
        .single();
      
      if (updatedOrder) {
        setOrder({ ...order, ...updatedOrder });
        setSamplePhotos(null);
        setSampleNotes('');
      }
    } catch (error: any) {
      console.error('Error submitting sample update:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

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
                {order.designs?.name || 'Unknown Design'}
              </h1>
              <p className="text-muted-foreground">Designer: {order.profiles?.full_name || 'Unknown'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                On Track
              </Badge>
              <Badge variant="outline">{order.status?.replace(/_/g, ' ') || 'Pending'}</Badge>
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
                <ManufacturerStepper activeStep={activeTab} onStepChange={handleTabChange} orderData={order} />
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
                    {order.designs?.category || 'No category specified'}
                  </p>
                  {order.design_specs?.construction_notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {order.design_specs.construction_notes}
                    </p>
                  )}
                </div>
                {(order.design_specs?.measurements || order.design_specs?.fabric_type || order.design_specs?.gsm) && (
                  <div>
                    <h3 className="font-semibold mb-2">Specifications</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {order.design_specs?.measurements && (
                        <div>
                          <p className="text-muted-foreground">Measurements</p>
                          <p className="font-medium">{JSON.stringify(order.design_specs.measurements)}</p>
                        </div>
                      )}
                      {order.design_specs?.fabric_type && (
                        <div>
                          <p className="text-muted-foreground">Fabric</p>
                          <p className="font-medium">{order.design_specs.fabric_type}</p>
                        </div>
                      )}
                      {order.design_specs?.gsm && (
                        <div>
                          <p className="text-muted-foreground">GSM</p>
                          <p className="font-medium">{order.design_specs.gsm}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.notes || 'No notes provided'}
                  </p>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Sample Development Content */}
            {activeTab === 'production' && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!order.production_params_approved && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-amber-800">
                      ⚠️ You cannot proceed to sample development until the designer approves your production parameters.
                    </p>
                  </div>
                )}
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
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="sample-photos" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setSamplePhotos(e.target.files)}
                    />
                    <Label htmlFor="sample-photos" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Select Files {samplePhotos && samplePhotos.length > 0 && `(${samplePhotos.length})`}</span>
                      </Button>
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Notes / Questions</Label>
                  <Textarea
                    placeholder="Add any notes or questions about the sample..."
                    rows={3}
                    value={sampleNotes}
                    onChange={(e) => setSampleNotes(e.target.value)}
                  />
                  <Button 
                    onClick={handleSubmitSampleUpdate}
                    disabled={submitting || (!samplePhotos && !sampleNotes) || !order.production_params_approved}
                  >
                    {submitting ? 'Submitting...' : 'Submit Update'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Production Approval Content */}
            {activeTab === 'sample' && (
            <Card>
              <CardHeader>
                <CardTitle>Production Approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Production Timeline</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Production Start Date</Label>
                      <Input 
                        type="date" 
                        value={productionStartDate}
                        onChange={(e) => setProductionStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Completion Date</Label>
                      <Input 
                        type="date" 
                        value={productionCompletionDate}
                        onChange={(e) => setProductionCompletionDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Upload Lab Dip Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="lab-dip" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setLabDipFiles(e.target.files)}
                    />
                    <Label htmlFor="lab-dip" className="cursor-pointer">
                      <Button variant="outline" className="gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Upload Photos {labDipFiles && labDipFiles.length > 0 && `(${labDipFiles.length})`}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Fabric Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fabric Type *</Label>
                      <Input 
                        placeholder="e.g., 100% Cotton" 
                        value={fabricType}
                        onChange={(e) => setFabricType(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GSM *</Label>
                      <Input 
                        placeholder="e.g., 180 GSM" 
                        value={gsm}
                        onChange={(e) => setGsm(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shrinkage (%)</Label>
                      <Input 
                        placeholder="e.g., 3-5%" 
                        value={shrinkage}
                        onChange={(e) => setShrinkage(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color Fastness</Label>
                      <Input 
                        placeholder="e.g., Grade 4-5" 
                        value={colorFastness}
                        onChange={(e) => setColorFastness(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  {order.production_params_submitted_at && !order.production_params_approved && order.production_params_approved !== false ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Waiting for designer approval</p>
                          <p className="text-xs text-blue-700 mt-0.5">Your production parameters have been submitted and are under review</p>
                        </div>
                      </div>
                    </div>
                  ) : order.production_params_approved === true ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-900">Designer approved your production parameters</p>
                      </div>
                    </div>
                  ) : order.production_params_approved === false ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm font-medium text-red-900">Designer rejected your production parameters</p>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant="outline">
                      {order.production_params_approved === true ? 'Approved' : 
                       order.production_params_approved === false ? 'Rejected' :
                       order.production_params_submitted_at ? 'Pending Approval' : 'Not Submitted'}
                    </Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSubmitProductionApproval}
                    disabled={submitting || !productionStartDate || !productionCompletionDate || !fabricType || !gsm || (order.production_params_submitted_at && order.production_params_approved !== false)}
                  >
                    {submitting ? 'Submitting...' : order.production_params_submitted_at && order.production_params_approved !== false ? 'Awaiting Designer Approval' : 'Submit for Designer Approval'}
                  </Button>
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

        {/* Matching Controls (shown only when status is pending) */}
        {matchStatus === 'pending' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Match Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The designer has requested to work with your factory for this order.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleAcceptMatch} 
                  disabled={accepting}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {accepting ? 'Accepting...' : 'Accept Match'}
                </Button>
                <Button 
                  onClick={handleDeclineMatch}
                  disabled={accepting}
                  variant="outline" 
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Decline Match
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {matchStatus === 'accepted' && (
          <Card className="mt-8 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  You have accepted this order. The designer has been notified.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Messages Widget */}
      {order?.design_id && <FloatingMessagesWidget designId={order.design_id} />}
    </div>
  );
};

export default ManufacturerOrderWorkspace;
