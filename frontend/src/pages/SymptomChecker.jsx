import { useState } from 'react';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bot, Sparkles, AlertTriangle, Heart, Stethoscope } from 'lucide-react';

const SymptomChecker = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ symptoms: '', age: '', gender: 'male' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const check = async () => {
    if (!form.symptoms.trim()) return toast.error('Please describe your symptoms');
    setLoading(true);
    try {
      const res = await aiService.checkSymptoms(form);
      setResult(res.data.result);
      setHistory(prev => [{ symptoms: form.symptoms, result: res.data.result, time: new Date() }, ...prev.slice(0, 4)]);
    } catch {
      toast.error('AI service unavailable');
    }
    setLoading(false);
  };

  const commonSymptoms = [
    'Fever and headache', 'Chest pain', 'Shortness of breath',
    'Stomach pain', 'Back pain', 'Skin rash', 'Joint pain', 'Dizziness',
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center">
          <Bot size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">AI Symptom Checker</h1>
          <p className="text-slate-500 text-sm">Powered by Claude AI — Not a substitute for medical advice</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-8 flex items-start gap-2 text-sm text-yellow-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>This tool provides general health information only. Always consult a qualified doctor for proper diagnosis and treatment.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Describe Your Symptoms</h2>

            <div className="mb-3">
              <label className="label">Quick select</label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map(s => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, symptoms: s })}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-primary-100 hover:text-primary-700 rounded-full transition-colors text-slate-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={5}
              className="input resize-none"
              placeholder="Describe your symptoms in detail. Include when they started, severity, and any other relevant information..."
              value={form.symptoms}
              onChange={e => setForm({ ...form, symptoms: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="label">Age</label>
                <input type="number" className="input" placeholder="25" min="1" max="120"
                  value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button onClick={check} disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3">
              {loading
                ? <><div className="dot-pulse"><span /><span /><span /></div> Analyzing...</>
                : <><Sparkles size={17} /> Analyze Symptoms</>
              }
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="card bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope size={18} className="text-primary-600" />
                <span className="font-semibold text-primary-800">AI Analysis Result</span>
              </div>
              <div className="prose prose-sm max-w-none">
                {result.split('\n').map((line, i) => (
                  <p key={i} className={`text-sm ${line.startsWith('#') || /^\d\./.test(line) ? 'font-semibold text-slate-800 mt-3' : 'text-slate-600'}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Tips */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-red-500" />
              <span className="font-semibold text-slate-700 text-sm">Health Tips</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">✅ Be specific about when symptoms started</li>
              <li className="flex items-start gap-1.5">✅ Mention any medications you're taking</li>
              <li className="flex items-start gap-1.5">✅ Include fever temperature if known</li>
              <li className="flex items-start gap-1.5">🚨 Call emergency if chest pain or breathing difficulty</li>
            </ul>
          </div>

          {/* Recent */}
          {history.length > 0 && (
            <div className="card">
              <p className="font-semibold text-slate-700 text-sm mb-3">Recent Checks</p>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setForm({ ...form, symptoms: h.symptoms }); setResult(h.result); }}
                    className="w-full text-left p-2 bg-slate-50 rounded-lg text-xs text-slate-600 hover:bg-primary-50 transition-colors">
                    <p className="font-medium truncate">{h.symptoms}</p>
                    <p className="text-slate-400 mt-0.5">{h.time.toLocaleTimeString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
