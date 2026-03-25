import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Calendar,
  FileText,
  Send,
  Sparkles,
  MoreHorizontal,
  Clock,
  ArrowUpRight,
  Music,
  Mic2
} from 'lucide-react';

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<any[]>([]);
  const [highlightedStat, setHighlightedStat] = useState<string | null>(null);
  const [inactiveClientsResult, setInactiveClientsResult] = useState<any[]>([]);
  const [insightCard, setInsightCard] = useState<any | null>(null);
  const [recommendationText, setRecommendationText] = useState<string>('');
  const navigate = useNavigate();
    useEffect(() => {
      const user = localStorage.getItem('ems_user');
      if (!user) {
        navigate('/login');
      }
    }, [navigate]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/api/contracts")
      .then((res) => res.json())
      .then((data) => setContracts(data))
      .catch((err) => console.error("Error loading contracts:", err));
    fetch("http://127.0.0.1:5001/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Error loading clients:", err));

    fetch("http://127.0.0.1:5001/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Error loading events:", err));
  }, []);

  const totalClients = clients.length;
  const totalEvents = events.length;
  const activeEvents = events.filter((e: any) => (e.status ?? "active") === "active").length;
  const totalVenues = clients.filter((c: any) => c.type === "Venue").length;

  const recentEvents = [...events].reverse().slice(0, 5);
  useEffect(() => {
    setDisplayedEvents(recentEvents);
  }, [events]);

  const realStatsData = [
    {
      title: 'Total Clients',
      value: String(totalClients),
      change: '',
      trend: 'up',
      icon: Music,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Total Events',
      value: String(totalEvents),
      change: '',
      trend: 'up',
      icon: Calendar,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Active Events',
      value: String(activeEvents),
      change: '',
      trend: 'up',
      icon: Mic2,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Venues',
      value: String(totalVenues),
      change: '',
      trend: 'up',
      icon: FileText,
      iconBg: 'bg-[#ff8a01]/20',
      iconColor: 'text-[#ff8a01]'
    }
  ];

  const realRecentActivity = [
    ...events.slice(-3).reverse().map((event: any, index: number) => ({
      id: `event-${event.id}-${index}`,
      action: 'New event created',
      details: `${event.title} for ${event.client_name ?? 'Unknown client'}`,
      time: event.event_date ?? 'No date',
      type: 'event'
    })),
    ...clients.slice(-3).reverse().map((client: any, index: number) => ({
      id: `client-${client.id}-${index}`,
      action: 'New client added',
      details: client.name,
      time: client.type ?? 'Client',
      type: 'booking'
    }))
  ].slice(0, 6);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('http://127.0.0.1:5001/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiInput })
      });

      const data = await res.json();

      if (!res.ok) {
        setAiResponse({
          type: 'text',
          answer: data.error || 'AI request failed.'
        });
      } else {
        setAiResponse(data);

        setHighlightedStat(null);
        setInactiveClientsResult([]);
        setInsightCard(null);
        setRecommendationText('');

        if (data.type === 'events_list' && data.items) {
          setDisplayedEvents(data.items);
        }

        if (data.type === 'stat' && data.label === 'Active Events') {
          setHighlightedStat('Active Events');
        }

        if (data.type === 'clients_list' && data.items) {
          setInactiveClientsResult(data.items);
        }
        
        if (data.type === 'insight' && data.item) {
          setInsightCard(data.item);
        }

        if (data.type === 'recommendation') {
          setRecommendationText(data.answer);
        }

        if (data.type !== 'events_list') {
          setDisplayedEvents(recentEvents);
        }
      }
    } catch (error) {
      setAiResponse({
        type: 'text',
        answer: 'Could not reach the backend AI service.'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff8a01]/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px]" />
        
        {/* Grid Pattern */}
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
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/40">Live overview of your clients, events, and contracts.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20">
              <Clock className="w-4 h-4" />
              All data
            </Button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-[#ff8a01]/30">
              EM
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {realStatsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className={`group border-0 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${
                    highlightedStat === stat.title
                      ? 'bg-[#ff8a01]/10 ring-1 ring-[#ff8a01]/40'
                      : 'bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <div />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-white/50">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Assistant & Recent Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Assistant - Powered by Ollama */}
            <Card className="lg:col-span-2 border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff8a01]/20 to-[#ff6b00]/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#ff8a01]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Ask AI Assistant</CardTitle>
                    <p className="text-xs text-white/40">Powered by Ollama</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAiSubmit} className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Ask anything about your events... (e.g., 'Show me upcoming events')"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      className="pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isAiLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
                    >
                      {isAiLoading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {aiResponse && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#ff8a01]/10 to-[#ff6b00]/5 border border-[#ff8a01]/20 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>

                        <div className="flex-1 space-y-3">
                          <p className="text-sm text-white/70 leading-relaxed">{aiResponse.answer}</p>

                          {aiResponse.value !== undefined && (
                            <div className="text-sm text-white/50">
                              <span className="font-medium text-white">{aiResponse.label}:</span> {aiResponse.value}
                            </div>
                          )}

                          {aiResponse.item && (
                            <div className="text-sm text-white/60 rounded-lg bg-white/5 p-3">
                              {aiResponse.item.name && <div><span className="text-white font-medium">Name:</span> {aiResponse.item.name}</div>}
                              {aiResponse.item.events_count !== undefined && <div><span className="text-white font-medium">Events:</span> {aiResponse.item.events_count}</div>}
                              {aiResponse.item.period && <div><span className="text-white font-medium">Period:</span> {aiResponse.item.period}</div>}
                            </div>
                          )}

                          {aiResponse.items && aiResponse.items.length > 0 && (
                            <div className="space-y-2">
                              {aiResponse.items.map((item: any, index: number) => (
                                <div key={index} className="rounded-lg bg-white/5 p-3 text-sm text-white/60">
                                  {item.title && <div><span className="text-white font-medium">Event:</span> {item.title}</div>}
                                  {item.name && <div><span className="text-white font-medium">Name:</span> {item.name}</div>}
                                  {item.client_name && <div><span className="text-white font-medium">Client:</span> {item.client_name}</div>}
                                  {item.event_date && <div><span className="text-white font-medium">Date:</span> {item.event_date}</div>}
                                  {item.status && <div><span className="text-white font-medium">Status:</span> {item.status}</div>}
                                  {item.type && <div><span className="text-white font-medium">Type:</span> {item.type}</div>}
                                </div>
                              ))}
                            </div>
                          )}

                          {inactiveClientsResult.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="text-sm font-medium text-white">Inactive Clients</h4>

                              {inactiveClientsResult.map((client: any) => (
                                <div
                                  key={client.id}
                                  className="rounded-lg bg-white/5 p-3 text-sm text-white/60"
                                >
                                  <div>
                                    <span className="text-white font-medium">Name:</span> {client.name}
                                  </div>
                                  <div>
                                    <span className="text-white font-medium">Type:</span> {client.type}
                                  </div>
                                  <div>
                                    <span className="text-white font-medium">Status:</span> {client.status}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {insightCard && (
                            <div className="mt-4 rounded-xl bg-white/5 p-4">
                              <h4 className="text-sm font-medium text-white mb-2">Insight</h4>

                              {insightCard.name && (
                                <div className="text-sm text-white/60">
                                  <span className="text-white font-medium">Name:</span> {insightCard.name}
                                </div>
                              )}

                              {insightCard.events_count !== undefined && (
                                <div className="text-sm text-white/60">
                                  <span className="text-white font-medium">Events:</span> {insightCard.events_count}
                                </div>
                              )}

                              {insightCard.period && (
                                <div className="text-sm text-white/60">
                                  <span className="text-white font-medium">Period:</span> {insightCard.period}
                                </div>
                              )}
                            </div>
                          )}

                          {recommendationText && (
                            <div className="mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                              <h4 className="text-sm font-medium text-white mb-2">Recommendation</h4>
                              <p className="text-sm text-white/70">{recommendationText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Show upcoming events',
                      'How many active events?',
                      'Which clients are inactive?',
                      'Most active client',
                      'Peak event periods',
                      'Suggest best venue',
                      'Recommend scheduling improvements'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setAiInput(suggestion)}
                        className="px-3 py-1.5 text-xs rounded-full bg-white/5 text-white/50 hover:bg-[#ff8a01]/10 hover:text-[#ff8a01] transition-colors border border-white/10"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Recent Activity Events */}
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {realRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'payment' ? 'bg-emerald-500/10' :
                        activity.type === 'booking' ? 'bg-purple-500/10' :
                        activity.type === 'contract' ? 'bg-[#ff8a01]/10' :
                        'bg-blue-500/10'
                      }`}>
                        {activity.type === 'payment' ? <DollarSign className="w-4 h-4 text-emerald-400" /> :
                         activity.type === 'booking' ? <Music className="w-4 h-4 text-purple-400" /> :
                         activity.type === 'contract' ? <FileText className="w-4 h-4 text-[#ff8a01]" /> :
                         <Calendar className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-white/40 truncate">{activity.details}</p>
                        <p className="text-xs text-white/30 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Contracts Table */}
          <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-white">Recent Events</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/events')}
                className="text-[#ff8a01] hover:text-[#ff6b00] hover:bg-[#ff8a01]/10"
              >
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Client</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Event</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Date</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/40 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEvents.map((event: any) => (
                      <tr key={event.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00173d] to-[#002a6b] flex items-center justify-center text-white text-xs font-medium border border-white/10">
                              {(event.client_name ?? "U").charAt(0)}
                            </div>
                            <span className="font-medium text-white">{event.client_name ?? "Unknown"}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-sm text-white/60">{event.title}</td>

                        <td className="py-3 px-4">
                          <Badge
                              variant="outline"
                              className={`capitalize border-0 ${
                                (event.status ?? 'active') === 'active'
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : (event.status ?? '') === 'completed'
                                  ? 'text-blue-400 bg-blue-500/10'
                                  : 'text-[#ff8a01] bg-[#ff8a01]/10'
                              }`}
                            >
                              {event.status ?? 'active'}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-sm text-white/40">{event.event_date ?? '-'}</td>

                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
