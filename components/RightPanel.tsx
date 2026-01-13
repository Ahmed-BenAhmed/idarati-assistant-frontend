
import React from 'react';
import { StructuredResponse } from '../types';

interface RightPanelProps {
  data?: StructuredResponse;
}

export const RightPanel: React.FC<RightPanelProps> = ({ data }) => {
  const legalReference = data?.legalCitation || 'القانون 55.19 الخاص بتبسيط المساطر والإجراءات الإدارية';

  return (
    <div className="h-full bg-white flex flex-col p-6 overflow-y-auto">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
        ملخص المسطرة
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px]">بيانات حية</span>
      </h3>

      {!data ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
          </div>
          <p className="text-xs text-slate-400 px-4 arabic-text">اطرح سؤالاً لمشاهدة الوثائق المطلوبة والإجراءات هنا.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <section>
             <h4 className="text-sm font-bold text-slate-800 mb-2">أبرز النقاط</h4>
             <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
               <p className="text-xs text-blue-800 leading-relaxed arabic-text">{data.summary}</p>
             </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800">قائمة الوثائق</h4>
              <span className="text-[10px] text-slate-400">{data.checklist.length} وثائق</span>
            </div>
            <div className="space-y-3">
              {data.checklist.map((item, idx) => (
                <div key={idx} className="group p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1 rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5" />
                    <span className="text-xs text-slate-600 font-medium leading-normal arabic-text">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 mb-3">السياق القانوني</h4>
            <div className="bg-slate-900 rounded-xl p-4 text-slate-300 relative overflow-hidden">
               <div className="absolute top-0 left-0 p-2 opacity-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
               </div>
               <p className="text-[10px] font-mono mb-2 text-primary">سجل رسمي</p>
               <p className="text-[11px] leading-relaxed italic arabic-text">
                 "تخضع هذه المسطرة لـ {legalReference}. بموجب القانون 55.19، تمنع الإدارات من مطالبة المرتفق بأكثر من نسخة واحدة من ملف الطلب."
               </p>
            </div>
          </section>

          {(data.procedureLink || data.thematicLink) && (
            <section className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800">روابط رسمية</h4>
                <span className="text-[10px] text-slate-400">idarati.ma</span>
              </div>
              <div className="space-y-2">
                {data.procedureLink && (
                  <a 
                    href={data.procedureLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors arabic-text text-sm text-blue-800"
                  >
                    <span>الانتقال إلى المسطرة</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                )}
                {data.thematicLink && (
                  <a 
                    href={data.thematicLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors arabic-text text-sm text-slate-700"
                  >
                    <span>استكشاف بقية المساطر في نفس الموضوع</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>
                  </a>
                )}
              </div>
            </section>
          )}

          <div className="mt-8 space-y-2">
            <button className="w-full py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 arabic-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              تصدير القائمة (PDF)
            </button>
            <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all arabic-text">
              تحديد أقرب مكتب إداري
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
