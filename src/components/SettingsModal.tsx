import React from 'react';
import {
  X,
  Eye,
  Volume2,
  VolumeX,
  Camera,
  Globe,
  Sliders,
  Check,
  ShieldCheck,
  Palette,
  Paintbrush,
} from 'lucide-react';
import { COLORBIND_LABELS, ColorblindPatternOverlay } from './ColorblindPatterns';
import { PlayerColor } from '../types/ludo';
import { LanguageCode, SUPPORTED_LANGUAGES, t } from '../logic/i18n';

export const BACKGROUND_PRESETS = [
  { id: 'slate', name: 'Slate Dark', color: '#0f172a' },
  { id: 'midnight', name: 'Midnight', color: '#1e1b4b' },
  { id: 'emerald', name: 'Emerald', color: '#064e3b' },
  { id: 'purple', name: 'Royal Purple', color: '#581c87' },
  { id: 'crimson', name: 'Crimson', color: '#881337' },
  { id: 'amber', name: 'Sunset Gold', color: '#78350f' },
  { id: 'obsidian', name: 'Obsidian', color: '#18181b' },
  { id: 'teal', name: 'Deep Teal', color: '#134e4a' },
];

interface SettingsModalProps {
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  isColorblindMode: boolean;
  onToggleColorblindMode: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isGestureEnabled: boolean;
  onToggleGesture: () => void;
  bgTheme?: string;
  onChangeBgTheme?: (theme: string) => void;
  customBgColor?: string;
  onChangeCustomBgColor?: (color: string) => void;
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  language,
  onChangeLanguage,
  isColorblindMode,
  onToggleColorblindMode,
  isMuted,
  onToggleMute,
  isGestureEnabled,
  onToggleGesture,
  bgTheme = 'slate',
  onChangeBgTheme,
  customBgColor = '#0f172a',
  onChangeCustomBgColor,
  isAdmin = false,
  onToggleAdmin,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{t('settings', language)}</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Customize language, audio & controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Language / Locale Selector */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{t('language', language)}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                    VOICE & TEXT
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t('language_desc', language)}
                </p>
              </div>
            </div>

            {/* Language Grid Selector */}
            <div className="grid grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onChangeLanguage(lang.code)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                        : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{lang.flag}</span>
                      <div className="truncate">
                        <p className="text-xs font-extrabold truncate leading-none">
                          {lang.nativeName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {lang.name}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colorblind Accessibility Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isColorblindMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{t('colorblind_mode', language)}</span>
                    {isColorblindMode && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('colorblind_desc', language)}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={onToggleColorblindMode}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isColorblindMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isColorblindMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pattern Legend Preview */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                Colorblind Pattern Legend
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
                  const info = COLORBIND_LABELS[color];
                  const colorBgMap: Record<PlayerColor, string> = {
                    red: 'bg-rose-600',
                    green: 'bg-emerald-600',
                    yellow: 'bg-amber-500 text-slate-950',
                    blue: 'bg-blue-600',
                  };

                  return (
                    <div
                      key={color}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 overflow-hidden"
                    >
                      {/* Color Block with Pattern Overlay */}
                      <div
                        className={`w-8 h-8 rounded-lg ${colorBgMap[color]} relative flex items-center justify-center font-black text-xs shadow-inner overflow-hidden border border-white/20`}
                      >
                        <ColorblindPatternOverlay color={color} opacity={0.8} />
                        <span className="relative z-10 drop-shadow">{info.symbol}</span>
                      </div>

                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-200 capitalize truncate">
                          {info.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {info.pattern}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Background Color & Theme Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{t('bg_color', language)}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                    THEMES
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {t('bg_color_desc', language)}
                </p>
              </div>
            </div>

            {/* Theme Preset Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = bgTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onChangeBgTheme?.(preset.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500/50 shadow-md'
                        : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-xs font-bold truncate">{preset.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color Selector */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                  <Paintbrush className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Custom Solid Color</span>
                  <span className="text-[10px] text-slate-400 font-mono">Pick any color code</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => {
                    onChangeCustomBgColor?.(e.target.value);
                    onChangeBgTheme?.('custom');
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                  title="Choose custom background color"
                />
                <button
                  onClick={() => onChangeBgTheme?.('custom')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                    bgTheme === 'custom'
                      ? 'bg-purple-600 text-white border-purple-400 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {bgTheme === 'custom' ? customBgColor.toUpperCase() : 'Custom'}
                </button>
              </div>
            </div>
          </div>

          {/* Sound & Audio Effects Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${!isMuted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}`}>
                {!isMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t('audio_fx', language)}</h3>
                <p className="text-xs text-slate-400">
                  {t('audio_desc', language)}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleMute}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                !isMuted ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  !isMuted ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Camera Gesture Control Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isGestureEnabled ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-slate-800 text-slate-400'}`}>
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t('camera_gestures', language)}</h3>
                <p className="text-xs text-slate-400">
                  {t('camera_desc', language)}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleGesture}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                isGestureEnabled ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  isGestureEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Admin Diagnostics & Shield Access Section */}
          {onToggleAdmin && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isAdmin ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Admin Suite & Shield</span>
                    {isAdmin && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        ADMIN
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Private diagnostic tools & security shield
                  </p>
                </div>
              </div>

              <button
                onClick={onToggleAdmin}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isAdmin ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    isAdmin ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('accessibility_enhanced', language)}</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            {t('done', language)}
          </button>
        </div>
      </div>
    </div>
  );
};
