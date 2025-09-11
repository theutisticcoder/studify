
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { getTutorResponseStream } from '../services/geminiService';
import { SendIcon } from './icons/SendIcon';
import { SparklesIcon } from './icons/SparklesIcon';

// This component is defined outside AITutorView to prevent re-creation on every render.
const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
      <div className={`p-2 rounded-full ${isModel ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-slate-200 dark:bg-slate-700'}`}>
        {isModel ? <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /> : 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-600 dark:text-slate-300"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
        }
      </div>
      <div className={`p-4 rounded-lg max-w-xl ${isModel ? 'bg-white dark:bg-slate-800' : 'bg-primary-600 text-white'}`}>
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
      </div>
    </div>
  );
};

const AITutorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (isLoading || !input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    try {
      const responseStream = await getTutorResponseStream(history, input);
      let newModelMessage: ChatMessage = { role: 'model', content: '' };
      setMessages(prev => [...prev, newModelMessage]);

      for await (const chunk of responseStream) {
        newModelMessage.content += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...newModelMessage };
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'system', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);


  return (
    <div className="container mx-auto max-w-4xl h-[calc(100vh-120px)] flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-lg shadow-md">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold">AI Tutor</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask me anything about your studies!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
         {isLoading && messages[messages.length-1]?.role !== 'model' && (
             <div className="flex items-start gap-3 my-4">
                <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/50">
                    <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="p-4 rounded-lg max-w-xl bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-pulse"></span>
                    </div>
                </div>
            </div>
         )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question here..."
            className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-md bg-primary-600 text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:bg-primary-500 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutorView;
