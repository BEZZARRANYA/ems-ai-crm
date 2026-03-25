import { useEffect, useState } from "react";
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  MapPin,
  Filter,
  Download,
  ArrowUpRight,
  Users,
  Music,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ClientsPage() {
  
  const [editClient, setEditClient] = useState({
    name: "",
    contact_email: "",
    phone: "",
    type: "",
    status: "",
 });

  // ---------- NEW: selected client + dialogs ----------
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);

  // ---------- NEW: menu actions ----------
  const openClientDetails = (client: any) => {
    setSelectedClient(client);
    setIsClientDetailsOpen(true);
  };

  const openEditClient = (client: any) => {
    setSelectedClient(client);

    setEditClient({
      name: client.name ?? "",
      contact_email: client.contact_email ?? "",
      phone: client.phone ?? "",
      type: client.type ?? "",
      status: client.status ?? "active",
    });

    setIsEditClientOpen(true);
  };

  const openSendEmail = (client: any) => {
    setSelectedClient(client);
    setIsSendEmailOpen(true);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
  fetch("http://127.0.0.1:5001/api/clients")
    .then((res) => res.json())
    .then((data) => setClients(data))
    .catch((err) => console.error("Error loading clients:", err));
}, []);

  const handleDeleteClient = async (clientId: number) => {
    const ok = confirm("Delete this client? This will also delete their events.");
    if (!ok) return;

    const res = await fetch(`http://127.0.0.1:5001/api/clients/${clientId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to delete client");
      return;
    }

    // Option A: remove locally (fast)
    setClients(prev => prev.filter(c => c.id !== clientId));

    // Option B (strongest): re-fetch from backend
    // const data = await fetch("http://127.0.0.1:5001/api/clients").then(r => r.json());
    // setClients(data);
  };

  const handleExportClients = () => {
    const rows = [
      ["ID", "Name", "Email", "Phone", "Type", "Status", "Events"],
      ...filteredClients.map((client: any) => [
        client.id,
        client.name ?? "",
        client.contact_email ?? "",
        client.phone ?? "",
        client.type ?? "",
        client.status ?? "",
        client.events?.length ?? 0,
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Artist',
  });
  const filteredClients = clients.filter((client: any) => {
    const name = (client.name ?? "").toLowerCase();
    const email = (client.contact_email ?? client.email ?? "").toLowerCase();
    const type = (client.type ?? "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(q) || email.includes(q) || type.includes(q);

    const matchesFilter =
      clientFilter === "All" || (client.type ?? "") === clientFilter;

    return matchesSearch && matchesFilter;
  });

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    await fetch(`http://127.0.0.1:5001/api/clients/${selectedClient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editClient),
    });

    // reload clients
    const refreshed = await fetch("http://127.0.0.1:5001/api/clients")
      .then(r => r.json());

    setClients(refreshed);

    setIsEditClientOpen(false);
  };

  const handleAddClient = async () => {
  if (!newClient.name || !newClient.email) return;

  try {
    const response = await fetch("http://127.0.0.1:5001/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newClient.name,
        contact_email: newClient.email,
        phone: newClient.phone,
        type: newClient.type,
        status: "active",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add client");
    }

    const createdClient = await response.json();

    // Add new client to UI instantly
    setClients((prev) => [...prev, createdClient]);

    setNewClient({ name: "", email: "", phone: "", type: "Artist" });
    setIsAddDialogOpen(false);
  } catch (error) {
    console.error("Error adding client:", error);
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10 border-0';
      case 'inactive':
        return 'text-white/40 bg-white/5 border-0';
      case 'pending':
        return 'text-[#ff8a01] bg-[#ff8a01]/10 border-0';
      default:
        return 'text-white/40 bg-white/5 border-0';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Artist':
        return <Music className="w-4 h-4" />;
      case 'Venue':
        return <MapPin className="w-4 h-4" />;
      case 'Vendor':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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
            <h1 className="text-xl font-bold text-white">Clients</h1>
            <p className="text-sm text-white/40">Manage artists, venues, and vendors</p>
          </div>
          <div className="flex items-center gap-3">
            
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="h-9 rounded-md bg-white/5 border border-white/10 text-white px-3"
              >
                <option value="All" className="text-black">All</option>
                <option value="Artist" className="text-black">Artist</option>
                <option value="Venue" className="text-black">Venue</option>
                <option value="Vendor" className="text-black">Vendor</option>
                </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportClients}
              className="gap-2 border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{clients.length}</p>
                    <p className="text-xs text-white/40">Total Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Music className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {clients.filter((c: any) => c.type === 'Artist').length}
                    </p>
                    <p className="text-xs text-white/40">Artists</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff8a01]/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#ff8a01]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {clients.filter(c => c.type === 'Venue').length}
                    </p>
                    <p className="text-xs text-white/40">Venues</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {clients.reduce((acc, c) => acc + ((c.events?.length) ?? 0), 0)}
                    </p>
                    <p className="text-xs text-white/40">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clients Table */}
          <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">All Clients</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search clients..."
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
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Client</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Contact</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Events</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Revenue</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/40 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00173d] to-[#002a6b] flex items-center justify-center text-white text-sm font-medium border border-white/10">
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{client.name}</p>
                              <p className="text-xs text-white/40">{client.contact_email ?? '-'}</p>
                              {(client.events?.length ?? 0) > 0 && (
                                <div className="mt-1 space-y-1">
                                  {client.events.slice(0, 2).map((e: any) => (
                                    <p key={e.id} className="text-[11px] text-white/50">
                                      • {e.title} {e.event_date ? `(${e.event_date})` : ""}
                                    </p>
                                  ))}
                                  {client.events.length > 2 && (
                                   <p className="text-[11px] text-white/40">
                                     +{client.events.length - 2} more…
                                   </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-white/50">
                            <Phone className="w-3 h-3" />
                            {client.phone ?? "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-white/60 bg-white/5 border-white/10 text-xs">
                              {getTypeIcon(client.type)}
                              <span className="ml-1">{client.type ?? "active"}</span>
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`capitalize ${getStatusColor(client.status ?? "active")}`}>
                            {client.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-white">{client.events?.length ?? 0}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-white">{client.revenue ?? "$0"}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#0a0f1c] border-white/10 text-white"
                            >
                              <DropdownMenuItem
                                onClick={() => openClientDetails(client)}
                                className="text-white/80 focus:text-white focus:bg-white/10"
                              >
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openEditClient(client)}
                                className="text-white/80 focus:text-white focus:bg-white/10"
                              >
                                Edit Client
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openSendEmail(client)}
                                className="text-white/80 focus:text-white focus:bg-white/10"
                              >
                                Send Email
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                              >
                                Delete Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-medium text-white">No clients found</h3>
                  <p className="text-sm text-white/40 mt-1">Try adjusting your search query</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Client</DialogTitle>
            <DialogDescription className="text-white/50">
              Update the client details and click Save.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Name</Label>
              <Input
                id="name"
                placeholder="Artist Name or Venue"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@artist.com"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white/80">Client Type</Label>
              <select
                id="type"
                value={newClient.type}
                onChange={(e) => setNewClient({ ...newClient, type: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              >
                <option value="Artist" className="bg-[#0a0f1c]">Artist</option>
                <option value="Venue" className="bg-[#0a0f1c]">Venue</option>
                <option value="Vendor" className="bg-[#0a0f1c]">Vendor</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleAddClient}
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
            >
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Client Details Dialog */}
      <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Client Details</DialogTitle>
            <DialogDescription className="text-white/50">
              Here are the details of this client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-white/80">
            <div><b className="text-white">Name:</b> {selectedClient?.name}</div>
            <div><b className="text-white">Email:</b> {selectedClient?.contact_email}</div>
            <div><b className="text-white">Phone:</b> {selectedClient?.phone ?? "-"}</div>
            <div><b className="text-white">Type:</b> {selectedClient?.type}</div>
            <div><b className="text-white">Status:</b> {selectedClient?.status}</div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClientDetailsOpen(false)}
              className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              type="button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog (placeholder for now) */}
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Client</DialogTitle>
            <DialogDescription className="text-white/50">
              We will build the edit form next.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">

            <div className="space-y-1">
              <Label className="text-white/80">Name</Label>
              <Input
                value={editClient.name}
                onChange={(e) =>
                  setEditClient({ ...editClient, name: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-white/80">Email</Label>
              <Input
                value={editClient.contact_email}
                onChange={(e) =>
                  setEditClient({ ...editClient, contact_email: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-white/80">Phone</Label>
              <Input
                value={editClient.phone}
                onChange={(e) =>
                  setEditClient({ ...editClient, phone: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditClientOpen(false)}
              className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              onClick={handleUpdateClient}
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
              type="button"
            >
              Save Changes         
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Send Email Dialog */}
      <Dialog open={isSendEmailOpen} onOpenChange={setIsSendEmailOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Client Email</DialogTitle>
          </DialogHeader>

          <div className="text-white/70">
            Email: <span className="text-white">{selectedClient?.contact_email}</span>
          </div>

          <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsSendEmailOpen(false)}
            className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
