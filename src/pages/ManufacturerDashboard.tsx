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
import { Factory, CheckCircle, XCircle } from 'lucide-react';
import NavBar from '@/components/Navbar';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Mock data for current orders
const mockOrders = [
  {
    id: '1',
    designName: 'Cotton Pajama Set',
    designerName: 'Emma Johnson',
    stage: 'Sample Development',
    status: 'On Track',
    nextAction: 'Upload sample progress photos',
  },
  {
    id: '2',
    designName: 'Premium Crew Neck',
    designerName: 'Michael Chen',
    stage: 'Production Approval',
    status: 'Action Required',
    nextAction: 'Upload lab dip photos',
  },
  {
    id: '3',
    designName: 'V-Neck T-Shirt',
    designerName: 'Sophia Rodriguez',
    stage: 'Quality Check',
    status: 'On Track',
    nextAction: 'Upload QC photos',
  },
  {
    id: '4',
    designName: 'Hooded Sweatshirt',
    designerName: 'Lucas Wong',
    stage: 'Tech Pack',
    status: 'Delayed',
    nextAction: 'Review tech pack details',
  },
];

// Mock data for potential orders (order matching)
const mockPotentialOrders = [
  {
    id: 'p1',
    designName: 'Organic Cotton Tee',
    designerName: 'Sarah Williams',
    category: 'T-Shirts',
    quantity: 500,
    targetPrice: '$12-15',
    deadline: '45 days',
    requirements: 'Organic cotton, GOTS certified, custom embroidery'
  },
  {
    id: 'p2',
    designName: 'Athletic Joggers',
    designerName: 'David Park',
    category: 'Pants',
    quantity: 300,
    targetPrice: '$20-25',
    deadline: '60 days',
    requirements: 'Moisture-wicking fabric, elastic waistband, side pockets'
  },
  {
    id: 'p3',
    designName: 'Summer Dress Collection',
    designerName: 'Maria Garcia',
    category: 'Dresses',
    quantity: 200,
    targetPrice: '$30-40',
    deadline: '75 days',
    requirements: 'Lightweight fabric, multiple sizes, quality stitching'
  },
];

const kpiData = [
  { title: 'Active Orders', value: 4, color: 'text-primary' },
  { title: 'Awaiting Your Action', value: 2, color: 'text-amber-600' },
  { title: 'In Production', value: 3, color: 'text-blue-600' },
  { title: 'Ready to Ship', value: 1, color: 'text-green-600' },
];

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
                    {mockOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{order.designName}</TableCell>
                        <TableCell>{order.designerName}</TableCell>
                        <TableCell>
                          <span className="group relative">
                            <span className="text-sm text-muted-foreground group-hover:opacity-0 transition-opacity">
                              {order.stage}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            >
                              {order.stage}
                            </Badge>
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="group relative inline-block">
                            <span className="text-sm group-hover:opacity-0 transition-opacity">
                              {order.status}
                            </span>
                            <Badge 
                              className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                                getStatusColor(order.status)
                              )}
                            >
                              {order.status}
                            </Badge>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.nextAction}
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
                    ))}
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
                <div className="space-y-4">
                  {mockPotentialOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">
                                {order.designName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Designer: {order.designerName}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p className="font-medium">{order.category}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quantity:</span>
                                <p className="font-medium">{order.quantity} units</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Target Price:</span>
                                <p className="font-medium">{order.targetPrice}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Deadline:</span>
                                <p className="font-medium">{order.deadline}</p>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Requirements:</span>
                              <p className="text-sm mt-1">{order.requirements}</p>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center gap-3">
                            <Button className="w-full gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Accept Order
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                              <XCircle className="w-4 h-4" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
