
import React, { useState, useRef, useEffect } from 'react';
import { tutorService } from './services/geminiService';
import { Message, Role } from './types';
import { 
  CameraIcon, 
  PhotoIcon, 
  PaperAirplaneIcon, 
  ArrowPathIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I'm Aura, your math tutor. I'm here to help you understand calculus and algebra at your own pace. Feel free to upload a photo of a problem you're working on, or just type it out. What shall we explore today?",
      timestamp: Date.now(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text?: string, image?: string) => {
    const content = text || inputText;
    if (!content && !image) return;

    const userMsg: Message = {
      role: 'user',
      content: content || (image ? "I've uploaded a photo of a problem. Can you help me walk through it?" : ""),
      image: image || (selectedImage || undefined),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await tutorService.chat(newMessages, image || (selectedImage || undefined));
      setMessages(prev => [...prev, {
        role: 'model',
        content: response,
        timestamp: Date.now(),
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Oh, it seems I hit a little snag. Could you try rephrasing that or uploading the photo again? I'm ready when you are!",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhyQuestion = () => {
    handleSendMessage("Why did we do that? Can you explain the concept behind this step?");
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-indigo-600 shadow-inner">
            <AcademicCapIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Aura</h1>
            <p className="text-xs text-indigo-100 opacity-90">Socratic Math Tutor</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setMessages([{
              role: 'model',
              content: "Hello! Let's start fresh. What can I help you learn now?",
              timestamp: Date.now(),
            }])}
            className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
            title="Reset Session"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                  <img src={msg.image} alt="Problem" className="max-w-full h-auto" />
                </div>
              )}
              <div className="prose prose-slate max-w-none prose-sm md:prose-base dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                  className="math-container break-words"
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-slate-500 italic flex items-center gap-1">
                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                Aura is thinking...
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Suggestions/Quick Actions */}
      <div className="bg-slate-50 px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-slate-200">
        <button 
          onClick={handleWhyQuestion}
          disabled={isLoading || messages.length < 2}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          <QuestionMarkCircleIcon className="w-4 h-4" />
          Why did we do that?
        </button>
        <button 
          onClick={() => handleSendMessage("Can you give me a hint?")}
          disabled={isLoading || messages.length < 2}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          I'm stuck, need a hint
        </button>
        <button 
          onClick={() => handleSendMessage("Is there another way to solve this?")}
          disabled={isLoading || messages.length < 2}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          Any other way?
        </button>
      </div>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-slate-200 shrink-0">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-indigo-300" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Upload photo"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask a question or explain your process..."
              className="w-full bg-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700"
            />
          </div>

          <button 
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Aura is here to help you learn. Take your time, there are no wrong questions!
        </p>
      </footer>
    </div>
  );
};

export default App;
