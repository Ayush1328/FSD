import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { getSocket } from './services/socket';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AuctionsList from './pages/AuctionsList';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import Wallet from './pages/Wallet';
import MyActivity from './pages/MyActivity';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CasinoArcade from './pages/CasinoArcade';

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

  // Global socket listener for private notifications (e.g. being outbid)
  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    const handleOutbid = (data) => {
      setGlobalAlert({
        title: '⚠️ You were outbid!',
        message: data.message || `Another bidder placed ₹${data.newBid} on "${data.auctionTitle}"`
      });
    };

    socket.on('outbid', handleOutbid);

    return () => {
      socket.off('outbid', handleOutbid);
    };
  }, [user]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F5F0E8] text-[#1C1710] flex flex-col font-sans selection:bg-[#A8432A] selection:text-white">
        
        {/* Floating Global Notification Toast */}
        {globalAlert && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#1C1710] text-white border border-[#A8432A] rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start space-x-3 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-[#F0D0B0] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <div className="font-bold text-[#F0D0B0]">{globalAlert.title}</div>
              <div className="text-white/80">{globalAlert.message}</div>
            </div>
            <button
              onClick={() => setGlobalAlert(null)}
              className="text-white/60 hover:text-white transition"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <Navbar />

        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auctions" element={<AuctionsList />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/arcade" element={<CasinoArcade />} />
            <Route path="/casino" element={<CasinoArcade />} />
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

        <Footer />

      </div>
    </BrowserRouter>
  );
}
