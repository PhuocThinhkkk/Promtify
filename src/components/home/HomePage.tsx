
import { Button, Frame, TitleBar, Fieldset, TextArea } from '@react95/core';
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
          className="text-3xl md:text-2xl lg:text-[12rem] font-bold mb-4 cursor-blink"
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
          Promptify
        </h1>
        <div 
          className="text-2xl md:text-3xl font-semibold mt-44"
          style={{
            color: '#000080',
            textShadow: '2px 2px 0px #c0c0c0, 4px 4px 0px #808080'
          }}
        >
          AI That Babysits Your Cringe Prompts
        </div>
      </div>

      {/* Welcome Frame */}
      <Frame className="max-w-2xl w-full mx-auto mb-8 window-95">
        <TitleBar>🖥️ Welcome to Prompt Jail™</TitleBar>
        <div className="p-8 text-center bg-gray-200">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'MS Sans Serif, sans-serif' }}>
            Your Prompt Was Mid. We Fixed It.
          </h2>
          <p className="text-lg mb-6 leading-relaxed">
            Drop your confusing prompt. We'll politely bully it into shape.
            Build, chat, and create amazing applications with the nostalgic feel of Windows 95.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/chat')}
              className="flex items-center justify-center space-x-2 px-6 py-3 text-lg"
            >
              <span>💬</span>
              <span>Chat</span>
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
          <TitleBar>⚡ Prompt Speedrun</TitleBar>
          <div className="p-6 text-center bg-gray-200">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">So Fast You wll Miss the Point™</h3>
            <p className="text-sm">Build applications in minutes, not hours</p>
          </div>
        </Frame>

        <Frame className="window-95">
          <TitleBar>🤖 AI Powered</TitleBar>
          <div className="p-6 text-center bg-gray-200">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2">	Actually Thinks Before Typing</h3>
            <p className="text-sm">The wise master guiding your prompt noobs</p>
          </div>
        </Frame>

        <Frame className="window-95">
          <TitleBar>🎨 1995 UX Back</TitleBar>
          <div className="p-6 text-center bg-gray-200">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="font-bold text-lg mb-2">	Painfully Nostalgic</h3>
            <p className="text-sm">Classic Windows 95 aesthetic meets modern tech</p>
          </div>
        </Frame>
      </div>
      <Frame className="max-w-2xl w-full mx-auto mb-8 window-95" variant="outside" shadow="lg" style={{ margin: '2rem auto' }}>
      <TitleBar title="How it works." active />
      <div style={{ padding: '1rem' }}>
        <h3 className='text-left text-xl'>Garbage in</h3>
        <Fieldset className="w-full" label="📜 Before" style={{ marginBottom: '1rem' }}>
          <TextArea
            className='w-full'
            disabled
            rows={3}
            defaultValue="make a website that show all my cats and also do api call and fetch user and i want button on it"
          />
        </Fieldset>
          <h3 className='text-left text-xl'> Gold Out</h3>
        <Fieldset label="🧠 Nerdified Prompt">
          <TextArea
          className='w-full'
            disabled
            rows={4}
            defaultValue="Build a responsive website that displays a gallery of my cats, includes an API call to fetch user data, and features an interactive button component."
          />
        </Fieldset>
      </div>
    </Frame>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm opacity-75" style={{ color: '#000080' }}>
         	🤠 Yeehaw Machine Learning
        </p>
      </div>
    </div>
  );
};
