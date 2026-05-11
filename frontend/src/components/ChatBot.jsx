import { useState } from 'react';
import { aiService } from '../services/aiService';
import { Bot, Send, X, Sparkles } from 'lucide-react';

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m MedAssist AI 👋 Tell me your symptoms and I\'ll help you understand what might be happening and which specialist to see.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const question = input;
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await aiService.chat({
        messages: history,
        systemContext: 'You are MedAssist AI, a helpful medical assistant. Help users understand their symptoms and guide them on which doctor to see. Always be empathetic and remind them to consult a real doctor for proper diagnosis. Keep responses concise and friendly.'
      });

      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\'t connect right now. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-105 flex items-center justify-center z-50"
      >
        <Bot size={24} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 flex flex-col" style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-primary-600 text-white rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <p className="font-semibold text-sm">MedAssist AI</p>
                <p className="text-xs text-primary-200 flex items-center gap-1"><Sparkles size={10} /> AI-Powered Assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-primary-500 rounded-lg p-1 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="dot-pulse"><span /><span /><span /></div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Describe your symptoms..."
                className="input text-xs flex-1 py-2"
              />
              <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-3 py-2">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
