import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../services/api';
import { Send, Bot, Video, Phone, PhoneOff, Mic, MicOff, VideoOff } from 'lucide-react';
import { aiService } from '../services/aiService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

let socket;

const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(roomId || null);
  const [typing, setTyping] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEnd = useRef(null);
  const typingTimeout = useRef(null);

  // WebRTC State
  const [inCall, setInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Connect socket
    socket = io(window.location.origin);
    socket.emit('register', user._id);

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_typing', ({ senderName }) => {
      setTyping(`${senderName} is typing...`);
    });

    socket.on('user_stop_typing', () => setTyping(''));

    // WebRTC Signaling
    socket.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_accepted', async ({ signalData }) => {
      setInCall(true);
      if (connectionRef.current) {
        await connectionRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
      }
    });

    socket.on('call_rejected', () => {
      toast.error('Call declined');
      cleanupCall();
    });

    socket.on('ice_candidate', async ({ candidate }) => {
      if (connectionRef.current) {
        try {
          await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      }
    });

    socket.on('call_ended', () => {
      toast('Call ended by the other person');
      cleanupCall();
    });

    return () => socket.disconnect();
  }, [user._id]);

  useEffect(() => {
    const endpoint = user.role === 'doctor' ? '/appointments/doctor' : '/appointments/my';
    api.get(endpoint).then(r => {
      const active = r.data.filter(a => ['confirmed', 'completed'].includes(a.status));
      setAppointments(active);
    });
  }, [user.role]);

  useEffect(() => {
    if (selectedRoom) {
      socket.emit('join_room', selectedRoom);
      setMessages([]);
    }
  }, [selectedRoom]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- WebRTC Logic ---
  const setupMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
      return stream;
    } catch (err) {
      toast.error('Failed to access camera/microphone');
      return null;
    }
  };

  const createPeerConnection = (stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { roomId: selectedRoom, candidate: event.candidate });
      }
    };

    return peer;
  };

  const callUser = async () => {
    if (!selectedRoom) return;
    const stream = await setupMediaStream();
    if (!stream) return;

    setInCall(true);
    const peer = createPeerConnection(stream);
    connectionRef.current = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit('call_user', {
      roomId: selectedRoom,
      signalData: offer,
      callerName: user.name,
      callerId: user._id
    });
  };

  const answerCall = async () => {
    const stream = await setupMediaStream();
    if (!stream) return;

    setInCall(true);
    const peer = createPeerConnection(stream);
    connectionRef.current = peer;

    await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.signalData));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit('answer_call', { roomId: selectedRoom, signalData: answer });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socket.emit('reject_call', { roomId: selectedRoom });
    setIncomingCall(null);
  };

  const endCall = () => {
    socket.emit('end_call', { roomId: selectedRoom });
    cleanupCall();
  };

  const cleanupCall = () => {
    setInCall(false);
    setIncomingCall(null);
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // --- Chat Logic ---
  const sendMessage = () => {
    if (!input.trim() || !selectedRoom) return;
    const msg = {
      roomId: selectedRoom,
      message: input,
      senderId: user._id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
    };
    socket.emit('send_message', msg);
    setMessages(prev => [...prev, { ...msg, isSelf: true }]);
    setInput('');
    socket.emit('stop_typing', { roomId: selectedRoom });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (selectedRoom) {
      socket.emit('typing', { roomId: selectedRoom, senderName: user.name });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit('stop_typing', { roomId: selectedRoom });
      }, 1500);
    }
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
    const q = aiInput;
    setAiInput('');
    setAiLoading(true);
    setMessages(prev => [...prev, { senderId: user._id, senderName: 'You (AI query)', message: q, timestamp: new Date().toISOString(), isSelf: true }]);
    try {
      const res = await aiService.chat({
        messages: [{ role: 'user', content: q }],
        systemContext: 'You are a medical assistant helping during a patient-doctor consultation. Provide concise, helpful medical information. Always remind to follow the doctor\'s advice.'
      });
      setMessages(prev => [...prev, {
        senderId: 'ai',
        senderName: '🤖 MedAssist AI',
        message: res.data.reply,
        timestamp: new Date().toISOString(),
        isAI: true,
      }]);
    } catch {
      setMessages(prev => [...prev, { senderId: 'ai', senderName: 'AI', message: 'Sorry, AI is unavailable right now.', timestamp: new Date().toISOString(), isAI: true }]);
    }
    setAiLoading(false);
  };

  const currentApt = appointments.find(a => a._id === selectedRoom);
  const otherPerson = user.role === 'doctor' ? currentApt?.patientId : currentApt?.doctorId;

  return (
    <div className="h-[calc(100vh-57px)] flex relative">
      {/* Incoming Call Modal */}
      {incomingCall && !inCall && (
        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <Video size={24} className="text-primary-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-primary-500 animate-ping opacity-20"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{incomingCall.callerName}</h3>
            <p className="text-slate-500 text-sm mb-6">Incoming video call...</p>
            <div className="flex gap-3 justify-center">
              <button onClick={rejectCall} className="px-6 py-2.5 rounded-full bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors">
                Decline
              </button>
              <button onClick={answerCall} className="px-6 py-2.5 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30">
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Overlay */}
      {inCall && (
        <div className="absolute inset-0 bg-slate-900 z-40 flex flex-col">
          <div className="flex-1 relative flex items-center justify-center bg-black">
            {/* Remote Video */}
            <video ref={userVideo} autoPlay playsInline className="w-full h-full object-contain" />
            
            {/* Local Video */}
            <div className="absolute bottom-6 right-6 w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700/50">
              <video ref={myVideo} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`} />
              {isVideoOff && <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800"><VideoOff size={24} /></div>}
            </div>
          </div>
          
          {/* Controls */}
          <div className="h-20 bg-slate-900/90 border-t border-slate-800 flex items-center justify-center gap-4 px-6 backdrop-blur-sm">
            <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all">
              <PhoneOff size={24} />
            </button>
            <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar: consultation list */}
      <div className="w-64 bg-white border-r border-slate-100 flex flex-col z-10">
        <div className="p-4 border-b border-slate-100">
          <p className="font-semibold text-slate-700 text-sm">Consultations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center p-6">No active consultations</p>
          ) : appointments.map(apt => {
            const person = user.role === 'doctor' ? apt.patientId : apt.doctorId;
            return (
              <button
                key={apt._id}
                onClick={() => setSelectedRoom(apt._id)}
                className={`w-full text-left p-4 border-b border-slate-50 transition-colors ${
                  selectedRoom === apt._id ? 'bg-primary-50 border-l-2 border-l-primary-500' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                    {person?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate">{person?.name}</p>
                    <p className="text-xs text-slate-400">{format(new Date(apt.date), 'dd MMM')}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col z-0">
          {/* Chat header */}
          <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
                {otherPerson?.name?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{otherPerson?.name || 'Consultation'}</p>
                <p className="text-xs text-emerald-500">● Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={callUser} className="btn-outline text-xs py-1.5 flex items-center gap-1 hover:bg-primary-50 hover:border-primary-200 transition-colors">
                <Video size={13} /> Video Call
              </button>
              <button className="btn-outline text-xs py-1.5 flex items-center gap-1 hover:bg-slate-50 transition-colors">
                <Phone size={13} /> Voice
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm pt-12">
                <Bot size={32} className="mx-auto mb-2 text-slate-300" />
                <p>Start your consultation</p>
                <p className="text-xs mt-1">Messages are end-to-end encrypted</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isSelf = msg.senderId === user._id;
              const isAI = msg.isAI || msg.senderId === 'ai';
              return (
                <div key={i} className={`chat-bubble flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isSelf ? '' : 'flex items-end gap-2'}`}>
                    {!isSelf && (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mb-1 ${isAI ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {isAI ? '🤖' : msg.senderName?.[0]}
                      </div>
                    )}
                    <div>
                      {!isSelf && <p className="text-xs text-slate-400 mb-1 ml-1">{msg.senderName}</p>}
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isSelf ? 'bg-primary-600 text-white rounded-br-sm' :
                        isAI ? 'bg-gradient-to-br from-primary-50 to-blue-50 text-slate-800 border border-primary-200 rounded-bl-sm' :
                        'bg-white text-slate-800 rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <p className={`text-xs text-slate-400 mt-1 ${isSelf ? 'text-right' : 'ml-1'}`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && <p className="text-xs text-slate-400 italic">{typing}</p>}
            <div ref={messagesEnd} />
          </div>

          {/* Input area */}
          <div className="bg-white border-t border-slate-100 p-4 space-y-3">
            {/* AI query row */}
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-primary-50 rounded-xl px-3 py-2 flex-1 border border-primary-200">
                <Bot size={14} className="text-primary-600 shrink-0" />
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAI()}
                  placeholder="Ask AI assistant..."
                  className="bg-transparent text-xs flex-1 outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
              <button onClick={askAI} disabled={aiLoading} className="btn-primary px-3 py-2 text-xs">
                {aiLoading ? '...' : 'Ask AI'}
              </button>
            </div>

            {/* Main chat input */}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="input flex-1"
              />
              <button onClick={sendMessage} disabled={!input.trim()} className="btn-primary px-4">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 z-0">
          <div className="text-center">
            <Video size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Select a consultation to start</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
