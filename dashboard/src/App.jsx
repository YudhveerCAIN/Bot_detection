import React, { useEffect, useState } from "react";
import API from "./api"; // your local axios instance pointing to localhost:8000
import { ShieldAlert, ShieldCheck, Activity, Users, ChevronRight, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function App() {
  const [overview, setOverview] = useState({});
  const [sites, setSites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [selectedForensics, setSelectedForensics] = useState(null);

  // Poll exactly as before
  const fetchData = async () => {
    try {
      const [o, s, r] = await Promise.all([
        API.get("/analytics/overview"),
        API.get("/analytics/sites"),
        API.get("/analytics/recent-detections"),
      ]);
      setOverview(o.data);
      setSites(s.data);
      setRecent(r.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // 3 seconds matching tracker
    return () => clearInterval(interval);
  }, []);

  const botRate = overview.bot_rate || 0;
  const isElevated = botRate > 15;

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans tracking-tight relative overflow-x-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-cyan-400" />
            Security Operations Center
          </h1>
          <p className="text-muted-foreground mt-1">Live Behavioral Detection & Bot Mitigation</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isElevated ? 'bg-red-400' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isElevated ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
          </span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${isElevated ? 'bg-red-500/10 border-red-500/20 text-red-400 bot-glow' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
            Threat Level: {isElevated ? 'ELEVATED' : 'STABLE'}
          </span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPI title="Total Monitored" value={overview.total_predictions || 0} icon={Activity} color="cyan" />
        <KPI title="Humans Verified" value={overview.humans || 0} icon={ShieldCheck} color="green" />
        <KPI className={isElevated ? "bot-glow" : ""} title="Bots Blocked" value={overview.bots || 0} icon={ShieldAlert} color="red" />
        <KPI title="Bot Traffic Rate" value={`${botRate.toFixed(1)}%`} icon={Users} color={isElevated ? "red" : "cyan"} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Feed (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="h-[450px] relative overflow-hidden flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between">
                Live Interception Feed
                <span className="text-xs font-normal px-2 py-1 bg-white/5 rounded text-muted-foreground">Updates 3s</span>
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
              {recent.length === 0 ? <div className="text-center text-muted-foreground mt-10">Waiting for events...</div> : null}
              {recent.map((sess, i) => {
                const isBot = sess.prediction === 1;
                return (
                  <div 
                    key={sess.session_id} 
                    onClick={() => setSelectedForensics(sess)}
                    className={`p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all border animate-slidein 
                      ${isBot ? 'bg-red-950/20 border-red-900/50 hover:bg-red-900/30' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      {isBot ? <ShieldAlert size={20} className="text-red-500 animate-pulse-red" /> : <ShieldCheck size={20} className="text-cyan-500" />}
                      <div>
                        <div className="font-mono text-sm text-white/90">{sess.session_id}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-background rounded">{sess.site_id}</span>
                          • {sess.event_count} raw events
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${isBot ? 'text-red-400' : 'text-cyan-400'}`}>
                          {(sess.bot_probability * 100).toFixed(1)}% AI Prob
                        </div>
                        <div className="text-xs text-muted-foreground">{isBot ? 'BLOCKED' : 'CLEARED'}</div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground opacity-50" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Charts (Right Column) */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Domain Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sites} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="_id" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }} />
                  <Bar dataKey="sessions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Confidence Dist.</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground text-sm text-center">
               Bot Models dynamically threshold across your traffic. 
               <br/><br/>
               Overall Threat Rate: {botRate.toFixed(1)}%
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Forensics Deep Dive Dialog */}
      {selectedForensics && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            
            <button onClick={() => setSelectedForensics(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <XCircle size={24} />
            </button>

            <div className={`p-6 border-b ${selectedForensics.prediction === 1 ? 'border-red-900/50 bg-red-950/20' : 'border-cyan-900/50 bg-cyan-950/20'}`}>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {selectedForensics.prediction === 1 ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-cyan-500" />}
                Behavioral Forensics
              </h2>
              <div className="mt-2 text-sm text-muted-foreground font-mono flex gap-4">
                <span>Session: {selectedForensics.session_id}</span>
                <span>Node: {selectedForensics.site_id}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Model Probability Score</p>
                  <p className={`text-4xl font-bold mt-1 ${selectedForensics.prediction === 1 ? 'text-red-500' : 'text-cyan-500'}`}>
                    {(selectedForensics.bot_probability * 100).toFixed(2)}%
                  </p>
                </div>
                <div className={`px-4 py-1.5 rounded text-sm font-bold ${selectedForensics.prediction === 1 ? 'bg-red-500 text-black' : 'bg-cyan-500 text-black'}`}>
                  {selectedForensics.prediction === 1 ? 'SIGNATURE BLOCKED' : 'AUTHORIZATION GRANTED'}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider border-b border-white/10 pb-2">Extracted Behavioral Features</h4>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(selectedForensics.features || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm font-mono text-white/90">
                      {typeof val === 'number' ? val.toFixed(2).replace(/\.00$/, '') : val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-muted-foreground">
                <strong>Why was this flagged?</strong> The AI detected anomalous patterns across exactly these 10 distinct mathematical behaviors—preventing bots from simulating simple clicks.
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Global CSS injected styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

function KPI({ title, value, icon: Icon, color, className = "" }) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    red: "text-red-500 bg-red-500/10",
    green: "text-emerald-400 bg-emerald-400/10",
  };
  return (
    <Card className={`overflow-hidden relative ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}