import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type UserRole = "designer" | "manufacturer";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [userRole, setUserRole] = useState<UserRole>("designer");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    location: "",
    phone: "",
    moq: "",
    leadTime: "",
    capabilities: [] as string[],
    categories: [] as string[],
  });

  const capabilitiesOptions = [
    "Cut & Sew",
    "Printing",
    "Embroidery",
    "Dyeing",
    "Pattern Making",
    "Sampling",
    "Quality Control",
    "Packaging"
  ];

  const categoriesOptions = [
    "T-Shirts",
    "Hoodies",
    "Pants",
    "Dresses",
    "Jackets",
    "Activewear",
    "Underwear",
    "Accessories"
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (roleData?.role === "manufacturer") {
        navigate("/manufacturer");
      } else {
        navigate("/dashboard");
      }

      toast.success("Signed in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      // Assign role
      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: userRole,
      });

      // Update profile with common data
      await supabase.from("profiles").update({
        full_name: formData.fullName,
        company_name: formData.companyName,
        location: formData.location || null,
        phone: formData.phone || null,
        capabilities: formData.capabilities.length > 0 ? formData.capabilities : null,
        categories: formData.categories.length > 0 ? formData.categories : null,
        moq: formData.moq ? parseInt(formData.moq) : null,
        lead_time: formData.leadTime ? parseInt(formData.leadTime) : null,
      }).eq("user_id", data.user.id);

      // If manufacturer, create manufacturer record
      if (userRole === "manufacturer") {
        await supabase.from("manufacturers").insert({
          user_id: data.user.id,
          name: formData.companyName || formData.fullName,
          description: `${formData.companyName || formData.fullName} - Professional manufacturing services`,
          location: formData.location || null,
          country: formData.location || null,
          specialties: formData.capabilities.length > 0 ? formData.capabilities : null,
          certifications: formData.categories.length > 0 ? formData.categories : null,
          min_order_quantity: formData.moq ? parseInt(formData.moq) : null,
          lead_time_days: formData.leadTime ? parseInt(formData.leadTime) : null,
          is_active: true,
        });
      }

      toast.success("Account created! Please check your email to verify.");
      setMode("signin");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D4C4B0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">formme</h1>
          <p className="text-muted-foreground">
            {mode === "signin" ? "Welcome back" : "Join our community"}
          </p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <div className="mb-6">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  type="button"
                  variant={userRole === "designer" ? "default" : "outline"}
                  onClick={() => setUserRole("designer")}
                  className="w-full"
                >
                  Designer
                </Button>
                <Button
                  type="button"
                  variant={userRole === "manufacturer" ? "default" : "outline"}
                  onClick={() => setUserRole("manufacturer")}
                  className="w-full"
                >
                  Manufacturer
                </Button>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-fullName">Full Name</Label>
                <Input
                  id="signup-fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-companyName">Company Name</Label>
                <Input
                  id="signup-companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              
              {userRole === "manufacturer" && (
                <>
                  <div>
                    <Label htmlFor="signup-location">Location</Label>
                    <Input
                      id="signup-location"
                      type="text"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Phone</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-moq">Min Order Qty</Label>
                      <Input
                        id="signup-moq"
                        type="number"
                        placeholder="100"
                        value={formData.moq}
                        onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-leadTime">Lead Time (days)</Label>
                      <Input
                        id="signup-leadTime"
                        type="number"
                        placeholder="30"
                        value={formData.leadTime}
                        onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-capabilities">Capabilities</Label>
                    <Select
                      onValueChange={(value) => {
                        if (!formData.capabilities.includes(value)) {
                          setFormData({
                            ...formData,
                            capabilities: [...formData.capabilities, value]
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select capabilities" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {capabilitiesOptions.map((capability) => (
                          <SelectItem key={capability} value={capability}>
                            {capability}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {cap}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  capabilities: formData.capabilities.filter((c) => c !== cap)
                                })
                              }
                              className="hover:text-primary/70"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-categories">Categories</Label>
                    <Select
                      onValueChange={(value) => {
                        if (!formData.categories.includes(value)) {
                          setFormData({
                            ...formData,
                            categories: [...formData.categories, value]
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {categoriesOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.categories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                          >
                            {cat}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  categories: formData.categories.filter((c) => c !== cat)
                                })
                              }
                              className="hover:text-primary/70"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
