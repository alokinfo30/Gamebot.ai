import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, Volume2, VolumeX, RefreshCw, AudioLines } from 'lucide-react';
import { LanguageCode, getSpeechLang, getLocalizedCommentary } from '../logic/i18n';

interface BotCommentaryOverlayProps {
  commentary: string | null;
  botName?: string;
  botColor?: string;
  isMuted?: boolean;
  language?: LanguageCode;
}

export const BotCommentaryOverlay: React.FC<BotCommentaryOverlayProps> = ({
  commentary,
  botName = 'AI Grandmaster Bot',
  botColor = 'green',
  isMuted = false,
  language = 'en',
}) => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ludo_tts_voice') !== 'false';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const localizedText = commentary ? getLocalizedCommentary(commentary, language) : '';

  const toggleVoice = () => {
    setIsVoiceEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('ludo_tts_voice', String(next));
      if (!next && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  };

  const speakCommentary = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();
    if (!isVoiceEnabled) return;

    const targetLang = getSpeechLang(language);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const primaryCode = targetLang.split('-')[0];
    const preferredVoice =
      voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(primaryCode)) ||
      voices.find((v) => v.lang.startsWith(primaryCode)) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled, isMuted, language]);

  // Speak whenever commentary text changes
  useEffect(() => {
    if (localizedText) {
      speakCommentary(localizedText);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [localizedText, speakCommentary]);

  // Ensure voices are loaded
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  if (!commentary) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -10, opacity: 0, scale: 0.95 }}
        className="w-full max-w-md mx-auto my-2 p-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center gap-3 relative overflow-hidden"
      >
        {/* Glowing background accent */}
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md relative">
          <Bot className="w-5 h-5 animate-pulse" />
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <span>{botName}</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>

            {/* Sound Wave Indicator when speaking */}
            {isSpeaking && (
              <div className="flex items-center gap-0.5 text-emerald-400">
                <AudioLines className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase">Speaking</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-100 font-medium italic line-clamp-2 mt-0.5">
            "{localizedText}"
          </p>
        </div>

        {/* Audio / Voice Controls */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={() => speakCommentary(localizedText)}
            title="Replay Voice Commentary"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Disable Commentary Voice' : 'Enable Commentary Voice'}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
              isVoiceEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isVoiceEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
