import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Shield,
  Clock,
  FileCheck,
  Music,
  MapPin,
  Mic2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AIAnalysis {
  summary: string;
  keyPoints: string[];
  risks: { level: 'high' | 'medium' | 'low'; description: string }[];
  recommendations: string[];
}

interface ContractItem {
  id: number;
  contract_code: string;
  name: string;
  client: string;
  date: string;
  status: string;
  size: string;
  type: string;
  analysis?: AIAnalysis | null;
}

interface ClientItem {
  id: number;
  name: string;
}


export default function ContractsPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [editingContract, setEditingContract] = useState<ContractItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'Artist',
    status: 'on-hold',
    client_id: ''
  });
  

  const filteredContracts = contracts.filter((contract) =>
    (contract.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.client || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.contract_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.status || '').toLowerCase().includes(searchQuery.toLowerCase())
);

  const fetchClients = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5001/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadProgress(10);
    setAnalysis(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5001/api/contracts/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      console.log("ANALYZE RESPONSE STATUS:", res.status);
      console.log("ANALYZE RESPONSE DATA:", data);

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      setSelectedContractId(data.id);
      setUploadProgress(100);
      toast.success("Contract uploaded");

      await fetchContracts();
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const runAnalysisForContract = async (contractId: number) => {
    setSelectedContractId(contractId);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const res = await fetch(`http://127.0.0.1:5001/api/contracts/${contractId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'AI analysis failed');
        return;
      }

      setAnalysis(data);
      toast.success('AI Analysis complete');
      await fetchContracts();
    } catch (error) {
      console.error('Analyze error:', error);
      toast.error('Could not reach Ollama analysis service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedContractId) {
      toast.error('Please upload or select a contract first');
      return;
    }
    await runAnalysisForContract(selectedContractId);
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setAnalysis(null);
    setSelectedContractId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-[#ff8a01] bg-[#ff8a01]/10 border-[#ff8a01]/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Artist':
        return <Music className="w-4 h-4" />;
      case 'Venue':
        return <MapPin className="w-4 h-4" />;
      case 'Vendor':
        return <Mic2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5001/api/contracts");
      const data = await res.json();

      setContracts(data);

      if (!Array.isArray(data) || data.length === 0) {
        setSelectedContractId(null);
        setAnalysis(null);
        return;
      }

      setSelectedContractId((currentSelectedId: number | null) => {
        const stillExists = data.some((c: ContractItem) => c.id === currentSelectedId);
        const nextId = stillExists ? currentSelectedId : data[0].id;

        const selected = data.find((c: ContractItem) => c.id === nextId);
        setAnalysis(selected?.analysis || null);

        return nextId;
      });
    } catch (err) {
      console.error("Error loading contracts:", err);
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
            <h1 className="text-xl font-bold text-white">Contracts</h1>
            <p className="text-sm text-white/40">Manage event contracts with AI analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Filter className="w-4 h-4" />
                   Filter
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="bg-[#0a0f1c] border border-white/10 text-white"
              >
                <DropdownMenuItem onClick={() => setSearchQuery('Active')}>
                  Active
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setSearchQuery('on-hold')}>
                  On Hold
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setSearchQuery('completed')}>
                  Completed
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setSearchQuery('')}>
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-4 h-4" />
              Upload Contract
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Upload & Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-400" />
                  </div>
                  <CardTitle className="text-lg text-white">Upload Contract</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-[#ff8a01]/50 hover:bg-[#ff8a01]/5 transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-white/30" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Drop your contract here</h3>
                    <p className="text-sm text-white/40 mt-1">or click to browse (PDF, DOC, DOCX)</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#ff8a01] to-[#ff6b00] flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{uploadedFile.name}</p>
                        <p className="text-sm text-white/40">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={clearUpload}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                    
                    {uploadProgress < 100 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Uploading...</span>
                          <span className="text-white font-medium">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2 bg-white/10" />
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          handleAnalyze();
                        }}
                        disabled={isAnalyzing || !selectedContractId}
                        className="w-full gap-2 bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
                      >                     
                        {isAnalyzing ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff8a01]/20 to-[#ff6b00]/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#ff8a01]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">AI Analysis TEST</CardTitle>
                    <p className="text-xs text-white/40">Powered by Ollama</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedContractId && (
                  <div className="mb-4 text-xs text-white/50 rounded-lg bg-white/5 px-3 py-2">
                    Selected contract ID: <span className="text-white font-medium">{selectedContractId}</span>
                  </div>
                )}
                {!analysis ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-lg font-medium text-white">No analysis yet</h3>
                    <p className="text-sm text-white/40 mt-1 max-w-xs">
                      Upload a contract and click "Analyze with AI" to get insights, risk assessment, and recommendations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#ff8a01]/10 to-[#ff6b00]/5 border border-[#ff8a01]/20">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#ff8a01]" />
                        Summary
                      </h4>
                      <p className="text-sm text-white/60">{analysis.summary}</p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Key Points
                      </h4>
                      <ul className="space-y-1.5">
                        {analysis.keyPoints.map((point, index) => (
                          <li key={index} className="text-sm text-white/60 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Risk Flags */}
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Risk Flags
                      </h4>
                      <div className="space-y-2">
                        {analysis.risks.map((risk, index) => (
                          <div
                            key={index}
                            className={`p-2.5 rounded-lg border text-sm ${getRiskColor(risk.level)}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={`text-xs capitalize border-0 ${getRiskColor(risk.level)}`}>
                                {risk.level}
                              </Badge>
                            </div>
                            {risk.description}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1.5">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-white/60 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contracts List */}
          <Card className="border-0 bg-white/[0.03] backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">All Contracts</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    placeholder="Search contracts..."
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
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Contract ID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Client</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-white/40 uppercase">Actions</th>
                    </tr>
                  </thead>
                 <tbody>
                  {filteredContracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-white/30" />
                          <span className="font-medium text-white">{contract.contract_code}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-sm text-white/70">{contract.name}</td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00173d] to-[#002a6b] flex items-center justify-center text-white text-xs font-medium border border-white/10">
                            {(contract.client || "U").charAt(0)}
                          </div>
                          <span className="text-sm text-white/70">{contract.client}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-white/60 bg-white/5 border-white/10 text-xs">
                          {getTypeIcon(contract.type)}
                          <span className="ml-1">{contract.type}</span>
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Clock className="w-3 h-3" />
                          {contract.date}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`capitalize ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right relative z-20">
                        <div className="flex items-center justify-end gap-2 relative z-20 pointer-events-auto">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 pointer-events-auto"
                            onClick={() => {
                              void runAnalysisForContract(contract.id);
                            }}
                          >
                            Test AI
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-white/50 hover:text-white hover:bg-white/10 pointer-events-auto"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="bg-[#0a0f1c] border border-white/10 text-white min-w-[180px] z-50"
                            >
                              <DropdownMenuItem
                                className="text-white hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                                onSelect={() => setSelectedContract(contract)}
                              >
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-white hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                                onSelect={() => {
                                  window.open(`http://127.0.0.1:5001/api/contracts/${contract.id}/download`, '_blank');
                                }}
                              >
                                Download
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-white hover:text-white focus:text-white focus:bg-white/10 cursor-pointer gap-2"
                                onSelect={() => {
                                  void runAnalysisForContract(contract.id);
                                }}
                              >
                                <Sparkles className="w-4 h-4" />
                                Analyze with AI
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-white hover:text-white focus:text-white focus:bg-white/10 cursor-pointer"
                                onSelect={() => {
                                  setEditingContract(contract);
                                  setEditForm({
                                    name: contract.name || '',
                                    type: contract.type || 'Artist',
                                    status: contract.status || 'on-hold',
                                    client_id: ''
                                  });
                                }}
                              >
                                Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                                onSelect={async () => {
                                  try {
                                    const res = await fetch(`http://127.0.0.1:5001/api/contracts/${contract.id}`, {
                                      method: "DELETE",
                                    });

                                    if (!res.ok) {
                                      toast.error("Failed to delete contract");
                                      return;
                                    }

                                    toast.success("Contract deleted");

                                    if (selectedContractId === contract.id) {
                                      setSelectedContractId(null);
                                      setAnalysis(null);
                                    }

                                    await fetchContracts();
                                  } catch (err) {
                                    toast.error("Error deleting contract");
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

              {filteredContracts.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-medium text-white">No contracts found</h3>
                  <p className="text-sm text-white/40 mt-1">Try adjusting your search query</p>
                </div>
              )}
                       
              {selectedContract && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="w-full max-w-md rounded-2xl bg-[#0a0f1c] border border-white/10 p-6 shadow-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">Contract Details</h3>

                    <div className="space-y-2 text-sm text-white/70">
                      <div><span className="text-white font-medium">Contract ID:</span> {selectedContract.contract_code}</div>
                      <div><span className="text-white font-medium">Name:</span> {selectedContract.name}</div>
                      <div><span className="text-white font-medium">Client:</span> {selectedContract.client}</div>
                      <div><span className="text-white font-medium">Type:</span> {selectedContract.type}</div>
                      <div><span className="text-white font-medium">Status:</span> {selectedContract.status}</div>
                      <div><span className="text-white font-medium">Date:</span> {selectedContract.date}</div>
                      <div><span className="text-white font-medium">Size:</span> {selectedContract.size}</div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setSelectedContract(null)}
                        className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00] hover:from-[#ff9500] hover:to-[#ff7b00]"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {editingContract && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="w-full max-w-md rounded-2xl bg-[#0a0f1c] border border-white/10 p-6 shadow-2xl space-y-4">
                    <h3 className="text-lg font-semibold text-white">Edit Contract</h3>

                    <div className="space-y-3">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Contract name"
                        className="bg-white/5 border-white/10 text-white"
                      />

                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full rounded-md bg-white/5 border border-white/10 text-white p-2"
                      >
                        <option value="Artist">Artist</option>
                        <option value="Venue">Venue</option>
                        <option value="Vendor">Vendor</option>
                        <option value="General">General</option>
                      </select>

                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full rounded-md bg-white/5 border border-white/10 text-white p-2"
                      >
                        <option value="on-hold">on-hold</option>
                        <option value="active">active</option>
                        <option value="completed">completed</option>
                      </select>

                      <select
                        value={editForm.client_id}
                        onChange={(e) => setEditForm({ ...editForm, client_id: e.target.value })}
                        className="w-full rounded-md bg-white/5 border border-white/10 text-white p-2"
                      >
                        <option value="">Select client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white"
                        onClick={() => setEditingContract(null)}
                      >
                        Cancel
                      </Button>

                      <Button
                        className="bg-gradient-to-r from-[#ff8a01] to-[#ff6b00]"
                        onClick={async () => {
                          try {
                            const payload = {
                              name: editForm.name,
                              type: editForm.type,
                              status: editForm.status,
                              client_id: editForm.client_id ? Number(editForm.client_id) : null
                            };

                            const res = await fetch(`http://127.0.0.1:5001/api/contracts/${editingContract.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(payload)
                            });

                            const data = await res.json();

                            if (!res.ok) {
                              toast.error(data.error || "Failed to update contract");
                              return;
                            }

                            toast.success("Contract updated");
                            setEditingContract(null);
                            await fetchContracts();
                          } catch (err) {
                            toast.error("Update failed");
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
