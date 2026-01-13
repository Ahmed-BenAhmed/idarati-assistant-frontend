
import React from 'react';
import { HistoryItem } from '../types';

interface SidebarProps {
  history: HistoryItem[];
  onNewChat: () => void;
}

const CATEGORIES = [
  "المقاولة والأعمال",
  "الأمن والسلامة",
  "التعليم والتكوين",
  "الصناعة والتجارة والاتصالات",
  "الصحة والشؤون الاجتماعية",
  "الشغل والتوظيف",
  "الطاقة والمعادن والبيئة",
  "المواطنة ووثائق الهوية",
  "الجمارك والعملات",
  "البناء والسكن والعقار",
  "ضرائب وأموال",
  "الفلاحة والصيد البحري",
  "الأسرة والحالة المدنية",
  "النقل والمواصلات",
  "الثقافة والرياضة والترفيه",
  "القانون والعدل",
  "الأوقاف والشؤون الدينية"
];

export const Sidebar: React.FC<SidebarProps> = ({ history, onNewChat }) => {
  return (
    <div className="h-full bg-softGray flex flex-col p-4">
      <button 
        onClick={onNewChat}
        className="w-full mb-6 py-2.5 px-4 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        طلب جديد
      </button>

      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin">
        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">السجل</h3>
          <div className="space-y-1">
            {history.map(item => (
              <button 
                key={item.id} 
                className="w-full text-right px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-200 transition-colors truncate arabic-text"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">المواضيع</h3>
          <div className="space-y-1">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className="w-full text-right px-3 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 arabic-text"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-accent">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-200/50">
          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">بوابة المواطن</p>
            <p className="text-[10px] text-slate-500 truncate">نشط الآن</p>
          </div>
        </div>
      </div>
    </div>
  );
};
