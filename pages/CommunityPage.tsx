

import React, { useState, useCallback, useRef } from 'react';
import Card from '../components/common/Card';
import { useLocalization } from '../hooks/useLocalization';
import { getRandomProfileImage } from '../lib/initialData';

const CommunityPage: React.FC = () => {
    const { t, language } = useLocalization();
    const [message, setMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const hasSpeechSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const handleListen = useCallback(() => {
        if (!hasSpeechSupport) {
            alert(t('marketplace.noSpeechSupport'));
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setMessage(prev => (prev ? prev.trim() + ' ' : '') + transcript);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
            console.error("Speech recognition error:", e.error);
            setIsListening(false);
        };
        
        recognition.start();
        setIsListening(true);
        recognitionRef.current = recognition;
    }, [isListening, hasSpeechSupport, language, t]);


    const messages = [
        { user: 'Rina S.', text: t('community.messages.msg1'), avatar: getRandomProfileImage('Rina S.'), isCurrentUser: false },
        { user: 'Manish P.', text: t('community.messages.msg2'), avatar: getRandomProfileImage('Manish P.'), isCurrentUser: false },
        { user: 'A. Kumar', text: t('community.messages.msg3'), avatar: getRandomProfileImage('A. Kumar'), isCurrentUser: true },
        { user: 'Sunita V.', text: t('community.messages.msg4'), avatar: getRandomProfileImage('Sunita V.'), isCurrentUser: false },
    ];
  
    return (
        <div className="h-full flex flex-col space-y-8">
             <div>
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">{t('community.main.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('community.main.description')}</p>
            </div>
            <Card className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            <img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full object-cover" />
                            <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 px-1">{msg.user}</p>
                                <div className={`max-w-md p-4 rounded-2xl mt-1 ${msg.isCurrentUser ? 'bg-teal-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 rounded-bl-none'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl dark:bg-slate-800 dark:border-slate-700">
                    <div className="relative flex items-center">
                        <input 
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('community.inputPlaceholder')}
                            className="w-full p-4 pr-24 border-slate-200 bg-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition dark:bg-slate-700 dark:border-slate-600 dark:focus:bg-slate-700"
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                             {hasSpeechSupport && (
                                <button
                                    type="button"
                                    onClick={handleListen}
                                    className={`p-3 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-transparent text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600'}`}
                                    aria-label={isListening ? t('marketplace.stopRecording') : t('marketplace.startRecording')}
                                >
                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7v2h6v-2h-2v-2.07z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                            <button className="p-3 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition-transform transform hover:scale-105">
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CommunityPage;