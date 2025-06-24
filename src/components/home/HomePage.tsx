
import { Button, Frame, TitleBar } from '@react95/core';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ 
        background: 'linear-gradient(45deg, #008080, #20b2aa, #008080)',
        fontFamily: 'MS Sans Serif, sans-serif'
      }}
    >
      {/* Large Retro Word Display */}
      <div className="text-center mb-12">
        <h1 
          className="text-8xl md:text-9xl lg:text-[12rem] font-bold mb-4 cursor-blink"
          style={{
            color: '#000080',
            textShadow: `
              4px 4px 0px #c0c0c0,
              8px 8px 0px #808080,
              12px 12px 0px #404040,
              16px 16px 20px rgba(0,0,0,0.3)
            `,
            fontFamily: 'MS Sans Serif, monospace',
            letterSpacing: '0.1em'
          }}
        >
          LOVABLE
        </h1>
        <div 
          className="text-2xl md:text-3xl font-semibold"
          style={{
            color: '#000080',
            textShadow: '2px 2px 0px #c0c0c0, 4px 4px 0px #808080'
          }}
        >
          AI-Powered Development Platform
        </div>
      </div>

      {/* Welcome Frame */}
      <Frame className="max-w-2xl w-full mx-auto mb-8 window-95">
        <TitleBar>🖥️ Welcome to Lovable v1.0</TitleBar>
        <div className="p-8 text-center bg-gray-200">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
            Welcome to the Future of AI Development
          </h2>
          <p className="text-lg mb-6 leading-relaxed">
            Experience the power of AI-driven web development with our retro-modern interface. 
            Build, chat, and create amazing applications with the nostalgic feel of Windows 95.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/chat')}
              className="flex items-center justify-center space-x-2 px-6 py-3 text-lg"
            >
              <span>💬</span>
              <span>Start Chatting</span>
            </Button>
            <Button 
              onClick={() => navigate('/history')}
              className="flex items-center justify-center space-x-2 px-6 py-3 text-lg"
            >
              <span>📋</span>
              <span>View History</span>
            </Button>
          </div>
        </div>
      </Frame>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Frame className="window-95">
          <TitleBar>⚡ Fast Development</TitleBar>
          <div className="p-6 text-center bg-gray-200">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
            <p className="text-sm">Build applications in minutes, not hours</p>
          </div>
        </Frame>

        <Frame className="window-95">
          <TitleBar>🤖 AI Powered</TitleBar>
          <div className="p-6 text-center bg-gray-200">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2">Smart AI</h3>
            <p className="text-sm">Intelligent code generation and suggestions</p>
          </div>
        </Frame>

        <Frame className="window-95">
          <TitleBar>🎨 Retro Style</TitleBar>
          <div className="p-6 text-center bg-gray-200">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-2">Nostalgic UI</h3>
            <p className="text-sm">Classic Windows 95 aesthetic meets modern tech</p>
          </div>
        </Frame>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm opacity-75" style={{ color: '#000080' }}>
          © 2024 Lovable AI • Bringing the future to the past
        </p>
      </div>
    </div>
  );
};
