import { Header } from '@/components/layout/Header';
import { UnifiedChatInterface } from '@/components/chat/UnifiedChatInterface';

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
        <UnifiedChatInterface />
      </div>
    </div>
  );
};