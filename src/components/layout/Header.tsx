
import { Button } from '@react95/core';
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
    <div 
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
              Promtify v1.0
            </h1>
          </div>
          
          <div className="w-px h-6 bg-gray-400"></div>
          
          <nav className="flex space-x-2">
            <Button
              onClick={() => navigate('/chat')}
              className={`flex items-center space-x-1 ${location.pathname === '/chat' ? 'bg-gray-300' : ''}`}
            >
              <span>💬</span>
              <span>Chat</span>
            </Button>
            <Button
              onClick={() => navigate('/history')}
              className={`flex items-center space-x-1 ${location.pathname === '/history' ? 'bg-gray-300' : ''}`}
            >
              <span>📋</span>
              <span>History</span>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-2 py-1 bg-gray-200 border border-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-sm">👤</span>
              <span className="text-sm font-mono">
                {user?.email?.charAt(0).toUpperCase()}{user?.email?.slice(1, 8)}...
              </span>
            </div>
          </div>
          <Button onClick={handleSignOut}>
            <span className="flex items-center space-x-1">
              <span>🚪</span>
              <span>Exit</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
