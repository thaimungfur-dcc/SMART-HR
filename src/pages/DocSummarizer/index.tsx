import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

const THEME = {
  primary: '#212c46',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  bgMain: '#f3f3f1',
  success: '#657f4d',
};

interface SummaryResult {
  title: string;
  keyTakeaways: string[];
  risks: string[];
  actionItems: string[];
}

export default function DocSummarizer() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleSummarize = () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setResult(null);

    // Mock processing
    setTimeout(() => {
      setResult({
        title: "สรุปสาระสำคัญของข้อกฎหมาย",
        keyTakeaways: [
          "ผู้ประกอบกิจการต้องจัดทำรายงานการประเมินความเสี่ยงทุก 6 เดือน",
          "ต้องมีเจ้าหน้าที่ความปลอดภัย (จป.) ระดับวิชาชีพประจำสถานประกอบการ",
          "เอกสารหลักฐานต้องเก็บรักษาไว้อย่างน้อย 5 ปี"
        ],
        risks: [
          "บทลงโทษปรับสูงสุดไม่เกิน 200,000 บาท หากไม่จัดทำรายงาน",
          "ความเสี่ยงในการถูกระงับใบอนุญาตชั่วคราว"
        ],
        actionItems: [
          "ตรวจสอบรายชื่อ จป. ปัจจุบัน",
          "จัดพิกัดการเก็บเอกสารย้อนหลังให้เป็นระเบียบ",
          "กำหนดปฏิทินการส่งรายงานงวดถัดไป"
        ]
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="flex flex-1 w-full flex-col pb-6 animate-fadeIn bg-transparent space-y-4 min-h-0">
      
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#932c2e] hover:text-white hover:border-[#932c2e] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
            <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#7a8b95] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* HEADER SECTION */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center group cursor-default shrink-0">
            <div className="absolute inset-0 bg-[#b7a159] blur-[15px] opacity-30 rounded-full group-hover:opacity-70 transition-all duration-700 animate-pulse-subtle"></div>
            <div className="relative z-10 p-1.5 border border-[#b7a159]/50 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
              <Icons.BookOpen size={28} strokeWidth={2.5} className="text-[#b58c4f]" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none flex items-center gap-2" style={{ fontSize: '24px' }}>
              AI DOCUMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#8e9141]">SUMMARIZER</span>
              <span className="bg-[#b58c4f] text-white text-[9px] px-2 py-0.5 rounded-full tracking-widest ml-1 shadow-sm font-mono">BETA</span>
            </h3>
            <p className="text-[11px] font-bold text-[#b58c4f] uppercase tracking-[0.2em] mt-0.5 opacity-90 leading-none">
              INTELLIGENT DOCUMENT DIGEST
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-[2px] pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Card */}
        <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-[#eaeaec] animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-[#eaeaec] pb-3">
             <h4 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest flex items-center gap-2">
               <Icons.FileText size={18} className="text-[#b58c4f]"/> Input Legal Text
             </h4>
             <button 
               onClick={() => setInputText('')}
               className="text-[10px] font-bold text-[#7a8b95] hover:text-[#932c2e] uppercase tracking-widest transition-colors"
             >
               Clear
             </button>
          </div>
          
          <div className="relative group">
            <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="วางข้อความกฎหมาย หรือประกาศที่ต้องการให้สรุปที่นี่..."
               className="w-full h-80 p-5 bg-[#f8f9fa] border border-[#eaeaec] rounded-2xl outline-none focus:border-[#b58c4f] focus:ring-2 focus:ring-[#b58c4f]/10 transition-all text-[#212c46] text-[14px] leading-relaxed resize-none"
            />
            {inputText.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                 <Icons.UploadCloud size={48} className="text-[#7a8b95] mb-2" />
                 <span className="text-[12px] font-bold tracking-widest uppercase text-[#7a8b95]">Paste Content Here</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleSummarize}
            disabled={!inputText.trim() || isProcessing}
            className={`w-full mt-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] transition-all flex items-center justify-center gap-3 shadow-md ${(!inputText.trim() || isProcessing) ? 'bg-[#eaeaec] text-[#a0aec0] cursor-not-allowed' : 'bg-[#212c46] text-[#b7a159] hover:bg-[#b7a159] hover:text-[#212c46]'}`}
          >
            {isProcessing ? (
              <>
                <Icons.Loader2 size={18} className="animate-spin" /> Processing Legal Insights...
              </>
            ) : (
              <>
                <Icons.Sparkles size={18} /> Summarize Document
              </>
            )}
          </button>
        </div>

        {/* Result Card */}
        <div className="bg-[#1d2636] p-6 rounded-3xl shadow-xl border border-[#414757] animate-fadeIn min-h-[500px] flex flex-col">
           {!result && !isProcessing ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 group">
                   <Icons.FileSearch size={32} className="text-white/20 group-hover:text-[#b7a159] transition-colors" />
                </div>
                <h4 className="text-white font-black uppercase tracking-widest text-[14px] mb-2">Awaiting Analysis</h4>
                <p className="text-white/40 text-[11px] leading-relaxed max-w-xs font-bold uppercase tracking-wider">
                  Paste a legal text in the left panel to generate an intelligent summary and risk assessment.
                </p>
             </div>
           ) : isProcessing ? (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-[#b7a159]/20 border-t-[#b7a159] rounded-full animate-spin"></div>
                   <Icons.BrainCircuit size={24} className="text-[#b7a159] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-white/60 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Deep Legal Processing...</span>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#b7a159] rounded-lg text-white">
                         <Icons.CheckCircle size={18} />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase tracking-tighter text-[18px]">Analysis Complete</h4>
                        <p className="text-[#b7a159] text-[9px] font-black uppercase tracking-widest">Document Digest Result</p>
                      </div>
                   </div>
                   <button className="p-2 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                      <Icons.Download size={20} />
                   </button>
                </div>

                <div className="space-y-6">
                   <section>
                      <h5 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Icons.LayoutList size={14} className="text-[#b7a159]"/> Key Takeaways
                      </h5>
                      <div className="space-y-2">
                        {result?.keyTakeaways.map((item, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#b7a159] mt-1.5 shrink-0" />
                             <span className="text-white/90 text-[13px] leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                   </section>

                   <section>
                      <h5 className="text-[11px] font-black text-[#d96245]/80 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Icons.AlertTriangle size={14} className="text-[#d96245]"/> Risks & Compliance Caps
                      </h5>
                      <div className="space-y-2">
                        {result?.risks.map((item, i) => (
                          <div key={i} className="bg-red-500/5 border border-red-500/20 p-3 rounded-xl flex items-start gap-3">
                             <Icons.ShieldAlert size={16} className="text-[#d96245] shrink-0 mt-0.5" />
                             <span className="text-white/90 text-[13px] leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                   </section>

                   <section>
                      <h5 className="text-[11px] font-black text-[#657f4d] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Icons.Zap size={14} className="text-[#657f4d]"/> Recommended Actions
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {result?.actionItems.map((item, i) => (
                          <div key={i} className="bg-[#657f4d]/10 border border-[#657f4d]/30 p-3 rounded-xl flex items-center gap-3">
                             <Icons.Check size={16} className="text-[#657f4d] shrink-0" />
                             <span className="text-white/90 text-[13px]">{item}</span>
                          </div>
                        ))}
                      </div>
                   </section>
                </div>
             </div>
           )}
        </div>
        </div>

        {/* Document Distribution Bar Chart (Relocated from Home) */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#eaeaec] mt-6 animate-fadeIn">
           <div className="flex items-center justify-between border-b border-[#eaeaec] pb-3 mb-4">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-amber-50 text-[#b58c4f] rounded-lg">
                 <Icons.FolderTree size={16} />
               </div>
               <div>
                 <h3 className="text-xs font-black text-[#212c46] uppercase tracking-wider">Document Distribution</h3>
                 <p className="text-[9px] text-[#748ea1] font-black uppercase tracking-widest mt-0.5">Database storage volumes by Document Category</p>
               </div>
             </div>
             <span className="text-[8px] font-black uppercase tracking-wider text-[#b58c4f] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 transition-all">
               Registry Stats
             </span>
           </div>
           <div className="h-44">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={[
                 { name: 'Policies', value: 12 },
                 { name: 'Contracts', value: 25 },
                 { name: 'NDAs', value: 8 },
                 { name: 'Tax / Compliance', value: 15 },
                 { name: 'Forms', value: 5 }
               ]} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                 <XAxis dataKey="name" stroke="#7a8b95" fontSize={10} tickLine={false} />
                 <YAxis stroke="#7a8b95" fontSize={10} tickLine={false} />
                 <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                 <Bar dataKey="value" fill="#b58c4f" radius={[4, 4, 0, 0]}>
                   {[
                     { name: 'Policies', value: 12 },
                     { name: 'Contracts', value: 25 },
                     { name: 'NDAs', value: 8 },
                     { name: 'Tax / Compliance', value: 15 },
                     { name: 'Forms', value: 5 }
                   ].map((entry, index) => {
                     const colors = ['#254268', '#b58c4f', '#5f7ab7', '#a73527', '#657f4d'];
                     return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                   })}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
