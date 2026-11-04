import { useState, useEffect } from 'react';
import API from '../services/api';
import { getSocket } from '../services/socket';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  UserX,
  XCircle,
  Activity,
  Users,
  Gavel,
  Zap,
  RefreshCw,
  TrendingDown
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, flagsRes] = await Promise.all([
        API.get('/admin/metrics'),
        API.get('/admin/flags')
      ]);
      setMetrics(metricsRes.data);
      setFlags(flagsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for live real-time fraud alerts pushed over Socket.IO
    const socket = getSocket();
    const handleFraudAlert = (newFlag) => {
      console.log('🚨 Incoming live fraud alert:', newFlag);
      setFlags((prev) => [newFlag, ...prev]);
      setActionFeedback({
        type: 'warning',
        text: `🚨 REAL-TIME FRAUD ALERT: ${newFlag.rule} detected! Severity: ${newFlag.severity}`
      });
      // Refresh metrics count
      API.get('/admin/metrics').then(res => setMetrics(res.data));
    };

    socket.on('fraud:alert', handleFraudAlert);

    return () => {
      socket.off('fraud:alert', handleFraudAlert);
    };
  }, []);

  const handleResolveFlag = async (flagId, action) => {
    try {
      await API.patch(`/admin/flags/${flagId}`, { action });
      setActionFeedback({
        type: 'success',
        text: `Flag successfully resolved: action "${action}" applied.`
      });
      // Refresh data
      fetchDashboardData();
    } catch (err) {
      setActionFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to apply resolution.'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
            <span>Fraud Detection & Trust Center</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time anomaly monitoring: shill bidding, ping-pong collusion, bid bursts, and anti-sniping forensics.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold shadow-lg ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
              : actionFeedback.type === 'warning'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 animate-pulse'
              : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Open Fraud Flags</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono mt-2">
            {metrics?.summary?.openFlags ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires admin review</p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Live Auctions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
            {metrics?.summary?.activeAuctions ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Currently taking bids</p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Listings</span>
            <Gavel className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {metrics?.summary?.totalAuctions ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Platform catalogue</p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Platform Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono mt-2">
            {metrics?.summary?.totalUsers ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Registered accounts</p>
        </div>

      </div>

      {/* Main Row: Live Fraud Alert Feed + Risky Users Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Fraud Flag Review List */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Live Flagged Violations Queue ({flags.length})</span>
            </h2>
            <span className="text-xs text-slate-400">WebSocket Connected</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Checking fraud events...</div>
          ) : flags.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800/60 p-6">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-200">Zero Open Fraud Violations</h3>
              <p className="text-xs text-slate-500 mt-1">All real-time bidding streams are operating cleanly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => {
                let badgeColor = 'bg-rose-950 text-rose-300 border-rose-500/40';
                if (flag.severity === 'medium') badgeColor = 'bg-amber-950 text-amber-300 border-amber-500/40';
                if (flag.severity === 'low') badgeColor = 'bg-blue-950 text-blue-300 border-blue-500/40';

                return (
                  <div
                    key={flag._id || flag.flagId}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeColor}`}>
                          {flag.severity}
                        </span>
                        <h4 className="font-mono font-bold text-white text-sm">
                          {flag.rule}
                        </h4>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(flag.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Evidence and Context Box */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1 font-mono">
                      <div className="text-slate-300">
                        <span className="text-slate-500">User: </span>
                        <strong className="text-white">{flag.user?.name || flag.userId || 'Unknown'}</strong>{' '}
                        (Risk Score: <span className="text-rose-400 font-bold">{flag.user?.riskScore ?? 'N/A'}</span>)
                      </div>

                      <div className="text-slate-300">
                        <span className="text-slate-500">Auction: </span>
                        <span className="text-indigo-300">{flag.auction?.title || flag.auctionId || 'Target Item'}</span>
                      </div>

                      {flag.evidence && (
                        <div className="text-slate-400 pt-1 border-t border-slate-800/60 font-sans text-[11px]">
                          <strong>Evidence: </strong>
                          {typeof flag.evidence === 'string'
                            ? flag.evidence
                            : JSON.stringify(flag.evidence)}
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleResolveFlag(flag._id || flag.flagId, 'dismiss')}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Dismiss False Positive</span>
                      </button>

                      <button
                        onClick={() => handleResolveFlag(flag._id || flag.flagId, 'suspend_user')}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 transition"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Suspend User</span>
                      </button>

                      <button
                        onClick={() => handleResolveFlag(flag._id || flag.flagId, 'cancel_auction')}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/60 transition"
                      >
                        <XCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cancel Compromised Auction</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Top Risky Users & Rules Stats */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top High-Risk Users */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Highest Risk Users</span>
            </h3>

            {metrics?.topRiskyUsers?.length === 0 ? (
              <p className="text-xs text-slate-500">No users flagged yet.</p>
            ) : (
              <div className="space-y-2">
                {metrics?.topRiskyUsers?.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                        u.riskScore > 10 ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'bg-slate-800 text-slate-300'
                      }`}>
                        Score: {u.riskScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules Engine Breakdown */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Configured Detection Rules</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { name: 'SHILL_BIDDING', desc: 'Seller/bidder IP overlap' },
                { name: 'BID_BURST', desc: '> 5 bids in 2-minute window' },
                { name: 'PING_PONG_COLLUSION', desc: 'Alternating price inflation' },
                { name: 'NEW_ACCOUNT_HIGH_BID', desc: '< 24h old placing high bid' },
                { name: 'REPEATED_SNIPING', desc: 'Rapid last-second triggers' }
              ].map((r) => (
                <div key={r.name} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                  <div className="font-mono font-bold text-indigo-300 text-[11px]">{r.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
