import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Activity, 
  Lock, 
  Cpu, 
  Wallet, 
  Box, 
  FileCode, 
  Menu,
  X,
  Zap,
  ShieldCheck,
  ShieldQuestion
} from 'lucide-react';
import { Packet, TrafficStatus, FirewallRule, GeminiAnalysisResult } from './types';
import { INITIAL_RULES, MOCK_IPS } from './constants';
import { analyzePacket } from './services/geminiService';
import PacketRow from './components/PacketRow';
import NetworkChart from './components/NetworkChart';

const App: React.FC = () => {
  // State
  const [packets, setPackets] = useState<Packet[]>([]);
  const [rules, setRules] = useState<FirewallRule[]>(INITIAL_RULES);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chartData, setChartData] = useState<{ time: string; allowed: number; blocked: number }[]>([]);
  const [blockHeight, setBlockHeight] = useState(18244921);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate mock traffic
  useEffect(() => {
    const interval = setInterval(() => {
      const isBlocked = Math.random() > 0.8;
      const isSuspicious = !isBlocked && Math.random() > 0.9;
      
      let status = TrafficStatus.ALLOWED;
      if (isBlocked) status = TrafficStatus.BLOCKED;
      if (isSuspicious) status = TrafficStatus.SUSPICIOUS;

      const newPacket: Packet = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourceIP: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
        destIP: '10.0.0.1',
        protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
        port: Math.floor(Math.random() * 65535),
        size: Math.floor(Math.random() * 1500),
        status,
        payloadHash: '0x' + Math.random().toString(16).substr(2, 40),
        signature: '0x' + Math.random().toString(16).substr(2, 64),
        blockNumber: blockHeight,
      };

      setPackets(prev => {
        const updated = [newPacket, ...prev].slice(0, 50);
        return updated;
      });

      // Update Chart Data
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      setChartData(prev => {
        const newData = [...prev, { time: timeStr, allowed: status === 'ALLOWED' ? 1 : 0, blocked: status !== 'ALLOWED' ? 1 : 0 }];
        return newData.slice(-20); // Keep last 20 points
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [blockHeight]);

  // Simulate block production
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setBlockHeight(h => h + 1);
    }, 12000); // Ethereum block time approx
    return () => clearInterval(blockInterval);
  }, []);

  const handleAnalyze = async (packet: Packet) => {
    setSelectedPacket(packet);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    const result = await analyzePacket(packet);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="flex h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-panel-bg border-r border-gray-800 transition-all duration-300 flex flex-col z-20`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          {sidebarOpen && <div className="flex items-center space-x-2 text-neon-blue font-bold tracking-wider">
            <Box className="w-6 h-6" />
            <span>CHAIN<span className="text-white">GUARD</span></span>
          </div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded text-gray-400">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <NavItem icon={<Activity />} label="Dashboard" active />
          <NavItem icon={<FileCode />} label="Smart Contracts" />
          <NavItem icon={<Shield />} label="Security Policies" />
          <NavItem icon={<Box />} label="Block Explorer" />
          <NavItem icon={<Cpu />} label="AI Node Config" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className={`bg-gray-900 rounded-lg p-3 border border-gray-700 ${!sidebarOpen && 'hidden'}`}>
            <div className="text-xs text-gray-500 mb-1">NETWORK STATUS</div>
            <div className="flex items-center space-x-2 text-neon-green text-sm">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span>Mainnet Synced</span>
            </div>
            <div className="text-xs text-gray-400 mt-2 font-mono">Block: #{blockHeight}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-panel-bg/50 backdrop-blur-sm flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-white tracking-tight">Firewall Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <div className="bg-gray-900 px-4 py-1.5 rounded-full border border-gray-700 flex items-center space-x-2">
              <span className="text-xs text-gray-400 uppercase">Gas Price</span>
              <span className="text-sm font-mono text-neon-blue">14 gwei</span>
            </div>
            
            <button 
              onClick={() => setWalletConnected(!walletConnected)}
              className={`flex items-center space-x-2 px-4 py-2 rounded font-medium text-sm border transition-all ${
                walletConnected 
                ? 'bg-neon-green/10 border-neon-green text-neon-green' 
                : 'bg-neon-blue/10 border-neon-blue text-neon-blue hover:bg-neon-blue/20'
              }`}
            >
              <Wallet size={16} />
              <span>{walletConnected ? '0x8F...3A21' : 'Connect Wallet'}</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              label="Threats Blocked" 
              value="1,284" 
              change="+12%" 
              icon={<Shield className="text-neon-red" />} 
              color="red"
            />
            <StatCard 
              label="Network Load" 
              value="452 MB/s" 
              change="-5%" 
              icon={<Activity className="text-neon-blue" />} 
              color="blue"
            />
            <StatCard 
              label="Active Contracts" 
              value="8" 
              change="Stable" 
              icon={<FileCode className="text-purple-400" />} 
              color="purple"
            />
            <StatCard 
              label="Gas Used (24h)" 
              value="0.45 ETH" 
              change="+2%" 
              icon={<Zap className="text-yellow-400" />} 
              color="yellow"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            
            {/* Main Traffic Chart */}
            <div className="lg:col-span-2 bg-panel-bg border border-gray-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-green opacity-50" />
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Activity size={18} className="text-neon-blue" />
                <span>Real-time Traffic Volume</span>
              </h3>
              <NetworkChart data={chartData} />
            </div>

            {/* Smart Contract Rules */}
            <div className="bg-panel-bg border border-gray-800 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <FileCode size={18} className="text-purple-400" />
                <span>Active Smart Rules</span>
              </h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {rules.map(rule => (
                  <div key={rule.id} className="bg-gray-900/50 p-3 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-gray-500">{rule.contractAddress}</span>
                      <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-neon-green shadow-glow-green' : 'bg-gray-600'}`} />
                    </div>
                    <div className="text-sm text-gray-300 font-mono mb-2">{rule.condition}</div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${rule.action === 'BLOCK' ? 'border-neon-red text-neon-red' : 'border-neon-green text-neon-green'}`}>
                        {rule.action}
                      </span>
                      <button 
                        onClick={() => toggleRule(rule.id)}
                        className="text-xs text-neon-blue hover:text-white transition-colors"
                      >
                        {rule.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Packet Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-panel-bg border border-gray-800 rounded-xl p-0 flex flex-col h-[500px] overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Box size={18} className="text-neon-green" />
                  <span>Immutable Traffic Log (Chain Feed)</span>
                </h3>
                <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                {packets.map(packet => (
                  <PacketRow key={packet.id} packet={packet} onAnalyze={handleAnalyze} />
                ))}
              </div>
            </div>

            {/* AI Analysis Panel */}
            <div className="bg-panel-bg border border-gray-800 rounded-xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-neon-blue/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <h3 className="font-semibold flex items-center space-x-2 mb-6">
                <Cpu size={18} className="text-neon-blue" />
                <span>AI Threat Analysis (Gemini)</span>
              </h3>

              {selectedPacket ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700 font-mono text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target IP:</span>
                      <span className="text-neon-blue">{selectedPacket.sourceIP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payload Hash:</span>
                      <span className="text-gray-400 truncate w-32">{selectedPacket.payloadHash}</span>
                    </div>
                  </div>

                  {isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
                      <div className="text-sm text-neon-blue animate-pulse">Running Deep Packet Inspection...</div>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Risk Score</span>
                        <span className={`text-xl font-bold ${analysisResult.riskScore > 70 ? 'text-neon-red shadow-glow-red' : analysisResult.riskScore > 30 ? 'text-yellow-400' : 'text-neon-green'}`}>
                          {analysisResult.riskScore}/100
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${analysisResult.riskScore > 70 ? 'bg-neon-red' : analysisResult.riskScore > 30 ? 'bg-yellow-400' : 'bg-neon-green'}`} 
                          style={{ width: `${analysisResult.riskScore}%` }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs uppercase text-gray-500 font-bold">Analysis</div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-gray-900/50 p-2 rounded">
                          {analysisResult.analysis}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs uppercase text-gray-500 font-bold">Recommendation</div>
                        <div className="flex items-start space-x-2 text-sm text-neon-blue">
                          <ShieldCheck size={16} className="mt-0.5" />
                          <span>{analysisResult.recommendation}</span>
                        </div>
                      </div>
                      
                      {analysisResult.riskScore > 50 && (
                         <button className="w-full mt-4 py-2 bg-neon-red/10 border border-neon-red text-neon-red rounded hover:bg-neon-red/20 transition-colors uppercase text-xs font-bold tracking-wider">
                           Execute Smart Contract Ban
                         </button>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4 text-center">
                  <ShieldQuestion size={48} className="opacity-20" />
                  <p className="text-sm px-8">Select a suspicious packet from the traffic log to initiate AI forensic analysis.</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

// Helper Components

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    <span className="font-medium text-sm hidden md:block">{label}</span>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; change: string; icon: React.ReactNode; color: string }> = ({ label, value, change, icon, color }) => {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');
  
  return (
    <div className="bg-panel-bg border border-gray-800 p-5 rounded-xl flex flex-col justify-between hover:border-gray-600 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="text-gray-400 text-sm font-medium">{label}</div>
        <div className={`p-2 rounded-lg bg-${color}-500/10 group-hover:bg-${color}-500/20 transition-colors`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className={`text-xs font-medium px-2 py-1 rounded ${isPositive ? 'text-neon-green bg-neon-green/10' : isNegative ? 'text-neon-red bg-neon-red/10' : 'text-gray-400 bg-gray-800'}`}>
          {change}
        </div>
      </div>
    </div>
  );
};

export default App;