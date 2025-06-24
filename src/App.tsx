
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HomePage } from "@/components/home/HomePage";
import { ChatPage } from "@/pages/ChatPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { ConversationPage } from "@/pages/ConversationPage";
import NotFound from "./pages/NotFound";
import { AlertProvider } from "./hooks/useAlert";

import './App.css';

import '@react95/core/GlobalStyle';
import '@react95/core/themes/win95.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/conversation/:id" element={
          <ProtectedRoute>
            <ConversationPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </AlertProvider>
  </QueryClientProvider>
);

export default App;
