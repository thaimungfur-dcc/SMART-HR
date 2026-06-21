import { UserGuidePanel } from '../../components/shared/UserGuidePanel';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from 'lucide-react';

const THEME = {
  bgMain: '#f3f3f1',
  bgGradient: 'transparent',
  sidebarBg: 'linear-gradient(180deg, #1d2636 0%, #0F172A 100%)',
  glassWhite: 'rgba(255, 255, 255, 0.88)',
  primary: '#212c46',
  primaryLight: '#4d87a8',
  accent: '#a94228',
  gold: '#b58c4f',
  brightGold: '#b7a159',
  success: '#657f4d',
  danger: '#932c2e',
  skyBlue: '#3f809e',
  dustyBlue: '#7a8b95',
  indigo: '#414757',
  softPurple: '#ab7d82',
  deepPurple: '#2d2c4a',
  pinkAccent: '#a54f6b',
  mutedSlate: '#606a5f',
  darkSlate: '#2f2926',
  silver: '#d7d7d7',
  deepNavy: '#212c46',
  brownGold: '#b58c4f',
  vibrantPurple: '#2d2c4a',
  burntOrange: '#d96245',
  slateBlue: '#748ea1',
  coolGray: '#eaeaec',
  darkRed: '#851c24',
  oliveGreen: '#818d47',
  sageGreen: '#bab98b',
  burgundy: '#8b2c3d',
  khaki: '#84896d',
  redMain: '#b22026',
  forestGreen: '#508660',
  grayGreen: '#939885'
};

const suggestedPrompts = [
  { id: 'p1', title: 'KPI Calibration', text: 'ขอแนวทางการตั้งเป้าหมายและเขียน KPIs สำหรับตำแหน่งผู้ช่วยฝ่ายจัดซื้อ (Purchasing Officer) และหัวหน้าคลังที่วัดผลด้านประหยัดต้นทุนและนำส่งตรงเวลา', icon: 'Target' },
  { id: 'p2', title: 'Disciplinary Warning', text: 'กรณีมีกรณีพนักงานทำผิดวินัยขั้นร้ายแรง (เช่น ทำลายทรัพย์สินในเขตออฟฟิศ) ควรมีขั้นตอนการออกหนังสือเตือนตามกฎหมายแรงงานไทยอย่างไร?', icon: 'AlertTriangle' },
  { id: 'p3', title: 'Onboarding Checklists', text: 'ช่วยร่างแนวทางระบบการปฐมนิเทศพนักงานใหม่แบบเชิงรุก Onboarding Checklist สำหรับพนักงานสำนักงานทั่วไปใน 7 วันแรก', icon: 'UserPlus' },
  { id: 'p4', title: 'Engagement Program', text: 'ขอไอเดียเสนอแนะการจัดกิจกรรมนันทนาการและกีฬา Employee Engagement ภายในแผนก เพื่อลดอัตราความเหนื่อยล้าของบุคลากร', icon: 'Heart' }
];

interface CopilotSource {
  title: string;
  uri: string;
}

interface CopilotMessage {
  id: number;
  role: 'ai' | 'user';
  text: string;
  timestamp: string;
  sources?: CopilotSource[];
  offline?: boolean;
}

