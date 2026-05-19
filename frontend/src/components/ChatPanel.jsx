import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const ChatPanel = ({ paperId }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I have analyzed this paper. What would you like to know?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/papers/chat', {
                message: userMsg,
                paperId: paperId
            });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error answering your question.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="bg-indigo-600 p-4 flex items-center text-white">
                <Bot className="h-6 w-6 mr-2" />
                <h3 className="font-semibold text-lg">AI Assistant</h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary ml-3' : 'bg-indigo-100 mr-3'}`}>
                                {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-indigo-600" />}
                            </div>
                            <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none flex items-center text-gray-500 text-sm ml-11">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> AI is typing...
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this paper..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-3 bg-primary text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
