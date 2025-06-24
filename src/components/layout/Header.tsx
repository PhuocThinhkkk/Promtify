
import { Button, Panel, Separator } from 'react95';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Panel 
      variant="well" 
      className="border-b shadow-sm"
      style={{ 
        background: 'linear-gradient(90deg, #c0c0c0, #d4d0c8)',
        borderBottom: '2px solid #808080'
      }}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🖥️</span>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
              Lovable AI v1.0
            </h1>
          </div>
          
          <Separator orientation="vertical" />
          
          <nav className="flex space-x-2">
            <Button
              variant={location.pathname === '/chat' ? 'default' : 'flat'}
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-1"
            >
              <span>💬</span>
              <span>Chat</span>
            </Button>
            <Button
              variant={location.pathname === '/history' ? 'default' : 'flat'}
              onClick={() => navigate('/history')}
              className="flex items-center space-x-1"
            >
              <span>📋</span>
              <span>History</span>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <Panel variant="well" className="px-2 py-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <span className="text-sm font-mono">
                {user?.email?.charAt(0).toUpperCase()}{user?.email?.slice(1, 8)}...
              </span>
            </div>
          </Panel>
          <Button onClick={handleSignOut} variant="flat">
            <span className="flex items-center space-x-1">
              <span>🚪</span>
              <span>Exit</span>
            </span>
          </Button>
        </div>
      </div>
    </Panel>
  );
};
