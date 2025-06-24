
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';

export const ChatPage = () => {
  return (
    <div 
      className="h-screen flex flex-col"
      style={{ 
        background: 'linear-gradient(45deg, #008080, #20b2aa)',
        fontFamily: 'MS Sans Serif, sans-serif'
      }}
    >
      <Header />
      <div className="flex-1 p-4">
        <ChatInterface />
      </div>
    </div>
  );
};
