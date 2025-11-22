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
import NavBar from '@/components/Navbar';

// Mock data
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
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Manufacturer Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            View your current orders, update status, and collaborate with designers.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order / Design Name</TableHead>
                  <TableHead>Designer Name</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.designName}</TableCell>
                    <TableCell>{order.designerName}</TableCell>
                    <TableCell>{order.stage}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.nextAction}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/manufacturer/order/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View Order
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;
