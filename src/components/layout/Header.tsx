
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, History, LogOut } from 'lucide-react';
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
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-primary">Lovable AI</h1>
          <nav className="flex space-x-4">
            <Button
              variant={location.pathname === '/chat' ? 'default' : 'ghost'}
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Button>
            <Button
              variant={location.pathname === '/history' ? 'default' : 'ghost'}
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
