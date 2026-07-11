import React, { useState } from 'react';
import { Shield, Sparkles, Zap, Lock, Mail, User as UserIcon, Play } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signInAnonymously } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthScreenProps {
  onLoginSuccess: (user: { uid: string; email: string; displayName: string }) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = userCredential.user;
      
      // Sync with MongoDB backend
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email || email,
          displayName: displayName || user.email?.split('@')[0] || 'Hero'
        })
      });

      onLoginSuccess({
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || user.email?.split('@')[0] || 'Hero'
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Hero'
        })
      });

      onLoginSuccess({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Hero'
      });
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const res = await signInAnonymously(auth);
      const user = res.user;
      const guestName = `Adventurer_${Math.floor(Math.random() * 9000 + 1000)}`;

      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: 'guest@realm.local',
          displayName: guestName
        })
      });

      onLoginSuccess({
        uid: user.uid,
        email: 'guest@realm.local',
        displayName: guestName
      });
    } catch (err: any) {
      // Fallback if Firebase auth restricted in preview
      const fallbackUid = `guest_${Date.now()}`;
      const guestName = `Hero_${Math.floor(Math.random() * 9000 + 1000)}`;
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: fallbackUid,
          email: 'guest@realm.local',
          displayName: guestName
        })
      });
      onLoginSuccess({
        uid: fallbackUid,
        email: 'guest@realm.local',
        displayName: guestName
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background magical glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white mb-4 shadow-lg shadow-purple-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            Realm of Legends
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Online Multiplayer RPG • Co-op Dungeons • Real-time PvP
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Character / Account Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="HeroName"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@realm.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-11 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Enter Realm')}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="hover:text-purple-400 transition-colors cursor-pointer"
          >
            {isRegister ? 'Already have an account? Log in' : 'Need an account? Register'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-3 border border-slate-700 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sign in with Google
          </button>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800/80 text-amber-400 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-amber-500/30 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Quick Play as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
