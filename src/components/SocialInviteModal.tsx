import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  QrCode,
  Users,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types/ludo';

interface SocialInviteModalProps {
  roomCode?: string;
  userProfile: UserProfile;
  onClose: () => void;
  onSelectRoom?: (code: string) => void;
}

interface SocialFriend {
  id: string;
  name: string;
  handle: string;
  platform: 'facebook' | 'instagram';
  avatarBg: string;
  isOnline: boolean;
  elo: number;
  invited: boolean;
}

const MOCK_FRIENDS: SocialFriend[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    handle: '@sarah_j_ludo',
    platform: 'instagram',
    avatarBg: 'from-pink-500 to-rose-600',
    isOnline: true,
    elo: 1420,
    invited: false,
  },
  {
    id: '2',
    name: 'Alex Rivera',
    handle: 'fb.com/arivera99',
    platform: 'facebook',
    avatarBg: 'from-blue-600 to-indigo-700',
    isOnline: true,
    elo: 1510,
    invited: false,
  },
  {
    id: '3',
    name: 'Elena Rostova',
    handle: '@elena_dice_master',
    platform: 'instagram',
    avatarBg: 'from-purple-500 to-pink-500',
    isOnline: true,
    elo: 1380,
    invited: false,
  },
  {
    id: '4',
    name: 'Marcus Vance',
    handle: 'fb.com/marcus.vance',
    platform: 'facebook',
    avatarBg: 'from-blue-500 to-cyan-600',
    isOnline: false,
    elo: 1290,
    invited: false,
  },
  {
    id: '5',
    name: 'Priya Sharma',
    handle: '@priya_ludo_star',
    platform: 'instagram',
    avatarBg: 'from-amber-500 to-orange-600',
    isOnline: true,
    elo: 1600,
    invited: false,
  },
];

export const SocialInviteModal: React.FC<SocialInviteModalProps> = ({
  roomCode,
  userProfile,
  onClose,
  onSelectRoom,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'instagram' | 'facebook' | 'qrcode'>('friends');
  const [friendsList, setFriendsList] = useState<SocialFriend[]>(MOCK_FRIENDS);
  const [isConnectedFB, setIsConnectedFB] = useState(true);
  const [isConnectedIG, setIsConnectedIG] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const activeRoomCode = roomCode || 'LUDO88';
  const inviteUrl = `${window.location.origin}?room=${activeRoomCode}`;
  const inviteMessage = `🎮 Challenge me on gamebot.ai! Join my ranked match now.\nRoom Code: ${activeRoomCode}\nPlay directly: ${inviteUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSendInviteToFriend = (friendId: string) => {
    setFriendsList((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, invited: true } : f))
    );
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'gamebot.ai Challenge',
          text: `🎮 Join my gamebot.ai match! Room Code: ${activeRoomCode}`,
          url: inviteUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteUrl)}&quote=${encodeURIComponent(inviteMessage)}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
  };

  const handleShareMessenger = () => {
    const msgUrl = `https://www.facebook.com/dialog/send?app_id=123456789&link=${encodeURIComponent(inviteUrl)}&redirect_uri=${encodeURIComponent(inviteUrl)}`;
    window.open(msgUrl, '_blank', 'width=600,height=400');
  };

  const handleShareInstagramDirect = () => {
    handleCopyText();
    // Open Instagram app or web
    window.open('https://www.instagram.com/direct/inbox/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-600 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                <Users className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Play with Friends</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-extrabold border border-pink-500/30 uppercase">
                  IG & FB
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Challenge Instagram & Facebook friends in real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Banner */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Match Room:</span>
            <span className="text-base font-black text-cyan-400 font-mono tracking-wider">
              {activeRoomCode}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Room Link'}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 bg-slate-950 border-b border-slate-800 grid grid-cols-4 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('friends')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Friends</span>
          </button>

          <button
            onClick={() => setActiveTab('instagram')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-pink-300" />
            <span>Instagram</span>
          </button>

          <button
            onClick={() => setActiveTab('facebook')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'facebook'
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-300" />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'qrcode'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Friends List Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {/* Account Connection Status */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-slate-900">
                      IG
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-slate-900">
                      FB
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Social Sync Active</p>
                    <p className="text-[10px] text-slate-400">
                      Facebook & Instagram contacts loaded
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded-lg">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Synced</span>
                </div>
              </div>

              {/* Friends Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Online Social Friends ({friendsList.filter((f) => f.isOnline).length})</span>
                  <span className="text-[10px] text-blue-400 font-mono">Real-time Direct Invites</span>
                </h3>

                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${friend.avatarBg} flex items-center justify-center text-white font-extrabold text-sm shadow-md relative`}
                      >
                        {friend.name.slice(0, 2).toUpperCase()}
                        {friend.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">{friend.name}</p>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              friend.platform === 'instagram'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {friend.platform === 'instagram' ? 'IG' : 'FB'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {friend.handle} • {friend.elo} ELO
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendInviteToFriend(friend.id)}
                      disabled={friend.invited}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        friend.invited
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : friend.platform === 'instagram'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-md shadow-pink-600/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      {friend.invited ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Invited</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Invite</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instagram Tab */}
          {activeTab === 'instagram' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-950 border border-pink-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    IG
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Instagram Direct & Story Share</h4>
                    <p className="text-[10px] text-pink-300">
                      Copy formatted challenge message or send via Instagram DM
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap relative group">
                  {inviteMessage}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCopyText}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedText ? 'Copied Message' : 'Copy Message'}</span>
                  </button>

                  <button
                    onClick={handleShareInstagramDirect}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/30 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Open Instagram</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  💡 <span className="text-slate-200 font-bold">Pro Tip:</span> Paste the copied invite message directly into your Instagram Direct Messages or post a story with your room code!
                </p>
              </div>
            </div>
          )}

          {/* Facebook Tab */}
          {activeTab === 'facebook' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-950 border border-blue-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    FB
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Facebook Feed & Messenger Share</h4>
                    <p className="text-[10px] text-blue-300">
                      Invite friends directly on Facebook timeline or Messenger chat
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {inviteMessage}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleShareFacebook}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share to FB Feed</span>
                  </button>

                  <button
                    onClick={handleShareMessenger}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Messenger</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleNativeShare}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>More Social Sharing Options (Native Sheet)</span>
              </button>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qrcode' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 gap-4 text-center">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center relative">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                  <path d="M0,0 h35 v35 h-35 z M5,5 v25 h25 v-25 z M10,10 h15 v15 h-15 z" />
                  <path d="M65,0 h35 v35 h-35 z M70,5 v25 h25 v-25 z M75,10 h15 v15 h-15 z" />
                  <path d="M0,65 h35 v35 h-35 z M5,70 v25 h25 v-25 z M10,75 h15 v15 h-15 z" />
                  <rect x="40" y="5" width="20" height="10" />
                  <rect x="45" y="20" width="15" height="15" />
                  <rect x="5" y="40" width="25" height="10" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="65" y="40" width="30" height="10" />
                  <rect x="75" y="55" width="20" height="20" />
                  <rect x="40" y="65" width="10" height="30" />
                  <rect x="55" y="75" width="25" height="15" />
                  <rect x="85" y="80" width="10" height="15" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-2 py-1 bg-blue-600 text-white font-black text-[10px] rounded shadow-md border border-white">
                    LUDO.AI
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white">Scan to Join Room</p>
                <p className="text-[11px] text-slate-400">
                  Room Code: <span className="text-cyan-400 font-mono font-bold">{activeRoomCode}</span>
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Room Link'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cross-Platform Social Invites</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
