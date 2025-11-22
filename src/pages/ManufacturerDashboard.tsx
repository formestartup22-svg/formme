import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Factory, CheckCircle, XCircle, Clock } from 'lucide-react';
import NavBar from '@/components/Navbar';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useManufacturerOrders } from '@/hooks/useManufacturerOrders';


const getStatusColor = (status: string) => {
  switch (status) {
    case 'On Track':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Delayed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Action Required':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const ManufacturerDashboard = () => {
  const [profileCreated, setProfileCreated] = useState(true);
  const { orders, loading } = useManufacturerOrders();

  const activeOrders = orders.length;
  const awaitingAction = orders.filter(o => 
    o.status === 'manufacturer_review' || o.status === 'production_approval'
  ).length;
  const inProduction = orders.filter(o => 
    o.status === 'sample_development' || o.status === 'in_production'
  ).length;
  const readyToShip = orders.filter(o => o.status === 'ready_to_ship').length;

  const kpiData = [
    { title: 'Active Orders', value: activeOrders, color: 'text-primary' },
    { title: 'Awaiting Your Action', value: awaitingAction, color: 'text-amber-600' },
    { title: 'In Production', value: inProduction, color: 'text-blue-600' },
    { title: 'Ready to Ship', value: readyToShip, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        {/* Header with Profile Action */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Manufacturing Hub</h1>
            <p className="text-muted-foreground text-lg">
              Manage orders, discover opportunities, and grow your business
            </p>
          </div>
          {!profileCreated && (
            <Button 
              onClick={() => setProfileCreated(true)}
              className="gap-2"
            >
              <Factory className="w-4 h-4" />
              Create Factory Profile
            </Button>
          )}
        </div>

        {/* KPI Cards - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {kpiData.map((kpi) => (
            <Card key={kpi.title} className="border border-border">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">{kpi.title}</div>
                <div className={`text-2xl font-semibold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Orders and Opportunities */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="current">Current Orders</TabsTrigger>
            <TabsTrigger value="opportunities">Find Orders</TabsTrigger>
          </TabsList>

          {/* Current Orders Tab */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Active Production Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Design Name</TableHead>
                      <TableHead>Designer</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Action</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                          <p className="text-muted-foreground">Loading orders...</p>
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-muted-foreground">No orders yet</p>
                          <p className="text-sm text-muted-foreground mt-1">Check the "Find Orders" tab for opportunities</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{order.designs.name}</TableCell>
                          <TableCell>{order.profiles?.full_name || 'Unknown'}</TableCell>
                          <TableCell>
                            <span className="group relative">
                              <span className="text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                                {order.status?.replace(/_/g, ' ') || 'Pending'}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                              >
                                {order.status?.replace(/_/g, ' ') || 'Pending'}
                              </Badge>
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="group relative inline-block">
                              <span className="text-sm group-hover:opacity-0 transition-opacity">
                                {order.status?.includes('review') ? 'Action Required' : 'On Track'}
                              </span>
                              <Badge 
                                className={cn(
                                  "absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                  order.status?.includes('review') 
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                )}
                              >
                                {order.status?.includes('review') ? 'Action Required' : 'On Track'}
                              </Badge>
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            Review order details
                          </TableCell>
                          <TableCell className="text-right">
                            <Link to={`/manufacturer/order/${order.id}`}>
                              <span className="group relative inline-block">
                                <span className="text-sm text-primary group-hover:opacity-0 transition-opacity">
                                  View Order
                                </span>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                >
                                  View Order
                                </Button>
                              </span>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Potential Orders Tab */}
          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle>Available Order Opportunities</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Review designer requests and accept orders that match your capabilities
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No available orders at the moment</p>
                  <p className="text-sm mt-2">Check back later for new opportunities</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
