import React, { useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginProps {
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isAdmin, onLogin, onLogout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'Admin' && password === 'Poste123') {
      onLogin();
      setShowLogin(false);
      setUsername('');
      setPassword('');
      toast.success('Accesso amministratore effettuato');
    } else {
      toast.error('Credenziali non valide');
    }
  };

  const handleLogout = () => {
    onLogout();
    toast.info('Disconnesso dal pannello amministratore');
  };

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3 bg-accent/20 px-4 py-2 rounded-lg border border-accent">
        <Lock className="w-4 h-4 text-accent-foreground" />
        <span className="text-sm font-medium text-accent-foreground">Modalità Amministratore</span>
        <button
          onClick={handleLogout}
          className="ml-2 text-accent-foreground hover:text-destructive transition"
          title="Esci"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!showLogin) {
    return (
      <button
        onClick={() => setShowLogin(true)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
      >
        <Lock className="w-4 h-4" />
        <span className="text-sm">Admin</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-card-foreground">Accesso Amministratore</h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="Admin"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLogin(false);
                setUsername('');
                setPassword('');
              }}
              className="flex-1 bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition font-medium"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
