import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getSocket } from '../services/socket';
import API from '../services/api';
import {
  Sparkles,
  Gamepad2,
  Users,
  Coins,
  Flame,
  Bomb,
  Rocket,
  CircleDot,
  Dices,
  Trophy,
  ArrowRight,
  Send,
  RefreshCw,
  Gift,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  playWinSound,
  playDiceRollSound,
  playCashoutSound,
  playExplosionSound,
  triggerConfetti
} from '../utils/soundEffects';

export default function CasinoArcade() {
  const { user, wallet, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = useState('multiplayer'); // 'multiplayer' | 'mines' | 'crash' | 'plinko'
  const [faucetLoading, setFaucetLoading] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState(null);

  // 1-Click Free Faucet Deposit
  const handleClaimFaucet = async () => {
    if (!user) {
      alert('Please log in or select a demo account to claim free chips!');
      return;
    }
    try {
      setFaucetLoading(true);
      const res = await API.post('/wallet/faucet');
      setFaucetMessage(res.data.message);
      playWinSound();
      triggerConfetti();
      await fetchMe();
      setTimeout(() => setFaucetMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim faucet.');
    } finally {
      setFaucetLoading(false);
    }
  };

  return (
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner: Free Chips Faucet & Casino Title */}
      <div className="bg-[#1C1710] text-white rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#F0D0B0] text-xs font-semibold">
            <Gamepad2 className="w-4 h-4 text-[#A8432A]" />
            <span>Real-Time Multiplayer &amp; Casino Lounge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-normal text-white">
            BidVault <span className="italic text-[#F0D0B0]">High Stakes Arena</span>
          </h1>
          <p className="text-white/70 text-xs sm:text-sm max-w-lg leading-relaxed">
            Play live 2 to 4 player multiplayer games across devices, put your chips on the line, or test your luck on Stake-style originals!
          </p>
        </div>

        {/* Free Chips Deposit Faucet Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shrink-0">
          <div>
            <div className="text-[11px] font-label font-bold uppercase tracking-wider text-[#F0D0B0]">
              Demo Chips Faucet
            </div>
            <div className="text-xl font-display font-bold text-white flex items-center justify-center sm:justify-start space-x-1.5">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>₹{(wallet?.available || 0).toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimFaucet}
            disabled={faucetLoading}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[#1C1710] font-bold text-xs sm:text-sm shadow-md hover:from-amber-300 hover:to-amber-400 transition-all transform hover:scale-105 flex items-center space-x-1.5"
          >
            <Gift className="w-4 h-4" />
            <span>{faucetLoading ? 'Crediting...' : '+ ₹10,000 Free Chips'}</span>
          </button>
        </div>
      </div>

      {faucetMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{faucetMessage}</span>
        </div>
      )}

      {/* Navigation Game Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1C1710]/15 overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'multiplayer', label: 'Multiplayer Arena (2-4P Live)', icon: Users, badge: 'LIVE' },
          { id: 'mines', label: 'Mines', icon: Bomb },
          { id: 'crash', label: 'Crash / Rocket', icon: Rocket },
          { id: 'plinko', label: 'Plinko', icon: CircleDot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#1C1710] text-white shadow-md'
                  : 'bg-[#FAF6EE] text-[#1C1710]/70 hover:text-[#1C1710] hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4 text-[#A8432A]" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Component */}
      {activeTab === 'multiplayer' && <MultiplayerArena />}
      {activeTab === 'mines' && <MinesGame />}
      {activeTab === 'crash' && <CrashSinglePlayer />}
      {activeTab === 'plinko' && <PlinkoGame />}

    </div>
  );
}

/* ========================================================================= */
/* 1. MULTIPLAYER ARENA (2 to 4 Players live with Socket.IO)                 */
/* ========================================================================= */
function MultiplayerArena() {
  const { user, wallet, fetchMe } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [tableName, setTableName] = useState('');
  const [selectedGame, setSelectedGame] = useState('dice'); // 'dice' | 'rocket'
  const [selectedWager, setSelectedWager] = useState(500);
  const [selectedMaxPlayers, setSelectedMaxPlayers] = useState(4);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [gameNotification, setGameNotification] = useState(null);
  const [rocketMult, setRocketMult] = useState(1.0);
  const [isRocketCrashed, setIsRocketCrashed] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.emit('mp:get_rooms');

    socket.on('mp:rooms_updated', (updatedRooms) => {
      setRooms(updatedRooms || []);
    });

    socket.on('mp:room_joined', (room) => {
      setCurrentRoom(room);
    });

    socket.on('mp:room_state', (room) => {
      setCurrentRoom(room);
    });

    socket.on('mp:game_starting', (data) => {
      setCurrentRoom(data.room);
      setGameNotification(`🚀 Game starting in ${data.countdown}s! Pot: ₹${data.pot.toLocaleString()}`);
      fetchMe();
    });

    socket.on('mp:game_started', (room) => {
      setCurrentRoom(room);
      setGameNotification('🎲 Round started! Shake and roll your dice!');
    });

    socket.on('mp:player_rolled', (data) => {
      playDiceRollSound();
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.userId === data.userId ? { ...p, dice: data.dice, score: data.score } : p
          )
        };
      });
    });

    socket.on('mp:rocket_tick', (data) => {
      setRocketMult(data.multiplier);
      setIsRocketCrashed(data.isCrashed);
      if (data.isCrashed) {
        playExplosionSound();
      }
    });

    socket.on('mp:player_cashed_out', (data) => {
      playCashoutSound();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'System', message: `💰 ${data.name} cashed out at ${data.multiplier}x for ₹${data.winAmount.toLocaleString()}!`, time: '' }
      ]);
      fetchMe();
    });

    socket.on('mp:game_ended', (data) => {
      setCurrentRoom(data.room);
      if (data.winners && data.winners.length > 0) {
        const winnerNames = data.winners.map((w) => w.name).join(', ');
        setGameNotification(`🏆 Winner: ${winnerNames}! Awarded ₹${data.winAmount.toLocaleString()} from pot!`);
        playWinSound();
        triggerConfetti();
      } else {
        setGameNotification(`💥 Rocket crashed at ${data.crashPoint}x! Round concluded.`);
      }
      fetchMe();
    });

    socket.on('mp:new_chat', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('mp:error', (err) => {
      alert(err.message);
    });

    return () => {
      socket.off('mp:rooms_updated');
      socket.off('mp:room_joined');
      socket.off('mp:room_state');
      socket.off('mp:game_starting');
      socket.off('mp:game_started');
      socket.off('mp:player_rolled');
      socket.off('mp:rocket_tick');
      socket.off('mp:player_cashed_out');
      socket.off('mp:game_ended');
      socket.off('mp:new_chat');
      socket.off('mp:error');
    };
  }, []);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in first to wager chips with real players!');
      return;
    }
    const socket = getSocket();
    socket.emit('mp:create_room', {
      name: tableName || `${user.name}'s High Table`,
      gameType: selectedGame,
      wager: selectedWager,
      maxPlayers: selectedMaxPlayers
    });
  };

  const handleJoinRoom = (roomId) => {
    if (!user) {
      alert('Please log in first!');
      return;
    }
    const socket = getSocket();
    socket.emit('mp:join_room', { roomId });
  };

  const handleToggleReady = () => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('mp:toggle_ready', { roomId: currentRoom.id });
  };

  const handleRollDice = () => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('mp:roll_dice', { roomId: currentRoom.id });
  };

  const handleCashoutRocket = () => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('mp:cashout_rocket', { roomId: currentRoom.id, currentMultiplier: rocketMult });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentRoom) return;
    const socket = getSocket();
    socket.emit('mp:chat', { roomId: currentRoom.id, message: chatInput });
    setChatInput('');
  };

  const handleLeaveRoom = () => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('mp:leave_room', { roomId: currentRoom.id });
    setCurrentRoom(null);
    setChatMessages([]);
    setGameNotification(null);
  };

  // If player is inside an active table
  if (currentRoom) {
    const isReady = currentRoom.players?.find((p) => p.userId === user?.id || p.socketId === getSocket().id)?.ready;
    const myPlayer = currentRoom.players?.find((p) => p.userId === user?.id || p.socketId === getSocket().id);

    return (
      <div className="bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 border border-[#1C1710]/10 shadow-lg space-y-6">
        
        {/* Table Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-[#1C1710]/10 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-label uppercase tracking-wider text-[#A8432A] font-bold">
                Table: {currentRoom.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1C1710] text-white">
                {currentRoom.gameType === 'dice' ? '🎲 Dice Royale' : '🚀 Multi-Crash'}
              </span>
            </div>
            <div className="text-xl font-display font-bold text-[#1C1710]">
              Wager: ₹{currentRoom.wager.toLocaleString()} per player | Pot:{' '}
              <span className="text-[#A8432A]">₹{currentRoom.pot.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLeaveRoom}
            className="px-4 py-2 rounded-full border border-[#1C1710]/20 text-xs font-semibold text-[#1C1710] hover:bg-[#1C1710] hover:text-white transition"
          >
            Leave Table
          </button>
        </div>

        {gameNotification && (
          <div className="p-3 rounded-2xl bg-[#EDE5D6] border border-[#1C1710]/20 text-[#1C1710] font-semibold text-xs sm:text-sm text-center animate-pulse">
            {gameNotification}
          </div>
        )}

        {/* 2 to 4 Players Seat Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: currentRoom.maxPlayers }).map((_, idx) => {
            const player = currentRoom.players?.[idx];
            return (
              <div
                key={idx}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between min-h-[160px] text-center ${
                  player
                    ? 'bg-white border-[#1C1710]/20 shadow-sm'
                    : 'bg-[#EDE5D6]/40 border-dashed border-[#1C1710]/20 flex items-center justify-center'
                }`}
              >
                {player ? (
                  <>
                    <div className="flex justify-between items-center text-[10px] font-label">
                      <span className="text-[#1C1710]/60">Seat {idx + 1}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                          player.ready
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {player.ready ? 'Ready' : 'Waiting'}
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="w-12 h-12 rounded-full bg-[#1C1710] text-[#F0D0B0] font-bold text-base flex items-center justify-center mx-auto shadow-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-bold text-[#1C1710] truncate mt-1">
                        {player.name}
                      </div>
                    </div>

                    {/* Game-specific seat outcome */}
                    {currentRoom.gameType === 'dice' ? (
                      <div className="text-xs">
                        {player.dice?.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center space-x-1 font-mono font-bold text-base text-[#A8432A]">
                              {player.dice.map((d, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-[#FAF6EE] border rounded">
                                  {d}
                                </span>
                              ))}
                            </div>
                            <div className="text-[11px] font-bold text-[#1C1710]/70">
                              Score: {player.score}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#1C1710]/40">Dice in cup...</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs">
                        {player.cashedOut ? (
                          <span className="text-emerald-700 font-bold">
                            Cashed out: {player.cashoutMultiplier}x
                          </span>
                        ) : (
                          <span className="text-[#1C1710]/40">In Flight...</span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-[#1C1710]/40 font-medium">
                    Empty Seat {idx + 1}<br />Waiting for player...
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Action Area based on game status */}
        <div className="bg-[#EDE5D6] rounded-2xl p-6 text-center space-y-4 border border-[#1C1710]/10">
          {currentRoom.status === 'waiting' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[#1C1710]/70">
                Table requires at least 2 players to be <strong>Ready</strong>. Wagers are escrowed at round start.
              </p>
              <button
                type="button"
                onClick={handleToggleReady}
                className={`px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all ${
                  isReady
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#1C1710] hover:bg-[#332a1e] text-white'
                }`}
              >
                {isReady ? 'Cancel Ready' : 'Ready to Play (Wager ₹' + currentRoom.wager.toLocaleString() + ')'}
              </button>
            </div>
          )}

          {currentRoom.status === 'playing' && currentRoom.gameType === 'dice' && (
            <div className="space-y-4">
              <h3 className="text-lg font-display text-[#1C1710]">
                {myPlayer?.dice?.length > 0 ? 'Dice Rolled! Waiting for other players...' : 'Your turn to roll!'}
              </h3>
              {!myPlayer?.dice?.length && (
                <button
                  type="button"
                  onClick={handleRollDice}
                  className="px-8 py-3.5 rounded-full bg-[#A8432A] hover:bg-[#8f3620] text-white font-bold text-sm shadow-lg transition-transform hover:scale-105"
                >
                  🎲 Shake &amp; Roll 3 Golden Dice!
                </button>
              )}
            </div>
          )}

          {currentRoom.status === 'playing' && currentRoom.gameType === 'rocket' && (
            <div className="space-y-4">
              <div className="text-5xl font-mono font-bold text-[#A8432A]">
                {rocketMult.toFixed(2)}x
              </div>
              <p className="text-xs text-[#1C1710]/70">
                {isRocketCrashed ? 'CRASHED!' : 'Rocket climbing! Cash out before it explodes!'}
              </p>
              {!isRocketCrashed && !myPlayer?.cashedOut && (
                <button
                  type="button"
                  onClick={handleCashoutRocket}
                  className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-transform hover:scale-105"
                >
                  🚀 Cash Out ₹{(currentRoom.wager * rocketMult).toFixed(0)}
                </button>
              )}
            </div>
          )}

          {currentRoom.status === 'ended' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleToggleReady}
                className="px-8 py-3.5 rounded-full bg-[#1C1710] text-white font-bold text-xs sm:text-sm shadow-md hover:bg-[#332a1e]"
              >
                Play Next Round
              </button>
            </div>
          )}
        </div>

        {/* In-Table Chat */}
        <div className="bg-white rounded-2xl p-4 border border-[#1C1710]/10 space-y-3">
          <div className="text-[11px] font-label uppercase tracking-wider text-[#1C1710]/60 font-semibold">
            Table Banter &amp; Chat
          </div>
          <div className="h-32 overflow-y-auto space-y-1.5 text-xs pr-2">
            {chatMessages.length === 0 ? (
              <div className="text-[#1C1710]/40 italic">No messages yet. Say hello to table players!</div>
            ) : (
              chatMessages.map((m, i) => (
                <div key={i} className="flex items-center space-x-1.5">
                  <span className="font-bold text-[#A8432A]">{m.sender}:</span>
                  <span className="text-[#1C1710]/80">{m.message}</span>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Send message to table..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#FAF6EE] border border-[#1C1710]/15 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#A8432A]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[#1C1710] text-white text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    );
  }

  // Lobby: Room browser & Table creator
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left: Active 2-4 Player Tables */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-[#1C1710] flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#A8432A]" />
            <span>Active Multiplayer Tables (2-4 Players)</span>
          </h2>
          <span className="text-xs text-[#1C1710]/60">{rooms.length} tables open</span>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-[#FAF6EE] rounded-2xl p-10 text-center border border-[#1C1710]/10 space-y-3">
            <Dices className="w-10 h-10 text-[#A8432A] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#1C1710]">No active tables right now</h3>
            <p className="text-xs text-[#1C1710]/60 max-w-sm mx-auto">
              Create a new 2 to 4 player table on the right! Open another browser tab or device to test playing together and putting chips on the line!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-[#FAF6EE] hover:bg-white rounded-2xl p-4 sm:p-5 border border-[#1C1710]/10 flex items-center justify-between shadow-xs transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#1C1710]">{room.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1C1710] text-white">
                      {room.gameType === 'dice' ? '🎲 Dice' : '🚀 Rocket'}
                    </span>
                  </div>
                  <div className="text-xs text-[#1C1710]/70 flex items-center space-x-3">
                    <span>
                      Wager: <strong>₹{room.wager.toLocaleString()}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Players: <strong>{room.playerCount}/{room.maxPlayers}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.playerCount >= room.maxPlayers || room.status !== 'waiting'}
                  className="px-5 py-2.5 rounded-full bg-[#1C1710] text-white text-xs font-semibold hover:bg-[#332a1e] transition shadow disabled:opacity-40"
                >
                  {room.playerCount >= room.maxPlayers ? 'Full' : 'Join Table'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Create a New Table */}
      <div className="lg:col-span-5 bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 border border-[#1C1710]/10 shadow-sm space-y-4">
        <h3 className="text-lg font-display font-bold text-[#1C1710]">
          Create High-Stakes Table
        </h3>
        <p className="text-xs text-[#1C1710]/70">
          Host a table and invite other bidders or players to put their demo chips on the line!
        </p>

        <form onSubmit={handleCreateRoom} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
              Table Name
            </label>
            <input
              type="text"
              placeholder="e.g. Dharwad High Rollers"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full bg-white border border-[#1C1710]/15 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#A8432A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGame('dice')}
                className={`p-2.5 rounded-2xl text-xs font-bold border transition ${
                  selectedGame === 'dice'
                    ? 'bg-[#1C1710] text-white border-[#1C1710]'
                    : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                }`}
              >
                🎲 Dice Royale
              </button>
              <button
                type="button"
                onClick={() => setSelectedGame('rocket')}
                className={`p-2.5 rounded-2xl text-xs font-bold border transition ${
                  selectedGame === 'rocket'
                    ? 'bg-[#1C1710] text-white border-[#1C1710]'
                    : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                }`}
              >
                🚀 Multi-Crash
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
              Wager Per Player
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 500, 1000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedWager(amt)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedWager === amt
                      ? 'bg-[#A8432A] text-white border-[#A8432A]'
                      : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
              Max Players
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedMaxPlayers(num)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedMaxPlayers === num
                      ? 'bg-[#1C1710] text-white border-[#1C1710]'
                      : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                  }`}
                >
                  {num} Players
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#1C1710] hover:bg-[#332a1e] text-white font-semibold text-xs sm:text-sm shadow-md transition"
          >
            Create Table &amp; Enter Lobby
          </button>
        </form>
      </div>

    </div>
  );
}

/* ========================================================================= */
/* 2. MINES (STAKE ORIGINAL)                                                 */
/* ========================================================================= */
function MinesGame() {
  const { user, wallet, fetchMe } = useAuthStore();
  const [bet, setBet] = useState(200);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState(Array(25).fill({ revealed: false, isMine: false }));
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'playing' | 'cashed_out' | 'busted'
  const [gemsFound, setGemsFound] = useState(0);

  // Multiplier formulas similar to Stake Mines
  const getMultiplier = (gems, mines) => {
    if (gems === 0) return 1.0;
    let prob = 1;
    for (let i = 0; i < gems; i++) {
      prob *= (25 - mines - i) / (25 - i);
    }
    return Math.max(1.15, +(0.97 / prob).toFixed(2));
  };

  const currentMultiplier = getMultiplier(gemsFound, mineCount);
  const currentPayout = Math.floor(bet * currentMultiplier);

  const startMines = async () => {
    if (!user) return alert('Please log in first!');
    if ((wallet?.available || 0) < bet) {
      return alert('Insufficient chips! Claim free demo chips at top!');
    }

    // Generate random mine indices
    const mineIndices = new Set();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    const newGrid = Array.from({ length: 25 }, (_, idx) => ({
      revealed: false,
      isMine: mineIndices.has(idx)
    }));

    setGrid(newGrid);
    setGemsFound(0);
    setGameState('playing');
  };

  const handleTileClick = async (idx) => {
    if (gameState !== 'playing' || grid[idx].revealed) return;

    const tile = grid[idx];
    const updatedGrid = [...grid];
    updatedGrid[idx] = { ...tile, revealed: true };
    setGrid(updatedGrid);

    if (tile.isMine) {
      // Hit a bomb!
      setGameState('busted');
      playExplosionSound();
      // Reveal all tiles
      setGrid(updatedGrid.map((t) => ({ ...t, revealed: true })));
      // Settle bet loss with backend wallet
      try {
        await API.post('/wallet/settle-game', {
          betAmount: bet,
          payout: 0,
          gameName: 'Mines',
          multiplier: 0
        });
        fetchMe();
      } catch (err) {
        console.warn('Mines settle error:', err);
      }
    } else {
      // Found a gem!
      playCashoutSound();
      const newGems = gemsFound + 1;
      setGemsFound(newGems);

      // If all non-mine tiles found
      if (newGems === 25 - mineCount) {
        handleCashOut(newGems);
      }
    }
  };

  const handleCashOut = async (overrideGems) => {
    if (gameState !== 'playing') return;
    const g = overrideGems || gemsFound;
    if (g === 0) return;

    const mult = getMultiplier(g, mineCount);
    const winAmt = Math.floor(bet * mult);

    setGameState('cashed_out');
    // Reveal rest of tiles
    setGrid((prev) => prev.map((t) => ({ ...t, revealed: true })));
    playWinSound();
    triggerConfetti();

    try {
      await API.post('/wallet/settle-game', {
        betAmount: bet,
        payout: winAmt,
        gameName: 'Mines',
        multiplier: mult
      });
      fetchMe();
    } catch (err) {
      console.warn('Mines cashout settle error:', err);
    }
  };

  return (
    <div className="bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 border border-[#1C1710]/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      
      {/* Controls on Left */}
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h2 className="text-xl font-display font-bold text-[#1C1710] flex items-center space-x-2">
            <Bomb className="w-5 h-5 text-[#A8432A]" />
            <span>Mines (Stake Original)</span>
          </h2>
          <p className="text-xs text-[#1C1710]/70 mt-1">
            Pick tiles to uncover diamonds. Multiplier increases with every diamond. Cash out before uncovering a bomb!
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
            Bet Amount (₹)
          </label>
          <div className="flex gap-1.5">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={gameState === 'playing'}
                onClick={() => setBet(amt)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                  bet === amt
                    ? 'bg-[#A8432A] text-white border-[#A8432A]'
                    : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
            Mines Count
          </label>
          <div className="flex gap-1.5">
            {[1, 3, 5, 10].map((m) => (
              <button
                key={m}
                type="button"
                disabled={gameState === 'playing'}
                onClick={() => setMineCount(m)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                  mineCount === m
                    ? 'bg-[#1C1710] text-white border-[#1C1710]'
                    : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                }`}
              >
                {m} Mines
              </button>
            ))}
          </div>
        </div>

        {gameState === 'idle' || gameState === 'busted' || gameState === 'cashed_out' ? (
          <button
            type="button"
            onClick={startMines}
            className="w-full py-3.5 rounded-full bg-[#1C1710] text-white font-bold text-xs sm:text-sm hover:bg-[#332a1e] transition shadow-md"
          >
            Start Round (₹{bet})
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleCashOut()}
            disabled={gemsFound === 0}
            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-40"
          >
            Cash Out ₹{currentPayout.toLocaleString()} ({currentMultiplier}x)
          </button>
        )}

        <div className="pt-2 text-xs text-[#1C1710]/70 flex justify-between">
          <span>Gems Found: <strong>{gemsFound}</strong></span>
          <span>Next: <strong>{getMultiplier(gemsFound + 1, mineCount)}x</strong></span>
        </div>
      </div>

      {/* 5x5 Grid on Right */}
      <div className="lg:col-span-8 flex justify-center">
        <div className="grid grid-cols-5 gap-2.5 max-w-md w-full aspect-square p-4 bg-[#EDE5D6] rounded-3xl border border-[#1C1710]/10">
          {grid.map((tile, idx) => (
            <button
              key={idx}
              type="button"
              disabled={gameState !== 'playing' || tile.revealed}
              onClick={() => handleTileClick(idx)}
              className={`rounded-2xl flex items-center justify-center font-bold transition-all transform ${
                tile.revealed
                  ? tile.isMine
                    ? 'bg-rose-600 text-white scale-95 shadow-inner'
                    : 'bg-emerald-500 text-white scale-95 shadow-inner'
                  : 'bg-white hover:bg-amber-100 text-[#1C1710] shadow-sm hover:scale-105 active:scale-95'
              }`}
            >
              {tile.revealed ? (
                tile.isMine ? (
                  <Bomb className="w-6 h-6 animate-bounce" />
                ) : (
                  <Sparkles className="w-6 h-6 animate-pulse" />
                )
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#1C1710]/20"></span>
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

/* ========================================================================= */
/* 3. CRASH / AVIATOR (SINGLE PLAYER)                                        */
/* ========================================================================= */
function CrashSinglePlayer() {
  const { user, wallet, fetchMe } = useAuthStore();
  const [bet, setBet] = useState(250);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const intervalRef = useRef(null);

  const startCrash = async () => {
    if (!user) return alert('Please log in first!');
    if ((wallet?.available || 0) < bet) {
      return alert('Insufficient chips! Claim free demo chips at top!');
    }

    setIsRunning(true);
    setIsCrashed(false);
    setHasCashedOut(false);
    setMultiplier(1.0);

    const rand = Math.random();
    const crashAt = rand < 0.15 ? 1.12 : rand < 0.65 ? +(1.3 + Math.random() * 2.5).toFixed(2) : +(2.8 + Math.random() * 15.0).toFixed(2);

    let current = 1.0;
    intervalRef.current = setInterval(async () => {
      current = +(current + 0.05 + current * 0.015).toFixed(2);
      if (current >= crashAt) {
        clearInterval(intervalRef.current);
        setMultiplier(crashAt);
        setIsCrashed(true);
        setIsRunning(false);
        playExplosionSound();

        // If not cashed out, record loss
        if (!hasCashedOut) {
          try {
            await API.post('/wallet/settle-game', {
              betAmount: bet,
              payout: 0,
              gameName: 'Crash',
              multiplier: 0
            });
            fetchMe();
          } catch (err) {
            console.warn('Crash settle error:', err);
          }
        }
      } else {
        setMultiplier(current);
      }
    }, 120);
  };

  const cashOut = async () => {
    if (!isRunning || hasCashedOut || isCrashed) return;
    setHasCashedOut(true);
    playCashoutSound();
    playWinSound();
    triggerConfetti();

    const payout = Math.floor(bet * multiplier);
    try {
      await API.post('/wallet/settle-game', {
        betAmount: bet,
        payout,
        gameName: 'Crash',
        multiplier
      });
      fetchMe();
    } catch (err) {
      console.warn('Crash cashout error:', err);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 border border-[#1C1710]/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h2 className="text-xl font-display font-bold text-[#1C1710] flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-[#A8432A]" />
            <span>Crash / Aviator</span>
          </h2>
          <p className="text-xs text-[#1C1710]/70 mt-1">
            Watch the rocket climb higher into the sky. Hit Cash Out before the sudden crash!
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
            Bet Amount
          </label>
          <div className="flex gap-1.5">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={isRunning}
                onClick={() => setBet(amt)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                  bet === amt
                    ? 'bg-[#A8432A] text-white border-[#A8432A]'
                    : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {!isRunning ? (
          <button
            type="button"
            onClick={startCrash}
            className="w-full py-3.5 rounded-full bg-[#1C1710] text-white font-bold text-xs sm:text-sm hover:bg-[#332a1e] transition shadow-md"
          >
            Launch Rocket (₹{bet})
          </button>
        ) : (
          <button
            type="button"
            onClick={cashOut}
            disabled={hasCashedOut || isCrashed}
            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-40"
          >
            {hasCashedOut
              ? `Cashed Out: ₹${(bet * multiplier).toFixed(0)}!`
              : `Cash Out ₹${(bet * multiplier).toFixed(0)}`}
          </button>
        )}
      </div>

      {/* Visual Rocket Display */}
      <div className="lg:col-span-8 bg-[#1C1710] text-white rounded-3xl p-10 h-72 flex flex-col justify-between items-center relative overflow-hidden shadow-inner">
        <div className="text-[11px] font-label text-white/50 tracking-widest uppercase">
          {isRunning ? 'IN FLIGHT' : isCrashed ? 'CRASHED' : 'READY TO LAUNCH'}
        </div>

        <div className="text-6xl sm:text-7xl font-mono font-black text-center text-[#F0D0B0]">
          {multiplier.toFixed(2)}x
        </div>

        <div className="text-xs text-white/70">
          {hasCashedOut && (
            <span className="text-emerald-400 font-bold">
              🎉 Cashed out at {multiplier.toFixed(2)}x (+₹{(bet * multiplier).toFixed(0)})!
            </span>
          )}
          {isCrashed && !hasCashedOut && (
            <span className="text-rose-400 font-bold">💥 Crashed! Try again!</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 4. PLINKO (STAKE ORIGINAL)                                                */
/* ========================================================================= */
function PlinkoGame() {
  const { user, wallet, fetchMe } = useAuthStore();
  const [bet, setBet] = useState(100);
  const [lastWin, setLastWin] = useState(null);
  const [dropping, setDropping] = useState(false);

  const buckets = [
    { mult: 10, color: 'bg-rose-600 text-white' },
    { mult: 3, color: 'bg-amber-600 text-white' },
    { mult: 1.5, color: 'bg-yellow-500 text-[#1C1710]' },
    { mult: 0.5, color: 'bg-emerald-600 text-white' },
    { mult: 0.3, color: 'bg-slate-700 text-white' },
    { mult: 0.5, color: 'bg-emerald-600 text-white' },
    { mult: 1.5, color: 'bg-yellow-500 text-[#1C1710]' },
    { mult: 3, color: 'bg-amber-600 text-white' },
    { mult: 10, color: 'bg-rose-600 text-white' }
  ];

  const dropBall = async () => {
    if (!user) return alert('Please log in first!');
    if ((wallet?.available || 0) < bet) {
      return alert('Insufficient chips! Claim free demo chips at top!');
    }

    setDropping(true);
    setLastWin(null);

    // Simulate bouncing down 8 rows
    setTimeout(async () => {
      // Pick random bucket weighted towards center
      const rand = Math.random();
      let bucketIdx = 4; // center
      if (rand < 0.05) bucketIdx = 0;
      else if (rand < 0.12) bucketIdx = 1;
      else if (rand < 0.28) bucketIdx = 2;
      else if (rand < 0.5) bucketIdx = 3;
      else if (rand < 0.72) bucketIdx = 5;
      else if (rand < 0.88) bucketIdx = 6;
      else if (rand < 0.95) bucketIdx = 7;
      else bucketIdx = 8;

      const target = buckets[bucketIdx];
      const payout = Math.floor(bet * target.mult);
      setLastWin({ mult: target.mult, payout });
      setDropping(false);

      if (target.mult >= 1.5) {
        playWinSound();
        triggerConfetti();
      } else {
        playCashoutSound();
      }

      try {
        await API.post('/wallet/settle-game', {
          betAmount: bet,
          payout,
          gameName: 'Plinko',
          multiplier: target.mult
        });
        fetchMe();
      } catch (err) {
        console.warn('Plinko settle error:', err);
      }
    }, 1200);
  };

  return (
    <div className="bg-[#FAF6EE] rounded-[32px] p-6 sm:p-8 border border-[#1C1710]/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div className="lg:col-span-4 space-y-4">
        <div>
          <h2 className="text-xl font-display font-bold text-[#1C1710] flex items-center space-x-2">
            <CircleDot className="w-5 h-5 text-[#A8432A]" />
            <span>Plinko</span>
          </h2>
          <p className="text-xs text-[#1C1710]/70 mt-1">
            Drop the ball from the top of the pyramid. Watch it bounce into high multiplier reward slots!
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-label font-bold text-[#1C1710]/70 uppercase">
            Wager Per Drop (₹)
          </label>
          <div className="flex gap-1.5">
            {[50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={dropping}
                onClick={() => setBet(amt)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                  bet === amt
                    ? 'bg-[#A8432A] text-white border-[#A8432A]'
                    : 'bg-white text-[#1C1710] border-[#1C1710]/15'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={dropBall}
          disabled={dropping}
          className="w-full py-3.5 rounded-full bg-[#1C1710] text-white font-bold text-xs sm:text-sm hover:bg-[#332a1e] transition shadow-md disabled:opacity-50"
        >
          {dropping ? 'Ball Bouncing...' : `Drop Ball (₹${bet})`}
        </button>

        {lastWin && (
          <div className="p-3 rounded-2xl bg-white border border-[#1C1710]/10 text-center space-y-1">
            <div className="text-xs text-[#1C1710]/60">Landed in:</div>
            <div className="text-lg font-bold text-[#A8432A]">
              {lastWin.mult}x Multiplier (+₹{lastWin.payout.toLocaleString()})
            </div>
          </div>
        )}
      </div>

      {/* Pegboard Display */}
      <div className="lg:col-span-8 bg-[#EDE5D6] rounded-3xl p-6 flex flex-col items-center justify-between min-h-[320px] border border-[#1C1710]/10">
        <div className="w-4 h-4 rounded-full bg-amber-500 shadow-md animate-bounce mb-2"></div>

        {/* Peg Rows */}
        <div className="space-y-3">
          {[3, 4, 5, 6, 7, 8].map((rowLen, rowIdx) => (
            <div key={rowIdx} className="flex justify-center space-x-4 sm:space-x-6">
              {Array.from({ length: rowLen }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#1C1710]/40 shadow-xs"></div>
              ))}
            </div>
          ))}
        </div>

        {/* Multiplier Buckets */}
        <div className="grid grid-cols-9 gap-1 w-full pt-6">
          {buckets.map((b, i) => (
            <div
              key={i}
              className={`rounded-lg py-2 text-center text-[10px] sm:text-xs font-bold ${b.color} shadow-sm`}
            >
              {b.mult}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
