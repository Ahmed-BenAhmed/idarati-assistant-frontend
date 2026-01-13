
import React, { useState, useRef, useEffect } from 'react';
import { Message, StructuredResponse } from '../types';
import { SmartBubble } from './SmartBubble';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectStructuredResponse?: (data: StructuredResponse | null) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, onSelectStructuredResponse }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      alert("التعرف على الصوت غير مدعوم في هذا المتصفح.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-MA';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0055A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">السلام عليكم!</h2>
            <p className="text-slate-500 text-sm">
              أنا مساعدك الإداري المغربي. اسألني عن أي مسطرة إدارية (البطاقة الوطنية، جواز السفر، رخصة السياقة...) في إطار القانون 55.19.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              {[
                "تجديد جواز السفر", 
                "الوثائق المطلوبة للزواج", 
                "استخراج عقد الازدياد", 
                "تجديد البطاقة الوطنية"
              ].map(item => (
                <button 
                  key={item}
                  onClick={() => onSendMessage(item)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors arabic-text"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%]`}>
              {msg.isStructured && msg.structuredData ? (
                <SmartBubble
                  data={msg.structuredData}
                  onAction={onSendMessage}
                  onSelectProcedure={onSelectStructuredResponse}
                />
              ) : (
                <div className={`p-4 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white shadow-md rounded-tr-none' 
                    : 'bg-accent text-slate-800 rounded-tl-none'
                }`}>
                  <p className="arabic-text">{msg.content}</p>
                </div>
              )}
              <div className={`mt-1 px-2 text-[10px] text-slate-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-accent p-4 rounded-2xl animate-pulse flex items-center gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              <span className="text-[11px] font-medium text-slate-500 mr-2 arabic-text">جاري مراجعة الدلائل الإدارية...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t border-accent bg-white">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <label className="p-2 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors group">
            <input type="file" className="hidden" onChange={(e) => console.log(e.target.files)} />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
          </label>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="كيف يمكنني مساعدتك اليوم؟"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 min-h-[40px] arabic-text text-right"
            dir="rtl"
          />

          <div className="flex items-center gap-1">
             <button 
              type="button"
              onClick={handleVoiceInput}
              className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-600'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl transition-all shadow-sm ${input.trim() && !isLoading ? 'bg-primary text-white scale-100' : 'bg-slate-200 text-slate-400 scale-95 cursor-not-allowed'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          الذكاء الاصطناعي قد يرتكب أخطاء. يرجى التحقق من المعلومات الهامة في الملحقة الإدارية.
        </p>
      </div>
    </div>
  );
};
