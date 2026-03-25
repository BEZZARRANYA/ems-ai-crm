import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Music,
  MapPin,
  Mic2,
  Sparkles
} from 'lucide-react';
import {
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

type ClientItem = {
  id: number;
  name: string;
  type?: string;
  revenue?: string;
  status?: string;
};

type EventItem = {
  id: number;
  title: string;
  event_date?: string;
  client_id?: number;
  client_name?: string;
  status?: string;
};

type InvoiceItem = {
  id: number;
  invoice_code?: string;
  client: string;
  event: string;
  amount: number;
  status: string;
  date?: string;
  dueDate?: string;
  email?: string;
};

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

export default function AnalyticsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [clientsRes, eventsRes, invoicesRes] = await Promise.all([
        fetch('http://127.0.0.1:5001/api/clients'),
        fetch('http://127.0.0.1:5001/api/events'),
        fetch('http://127.0.0.1:5001/api/invoices')
      ]);

      const clientsData = await clientsRes.json();
      const eventsData = await eventsRes.json();
      const invoicesData = await invoicesRes.json();

      setClients(Array.isArray(clientsData) ? clientsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setClients([]);
      setEvents([]);
      setInvoices([]);
    }
  };

  const rangeMonthsMap: Record<TimeRange, number> = {
    '7d': 1,
    '30d': 1,
    '3m': 3,
    '6m': 6,
    '1y': 12
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const safeLower = (value: string | undefined | null) => String(value || '').trim().toLowerCase();

  const parseMoney = (value: string | number | undefined) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    return Number(String(value).replace(/[$,]/g, '')) || 0;
  };

  const getDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'Artist':
        return <Music className="w-4 h-4 text-purple-400" />;
      case 'Venue':
        return <MapPin className="w-4 h-4 text-[#ff8a01]" />;
      default:
        return <Mic2 className="w-4 h-4 text-blue-400" />;
    }
  };

  const getEventCategory = (title: string) => {
    const t = safeLower(title);

    if (t.includes('festival')) return 'Festivals';
    if (t.includes('concert') || t.includes('music') || t.includes('tour')) return 'Concerts';
    if (t.includes('corporate') || t.includes('conference') || t.includes('business')) return 'Corporate';
    if (t.includes('birthday') || t.includes('wedding') || t.includes('private')) return 'Private';

    return 'Other';
  };

  const visibleMonths = rangeMonthsMap[timeRange];

  const revenueData = useMemo(() => {
    const now = new Date();
    const buckets: { month: string; revenue: number; target: number }[] = [];

    for (let i = visibleMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        month: monthLabels[d.getMonth()],
        revenue: 0,
        target: 0
      });
    }

    invoices.forEach((invoice) => {
      const invoiceDate = getDate(invoice.date);
      if (!invoiceDate) return;

      const diffMonths =
        (now.getFullYear() - invoiceDate.getFullYear()) * 12 +
        (now.getMonth() - invoiceDate.getMonth());

      if (diffMonths < 0 || diffMonths >= visibleMonths) return;

      const index = visibleMonths - 1 - diffMonths;
      const amount = Number(invoice.amount) || 0;

      if (safeLower(invoice.status) === 'paid') {
        buckets[index].revenue += amount;
      }

      buckets[index].target += amount;
    });

    return buckets;
  }, [invoices, timeRange]);

  const eventTypeData = useMemo(() => {
    const counts: Record<string, number> = {
      Concerts: 0,
      Festivals: 0,
      Corporate: 0,
      Private: 0,
      Other: 0
    };

    events.forEach((event) => {
      counts[getEventCategory(event.title)] += 1;
    });

    return [
      { name: 'Concerts', value: counts.Concerts, color: '#8b5cf6' },
      { name: 'Festivals', value: counts.Festivals, color: '#f59e0b' },
      { name: 'Corporate', value: counts.Corporate, color: '#3b82f6' },
      { name: 'Private', value: counts.Private, color: '#10b981' }
    ].filter((item) => item.value > 0);
  }, [events]);

  const clientGrowthData = useMemo(() => {
    const now = new Date();
    const buckets: { month: string; artists: number; venues: number; vendors: number }[] = [];

    for (let i = visibleMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        month: monthLabels[d.getMonth()],
        artists: 0,
        venues: 0,
        vendors: 0
      });
    }

    clients.forEach((client) => {
      const type = client.type || '';
      const fallbackIndex = buckets.length - 1;

      if (type === 'Artist') buckets[fallbackIndex].artists += 1;
      else if (type === 'Venue') buckets[fallbackIndex].venues += 1;
      else buckets[fallbackIndex].vendors += 1;
    });

    return buckets;
  }, [clients, timeRange]);

  const invoiceOverview = useMemo(() => {
    const paid = invoices.filter((i) => safeLower(i.status) === 'paid');
    const pending = invoices.filter((i) => safeLower(i.status) === 'pending');
    const overdue = invoices.filter((i) => safeLower(i.status) === 'overdue');

    return [
      {
        status: 'Paid',
        count: paid.length,
        amount: paid.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
      },
      {
        status: 'Pending',
        count: pending.length,
        amount: pending.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
      },
      {
        status: 'Overdue',
        count: overdue.length,
        amount: overdue.reduce((acc, i) => acc + (Number(i.amount) || 0), 0)
      }
    ];
  }, [invoices]);

  const topClients = useMemo(() => {
    const revenueMap: Record<string, { name: string; revenue: number; events: number; type: string }> = {};

    clients.forEach((client) => {
      revenueMap[client.name] = {
        name: client.name,
        revenue: parseMoney(client.revenue),
        events: events.filter((e) => e.client_name === client.name).length,
        type: client.type || 'Vendor'
      };
    });

    return Object.values(revenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [clients, events]);

  const recentActivity = useMemo(() => {
    const activity: { action: string; item: string; time: string; type: string }[] = [];

    const recentEvents = [...events]
      .filter((e) => e.event_date)
      .sort((a, b) => String(b.event_date).localeCompare(String(a.event_date)))
      .slice(0, 3);

    recentEvents.forEach((event) => {
      activity.push({
        action: 'Event recorded',
        item: `${event.title} for ${event.client_name || 'Unknown client'}`,
        time: event.event_date || '-',
        type: 'event'
      });
    });

    const recentInvoices = [...invoices]
      .filter((i) => i.date)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 3);

    recentInvoices.forEach((invoice) => {
      activity.push({
        action: `Invoice ${safeLower(invoice.status) === 'paid' ? 'paid' : 'created'}`,
        item: `${invoice.invoice_code || invoice.id} - $${Number(invoice.amount).toLocaleString()}`,
        time: invoice.date || '-',
        type: safeLower(invoice.status) === 'paid' ? 'payment' : 'contract'
      });
    });

    return activity.slice(0, 6);
  }, [events, invoices]);

  const totalRevenue = invoiceOverview.find((i) => i.status === 'Paid')?.amount || 0;
  const pendingAmount = invoiceOverview.find((i) => i.status === 'Pending')?.amount || 0;
  const overdueAmount = invoiceOverview.find((i) => i.status === 'Overdue')?.amount || 0;

  const firstRevenue = revenueData[0]?.revenue || 0;
  const lastRevenue = revenueData[revenueData.length - 1]?.revenue || 0;
  const revenueGrowth =
    firstRevenue > 0 ? (((lastRevenue - firstRevenue) / firstRevenue) * 100).toFixed(1) : '0.0';

  const totalClients = clients.length;
  const totalEvents = events.length;
  const avgEventValue = totalEvents > 0 ? totalRevenue / totalEvents : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff8a01]/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`relative z-10 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <header className="h-16 border-b border-white/5 backdrop-blur-xl bg-white/[0.02] flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">Analytics</h1>
            <p className="text-sm text-white/40">Event insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            {(['7d', '30d', '3m', '6m', '1y'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={
                  timeRange === range
                    ? 'bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] text-white border-0'
                    : 'border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                }
              >
                {range}
              </Button>
            ))}
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">${(totalRevenue / 1000).toFixed(0)}k</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">+{revenueGrowth}%</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Total Clients</p>
                    <p className="text-2xl font-bold text-white">{totalClients}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">live</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Events This Year</p>
                    <p className="text-2xl font-bold text-white">{totalEvents}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">live</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#ff8a01]/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#ff8a01]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Avg. Event Value</p>
                    <p className="text-2xl font-bold text-white">${(avgEventValue / 1000).toFixed(1)}k</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400">{pendingAmount > 0 ? 'pending exists' : 'stable'}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Revenue vs Target
                  </CardTitle>
                  <Badge variant="outline" className="text-emerald-400 bg-emerald-500/10 border-0">
                    +{revenueGrowth}% growth
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={12}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0f1c',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Target"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Event Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={eventTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {eventTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0f1c',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {eventTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-white/60">{item.name}</span>
                      <span className="text-sm text-white font-medium ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Client Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0f1c',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="artists" stackId="a" fill="#8b5cf6" name="Artists" />
                      <Bar dataKey="venues" stackId="a" fill="#f59e0b" name="Venues" />
                      <Bar dataKey="vendors" stackId="a" fill="#3b82f6" name="Vendors" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#ff8a01]" />
                  Invoice Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoiceOverview.map((item) => (
                    <div key={item.status} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.status === 'Paid'
                              ? 'bg-emerald-500/10'
                              : item.status === 'Pending'
                              ? 'bg-[#ff8a01]/10'
                              : 'bg-red-500/10'
                          }`}
                        >
                          {item.status === 'Paid' ? (
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                          ) : item.status === 'Pending' ? (
                            <Calendar className="w-5 h-5 text-[#ff8a01]" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.status}</p>
                          <p className="text-sm text-white/50">{item.count} invoices</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${item.amount.toLocaleString()}</p>
                        <p className="text-sm text-white/50">
                          {invoiceOverview.reduce((a, b) => a + b.amount, 0) > 0
                            ? ((item.amount / invoiceOverview.reduce((a, b) => a + b.amount, 0)) * 100).toFixed(0)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Top Clients by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={client.name} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00173d] to-[#002a6b] flex items-center justify-center text-white text-sm font-medium border border-white/10">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{client.name}</span>
                            <Badge variant="outline" className="text-white/60 bg-white/5 border-white/10 text-xs">
                              {getClientTypeIcon(client.type)}
                              <span className="ml-1">{client.type}</span>
                            </Badge>
                          </div>
                          <span className="text-white font-semibold">${(client.revenue / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#ff8a01] to-[#ff6b00]"
                            style={{ width: `${topClients[0] ? (client.revenue / topClients[0].revenue) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-xs text-white/40 mt-1">{client.events} events</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'payment'
                            ? 'bg-emerald-500/10'
                            : activity.type === 'event'
                            ? 'bg-purple-500/10'
                            : activity.type === 'contract'
                            ? 'bg-[#ff8a01]/10'
                            : 'bg-blue-500/10'
                        }`}
                      >
                        {activity.type === 'payment' ? (
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                        ) : activity.type === 'event' ? (
                          <Calendar className="w-4 h-4 text-purple-400" />
                        ) : activity.type === 'contract' ? (
                          <FileText className="w-4 h-4 text-[#ff8a01]" />
                        ) : (
                          <Users className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-white/50 truncate">{activity.item}</p>
                        <p className="text-xs text-white/30 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}