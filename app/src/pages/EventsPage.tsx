import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pause } from 'lucide-react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  TrendingUp,
  Filter,
  BarChart3,
  Music,
  Mic2,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function EventsPage() {
  const toDateInputValue = (value: any) => {
    if (!value) return "";
    // If already "YYYY-MM-DD", keep it
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // If "DD/MM/YYYY" or "MM/DD/YYYY", try to convert (best-effort)
    const parts = String(value).split("/");
    if (parts.length === 3) {
      const [a, b, c] = parts; // a/b/c
      // assume a=DD, b=MM (common outside US)
      const dd = a.padStart(2, "0");
      const mm = b.padStart(2, "0");
      const yyyy = c;
      return `${yyyy}-${mm}-${dd}`;
    }

    return "";
  };

const toBackendDate = (value: string) => {
  // input type="date" gives "YYYY-MM-DD" already
  return value || null;
};

  const [artistsInput, setArtistsInput] = useState("");
  const [artists, setArtists] = useState<string[]>([]);

  const artistsKey = (eventId: number) => `ems_event_artists_${eventId}`;

  const [editEvent, setEditEvent] = useState({
    title: "",
    event_date: "",
    status: "active",
  });

  // ---------- NEW: selected event + dialogs ----------
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isManageArtistsOpen, setIsManageArtistsOpen] = useState(false);

  // ---------- NEW: menu actions ----------
  const openEventDetails = (event: any) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const openEditEvent = (event: any) => {
    setSelectedEvent(event);

    setEditEvent({
      title: event.title ?? "",
      event_date: toDateInputValue(event.event_date),
      status: event.status ?? "active",
    });

    setIsEditEventOpen(true);
  };

  const openManageArtists = (event: any) => {
    setSelectedEvent(event);

    const saved = localStorage.getItem(artistsKey(event.id));
    setArtists(saved ? JSON.parse(saved) : []);

    setArtistsInput("");
    setIsManageArtistsOpen(true);
  };
  
  const addArtist = () => {
    const name = artistsInput.trim();
    if (!name || !selectedEvent) return;

    const next = [...artists, name];
    setArtists(next);
    localStorage.setItem(artistsKey(selectedEvent.id), JSON.stringify(next));
    setArtistsInput("");
  };
  
  const removeArtist = (index: number) => {
    if (!selectedEvent) return;

    const next = artists.filter((_, i) => i !== index);
    setArtists(next);
    localStorage.setItem(artistsKey(selectedEvent.id), JSON.stringify(next));
  }; 

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState("All");

  const mapEvent = (e: any) => ({
    ...e,
    type: "Concert",
  });

  useEffect(() => {
  // Load events
  fetch("http://127.0.0.1:5001/api/events")
    .then((res) => res.json())
    .then((data) => setEvents(data.map(mapEvent)))
    .catch((err) => console.error("Error loading events:", err));

  // Load clients (for the dropdown)
  fetch("http://127.0.0.1:5001/api/clients")
    .then((res) => res.json())
    .then((data) => setClients(data))
    .catch((err) => console.error("Error loading clients:", err));
}, []);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    event_date: "",
    client_id: "",
  });

  const filteredEvents = events.filter((event: any) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      (event.title ?? "").toLowerCase().includes(q) ||
      (event.client_name ?? "").toLowerCase().includes(q);

    const matchesFilter =
      eventFilter === "All" || (event.status ?? "active") === eventFilter;

    return matchesSearch && matchesFilter;
  });
  
  const  handleDeleteEvent= async (eventId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to update event:\n${text}`);
        return;
      }

      // remove from UI instantly
      setEvents((prev) => prev.filter((e: any) => e.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const res = await fetch(`http://127.0.0.1:5001/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editEvent.title,
          event_date: toBackendDate(editEvent.event_date),
          status: editEvent.status,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to update event: ${text}`);
        return;
      }

      const refreshed = await fetch("http://127.0.0.1:5001/api/events").then(r => r.json());
      setEvents(refreshed.map(mapEvent));

      setIsEditEventOpen(false);
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.client_id) return;

    try {
      const res = await fetch("http://127.0.0.1:5001/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title,
          event_date: toBackendDate(newEvent.event_date),
          client_id: Number(newEvent.client_id),
          status: "active",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to create event:\n${text}`);
        return;
      }

      const refreshed = await fetch("http://127.0.0.1:5001/api/events").then(r => r.json());
      setEvents(refreshed.map(mapEvent));

      setNewEvent({ title: "", event_date: "", client_id: "" });
      setIsAddDialogOpen(false);
    } catch (e) {
      console.error("Error creating event:", e);
      alert("Failed to create event");
    } 
  };
     
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10 border-0';
      case 'completed':
        return 'text-blue-400 bg-blue-500/10 border-0';
      case 'on-hold':
        return 'text-[#ff8a01] bg-[#ff8a01]/10 border-0';
      default:
        return 'text-white/40 bg-white/5 border-0';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-[#ff8a01]';
    return 'bg-red-500';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'Festival':
        return <Sparkles className="w-4 h-4" />;
      case 'Concert':
        return <Music className="w-4 h-4" />;
      case 'Party':
        return <Mic2 className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const activeEvents = events.filter(
    (event) => (event.status || "").toLowerCase().trim() === "active"
  ).length;

  const completedEvents = events.filter(
    (event) => (event.status || "").toLowerCase().trim() === "completed"
  ).length;

  const onHoldEvents = events.filter(
    (event) => (event.status || "").toLowerCase().trim() === "on-hold"
  ).length;
  

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
            <h1 className="text-xl font-bold text-white">Events</h1>
            <p className="text-sm text-white/40">Manage your events and track progress</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-9 rounded-md bg-white/5 border border-white/10 text-white px-3"
            >
              <option value="All" className="text-black">All</option>
              <option value="active" className="text-black">active</option>
              <option value="completed" className="text-black">completed</option>
              <option value="on-hold" className="text-black">on-hold</option>
            </select>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{events.length}</p>
                    <p className="text-xs text-white/40">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{activeEvents}</p>
                    <p className="text-xs text-white/40">Active Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff8a01]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#ff8a01]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{completedEvents}</p>
                    <p className="text-xs text-white/40">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff8a01]/10 flex items-center justify-center">
                    <Pause className="w-5 h-5 text-[#ff8a01]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{onHoldEvents}</p>
                    <p className="text-xs text-white/40">On Hold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="border-0 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-white/60 bg-white/5 border-white/10 text-xs">
                          {getEventTypeIcon("Concert")}
                          <span className="ml-1">Concert</span>
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <MapPin className="w-4 h-4" />
                        {event.client_name ?? `Client #${event.client_id}`}
                      </div>
                    </div>
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
                          onClick={() => openEventDetails(event)}
                          className="text-white/80 focus:text-white focus:bg-white/10"
                        >
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openEditEvent(event)}
                          className="text-white/80 focus:text-white focus:bg-white/10"
                        >
                          Edit Event
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openManageArtists(event)}
                          className="text-white/80 focus:text-white focus:bg-white/10"
                        >
                          Manage Artists
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
                        >
                          Delete Event
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/50">Planning Progress</span>
                        <span className="text-white font-medium">50%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(50)} transition-all duration-500`}
                          style={{ width: `50%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Users className="w-4 h-4" />
                          0 attendees
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Calendar className="w-4 h-4" />
                          {event.event_date ?? "-"}
                        </div>
                      </div>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(event.status)}`}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white">No events found</h3>
              <p className="text-sm text-white/40 mt-1">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Event</DialogTitle>
            <DialogDescription className="text-white/50">
              Enter the event details below to create a new event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Event Name</Label>
              <Input
                id="name"
                placeholder="Summer Music Festival 2024"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white/80">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id" className="text-white/80">Client</Label>
              <select
                id="client_id"
                value={newEvent.client_id}
                onChange={(e) => setNewEvent({ ...newEvent, client_id: e.target.value })}
                className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3 focus:border-[#ff8a01] focus:outline-none"
              >
                <option value="">Select a client...</option>
                {clients.map((c: any) => (
                 <option key={c.id} value={String(c.id)} className="text-black">
                   {c.name}
                 </option>
                ))}
              </select>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleAddEvent}
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        {/* Event Details Dialog */}
        <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
          <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Event Details</DialogTitle>
                <DialogDescription className="text-white/50">
                  Quick details about this event.
                </DialogDescription>
              </DialogHeader>

              <div className="text-white/80 text-sm space-y-2">
              <div><span className="text-white/50">Title:</span> {selectedEvent?.title}</div>
              <div><span className="text-white/50">Client:</span> {selectedEvent?.client_name ?? selectedEvent?.client_id}</div>
              <div><span className="text-white/50">Date:</span> {selectedEvent?.event_date}</div>
              <div><span className="text-white/50">Status:</span> {selectedEvent?.status}</div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEventDetailsOpen(false)}
                className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
       </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Event</DialogTitle>
              <DialogDescription className="text-white/50">
                Update the event details and click Save.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
               <Label className="text-white/80">Title</Label>
               <Input
                  value={editEvent.title}
                  onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-white/80">Date</Label>
                <Input
                  type="date"
                  value={editEvent.event_date}
                  onChange={(e) => setEditEvent({ ...editEvent, event_date: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-white/80">Status</Label>
                <select
                  value={editEvent.status}
                  onChange={(e) => setEditEvent({ ...editEvent, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                >
                  <option value="active" className="bg-[#0a0f1c]">active</option>
                  <option value="completed" className="bg-[#0a0f1c]">completed</option>
                  <option value="on-hold" className="bg-[#0a0f1c]">on-hold</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditEventOpen(false)}
                className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
                type="button"
              >
                Cancel        
              </Button>

              <Button
                onClick={handleUpdateEvent}
                className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
                type="button"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Artists Dialog */}
        <Dialog open={isManageArtistsOpen} onOpenChange={setIsManageArtistsOpen}>
          <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Manage Artists</DialogTitle>
              <DialogDescription className="text-white/50">
                Artists for: {selectedEvent?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Type artist name..."
                  value={artistsInput}
                  onChange={(e) => setArtistsInput(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button
                  onClick={addArtist}
                  className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
                  type="button"
                >
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {artists.length === 0 ? (
                  <p className="text-white/50 text-sm">No artists yet.</p>
                ) : (
                  artists.map((a, idx) => (
                    <div
                    key={`${a}-${idx}`}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-3 py-2"
                    >
                      <span className="text-white/80 text-sm">{a}</span>
                      <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArtist(idx)}
                      className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
                      type="button"
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManageArtistsOpen(false)}
              className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              type="button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
