import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  MoreHorizontal,
  FolderKanban,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Filter,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Mock Data
const initialProjects = [
  { 
    id: 1, 
    name: 'Website Redesign', 
    client: 'Acme Corp', 
    status: 'active', 
    progress: 75, 
    deadline: '2024-03-15',
    team: 4,
    budget: '$15,000',
    spent: '$11,250'
  },
  { 
    id: 2, 
    name: 'Mobile App Development', 
    client: 'TechStart Inc', 
    status: 'active', 
    progress: 45, 
    deadline: '2024-04-30',
    team: 6,
    budget: '$45,000',
    spent: '$20,250'
  },
  { 
    id: 3, 
    name: 'CRM Integration', 
    client: 'Global Solutions', 
    status: 'completed', 
    progress: 100, 
    deadline: '2024-01-20',
    team: 3,
    budget: '$28,000',
    spent: '$27,500'
  },
  { 
    id: 4, 
    name: 'Marketing Campaign', 
    client: 'Digital Dynamics', 
    status: 'active', 
    progress: 30, 
    deadline: '2024-03-30',
    team: 2,
    budget: '$12,500',
    spent: '$3,750'
  },
  { 
    id: 5, 
    name: 'Cloud Migration', 
    client: 'InnovateTech', 
    status: 'on-hold', 
    progress: 15, 
    deadline: '2024-05-15',
    team: 5,
    budget: '$35,000',
    spent: '$5,250'
  },
  { 
    id: 6, 
    name: 'API Development', 
    client: 'FutureSoft', 
    status: 'active', 
    progress: 60, 
    deadline: '2024-03-01',
    team: 3,
    budget: '$15,500',
    spent: '$9,300'
  },
];

export default function ProjectsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [projects] = useState(initialProjects);
  const [searchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    budget: '',
    deadline: '',
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = () => {
    if (newProject.name && newProject.client) {
      setNewProject({ name: '', client: '', budget: '', deadline: '' });
      setIsAddDialogOpen(false);
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

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((acc, p) => acc + parseInt(p.budget.replace(/[^0-9]/g, '')), 0);
  const totalSpent = projects.reduce((acc, p) => acc + parseInt(p.spent.replace(/[^0-9]/g, '')), 0);

  return (
    <div className="min-h-screen bg-[#0a0f1c] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff8a01]/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px]" />
        
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
            <h1 className="text-xl font-bold text-white">Projects</h1>
            <p className="text-sm text-white/40">Manage your projects and track progress</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Project
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
                    <FolderKanban className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{projects.length}</p>
                    <p className="text-xs text-white/40">Total Projects</p>
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
                    <p className="text-2xl font-bold text-white">{activeProjects}</p>
                    <p className="text-xs text-white/40">Active Projects</p>
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
                    <p className="text-2xl font-bold text-white">{completedProjects}</p>
                    <p className="text-xs text-white/40">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{Math.round((totalSpent / totalBudget) * 100)}%</p>
                    <p className="text-xs text-white/40">Budget Used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-0 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-white/50">
                        <Users className="w-4 h-4" />
                        {project.client}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/5">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0a0f1c] border-white/10">
                        <DropdownMenuItem className="text-white/70 hover:text-white focus:bg-white/5">View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-white/70 hover:text-white focus:bg-white/5">Edit Project</DropdownMenuItem>
                        <DropdownMenuItem className="text-white/70 hover:text-white focus:bg-white/5">Add Task</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:text-red-300 focus:bg-red-500/10">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/50">Progress</span>
                        <span className="text-white font-medium">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(project.progress)} transition-all duration-500`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Users className="w-4 h-4" />
                          {project.team} members
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Calendar className="w-4 h-4" />
                          {project.deadline}
                        </div>
                      </div>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(project.status)}`}>
                        {project.status}
                      </Badge>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-white/50">
                        Budget: <span className="text-white">{project.budget}</span>
                      </div>
                      <div className="text-sm text-white/50">
                        Spent: <span className="text-white">{project.spent}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white">No projects found</h3>
              <p className="text-sm text-white/40 mt-1">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1c] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Project</DialogTitle>
            <DialogDescription className="text-white/50">
              Enter the project details below to create a new project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Project Name</Label>
              <Input
                id="name"
                placeholder="Website Redesign"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client" className="text-white/80">Client</Label>
              <Input
                id="client"
                placeholder="Acme Corp"
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-white/80">Budget</Label>
              <Input
                id="budget"
                placeholder="$10,000"
                value={newProject.budget}
                onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-white/80">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#ff8a01] focus:ring-[#ff8a01]/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00] text-white"
            >
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
