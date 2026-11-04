import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

export default function CountdownTimer({ endsAt, isExtended = false, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
    }
    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isEnded: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isEnded) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  if (timeLeft.isEnded) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider border border-slate-700">
        <Clock className="w-3.5 h-3.5" />
        <span>Auction Concluded</span>
      </div>
    );
  }

  const isUrgent = timeLeft.total < 60 * 1000; // less than 60 seconds

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold shadow-sm transition-colors ${
          isUrgent
            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse'
            : 'bg-slate-800/80 text-slate-200 border border-slate-700'
        }`}
      >
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-indigo-400'}`} />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>

      {isExtended && (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>+30s Anti-Sniping</span>
        </span>
      )}
    </div>
  );
}
