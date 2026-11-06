import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Wallet as WalletIcon, Lock, CheckCircle2, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function Wallet() {
  const { user, wallet, fetchMe } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/wallet');
      setTransactions(res.data.transactions || []);
      fetchMe();
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      setFeedback({ type: 'error', text: 'Enter a valid amount.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await API.post('/wallet/topup', { amount });
      setFeedback({ type: 'success', text: res.data.message });
      fetchWalletData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Top up failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const balance = wallet?.balance || 0;
  const held = wallet?.held || 0;
  const available = Math.max(0, balance - held);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6 pt-6">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
          <WalletIcon className="w-8 h-8 text-emerald-400" />
          <span>Escrow Wallet & Ledger</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Atomic escrow management: funds in ongoing bids are locked until outbid or auction settlement.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-sm font-semibold shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
              : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Available to Spend */}
        <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Available to Bid</div>
          <div className="text-4xl font-black text-white font-mono mt-2">
            ${available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-2">Free liquid balance ready for placement.</p>
        </div>

        {/* Locked in Escrow */}
        <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 p-6 rounded-3xl border border-amber-500/30 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400">
            <span>Locked in Escrow</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-4xl font-black text-amber-300 font-mono mt-2">
            ${held.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-2">Held for active winning bids until outbid.</p>
        </div>

        {/* Total Ledger Balance */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Account Value</div>
          <div className="text-4xl font-black text-slate-200 font-mono mt-2">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 mt-2">Combined liquid balance + active holds.</p>
        </div>

      </div>

      {/* Top-up Box */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Instant Wallet Top-Up (Demo Funds)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add sandbox funds directly to your wallet to test bidding across multiple auctions.
            </p>
          </div>
        </div>

        <form onSubmit={handleTopUp} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {['100', '500', '1000', '5000'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUpAmount(amt)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
                  topUpAmount === amt
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                +${amt}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-3 text-slate-500 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter custom amount..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-8 pr-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
            >
              {submitting ? (
                <span>Adding...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Deposit Funds</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Audit Trail & Ledger</span>
          </h2>
          <button
            onClick={fetchWalletData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No transaction records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3 pl-2">Type</th>
                  <th className="pb-3">Auction / Context</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right pr-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.map((tx) => {
                  let badgeClass = 'bg-slate-800 text-slate-300';
                  let prefix = '';
                  let amountColor = 'text-white';

                  if (tx.type === 'topup') {
                    badgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-500/40';
                    prefix = '+';
                    amountColor = 'text-emerald-400';
                  } else if (tx.type === 'hold') {
                    badgeClass = 'bg-amber-950 text-amber-300 border border-amber-500/40';
                    prefix = '🔒 Hold: ';
                    amountColor = 'text-amber-300';
                  } else if (tx.type === 'release') {
                    badgeClass = 'bg-blue-950 text-blue-300 border border-blue-500/40';
                    prefix = '🔓 Release: ';
                    amountColor = 'text-blue-300';
                  } else if (tx.type === 'payout') {
                    badgeClass = 'bg-purple-950 text-purple-300 border border-purple-500/40';
                    prefix = '+';
                    amountColor = 'text-purple-300';
                  }

                  return (
                    <tr key={tx._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 pl-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300 font-sans">
                        {tx.auction?.title || 'Account Funding'}
                      </td>
                      <td className={`py-3 text-right font-bold ${amountColor}`}>
                        {prefix}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right pr-2 text-slate-500 font-sans text-[11px]">
                        {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
