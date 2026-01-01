
import React, { useState, useRef, useEffect } from 'react';
// Use namespace import to resolve named export issues
import * as ReactRouterDOM from 'react-router-dom';
import { AppState, ChatMessage } from '../types';
import { getChatResponse } from '../services/aiService';

const { useNavigate } = ReactRouterDOM;

interface Props {
  state: AppState;
  onAddMessage: (msg: ChatMessage) => void;
}

const ChatPage: React.FC<Props> = ({ state, onAddMessage }) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    onAddMessage({ role: 'user', text: userText, timestamp: timeStr });
    setIsTyping(true);

    try {
      const appContext = `اسم الملف: ${state.settings.fileName || 'غير محدد'}. مستوى الصعوبة: ${state.settings.difficulty}. عدد الأسئلة المنشأة حالياً: ${state.questions.length}.`;
      const response = await getChatResponse(userText, appContext);
      
      onAddMessage({ 
        role: 'model', 
        text: response || "عذراً، Gemini يحتاج لمزيد من الوقت للتفكير.", 
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) 
      });
    } catch (error) {
      onAddMessage({ role: 'model', text: "حدث خطأ في الاتصال بمحرك Gemini.", timestamp: timeStr });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="bg-white border-b border-slate-200 z-30 shrink-0 sticky top-0 shadow-sm h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors" title="العودة للإعدادات">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">tune</span>
          </button>
          <div className="flex flex-col text-right">
            <h1 className="text-[12px] font-black text-slate-800">Gemini المساعد التعليمي</h1>
            <div className="flex items-center gap-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">متصل الآن</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button className="flex h-7 px-3 items-center justify-center rounded-lg bg-white text-primary shadow-sm gap-1">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span className="text-[10px] font-bold">دردشة</span>
          </button>
          <button onClick={() => navigate('/questions')} className="flex h-7 px-3 items-center justify-center rounded-lg text-slate-500 hover:text-primary transition-colors gap-1">
            <span className="material-symbols-outlined text-[16px]">quiz</span>
            <span className="text-[10px] font-bold">الأسئلة</span>
          </button>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar pb-24">
        {state.messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`size-7 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${msg.role === 'model' ? 'bg-gradient-to-br from-blue-600 to-blue-400 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
              <span className="material-symbols-outlined text-[13px]">{msg.role === 'model' ? 'auto_awesome' : 'person'}</span>
            </div>
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3.5 rounded-2xl text-[11.5px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none text-right'}`}>
                {msg.text}
              </div>
              <span className="text-[8px] text-slate-400 px-1 font-bold">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none w-fit shadow-sm">
            <span className="text-[9px] text-blue-500 font-bold">Gemini يفكر...</span>
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </main>

      <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-3 flex items-center gap-3 z-40">
        <div className="flex-1 relative">
          <input 
            className="w-full h-10 pr-4 pl-10 rounded-2xl bg-slate-50 border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-[11px] text-right placeholder-slate-400" 
            placeholder="اسأل Gemini عن أي تفاصيل في الدرس..." 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="absolute left-1.5 top-1.5 bottom-1.5 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-hover active:scale-90 transition-all">
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
