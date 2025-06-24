
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Frame, TitleBar } from '@react95/core';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(45deg, #008080, #20b2aa)',
          fontFamily: 'MS Sans Serif, sans-serif'
        }}
      >
        <Frame className="p-4">
          <TitleBar>🔄 Loading System...</TitleBar>
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p>Initializing Lovable AI...</p>
          </div>
        </Frame>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};
