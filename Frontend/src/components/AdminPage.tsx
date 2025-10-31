import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Plane, 
  DollarSign, 
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Server,
  Database,
  Wifi,
  Lock,
  Eye,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import BottomNav from './BottomNav';

export default function AdminPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const stats = [
    {
      title: 'Total Bookings',
      value: '1,284',
      change: '+12.5%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Revenue',
      value: '$128,450',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Flights',
      value: '156',
      change: '+3.1%',
      trend: 'up',
      icon: Plane,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Users',
      value: '8,234',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  const recentBookings = [
    { pnr: 'ABC123', passenger: 'John Doe', flight: 'AA101', amount: 450, status: 'confirmed' },
    { pnr: 'DEF456', passenger: 'Jane Smith', flight: 'DL202', amount: 680, status: 'confirmed' },
    { pnr: 'GHI789', passenger: 'Bob Johnson', flight: 'UA303', amount: 520, status: 'pending' },
    { pnr: 'JKL012', passenger: 'Alice Brown', flight: 'BA404', amount: 890, status: 'confirmed' },
    { pnr: 'MNO345', passenger: 'Charlie Wilson', flight: 'EK505', amount: 1200, status: 'confirmed' },
  ];

  const adminActions = [
    { icon: Settings, title: 'System Settings', description: 'Configure platform settings', color: 'text-blue-600', key: 'settings' },
    { icon: FileText, title: 'Reports', description: 'Generate analytics reports', color: 'text-green-600', key: 'reports' },
    { icon: Shield, title: 'Security', description: 'Manage access & permissions', color: 'text-red-600', key: 'security' },
    { icon: Activity, title: 'Monitoring', description: 'System health & logs', color: 'text-purple-600', key: 'monitoring' },
  ];

  // System Settings Content
  const SystemSettingsDialog = () => (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          System Settings
        </DialogTitle>
        <DialogDescription>
          Configure platform settings and preferences
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 mt-4">
        {/* General Settings */}
        <div>
          <h3 className="text-gray-900 mb-3">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-600">Disable public access for maintenance</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow New Registrations</Label>
                <p className="text-sm text-gray-600">Enable new user sign-ups</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Send booking confirmations via email</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Booking Settings */}
        <div>
          <h3 className="text-gray-900 mb-3">Booking Settings</h3>
          <div className="space-y-4">
            <div>
              <Label>Booking Window (days)</Label>
              <Input type="number" defaultValue="365" className="mt-2" />
              <p className="text-sm text-gray-600 mt-1">Maximum days in advance to book flights</p>
            </div>
            
            <div>
              <Label>Cancellation Period (hours)</Label>
              <Input type="number" defaultValue="24" className="mt-2" />
              <p className="text-sm text-gray-600 mt-1">Hours before departure to allow cancellation</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-confirm Bookings</Label>
                <p className="text-sm text-gray-600">Skip manual confirmation step</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Payment Settings */}
        <div>
          <h3 className="text-gray-900 mb-3">Payment Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Payment Gateway</Label>
                <p className="text-sm text-gray-600">Current: Stripe</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div>
              <Label>Transaction Fee (%)</Label>
              <Input type="number" defaultValue="2.5" step="0.1" className="mt-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Partial Payments</Label>
                <p className="text-sm text-gray-600">Allow installment payments</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        <Button className="w-full">Save Changes</Button>
      </div>
    </DialogContent>
  );

  // Reports Dialog
  const ReportsDialog = () => {
    const reports = [
      { name: 'Booking Summary Report', period: 'Last 30 days', records: 1284, size: '2.4 MB', date: '2025-10-30' },
      { name: 'Revenue Analysis', period: 'Q3 2025', records: 3456, size: '5.1 MB', date: '2025-10-28' },
      { name: 'Customer Analytics', period: 'Last 90 days', records: 8234, size: '8.7 MB', date: '2025-10-25' },
      { name: 'Flight Performance', period: 'October 2025', records: 156, size: '1.2 MB', date: '2025-10-20' },
      { name: 'Payment Transactions', period: 'Last 7 days', records: 892, size: '3.6 MB', date: '2025-10-29' },
    ];

    return (
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Analytics Reports
          </DialogTitle>
          <DialogDescription>
            Generate and download detailed analytics reports
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl text-gray-900">24</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl text-gray-900">45.2 MB</p>
                <p className="text-sm text-gray-600">Total Size</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl text-gray-900">156</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </CardContent>
            </Card>
          </div>

          {/* Generate New Report */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="text-gray-900 mb-2">Generate New Report</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Custom Report
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Financial Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Reports */}
          <div>
            <h3 className="text-gray-900 mb-3">Available Reports</h3>
            <div className="space-y-2">
              {reports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-900">{report.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {report.period}
                          </span>
                          <span>{report.records.toLocaleString()} records</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{report.date}</span>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  // Security Dialog
  const SecurityDialog = () => {
    const securityEvents = [
      { type: 'success', event: 'Admin login', user: 'admin@airline.com', ip: '192.168.1.100', time: '2 minutes ago' },
      { type: 'warning', event: 'Failed login attempt', user: 'unknown@test.com', ip: '45.123.67.89', time: '15 minutes ago' },
      { type: 'success', event: 'Password changed', user: 'user@airline.com', ip: '192.168.1.105', time: '1 hour ago' },
      { type: 'warning', event: 'Multiple login attempts', user: 'test@example.com', ip: '123.45.67.89', time: '2 hours ago' },
      { type: 'success', event: 'API key generated', user: 'admin@airline.com', ip: '192.168.1.100', time: '3 hours ago' },
    ];

    const permissions = [
      { role: 'Super Admin', users: 2, access: 'Full System Access' },
      { role: 'Admin', users: 5, access: 'Dashboard & Reports' },
      { role: 'Support Agent', users: 12, access: 'Bookings & Customer Support' },
      { role: 'User', users: 8234, access: 'Booking & Profile' },
    ];

    return (
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Security & Access Control
          </DialogTitle>
          <DialogDescription>
            Manage user permissions and monitor security events
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Security Status */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-900">Security Status: Healthy</span>
              </div>
              <p className="text-sm text-gray-600">Last security scan: 30 minutes ago</p>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <div>
            <h3 className="text-gray-900 mb-3">Security Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-600" />
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-600">Auto logout after 30 minutes</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-600" />
                  <div>
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-gray-600">Restrict admin access by IP</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          {/* User Roles & Permissions */}
          <div>
            <h3 className="text-gray-900 mb-3">User Roles & Permissions</h3>
            <div className="space-y-2">
              {permissions.map((perm, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900">{perm.role}</p>
                        <p className="text-sm text-gray-600">{perm.access}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{perm.users} users</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Recent Security Events */}
          <div>
            <h3 className="text-gray-900 mb-3">Recent Security Events</h3>
            <div className="space-y-2">
              {securityEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {event.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-gray-900">{event.event}</p>
                    <p className="text-sm text-gray-600">
                      {event.user} • {event.ip}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{event.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  // Monitoring Dialog
  const MonitoringDialog = () => {
    const systemMetrics = [
      { name: 'API Server', status: 'healthy', uptime: '99.98%', response: '45ms', requests: '12.4K/min' },
      { name: 'Database', status: 'healthy', uptime: '99.99%', response: '12ms', connections: '234/500' },
      { name: 'Cache Server', status: 'healthy', uptime: '100%', response: '8ms', hitRate: '94.5%' },
      { name: 'Payment Gateway', status: 'healthy', uptime: '99.95%', response: '156ms', transactions: '45/min' },
    ];

    const recentLogs = [
      { level: 'info', message: 'Booking confirmed: PNR ABC123', service: 'Booking Service', time: '1 min ago' },
      { level: 'info', message: 'Payment processed: $450.00', service: 'Payment Service', time: '2 min ago' },
      { level: 'warning', message: 'High database latency detected', service: 'Database', time: '5 min ago' },
      { level: 'info', message: 'User registration: user@example.com', service: 'Auth Service', time: '8 min ago' },
      { level: 'error', message: 'API rate limit exceeded for IP 45.123.67.89', service: 'API Gateway', time: '12 min ago' },
      { level: 'info', message: 'Cache cleared successfully', service: 'Cache Service', time: '15 min ago' },
    ];

    return (
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            System Monitoring & Logs
          </DialogTitle>
          <DialogDescription>
            Real-time system health and activity logs
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Overall Status */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-gray-900">All Systems Operational</p>
                    <p className="text-sm text-gray-600">Last updated: 30 seconds ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Metrics */}
          <div>
            <h3 className="text-gray-900 mb-3">System Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {metric.name.includes('API') && <Server className="h-4 w-4 text-blue-600" />}
                        {metric.name.includes('Database') && <Database className="h-4 w-4 text-green-600" />}
                        {metric.name.includes('Cache') && <Activity className="h-4 w-4 text-purple-600" />}
                        {metric.name.includes('Payment') && <DollarSign className="h-4 w-4 text-orange-600" />}
                        <span className="text-gray-900">{metric.name}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Uptime</p>
                        <p className="text-gray-900">{metric.uptime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Response</p>
                        <p className="text-gray-900">{metric.response}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">
                          {metric.requests ? 'Requests' : metric.connections ? 'Connections' : metric.hitRate ? 'Hit Rate' : 'Transactions'}
                        </p>
                        <p className="text-gray-900">
                          {metric.requests || metric.connections || metric.hitRate || metric.transactions}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div>
            <h3 className="text-gray-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <Server className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-900">45%</p>
                  <p className="text-sm text-gray-600">CPU Usage</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Database className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="text-gray-900">62%</p>
                  <p className="text-sm text-gray-600">Memory</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Wifi className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-900">128 MB/s</p>
                  <p className="text-sm text-gray-600">Network</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Activity className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                  <p className="text-gray-900">234</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Activity Logs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-900">Activity Logs</h3>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
            <div className="space-y-2">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    log.level === 'error' ? 'bg-red-500' : 
                    log.level === 'warning' ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-gray-900">{log.message}</p>
                    <p className="text-sm text-gray-600">{log.service}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-500">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white pt-12 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-300">System overview and management</p>
            </div>
            <Shield className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 space-y-4">
        {/* Period Selector */}
        <Card className="shadow-md">
          <CardContent className="p-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['Today', 'Week', 'Month', 'Year'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period.toLowerCase() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.toLowerCase())}
                  className="whitespace-nowrap"
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {adminActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setOpenDialog(action.key)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`h-8 w-8 ${action.color} mx-auto mb-2`} />
                  <h3 className="text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs Section */}
        <Card className="shadow-md">
          <Tabs defaultValue="bookings" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
                <TabsTrigger value="flights">Flight Status</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="bookings" className="mt-0">
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.pnr}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-900">{booking.pnr}</span>
                          <Badge 
                            variant="secondary" 
                            className={
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {booking.passenger} • {booking.flight}
                        </p>
                      </div>
                      <span className="text-gray-900">${booking.amount}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="flights" className="mt-0">
                <div className="text-center py-8">
                  <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Flight status monitoring</p>
                  <p className="text-sm text-gray-500 mt-2">Real-time flight tracking coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Advanced Analytics</p>
                  <p className="text-sm text-gray-500 mt-2">Detailed reports and insights</p>
                  <Button className="mt-4">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Full Report
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* System Status */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Gateway</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Server Load</span>
                <Badge variant="secondary">45%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />

      {/* Dialogs */}
      <Dialog open={openDialog === 'settings'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <SystemSettingsDialog />
      </Dialog>

      <Dialog open={openDialog === 'reports'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <ReportsDialog />
      </Dialog>

      <Dialog open={openDialog === 'security'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <SecurityDialog />
      </Dialog>

      <Dialog open={openDialog === 'monitoring'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <MonitoringDialog />
      </Dialog>
    </div>
  );
}