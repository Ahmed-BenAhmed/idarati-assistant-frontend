import React, { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { RightPanel } from './components/RightPanel';
import { Message, StructuredResponse, HistoryItem, Category } from './types';
import { useAsk } from './hooks/useIdaratiApi';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [selectedProcedureData, setSelectedProcedureData] = useState<StructuredResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', title: 'تجديد جواز السفر', category: 'السفر', date: Date.now() - 86400000 },
    { id: '2', title: 'طلب البطاقة الوطنية', category: 'الهوية', date: Date.now() - 172800000 },
  ]);

  const askMutation = useAsk();

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await askMutation.mutateAsync({
        prompt: text,
        match_threshold: 0.5,
        match_count: 3,
        embedding_model: 'multilingual-e5-large'
      });
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.summary,
        timestamp: Date.now(),
        isStructured: true,
        structuredData: result,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setSelectedProcedureData(null);
      
      if (text.length > 5) {
        setHistory(prev => [
          { id: Date.now().toString(), title: text.slice(0, 30), category: 'عام', date: Date.now() },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "عذراً، حدث خطأ ما أثناء الوصول إلى قاعدة البيانات أو خدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى أو زيارة idarati.ma.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const lastAssistantResponse = messages
    .filter(m => m.role === 'assistant' && m.isStructured)
    .pop()?.structuredData;

  const rightPanelData = selectedProcedureData || lastAssistantResponse;

  return (
    <div className="flex h-screen bg-softGray overflow-hidden" dir="rtl">
      {/* Sidebar - Desktop (Right side in RTL) */}
      <div className={`hidden md:block border-l border-accent transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
         <Sidebar
           history={history}
           onNewChat={() => {
             setMessages([]);
             setSelectedProcedureData(null);
           }}
         />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 flex items-center justify-between px-6 border-b border-accent bg-white z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg md:block hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">ID</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">مساعد إدارتي</h1>
                <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">مساعد البوابة الرسمية</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="px-2 py-1 bg-green-50 text-green-700 text-[11px] rounded border border-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                القانون 55.19 مفعّل
              </div>
              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg md:block hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><rect x="14" y="4" width="8" height="16"></rect></svg>
              </button>
          </div>
        </header>

        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={askMutation.isPending} 
          onSelectStructuredResponse={setSelectedProcedureData}
        />
      </main>

      {/* Right Panel - Desktop (Left side in RTL) */}
      <div className={`hidden lg:block border-r border-accent transition-all duration-300 ${isRightPanelOpen ? 'w-80' : 'w-0'}`}>
        <RightPanel data={rightPanelData} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
};

export default App;
