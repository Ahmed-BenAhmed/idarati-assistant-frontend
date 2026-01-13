
import React, { useState } from 'react';
import { RetrievedProcedure, StructuredResponse } from '../types';

interface SmartBubbleProps {
  data: StructuredResponse;
  onAction: (text: string) => void;
  onSelectProcedure?: (data: StructuredResponse | null) => void;
}

export const SmartBubble: React.FC<SmartBubbleProps> = ({ data, onAction, onSelectProcedure }) => {
  const [isProceduresOpen, setIsProceduresOpen] = useState(false);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);
  const procedures: RetrievedProcedure[] = data.retrievedProcedures || [];
  const selectedProcedure = procedures.find((proc) => proc.id === selectedProcedureId) || null;

  const formatSummary = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return data.summary;
    return trimmed.length > 520 ? `${trimmed.slice(0, 520)}...` : trimmed;
  };

  const deriveChecklistFromContent = (content: string) => {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const bulletLines = lines.filter((line) =>
      /^[-*•–—]\s+/.test(line) || /^[0-9٠-٩]+[.)-]\s+/.test(line)
    );
    const cleaned = bulletLines.map((line) =>
      line.replace(/^[-*•–—]\s+/, "").replace(/^[0-9٠-٩]+[.)-]\s+/, "")
    );
    return cleaned;
  };

  const selectedChecklistFromMetadata = Array.isArray(selectedProcedure?.metadata?.checklist)
    ? (selectedProcedure?.metadata?.checklist as string[])
    : Array.isArray(selectedProcedure?.metadata?.documents)
      ? (selectedProcedure?.metadata?.documents as string[])
      : [];

  const derivedChecklist =
    selectedChecklistFromMetadata.length > 0
      ? selectedChecklistFromMetadata
      : selectedProcedure?.content
        ? deriveChecklistFromContent(selectedProcedure.content)
        : [];

  const activeSummary = selectedProcedure?.content ? formatSummary(selectedProcedure.content) : data.summary;
  const activeChecklist = selectedProcedure ? (derivedChecklist.length ? derivedChecklist : data.checklist) : data.checklist;
  const activeProcedureLink = selectedProcedure?.procedureLink || data.procedureLink;
  const activeThematicLink = selectedProcedure?.thematicLink || data.thematicLink;

  const buildResponseForProcedure = (proc: RetrievedProcedure) => {
    const summary = proc.content ? formatSummary(proc.content) : data.summary;
    const fromMetadata = Array.isArray(proc.metadata?.checklist)
      ? (proc.metadata?.checklist as string[])
      : Array.isArray(proc.metadata?.documents)
        ? (proc.metadata?.documents as string[])
        : [];
    const extracted = fromMetadata.length ? fromMetadata : proc.content ? deriveChecklistFromContent(proc.content) : [];
    return {
      ...data,
      summary,
      checklist: extracted.length ? extracted : data.checklist,
      procedureLink: proc.procedureLink || data.procedureLink,
      thematicLink: proc.thematicLink || data.thematicLink,
    };
  };

  const handleSelectProcedure = (proc: RetrievedProcedure) => {
    setSelectedProcedureId(proc.id);
    setIsProceduresOpen(false);
    onSelectProcedure?.(buildResponseForProcedure(proc));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-lg">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
           <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">دليل المسطرة</span>
           <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
             قانون 55.19 مفعّل
           </span>
        </div>
        {selectedProcedure && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 arabic-text">المسطرة المختارة: {selectedProcedure.title}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedProcedureId(null);
                onSelectProcedure?.(null);
              }}
              className="text-[10px] text-slate-500 hover:text-primary transition-colors"
            >
              عرض الإجابة العامة
            </button>
          </div>
        )}
        <p className="text-sm font-semibold text-slate-800 leading-relaxed arabic-text">
          {activeSummary}
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            الوثائق المطلوبة
          </h4>
          {activeChecklist.length === 0 ? (
            <p className="text-sm text-slate-500 arabic-text">لا توجد وثائق مذكورة لهذه المسطرة.</p>
          ) : (
            <ul className="space-y-2">
              {activeChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 arabic-text">
                  <div className="mt-1 w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {data.quickActions && data.quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.quickActions.map(action => (
              <button 
                key={action}
                onClick={() => onAction(action)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200 arabic-text"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {(activeProcedureLink || activeThematicLink) && (
        <div className="px-4 pb-3 pt-1 space-y-2">
          {activeProcedureLink && (
            <a 
              href={activeProcedureLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full p-3 bg-secondary text-white text-center text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 arabic-text rounded-xl"
            >
              الانتقال إلى المسطرة الرسمية
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>
          )}
          {activeThematicLink && (
            <a 
              href={activeThematicLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full p-3 bg-white border border-slate-200 text-center text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 arabic-text rounded-xl text-slate-700"
            >
              اكتشاف بقية المساطر في نفس الموضوع
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>
            </a>
          )}
        </div>
      )}

      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 italic arabic-text">المرجع: {data.legalCitation || 'القانون 55.19'}</span>
          <button
            type="button"
            onClick={() => setIsProceduresOpen(true)}
            disabled={procedures.length === 0}
            title={procedures.length ? "عرض الوثائق المسترجعة" : "لا توجد وثائق مسترجعة"}
            className={`p-1.5 rounded-md transition-colors ${
              procedures.length ? 'text-slate-500 hover:text-primary hover:bg-white' : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
          </button>
          <button className="text-slate-400 hover:text-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
          </button>
        </div>
      </div>

      {isProceduresOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div className="text-sm font-semibold text-slate-800 arabic-text">الوثائق المسترجعة</div>
              <button
                type="button"
                onClick={() => setIsProceduresOpen(false)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
              {procedures.length === 0 ? (
                <p className="text-sm text-slate-500 arabic-text">لا توجد وثائق مسترجعة لهذه الإجابة.</p>
              ) : (
                procedures.map((proc) => (
                  <div
                    key={proc.id}
                    className={`border rounded-xl p-4 space-y-2 transition-colors ${
                      selectedProcedureId === proc.id ? 'border-primary bg-blue-50/40' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-slate-800 arabic-text">{proc.title}</h4>
                      {typeof proc.similarity === "number" && (
                        <span className="text-[10px] text-slate-400">similarity: {proc.similarity.toFixed(3)}</span>
                      )}
                    </div>
                    {proc.content && (
                      <p className="text-xs text-slate-600 leading-relaxed arabic-text">
                        {proc.content.length > 220 ? `${proc.content.slice(0, 220)}...` : proc.content}
                      </p>
                    )}
                    {(proc.procedureLink || proc.thematicLink) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {proc.procedureLink && (
                          <a
                            href={proc.procedureLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors"
                          >
                            رابط المسطرة
                          </a>
                        )}
                        {proc.thematicLink && (
                          <a
                            href={proc.thematicLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            رابط الموضوع
                          </a>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectProcedure(proc)}
                      className={`w-full mt-2 px-3 py-2 text-[11px] font-semibold rounded-lg transition-colors ${
                        selectedProcedureId === proc.id
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      اعتماد هذه المسطرة
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
