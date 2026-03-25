import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Receipt,
  Sparkles,
  Mail,
  Copy,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type ToneType = 'friendly' | 'firm' | 'final';

export default function InvoicesPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reminderDialog, setReminderDialog] = useState<{ open: boolean; invoice: any | null }>({
    open: false,
    invoice: null
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    event: '',
    amount: '',
    status: 'pending',
    date: '',
    dueDate: ''
  });
  
  // AI Email Draft State
  const [selectedTone, setSelectedTone] = useState<ToneType>('friendly');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.event.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      String(invoice.status || '').toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = async () => {
    try {
      const payload = {
        client_id: Number(newInvoice.client_id),
        event: newInvoice.event,
        amount: Number(newInvoice.amount),
        status: newInvoice.status,
        date: newInvoice.date,
        dueDate: newInvoice.dueDate
      };

      const res = await fetch('http://127.0.0.1:5001/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create invoice');
        return;
      }

      toast.success('Invoice created');
      setCreateDialogOpen(false);
      setNewInvoice({
        client_id: '',
        event: '',
        amount: '',
        status: 'pending',
        date: '',
        dueDate: ''
      });
      await fetchInvoices();
    } catch (error) {
      toast.error('Error creating invoice');
    }
  };
  
   const handleExportInvoices = () => {
    if (filteredInvoices.length === 0) {
      toast.error('No invoices to export');
      return;
    }

    const headers = ['Invoice ID', 'Client', 'Event', 'Amount', 'Status', 'Date', 'Due Date', 'Email'];

    const rows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.client,
      invoice.event,
      invoice.amount,
      invoice.status,
      invoice.date,
      invoice.dueDate,
      invoice.email
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoices.csv';
    link.click();

    URL.revokeObjectURL(url);
    toast.success('Invoices exported');
  };

  const generateEmailDraft = (invoice: any, tone: ToneType) => {    setIsGeneratingEmail(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      
      let subject = '';
      let body = '';
      
      switch (tone) {
        case 'friendly':
          subject = `Friendly Reminder: Invoice ${invoice.id} - ${invoice.event}`;
          body = `Hi there,

I hope this message finds you well! I wanted to send a quick friendly reminder about Invoice ${invoice.id} for ${invoice.event}.

Invoice Details:
• Amount: $${invoice.amount.toLocaleString()}
• Due Date: ${invoice.dueDate}
• Days Overdue: ${daysOverdue}

We understand things can get busy, and this might have slipped through the cracks. If you've already sent the payment, please disregard this message. Otherwise, we'd greatly appreciate it if you could process this at your earliest convenience.

If you have any questions or need to discuss payment arrangements, please don't hesitate to reach out. We're here to help!

Thank you for your continued partnership.

Best regards,
Event Management Team`;
          break;
          
        case 'firm':
          subject = `Payment Required: Invoice ${invoice.id} - $${invoice.amount.toLocaleString()}`;
          body = `Dear ${invoice.client},

This is a formal reminder that Invoice ${invoice.id} for ${invoice.event} remains unpaid.

Invoice Details:
• Amount Due: $${invoice.amount.toLocaleString()}
• Original Due Date: ${invoice.dueDate}
• Days Overdue: ${daysOverdue}

We require immediate attention to this matter. Please remit payment within the next 5 business days to avoid any late fees or service interruptions.

If there are any issues with the invoice or if you need to set up a payment plan, please contact our accounts department immediately.

Thank you for your prompt attention to this matter.

Regards,
Accounts Receivable
Event Management System`;
          break;
          
        case 'final':
          subject = `URGENT: Final Notice - Invoice ${invoice.id} - Immediate Payment Required`;
          body = `ATTENTION: ${invoice.client}

FINAL NOTICE - IMMEDIATE ACTION REQUIRED

Invoice ${invoice.id} for ${invoice.event} is now ${daysOverdue} days overdue with an outstanding balance of $${invoice.amount.toLocaleString()}.

This is your final notice before we escalate this matter to our collections department and suspend all future services.

YOU MUST RESPOND WITHIN 48 HOURS:
1. Make full payment of $${invoice.amount.toLocaleString()}
2. Contact us to arrange a payment plan
3. Provide documentation if you believe this invoice is in error

Failure to respond will result in:
• Service suspension
• Collection agency referral
• Potential legal action

Payment can be made via bank transfer or credit card. Contact us immediately at accounts@ems.com or (555) 000-0000.

This matter requires your urgent attention.

Sincerely,
Legal & Collections Department
Event Management System`;
          break;
      }
      
      setEmailSubject(subject);
      setEmailBody(body);
      setIsGeneratingEmail(false);
    }, 1000);
  };

  const handleGenerateReminder = (invoice: any) => {
    setReminderDialog({ open: true, invoice });
    // Auto-generate initial email
    setTimeout(() => generateEmailDraft(invoice, selectedTone), 100);
  };

  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    if (reminderDialog.invoice) {
      generateEmailDraft(reminderDialog.invoice, tone);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const sendReminder = () => {
    if (reminderDialog.invoice) {
      toast.success(`Reminder email prepared for ${reminderDialog.invoice.client}`, {
        description: `Invoice ${reminderDialog.invoice.id} - $${reminderDialog.invoice.amount.toLocaleString()}`
      });
      setReminderDialog({ open: false, invoice: null });
      setEmailSubject('');
      setEmailBody('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-400 bg-emerald-500/10 border-0';
      case 'pending':
        return 'text-[#ff8a01] bg-[#ff8a01]/10 border-0';
      case 'overdue':
        return 'text-red-400 bg-red-500/10 border-0';
      default:
        return 'text-white/40 bg-white/5 border-0';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'overdue':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const totalRevenue = invoices
    .filter(i => (i.status || '').toLowerCase() === 'paid')
    .reduce((acc, i) => acc + Number(i.amount), 0);

  const pendingAmount = invoices
    .filter(i => (i.status || '').toLowerCase() === 'pending')
    .reduce((acc, i) => acc + Number(i.amount), 0);

  const overdueAmount = invoices
    .filter(i => (i.status || '').toLowerCase() === 'overdue')
    .reduce((acc, i) => acc + Number(i.amount), 0);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5001/api/invoices');
      const data = await res.json();

      if (!Array.isArray(data)) {
        setInvoices([]);
        return;
      }

      setInvoices(
        data.map((invoice: any) => ({
          id: invoice.invoice_code,
          dbId: invoice.id,
          client: invoice.client,
          event: invoice.event,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.date,
          dueDate: invoice.dueDate,
          email: invoice.email
        }))
      );
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      {/* Animated Background */}
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
        {/* Header */}
        <header className="h-16 border-b border-white/5 backdrop-blur-xl bg-white/[0.02] flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">Invoices</h1>
            <p className="text-sm text-white/40">Manage event invoices and payments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-white/10 bg-white/5 rounded-md px-3 h-9">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-white outline-none"
              >
                <option value="all" className="bg-[#0a0f1c] text-white">All</option>
                <option value="paid" className="bg-[#0a0f1c] text-white">Paid</option>
                <option value="pending" className="bg-[#0a0f1c] text-white">Pending</option>
                <option value="overdue" className="bg-[#0a0f1c] text-white">Overdue</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleExportInvoices}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              size="sm"
               className="gap-2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
               onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-white/40">Total Paid</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ff8a01]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#ff8a01]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">${pendingAmount.toLocaleString()}</p>
                      <p className="text-xs text-white/40">Pending</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#ff8a01]" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">${overdueAmount.toLocaleString()}</p>
                      <p className="text-xs text-white/40">Overdue</p>
                    </div>
                  </div>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{invoices.length}</p>
                    <p className="text-xs text-white/40">Total Invoices</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices Table */}
          <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">All Invoices</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Invoice ID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Client</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Event</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Due Date</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/40 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-white/30" />
                            <span className="font-medium text-white">{invoice.id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00173d] to-[#002a6b] flex items-center justify-center text-white text-xs font-medium border border-white/10">
                              {invoice.client.charAt(0)}
                            </div>
                            <span className="text-sm text-white/70">{invoice.client}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/50">{invoice.event}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-white">${invoice.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`capitalize gap-1 ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-white/50">
                            <Calendar className="w-3 h-3" />
                            {invoice.dueDate}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.status === 'overdue' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-[#ff8a01] border-[#ff8a01]/30 hover:bg-[#ff8a01]/10"
                                onClick={() => handleGenerateReminder(invoice)}
                              >
                                <Sparkles className="w-3 h-3" />
                                AI Reminder
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0a0f1c] border-white/10">
                                <DropdownMenuItem
                                  className="text-white focus:text-white hover:text-white focus:bg-white/10 cursor-pointer"
                                  onClick={() => {    
                                    
                                    alert(`Invoice: ${invoice.id}
                                Client: ${invoice.client}
                                Amount: $${invoice.amount}
                                Status: ${invoice.status}`);
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-white focus:text-white hover:text-white focus:bg-white/10 cursor-pointer"
                                  onClick={() => {
                                    const content = `
                                Invoice: ${invoice.id}
                                Client: ${invoice.client}
                                Event: ${invoice.event}
                                Amount: $${invoice.amount}
                                Status: ${invoice.status}
                                    `;

                                    const blob = new Blob([content], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);

                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${invoice.id}.txt`;
                                    a.click();
                                  }}
                                >
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-white focus:text-white hover:text-white focus:bg-white/10 cursor-pointer"
                                  onClick={() => {
                                    setNewInvoice({
                                      client_id: '',
                                      event: invoice.event,
                                      amount: String(invoice.amount),
                                      status: invoice.status,
                                      date: invoice.date,
                                      dueDate: invoice.dueDate
                                    });

                                    setCreateDialogOpen(true);
                                  }}
                                >
                                  Edit Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400 hover:text-red-300 focus:bg-red-500/10"
                                  onSelect={async () => {
                                    try {
                                      const realId = (invoice as any).dbId;
                                      if (!realId) {
                                        toast.error('This invoice is still mock data');
                                        return;
                                      }

                                      const res = await fetch(`http://127.0.0.1:5001/api/invoices/${realId}`, {
                                        method: 'DELETE'
                                      });

                                      if (!res.ok) {
                                        toast.error('Failed to delete invoice');
                                        return;
                                      }

                                      toast.success('Invoice deleted');
                                      await fetchInvoices();
                                    } catch (error) {
                                      toast.error('Error deleting invoice');
                                    }
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-medium text-white">No invoices found</h3>
                  <p className="text-sm text-white/40 mt-1">Try adjusting your search query</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* AI Reminder Email Generator Dialog */}
      <Dialog open={reminderDialog.open} onOpenChange={(open) => {
        if (!open) {
          setReminderDialog({ open: false, invoice: null });
          setEmailSubject('');
          setEmailBody('');
        }
      }}>
        <DialogContent className="sm:max-w-2xl bg-[#0a0f1c] border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff8a01]/20 to-[#ff6b00]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#ff8a01]" />
              </div>
              <div>
                <DialogTitle className="text-white">AI Reminder Email Generator</DialogTitle>
                <p className="text-xs text-white/40">Powered by Ollama</p>
              </div>
            </div>
            <DialogDescription className="text-white/50">
              Generate a personalized reminder email for {reminderDialog.invoice?.client}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Invoice Summary */}
            <div className="p-4 rounded-lg bg-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Invoice ID:</span>
                <span className="text-sm font-medium text-white">{reminderDialog.invoice?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Client:</span>
                <span className="text-sm font-medium text-white">{reminderDialog.invoice?.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Event:</span>
                <span className="text-sm font-medium text-white">{reminderDialog.invoice?.event}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Amount:</span>
                <span className="text-sm font-medium text-white">${reminderDialog.invoice?.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Due Date:</span>
                <span className="text-sm font-medium text-white">{reminderDialog.invoice?.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-white/50">Days Overdue:</span>
                <span className="text-sm font-medium text-red-400">
                  {reminderDialog.invoice && Math.floor((new Date().getTime() - new Date(reminderDialog.invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <Label className="text-white/80 mb-2 block">Select Email Tone</Label>
              <div className="flex gap-2">
                {(['friendly', 'firm', 'final'] as ToneType[]).map((tone) => (
                  <Button
                    key={tone}
                    variant={selectedTone === tone ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToneChange(tone)}
                    className={selectedTone === tone 
                      ? 'bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] text-white border-0 capitalize' 
                      : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 capitalize'
                    }
                  >
                    {tone}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reminderDialog.invoice && generateEmailDraft(reminderDialog.invoice, selectedTone)}
                  disabled={isGeneratingEmail}
                  className="border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 ml-auto"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isGeneratingEmail ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
            </div>

            {/* Generated Email */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white/80">Subject</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(emailSubject)}
                  className="text-white/50 hover:text-white hover:bg-white/10 h-8"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
                placeholder="Email subject will appear here..."
              />
              
              <div className="flex items-center justify-between">
                <Label className="text-white/80">Email Body</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(emailBody)}
                  className="text-white/50 hover:text-white hover:bg-white/10 h-8"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="bg-white/5 border-white/10 text-white focus:border-[#ff8a01] focus:ring-[#ff8a01]/20 min-h-[250px] font-mono text-sm"
                placeholder="Email body will be generated here..."
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10" 
              onClick={() => {
                setReminderDialog({ open: false, invoice: null });
                setEmailSubject('');
                setEmailBody('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] gap-2"
              onClick={sendReminder}
            >
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Invoice Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create Invoice</DialogTitle>
            <DialogDescription className="text-white/50">
              Add a new invoice to the system
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white/80">Client ID</Label>
              <Input
                value={newInvoice.client_id}
                onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter client ID"
              />
            </div>

            <div>
              <Label className="text-white/80">Event</Label>
              <Input
                value={newInvoice.event}
                onChange={(e) => setNewInvoice({ ...newInvoice, event: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter event name"
              />
            </div>

            <div>
              <Label className="text-white/80">Amount</Label>
              <Input
                type="number"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label className="text-white/80">Status</Label>
              <Input
                value={newInvoice.status}
                onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="pending / paid / overdue"
              />
            </div>

            <div>
              <Label className="text-white/80">Issue Date</Label>
              <Input
                type="date"
                value={newInvoice.date}
                onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-white/80">Due Date</Label>
              <Input
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
              onClick={handleCreateInvoice}
            >
              Save Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
