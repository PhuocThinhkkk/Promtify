
import { useState } from 'react';
import { Button, Fieldset, Window, WindowHeader, WindowContent, TextInput, Panel } from '@react95/core';
import { useAuth } from '@/hooks/useAuth';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

      if (error) {
        alert(`Error: ${error.message}`);
      } else if (!isLogin) {
        alert('Success! Check your email for the confirmation link!');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(45deg, #008080, #20b2aa)',
        fontFamily: 'MS Sans Serif, sans-serif'
      }}
    >
      <Window className="w-full max-w-md">
        <WindowHeader className="flex items-center justify-between">
          <span>🔐 {isLogin ? 'Login' : 'Sign Up'} - Lovable AI v1.0</span>
        </WindowHeader>
        <WindowContent>
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">🖥️</div>
            <h2 className="text-lg font-bold">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600">
              {isLogin ? 'Please enter your credentials' : 'Join the retro AI experience'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Fieldset legend="User Information">
              {!isLogin && (
                <div className="mb-3">
                  <label className="block text-sm font-bold mb-1">Full Name:</label>
                  <TextInput
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Email:</label>
                <TextInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Password:</label>
                <TextInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full"
                />
              </div>
            </Fieldset>

            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '⏳ Processing...' : (isLogin ? '🚪 Sign In' : '📝 Sign Up')}
              </Button>
              
              <Panel variant="well" className="p-2">
                <div className="text-center text-xs text-gray-600 mb-2">- OR -</div>
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full"
                >
                  🌐 Continue with Google
                </Button>
              </Panel>
              
              <Button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full"
                variant="flat"
              >
                {isLogin ? "🆕 Don't have an account? Sign up" : "🔄 Already have an account? Sign in"}
              </Button>
            </div>
          </form>
        </WindowContent>
      </Window>
    </div>
  );
};
