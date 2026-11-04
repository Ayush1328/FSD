import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { getSocket } from './services/socket';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import Wallet from './pages/Wallet';
import MyActivity from './pages/MyActivity';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import { AlertTriangle, X } from 'lucide-react';

function ProtectedRoute({ children, role }) {
  const { user, token } = useAuthStore();
  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const { fetchMe, user } = useAuthStore();
  const [globalAlert, setGlobalAlert] = useState(null);

  useEffect(() => {
    fetchMe();
  }, []);

  // Global socket listener for private notifications (like being outbid)
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    const handleOutbid = (data) => {
      setGlobalAlert({
        title: '⚠️ You were outbid!',
        message: data.message || `Another bidder placed $${data.newBid} on "${data.auctionTitle}"`
      });
    };

    socket.on('outbid', handleOutbid);

    return () => {
      socket.off('outbid', handleOutbid);
    };
  }, [user]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Floating Global Notification Toast */}
        {globalAlert && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-rose-950/95 border border-rose-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start space-x-3 animate-slide-in">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <div className="font-bold text-rose-200">{globalAlert.title}</div>
              <div className="text-slate-300">{globalAlert.message}</div>
            </div>
            <button
              onClick={() => setGlobalAlert(null)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateAuction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-activity"
              element={
                <ProtectedRoute>
                  <MyActivity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <div className="font-semibold text-slate-400">
              BidShield &copy; {new Date().getFullYear()} — Real-Time Bidding & Fraud Detection Platform
            </div>
            <p className="text-[11px] text-slate-600">
              Full-Stack MERN Architecture with Socket.IO, MongoDB Replica Set Transactions, and Anti-Sniping Protection.
            </p>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}
