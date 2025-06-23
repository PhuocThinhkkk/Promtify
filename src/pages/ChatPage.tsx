
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';

export const ChatPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};
