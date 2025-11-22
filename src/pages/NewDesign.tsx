import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Palette } from "lucide-react";
import { toast } from "sonner";

const NewDesign = () => {
  const navigate = useNavigate();
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

      toast.success("Design uploaded successfully!");
      navigate(`/design/${design.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload design");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseStudio = () => {
    navigate("/studio-selection");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-8 pt-32">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">New Design</h1>
            <p className="text-muted-foreground">Upload your own design or create one in our studio</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Existing Design */}
            <Card className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Upload Design</h2>
                <p className="text-muted-foreground">
                  Have an existing design? Upload it and we'll help you find manufacturers and generate tech packs
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
                  {isLoading ? "Uploading..." : "Upload & Continue"}
                </Button>
              </form>
            </Card>

            {/* Use Design Studio */}
            <Card className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Design Studio</h2>
                <p className="text-muted-foreground">
                  Create your design from scratch using our professional design tools
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Choose Your Studio</h3>
                    <p className="text-sm text-muted-foreground">Pro Studio or Free Studio</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Design Your Garment</h3>
                    <p className="text-sm text-muted-foreground">Use our tools to create your design</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Save & Manufacture</h3>
                    <p className="text-sm text-muted-foreground">Save and start production workflow</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleUseStudio} variant="outline" className="w-full">
                Open Design Studio
              </Button>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDesign;
