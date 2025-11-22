import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Palette, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

const NewDesign = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [designName, setDesignName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [designFile, setDesignFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDesignFile(e.target.files[0]);
    }
  };

  const handleUploadDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designName || !designFile) {
      toast.error("Please provide a design name and file");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = designFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(filePath, designFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(filePath);

      // Insert design record
      const { data: design, error: designError } = await supabase
        .from("designs")
        .insert({
          user_id: user.id,
          name: designName,
          description,
          category,
          design_file_url: publicUrl,
        })
        .select()
        .single();

      if (designError) throw designError;

      // Create an order for this design to enter the workflow
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          designer_id: user.id,
          design_id: design.id,
          status: 'tech_pack_pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      toast.success("Design uploaded successfully!");
      // Navigate to the workflow at tech-pack stage
      navigate(`/workflow/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload design");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDesignClick = () => {
    setShowDialog(true);
  };

  const handleStudioSelect = (studio: string) => {
    setShowDialog(false);
    if (studio === 'pro') {
      navigate("/professional-studio");
    } else {
      navigate("/designer");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-8 pt-32">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">New Design</h1>
            <p className="text-muted-foreground">Create your design or upload an existing one</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Design your garment with Formme */}
            <Card className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Design your garment with Formme</h2>
                <p className="text-muted-foreground">
                  Create your design from scratch using our design tools
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <h3 className="font-medium">Professional Studio</h3>
                    <p className="text-sm text-muted-foreground">Advanced tools for professional designers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3" />
                  </div>
                  <div>
                    <h3 className="font-medium">Basic Studio</h3>
                    <p className="text-sm text-muted-foreground">Quick and easy garment design with pre-made templates</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleNewDesignClick} className="w-full">
                Start Designing
              </Button>
            </Card>

            {/* Have a ready-to-manufacture design? */}
            <Card className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Have a ready-to-manufacture design?</h2>
                <p className="text-muted-foreground">
                  Upload your existing design and start the production process
                </p>
              </div>

              <form onSubmit={handleUploadDesign} className="space-y-4">
                <div>
                  <Label htmlFor="designName">Design Name *</Label>
                  <Input
                    id="designName"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Summer Collection Tee"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="T-Shirt, Hoodie, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your design..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="designFile">Design File *</Label>
                  <Input
                    id="designFile"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.ai,.psd"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported: Images, PDF, AI, PSD
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload & Start Production Pipeline"}
                </Button>
              </form>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Studio Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Studio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Button 
              onClick={() => handleStudioSelect('pro')} 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Professional Studio</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced tools for professional designers
              </p>
            </Button>
            <Button 
              onClick={() => handleStudioSelect('basic')} 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Basic Studio</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick and easy garment design with pre-made templates
              </p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDesign;
