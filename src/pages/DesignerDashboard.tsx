import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Shirt, Truck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Design {
  id: string;
  name: string;
  category: string;
  created_at: string;
  thumbnail_url: string | null;
}

interface Order {
  id: string;
  status: string;
  design_id: string;
  designs: Design;
  manufacturers: {
    name: string;
  } | null;
}

const DesignerDashboard = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "designer") {
      navigate("/manufacturer");
    }
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: designsData } = await supabase
        .from("designs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          *,
          designs(*),
          manufacturers(name)
        `)
        .eq("designer_id", user.id)
        .order("created_at", { ascending: false });

      setDesigns(designsData || []);
      setOrders(ordersData || []);
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Package className="w-4 h-4" />;
      case "sample_development": return <Shirt className="w-4 h-4" />;
      case "shipping": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "tech_pack_pending": return "outline";
      case "sent_to_manufacturer": return "default";
      case "sample_development": return "default";
      case "shipping": return "default";
      case "delivered": return "default";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your designs and production orders</p>
          </div>
          <Button onClick={() => navigate("/studio-selection")} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Design
          </Button>
        </div>

        <div className="grid gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Active Orders</h2>
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => navigate("/studio-selection")}>
                  Create your first design
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card
                    key={order.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/workflow/${order.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="font-semibold">{order.designs.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.manufacturers?.name || "No manufacturer selected"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">All Designs</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {designs.map((design) => (
                <Card
                  key={design.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/design/${design.id}`)}
                >
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    {design.thumbnail_url ? (
                      <img
                        src={design.thumbnail_url}
                        alt={design.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Shirt className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold">{design.name}</h3>
                  <p className="text-sm text-muted-foreground">{design.category}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DesignerDashboard;
