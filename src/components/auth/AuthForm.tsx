import { useState } from 'react';
import { Button, Fieldset, Frame, TitleBar, Input } from '@react95/core';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/hooks/useAlert';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const alertHook = useAlert()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

      if (error) {
        alertHook.showAlert({
          type: 'error',
          title: 'Hey there!',
          message: `${error.message}`,
          hasSound: true
        });
      } else if (!isLogin) {
        alertHook.showAlert({
          type: 'info',
          title: 'Hey there!',
          message: `Success! Check your email for the confirmation link!`,
          hasSound: true
        });
      }
    } catch (error) {
      alertHook.showAlert({
          type: 'error',
          title: 'Hey there!',
          message: `Something went wrong. Please try again.`,
          hasSound: true
        });
    
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        alertHook.showAlert({
        type: 'error',
        title: 'Hey there!',
        message: `${error.message}`,
        hasSound: true
      });
      }
    } catch (error) {
      alertHook.showAlert({
        type: 'error',
        title: 'Hey there!',
        message: `Something went wrong. Please try again.`,
        hasSound: true
      });
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
      <div className="w-full max-w-md">
        {/* Responsive Promptify Title */}
        <div className="text-center mb-6">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
            style={{
              color: '#000080',
              textShadow: `
                2px 2px 0px #c0c0c0,
                4px 4px 0px #808080,
                6px 6px 0px #404040
              `,
              fontFamily: 'MS Sans Serif, monospace',
              letterSpacing: '0.05em'
            }}
          >
            Promptify
          </h1>
          <div 
            className="text-sm sm:text-base font-semibold"
            style={{
              color: '#000080',
              textShadow: '1px 1px 0px #c0c0c0'
            }}
          >
            Welcome Back to the Future
          </div>
        </div>

        <Frame className="window-95 bg-gray-200 w-full">
          <TitleBar>
            🔐 {isLogin ? 'Login' : 'Sign Up'} 
          </TitleBar>
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="text-4xl sm:text-5xl mb-2">🖥️</div>
              <h2 className="text-base sm:text-lg font-bold mb-1">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {isLogin ? 'Please enter your credentials' : 'Join the retro AI experience'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Fieldset legend="User Information">
                <div className="space-y-3">
                  {!isLogin && (
                    <div>
                      <label className="block text-xs sm:text-sm font-bold mb-1">Full Name:</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="w-full text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1">Email:</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold mb-1">Password:</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </Fieldset>

              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={loading} className="w-full text-sm">
                  {loading ? '⏳ Processing...' : (isLogin ? '🚪 Sign In' : '📝 Sign Up')}
                </Button>
                
                <Frame className="p-2">
                  <div className="text-center text-xs text-gray-600 mb-2">- OR -</div>
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full text-sm"
                  >
                    🌐 Continue with Google
                  </Button>
                </Frame>
                
                <Button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-xs sm:text-sm"
                >
                  {isLogin ? "🆕 Don't have an account? Sign up" : "🔄 Already have an account? Sign in"}
                </Button>
              </div>
            </form>
          </div>
        </Frame>
      </div>
    </div>
  );
};