export default function AiCopilot() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('chat');
  
  const [messages, setMessages] = useState<CopilotMessage[]>([
    { id: 1, role: 'ai', text: 'สวัสดีค่ะ! ฉันคือ T All BOT ผู้ช่วยอัจฉริยะของคุณในระบบ SMART HR. วันนี้มีเรื่องการบริหารงานบุคคล การพัฒนาบุคลากร หรือข้อมูลส่วนไหนที่ต้องการให้ฉันช่วยเหลือไหมคะ?', timestamp: '08:00 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessageText = text.trim();
    const newUserMsg: CopilotMessage = { 
      id: Date.now(), 
      role: 'user', 
      text: userMessageText, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    const currentHistory = [...messages, newUserMsg];
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageText,
          history: currentHistory.map(m => ({ role: m.role, text: m.text }))
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      
      const newAiMsg: CopilotMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.text || "ขออภัยด้วยค่ะ ไม่ได้รับสัญญาณคำตอบจากทางระบบในขณะนี้",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        offline: !!data.offline
      };

      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Copilot request failed:", error);
      const errAiMsg: CopilotMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่ายความปลอดภัย ระบบได้เบี่ยงเบนสัญญาณกลับเข้าสู่คำตอบพื้นฐานออฟไลน์ชั่วคราวค่ะ กรุณาบันทึกคีย์ความปลอดภัยอีกครั้งในเมนูควบคุมค่ะ",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        offline: true
      };
      setMessages(prev => [...prev, errAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-1 w-full flex-col pb-6 animate-fadeIn bg-transparent space-y-4 min-h-0">
      
      {/* USER GUIDE FLOATING TAB */}
      {typeof document !== 'undefined' && createPortal(
        <button onClick={() => setIsGuideOpen(true)} className="fixed right-0 bg-[#f8f9fa] border border-[#eaeaec] border-r-0 text-[#212c46] py-8 px-1.5 rounded-l-xl shadow-md hover:bg-[#b7a159] hover:text-white hover:border-[#b7a159] transition-all duration-500 z-[100] flex flex-col items-center gap-4 group" style={{ top: '80px' }}>
            <Icons.HelpCircle size={18} className="shrink-0 group-hover:rotate-12 transition-transform text-[#b58c4f] group-hover:text-white" />
            <span className="font-black tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap uppercase text-[11px]">USER GUIDE</span>
        </button>,
        document.body
      )}

      <UserGuidePanel isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* HEADER SECTION (Matching User Permission) */}
      <div className="h-14 px-8 flex flex-row items-center justify-between gap-4 z-20 shrink-0">
          <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center group cursor-default shrink-0">
                  <div className="absolute inset-0 bg-[#b7a159] blur-[15px] opacity-30 rounded-full group-hover:opacity-70 transition-all duration-700 animate-pulse-subtle"></div>
                  <div className="relative z-10 p-1.5 border border-[#b7a159]/50 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm overflow-hidden">
                      <Icons.BrainCircuit size={28} strokeWidth={2.5} className="text-[#b58c4f]" />
                  </div>
              </div>
              <div>
                  <h3 className="font-black text-[#212c46] uppercase tracking-tighter leading-none flex items-center gap-2" style={{ fontSize: '24px' }}>
                      SMART AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b58c4f] to-[#8e9141]">COPILOT</span>
                      <span className="bg-[#b58c4f] text-white text-[9px] px-2 py-0.5 rounded-full tracking-widest ml-1 shadow-sm font-mono">BETA</span>
                  </h3>
                  <p className="text-[11px] font-bold text-[#b58c4f] uppercase tracking-[0.2em] mt-0.5 opacity-90 leading-none">
                      INTELLIGENT AI ASSISTANT
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner flex flex-wrap items-center gap-1">
                  <button onClick={() => setActiveMode('chat')} className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeMode === 'chat' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#b58c4f]'}`}>
                    <Icons.MessageSquare size={16} /> Copilot Chat
                  </button>
                  <button onClick={() => setActiveMode('documents')} className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeMode === 'documents' ? 'bg-[#212c46] text-white shadow-md' : 'text-[#7a8b95] hover:text-[#b58c4f]'}`}>
                    <Icons.FileSearch size={16} /> Multi-Doc Mode
                  </button>
              </div>
          </div>
      </div>

      <div className="px-4 sm:px-8 w-full mt-2 flex-1 pb-6 min-h-0 flex flex-col">
        <div className="w-full flex-1 flex flex-col gap-6 lg:flex-row h-full min-h-0">
            
            {/* Left Panel: Sidebar / Prompts */}
            <div className="w-full lg:w-80 flex flex-col gap-5 shrink-0 animate-fadeIn h-full pb-6">
                
                <div className="bg-white/90 p-4 rounded-3xl shadow-lg border border-[#eaeaec] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#212c46] to-[#414757] flex items-center justify-center shadow-xl border-4 border-white mb-3 relative">
                        <Icons.Bot size={30} className="text-white" />
                        <span className="absolute bottom-1 right-1 w-3 h-3 bg-[#657f4d] rounded-full border-2 border-white shadow-sm"></span>
                    </div>
                    <h4 className="text-[13px] font-black text-[#212c46] uppercase tracking-widest font-mono">T All BOT ผู้ช่วยอัจฉริยะ</h4>
                    <p className="text-[10px] text-[#7a8b95] font-bold mt-1 uppercase tracking-wider">Ready to help</p>
                </div>

                <div className="bg-white/90 rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col  flex-1 min-h-0">
                    <div className="p-5 border-b border-[#eaeaec] bg-[#f8f9fa]">
                        <h4 className="text-[12px] font-black uppercase text-[#212c46] tracking-widest flex items-center gap-2">
                            <Icons.Lightbulb size={16} className="text-[#b58c4f]"/> Suggested Prompts
                        </h4>
                    </div>
                    <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar flex-1">
                        {suggestedPrompts.map(prompt => {
                            const IconComponent = Icons[prompt.icon as keyof typeof Icons] as any || Icons.MessageSquare;
                            return (
                                <button key={prompt.id} onClick={() => handleSendMessage(prompt.text)} className="w-full text-left bg-white border border-[#eaeaec] p-2.5 px-3 rounded-2xl hover:border-[#b58c4f] hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="bg-[#f8f9fa] p-1.5 rounded-lg text-[#b58c4f] group-hover:bg-[#b58c4f] group-hover:text-white transition-colors">
                                            <IconComponent size={14} />
                                        </div>
                                        <span className="font-black text-[#212c46] text-[11px] uppercase tracking-widest">{prompt.title}</span>
                                    </div>
                                    <p className="text-[11px] text-[#414757] leading-relaxed line-clamp-2">{prompt.text}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* Right Panel: Chat Interface */}
            {activeMode === 'chat' ? (
                <div className=" bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col animate-fadeIn relative  flex-1 min-h-0">
                    {/* Chat Header */}
                    <div className="h-14 border-b border-[#eaeaec] bg-[#f8f9fa] flex items-center justify-between px-5 shrink-0 z-10">
                        <div className="flex items-center gap-3">
                            <Icons.MessageSquareText size={18} className="text-[#b58c4f]" />
                            <span className="font-black text-[#212c46] uppercase text-[12px] tracking-widest">Copilot Conversation</span>
                        </div>
                        <button className="text-[#7a8b95] hover:text-[#932c2e] transition-colors p-1.5 bg-white rounded-lg border border-[#eaeaec] hover:border-[#932c2e]/50 shadow-sm" onClick={() => setMessages([messages[0]])}>
                            <Icons.Trash2 size={16} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#f3f3f1]/30">
                        <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
                            {messages.map((msg, index) => (
                                <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                    <div className="shrink-0 mt-1">
                                        {msg.role === 'ai' ? (
                                            <div className="w-10 h-10 rounded-full bg-[#212c46] flex items-center justify-center shadow-md">
                                                <Icons.Bot size={20} className="text-[#b7a159]" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#b7a159] flex items-center justify-center shadow-md overflow-hidden">
                                                <Icons.User size={20} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className={`flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest mb-1.5 ${msg.role === 'user' ? 'justify-end text-[#b7a159]' : 'text-[#7a8b95]'}`}>
                                            <span>{msg.role === 'ai' ? 'Copilot' : 'You'}</span>
                                            <span>•</span>
                                            <span>{msg.timestamp}</span>
                                        </div>
                                        <div className={`px-6 py-4 text-[13px] leading-relaxed shadow-sm rounded-2xl ${msg.role === 'user' ? 'bg-[#212c46] text-white rounded-tr-md chat-bubble-user' : 'bg-white border border-[#eaeaec] text-[#212c46] rounded-tl-md chat-bubble-ai'}`}>
                                            {msg.text.split('\n').map((line, i) => (
                                                <p key={i} className={i !== 0 ? 'mt-2' : ''}>{line}</p>
                                            ))}
                                            
                                            {/* Offline Status Badge */}
                                            {msg.role === 'ai' && msg.offline && (
                                                <div className="mt-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit">
                                                    <Icons.WifiOff size={12} className="shrink-0" />
                                                    <span>แนะแนวทางออฟไลน์ (Offline Recommended)</span>
                                                </div>
                                            )}

                                            {/* Live Search Grounded badge */}
                                            {msg.role === 'ai' && !msg.offline && msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-3.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit">
                                                    <Icons.SearchCode size={12} className="shrink-0 animate-pulse-subtle" />
                                                    <span>Google Search Grounded (สืบค้นสดเรียลไทม์)</span>
                                                </div>
                                            )}

                                            {/* Citations list with clickable URL badges */}
                                            {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-[#eaeaec] flex flex-col gap-2">
                                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-[#b58c4f]">
                                                        <Icons.Bookmark size={11} className="text-[#b58c4f] shrink-0" />
                                                        <span>อ้างอิงแหล่งข้อมูล (Sources):</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {msg.sources.map((src, sIdx) => (
                                                            <a 
                                                                key={sIdx} 
                                                                href={src.uri} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#b58c4f]/10 text-[#b58c4f] hover:text-white hover:bg-[#b58c4f] border border-[#b58c4f]/20 rounded-full text-[11px] font-bold transition-all shadow-sm max-w-[260px] truncate"
                                                                title={src.title}
                                                            >
                                                                <Icons.ExternalLink size={10} className="shrink-0" />
                                                                <span className="truncate">{src.title}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex gap-4 max-w-[85%] self-start animate-fadeIn pb-6">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-[#212c46] flex items-center justify-center shadow-md">
                                            <Icons.Bot size={20} className="text-[#b7a159]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest mb-1.5 text-[#7a8b95]">
                                            <span>Copilot</span>
                                        </div>
                                        <div className="px-6 py-5 bg-white border border-[#eaeaec] text-[#212c46] rounded-2xl rounded-tl-md chat-bubble-ai shadow-sm flex items-center gap-2">
                                            <div className="w-2 h-2 bg-[#b7a159] rounded-full typing-dot"></div>
                                            <div className="w-2 h-2 bg-[#b7a159] rounded-full typing-dot"></div>
                                            <div className="w-2 h-2 bg-[#b7a159] rounded-full typing-dot"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 sm:p-6 bg-white border-t border-[#eaeaec] z-10 shrink-0">
                        <div className="max-w-4xl mx-auto relative flex items-end gap-3 bg-[#f8f9fa] p-2 rounded-3xl border border-[#eaeaec] shadow-inner focus-within:border-[#b7a159] focus-within:ring-2 focus-within:ring-[#b7a159]/20 transition-all">
                            <button onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.onchange = () => {
                                    handleSendMessage("User attached document(s) for analysis.");
                                };
                                input.click();
                            }} className="p-3 text-[#7a8b95] hover:text-[#212c46] transition-colors rounded-full hover:bg-white shrink-0" title="Attach Document">
                                <Icons.Paperclip size={20} />
                            </button>
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(inputText);
                                    }
                                }}
                                placeholder="Message Copilot... (Shift + Enter for new line)"
                                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none py-3 text-[14px] text-[#212c46] placeholder:text-[#7a8b95]"
                                rows={1}
                            />
                            <button 
                                onClick={() => handleSendMessage(inputText)}
                                disabled={!inputText.trim() || isTyping}
                                className={`p-3 rounded-2xl shrink-0 transition-all shadow-sm ${(!inputText.trim() || isTyping) ? 'bg-[#eaeaec] text-[#a0aec0] cursor-not-allowed' : 'bg-[#212c46] text-[#b7a159] hover:bg-[#b7a159] hover:text-[#212c46] active:scale-95 hover:shadow-md'}`}
                            >
                                <Icons.Send size={20} />
                            </button>
                        </div>
                        <p className="mt-3 text-center text-[10px] font-bold text-[#7a8b95] uppercase tracking-widest">AI can make mistakes. Verify critical information.</p>
                    </div>
                </div>
            ) : (
                <div className=" bg-white rounded-3xl shadow-lg border border-[#eaeaec] overflow-hidden flex flex-col justify-center items-center text-center p-8 animate-fadeIn  flex-1 min-h-0">
                    <div className="w-24 h-24 bg-[#f8f9fa] rounded-full flex items-center justify-center border border-[#eaeaec] shadow-inner mb-6 relative">
                        <Icons.SearchCode size={40} className="text-[#b58c4f]" />
                        <div className="absolute -bottom-2 -right-2 bg-[#212c46] text-[#b7a159] text-[9px] font-black px-2 py-1 rounded-md border border-[#b7a159]/30 uppercase tracking-widest">SOON</div>
                    </div>
                    <h3 className="text-xl font-black text-[#212c46] uppercase tracking-widest mb-3 font-mono">Multi-Document Analysis</h3>
                    <p className="text-[#7a8b95] text-[13px] max-w-md leading-relaxed font-medium">
                        Upload multiple standard documents or procedures to let AI cross-reference and find conflicting patterns.
                    </p>
                    <button onClick={() => setActiveMode('chat')} className="mt-8 bg-white border-2 border-[#b58c4f] text-[#b58c4f] px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#b58c4f] hover:text-white transition-all shadow-sm">
                        Return to Chat
                    </button>
                </div>
            )}
            
        </div>
      </div>
    </div>
  );
}
