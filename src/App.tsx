import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Bot,
  Users,
  Globe,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  Swords,
  ChevronRight,
  Share2,
  Sliders,
  Eye,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  LayoutGrid,
  Camera,
  CameraOff,
  LogOut,
} from 'lucide-react';
import { GameHubHomePage, GameKey } from './components/GameHubHomePage';
import { GameDemoGuideModal } from './components/GameDemoGuideModal';
import { CoachTooltip } from './components/CoachTooltip';
import { CameraPermissionModal } from './components/CameraPermissionModal';
import { QuitGameModal } from './components/QuitGameModal';
import { GameVictoryModal } from './components/GameVictoryModal';
import { GameMultiplayerLobbyModal } from './components/GameMultiplayerLobbyModal';
import { GameMultiplayerToolbar } from './components/GameMultiplayerToolbar';
import { GamePlayMode } from './logic/multiplayerRoomManager';
import {
  GameState,
  PlayerColor,
  Player,
  UserProfile,
  GestureType,
} from './types/ludo';
import {
  createInitialGameState,
  getNextTurnColor,
  getValidMovesForPlayer,
  hasValidMoves,
  isPlayerFinished,
  getAbsoluteCircuitStep,
  isSafeAbsoluteStep,
} from './logic/ludoBoard';
import { selectBotMove } from './logic/aiBot';
import { getStoredUserProfile, saveUserProfile, calculateEloChange, getRankTier } from './logic/elo';
import { soundManager } from './logic/soundManager';
import { LanguageCode, detectUserLanguage, t } from './logic/i18n';
import { Board } from './components/Board';
import { TestingSuiteModal } from './components/TestingSuiteModal';
import { Dice } from './components/Dice';
import { GestureControl } from './components/GestureControl';
import { TurnTimer } from './components/TurnTimer';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { OnlineLudo } from './components/OnlineLudo';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BotCommentaryOverlay } from './components/BotCommentaryOverlay';
import { SocialInviteModal } from './components/SocialInviteModal';
import { ReactionsWidget } from './components/ReactionsWidget';
import { ReactionBubble, ActiveReaction } from './components/ReactionBubble';
import { SettingsModal } from './components/SettingsModal';
import { SnakesAndLadders } from './components/SnakesAndLadders';
import { CarromGame } from './components/CarromGame';
import { SnookerGame } from './components/SnookerGame';
import { TableTennisGame } from './components/TableTennisGame';
import { ChessGame } from './components/ChessGame';
import { TeenPattiGame } from './components/TeenPattiGame';
import { RummyGame } from './components/RummyGame';
import { SattePeSattaGame } from './components/SattePeSattaGame';
import { CoatPieceGame } from './components/CoatPieceGame';
import { BhabhiGame } from './components/BhabhiGame';
import { PokerGame } from './components/PokerGame';
import { BlackjackGame } from './components/BlackjackGame';
import { SolitaireGame } from './components/SolitaireGame';
import { DonkeyGame } from './components/DonkeyGame';
import { BluffGame } from './components/BluffGame';
import { SeoKnowledgeGuide } from './components/SeoKnowledgeGuide';
import { SecurityShieldModal } from './components/SecurityShieldModal';

const TURN_TIMEOUT_SECONDS = 15;

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredUserProfile());
  const [language, setLanguage] = useState<LanguageCode>(() => detectUserLanguage());
  const [activeGameSuiteTab, setActiveGameSuiteTab] = useState<
    | 'home'
    | GameKey
  >(() => {
    try {
      const saved = localStorage.getItem('gamebot_active_suite_tab');
      if (saved) return saved as any;
    } catch (e) {}
    return 'home';
  });

  const [lastPlayedGameKey, setLastPlayedGameKey] = useState<GameKey>(() => {
    try {
      const saved = localStorage.getItem('gamebot_last_played_game');
      if (saved) return saved as GameKey;
    } catch (e) {}
    return 'ludo';
  });

  const handleSelectGameSuiteTab = useCallback((tab: 'home' | GameKey) => {
    setActiveGameSuiteTab(tab);
    try {
      localStorage.setItem('gamebot_active_suite_tab', tab);
      if (tab !== 'home') {
        setLastPlayedGameKey(tab as GameKey);
        localStorage.setItem('gamebot_last_played_game', tab);
      }
    } catch (e) {}
  }, []);

  const handleLanguageChange = useCallback((newLang: LanguageCode) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('ludo_preferred_language', newLang);
    } catch (e) {}
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('ludo_active_game_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status === 'playing' && Array.isArray(parsed.players) && parsed.players.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to restore saved game state', e);
    }
    return createInitialGameState('offline_bot', 'red', 'adaptive');
  });
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(
    () => localStorage.getItem('gamebot_camera_permission_granted') === 'true'
  );
  const [isGestureEnabled, setIsGestureEnabled] = useState<boolean>(
    () => localStorage.getItem('ludo_gesture_enabled') === 'true'
  );
  const [showCameraPermissionModal, setShowCameraPermissionModal] = useState<boolean>(false);

  const handleToggleCamera = useCallback(() => {
    if (!isGestureEnabled) {
      if (!hasCameraPermission) {
        setShowCameraPermissionModal(true);
      } else {
        setIsGestureEnabled(true);
        try {
          localStorage.setItem('ludo_gesture_enabled', 'true');
        } catch (e) {}
      }
    } else {
      setIsGestureEnabled(false);
      try {
        localStorage.setItem('ludo_gesture_enabled', 'false');
      } catch (e) {}
    }
  }, [isGestureEnabled, hasCameraPermission]);

  const handleGrantCameraPermission = useCallback(() => {
    setHasCameraPermission(true);
    setIsGestureEnabled(true);
    setShowCameraPermissionModal(false);
    try {
      localStorage.setItem('gamebot_camera_permission_granted', 'true');
      localStorage.setItem('ludo_gesture_enabled', 'true');
    } catch (e) {}
  }, []);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isColorblindMode, setIsColorblindMode] = useState<boolean>(
    () => localStorage.getItem('ludo_colorblind_mode') === 'true'
  );
  const [bgTheme, setBgTheme] = useState<string>(
    () => localStorage.getItem('ludo_bg_theme') || 'slate'
  );
  const [customBgColor, setCustomBgColor] = useState<string>(
    () => localStorage.getItem('ludo_custom_bg_color') || '#0f172a'
  );

  const handleBgThemeChange = useCallback((newTheme: string) => {
    setBgTheme(newTheme);
    try {
      localStorage.setItem('ludo_bg_theme', newTheme);
    } catch (e) {}
  }, []);

  const handleCustomBgColorChange = useCallback((newColor: string) => {
    setCustomBgColor(newColor);
    try {
      localStorage.setItem('ludo_custom_bg_color', newColor);
    } catch (e) {}
  }, []);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSocialInvite, setShowSocialInvite] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showTestingModal, setShowTestingModal] = useState<boolean>(false);
  const [showDemoGuideModal, setShowDemoGuideModal] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCoachEnabled, setIsCoachEnabled] = useState<boolean>(true);
  const [showCoachTooltip, setShowCoachTooltip] = useState<boolean>(true);
  const [coachTurnCounts, setCoachTurnCounts] = useState<Record<string, number>>({
    ludo: 1,
    chess: 1,
    teen_patti: 1,
    rummy: 1,
    satte: 1,
    coat_piece: 1,
    bhabhi: 1,
    poker: 1,
    blackjack: 1,
    solitaire: 1,
    donkey: 1,
    bluff: 1,
    snakes: 1,
    carrom: 1,
    snooker: 1,
    tt: 1,
  });
  const [coachUsesCount, setCoachUsesCount] = useState<Record<string, number>>({});
  const [showQuitModal, setShowQuitModal] = useState<boolean>(false);
  const [gamePlayModes, setGamePlayModes] = useState<Record<string, GamePlayMode>>({});
  const [gameRoomCodes, setGameRoomCodes] = useState<Record<string, string>>({});
  const [showMultiplayerLobbyModal, setShowMultiplayerLobbyModal] = useState<boolean>(false);
  const [globalVictoryInfo, setGlobalVictoryInfo] = useState<{
    isOpen: boolean;
    winnerName: string;
    isHumanWinner: boolean;
    gameTitle: string;
    scoreText?: string;
  }>({
    isOpen: false,
    winnerName: '',
    isHumanWinner: true,
    gameTitle: 'GAMEBOT.AI',
  });

  const handleDeclareWinner = useCallback(
    (winnerName: string, isHumanWinner: boolean, gameTitle: string, scoreText?: string) => {
      setGlobalVictoryInfo({
        isOpen: true,
        winnerName,
        isHumanWinner,
        gameTitle,
        scoreText,
      });

      if (isHumanWinner) {
        const updatedProfile: UserProfile = {
          ...userProfile,
          elo: userProfile.elo + 25,
          matchesPlayed: userProfile.matchesPlayed + 1,
          wins: userProfile.wins + 1,
        };
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
      }
    },
    [userProfile]
  );

  // Auto-show game rules demo guide & mark active game session in progress
  // Also IMMEDIATELY PAUSE background AI commentary TTS and background timers when switching away from game
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}

    if (activeGameSuiteTab === 'home') {
      setShowDemoGuideModal(false);
      setShowCoachTooltip(false);
      return;
    }
    try {
      localStorage.setItem(`gamebot_active_${activeGameSuiteTab}_state`, 'true');
      const isDisabled = localStorage.getItem(`gamebot_auto_guide_${activeGameSuiteTab}`) === 'false';
      if (!isDisabled) {
        setShowDemoGuideModal(true);
      }
      setShowCoachTooltip(true);
    } catch (e) {}
  }, [activeGameSuiteTab]);

  const [urlRoomCode, setUrlRoomCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'offline_bot' | 'local_pass' | 'online_room'>(() => {
    try {
      const savedTab = localStorage.getItem('ludo_active_tab');
      if (savedTab === 'offline_bot' || savedTab === 'local_pass' || savedTab === 'online_room') {
        return savedTab;
      }
    } catch (e) {}
    return 'offline_bot';
  });

  const handleToggleColorblindMode = useCallback(() => {
    setIsColorblindMode((prev) => {
      const next = !prev;
      localStorage.setItem('ludo_colorblind_mode', String(next));
      return next;
    });
  }, []);

  // Handle Quit & Forfeit Match Confirmation
  const handleConfirmQuitGame = useCallback(() => {
    setShowQuitModal(false);
    
    // Update profile for forfeit loss
    const delta = -25;
    const updatedProfile: UserProfile = {
      ...userProfile,
      elo: Math.max(800, userProfile.elo + delta),
      matchesPlayed: userProfile.matchesPlayed + 1,
      losses: userProfile.losses + 1,
    };
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);

    // Clear active game state in localStorage for this game
    try {
      localStorage.removeItem(`gamebot_active_${activeGameSuiteTab}_state`);
      if (activeGameSuiteTab === 'ludo') {
        localStorage.removeItem('ludo_active_game_state');
        setGameState(createInitialGameState(activeTab, 'red', 'adaptive'));
      }
    } catch (e) {}

    // Return to home hub cleanly
    setActiveGameSuiteTab('home');
    soundManager.playCapture();
  }, [userProfile, activeGameSuiteTab, activeTab]);
  const [isOnlineLobbyOpen, setIsOnlineLobbyOpen] = useState<boolean>(() => {
    try {
      const savedLobby = localStorage.getItem('ludo_online_lobby_open');
      if (savedLobby !== null) {
        return savedLobby === 'true';
      }
    } catch (e) {}
    return true;
  });
  const [eloDelta, setEloDelta] = useState<number | null>(null);
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(TURN_TIMEOUT_SECONDS);
  const [activeReactions, setActiveReactions] = useState<ActiveReaction[]>([]);

  // Persist current game state on every state change to support page refresh resume
  useEffect(() => {
    try {
      if (gameState.status === 'playing') {
        localStorage.setItem('ludo_active_game_state', JSON.stringify(gameState));
      } else {
        localStorage.removeItem('ludo_active_game_state');
      }
    } catch (e) {
      console.error('Failed to persist active game state', e);
    }
  }, [gameState]);

  useEffect(() => {
    try {
      localStorage.setItem('ludo_active_tab', activeTab);
      localStorage.setItem('ludo_online_lobby_open', String(isOnlineLobbyOpen));
    } catch (e) {}
  }, [activeTab, isOnlineLobbyOpen]);

  const isProcessingTurn = useRef<boolean>(false);

  const handleSendReaction = useCallback(
    (content: string, type: 'emoji' | 'message', senderColor?: PlayerColor) => {
      const color = senderColor || (activeTab === 'local_pass' ? gameState.currentTurnColor : 'red');
      const player = gameState.players.find((p) => p.color === color);
      const reactionId = `${Date.now()}_${Math.random()}`;
      const newReaction: ActiveReaction = {
        id: reactionId,
        playerColor: color,
        playerName: player?.name || color.toUpperCase(),
        content,
        type,
        timestamp: Date.now(),
      };

      setActiveReactions((prev) => [...prev.filter((r) => r.playerColor !== color), newReaction]);

      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== reactionId));
      }, 3500);
    },
    [activeTab, gameState.currentTurnColor, gameState.players]
  );

  // Parse URL query parameter for direct room invite links (?room=XYZ123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room') || params.get('invite');
    if (room) {
      const code = room.toUpperCase();
      setUrlRoomCode(code);
      setActiveTab('online_room');
      setIsOnlineLobbyOpen(true);
    }
  }, []);

  // Sync profile ELO with server backend
  useEffect(() => {
    fetch('/api/elo/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userProfile }),
    }).catch(() => {});
  }, [userProfile]);

  const currentTurnPlayer = gameState.players.find(
    (p) => p.color === gameState.currentTurnColor
  );

  // Reset turn timer when turn color, turn count, or hasRolled changes
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    setTurnSecondsLeft(TURN_TIMEOUT_SECONDS);
  }, [gameState.currentTurnColor, gameState.turnCount, gameState.hasRolled, gameState.status]);

  // Turn countdown interval
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        if (prev <= 5 && !isMuted) {
          soundManager.playTickSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, isMuted]);

  // Start New Game
  const handleStartNewGame = (
    mode: 'offline_bot' | 'local_pass' | 'online_room',
    humanColor: PlayerColor = 'red'
  ) => {
    setActiveTab(mode);
    setEloDelta(null);
    if (mode === 'online_room') {
      setIsOnlineLobbyOpen(false);
    } else {
      setIsOnlineLobbyOpen(true);
    }
    const newGame = createInitialGameState(mode, humanColor, 'adaptive');
    setGameState(newGame);
    setSelectedTokenId(null);
    setTurnSecondsLeft(TURN_TIMEOUT_SECONDS);
    setCoachTurnCounts((prev) => ({ ...prev, ludo: 1 }));
    setCoachUsesCount((prev) => ({ ...prev, ludo: 0 }));

    // Show guide when a new Ludo game has been started (unless user disabled auto guide)
    try {
      const isDisabled = localStorage.getItem('gamebot_auto_guide_ludo') === 'false';
      if (!isDisabled) {
        setShowDemoGuideModal(true);
      }
      setShowCoachTooltip(true);
    } catch (e) {}
  };

  // Switch sound mute
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Roll Dice Logic
  const handleRollDice = useCallback(() => {
    if (gameState.hasRolled || gameState.status === 'finished') return;
    // Strict Turn Lock: Only human whose turn it is can roll dice
    if (currentTurnPlayer?.type !== 'human') return;

    soundManager.playDiceRoll();
    const dice = Math.floor(Math.random() * 6) + 1;
    let sixes = gameState.diceValue === 6 ? gameState.sixesInARow + 1 : 0;
    if (dice === 6) sixes++;

    // 3 Consecutive 6s Forfeit Rule
    if (sixes >= 3) {
      const nextTurn = getNextTurnColor(
        gameState.currentTurnColor,
        gameState.players,
        gameState.rankings
      );
      setGameState((prev) => ({
        ...prev,
        diceValue: 6,
        hasRolled: false,
        sixesInARow: 0,
        currentTurnColor: nextTurn,
        commentary: `${prev.currentTurnColor.toUpperCase()} rolled 3 sixes in a row! Turn forfeited.`,
        logs: [
          ...prev.logs,
          {
            turnNumber: prev.turnCount,
            color: prev.currentTurnColor,
            playerName: currentTurnPlayer?.name || 'Player',
            dice: 6,
            action: 'three_sixes_forfeit',
            tokenId: -1,
            fromStep: -1,
            toStep: -1,
            timestamp: Date.now(),
          },
        ],
      }));
      return;
    }

    const currentPlayer = gameState.players.find(
      (p) => p.color === gameState.currentTurnColor
    );
    if (!currentPlayer) return;

    const validMoves = getValidMovesForPlayer(currentPlayer, dice);

    if (validMoves.length === 0) {
      // No valid moves -> Advance turn if not 6, or re-roll if 6
      const nextTurn =
        dice === 6
          ? gameState.currentTurnColor
          : getNextTurnColor(
              gameState.currentTurnColor,
              gameState.players,
              gameState.rankings
            );

      setGameState((prev) => ({
        ...prev,
        diceValue: dice,
        hasRolled: false,
        validMoves: [],
        currentTurnColor: nextTurn,
        commentary: `${prev.currentTurnColor.toUpperCase()} rolled a ${dice}. No valid moves available!`,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        diceValue: dice,
        hasRolled: true,
        validMoves,
        sixesInARow: dice === 6 ? sixes : 0,
        commentary: `${prev.currentTurnColor.toUpperCase()} rolled a ${dice}! Choose a token to move.`,
      }));

      // Trigger reaction when rolling 6
      if (dice === 6 && Math.random() < 0.7) {
        handleSendReaction('🔥', 'emoji', gameState.currentTurnColor);
      }

      // Auto-move if only 1 valid move
      if (validMoves.length === 1 && currentPlayer.type === 'human') {
        setTimeout(() => handleExecuteMove(validMoves[0].tokenId, dice), 350);
      }
    }
  }, [gameState, currentTurnPlayer, handleSendReaction]);

  // Execute Token Move
  const handleExecuteMove = useCallback(
    (tokenId: number, dice: number) => {
      // Strict Turn & Roll-Before-Move Lock: Must be human turn and dice must be rolled
      if (currentTurnPlayer?.type === 'human' && !gameState.hasRolled) return;

      const playerIndex = gameState.players.findIndex(
        (p) => p.color === gameState.currentTurnColor
      );
      if (playerIndex === -1) return;

      const player = gameState.players[playerIndex];
      const tokenIndex = player.tokens.findIndex((t) => t.id === tokenId);
      if (tokenIndex === -1) return;

      const token = player.tokens[tokenIndex];
      const currentStep = token.step;
      const targetStep = currentStep === -1 ? 0 : currentStep + dice;

      soundManager.playMoveStep();

      // Check Captures on Circuit
      let capturedColor: PlayerColor | undefined = undefined;
      let isExtraRollAwarded = dice === 6;

      const updatedPlayers = gameState.players.map((p) => {
        if (p.color === player.color) {
          const updatedTokens = p.tokens.map((t) => {
            if (t.id === tokenId) {
              const isHome = targetStep >= 58;
              if (isHome && !t.isHome) {
                soundManager.playHomeEntry();
                isExtraRollAwarded = true; // Extra turn for reaching home
                handleSendReaction('Home! 🏆', 'message', player.color);
              }
              return {
                ...t,
                step: targetStep,
                isHome,
                isBase: targetStep === -1,
              };
            }
            return t;
          });
          return { ...p, tokens: updatedTokens };
        } else {
          // Check if target step captures opponent on circuit
          const targetAbsStep = getAbsoluteCircuitStep(player.color, targetStep);
          if (targetAbsStep !== -1 && !isSafeAbsoluteStep(targetAbsStep)) {
            const updatedOpponentTokens = p.tokens.map((oppToken) => {
              const oppAbsStep = getAbsoluteCircuitStep(p.color, oppToken.step);
              if (oppAbsStep === targetAbsStep) {
                capturedColor = p.color;
                isExtraRollAwarded = true; // Extra turn for capturing!
                soundManager.playCapture();
                handleSendReaction('Gotcha! 💥', 'message', player.color);
                return { ...oppToken, step: -1, isBase: true, isHome: false };
              }
              return oppToken;
            });
            return { ...p, tokens: updatedOpponentTokens };
          }
        }
        return p;
      });

      // Check if Player finished all 4 tokens
      const updatedPlayer = updatedPlayers.find((p) => p.color === player.color)!;
      const newlyFinished = isPlayerFinished(updatedPlayer);
      let newRankings = [...gameState.rankings];

      if (newlyFinished && !newRankings.includes(player.color)) {
        newRankings.push(player.color);
      }

      // Check Game Over (Winner decided)
      const isGameOver = newRankings.length >= 3 || (newRankings.length === 1 && gameState.players.length === 2);
      if (isGameOver) {
        const winnerP = updatedPlayers.find((p) => p.color === newRankings[0]);
        const winnerName = winnerP ? winnerP.name : newRankings[0].toUpperCase();
        const isHuman = winnerP ? winnerP.type === 'human' : false;
        handleDeclareWinner(winnerName, isHuman, 'LUDO ARENA', `1st Place Champion: ${winnerName}`);
      }

      let nextTurnColor = gameState.currentTurnColor;
      if (!isExtraRollAwarded && !isGameOver) {
        nextTurnColor = getNextTurnColor(
          gameState.currentTurnColor,
          updatedPlayers,
          newRankings
        );
      }

      const actionType =
        currentStep === -1
          ? 'exit_base'
          : targetStep >= 58
          ? 'enter_home'
          : capturedColor
          ? 'capture'
          : 'move';

      setGameState((prev) => {
        const nextState: GameState = {
          ...prev,
          players: updatedPlayers,
          hasRolled: false, // Reset roll state so player can roll their extra turn or next player turn
          diceValue: null, // Reset dice value for new roll
          validMoves: [],
          rankings: newRankings,
          currentTurnColor: nextTurnColor,
          winnerColor: isGameOver ? newRankings[0] : null,
          status: isGameOver ? 'finished' : 'playing',
          turnCount: prev.turnCount + 1,
          commentary: capturedColor
            ? `${player.color.toUpperCase()} captured ${capturedColor.toUpperCase()}! Extra turn granted!`
            : targetStep >= 58
            ? `${player.color.toUpperCase()} reached Home! Extra turn granted!`
            : isExtraRollAwarded
            ? `${player.color.toUpperCase()} rolled a 6! Extra turn granted!`
            : `${player.color.toUpperCase()} moved Token ${tokenId + 1}.`,
          logs: [
            ...prev.logs,
            {
              turnNumber: prev.turnCount,
              color: player.color,
              playerName: player.name,
              dice,
              action: actionType,
              tokenId,
              fromStep: currentStep,
              toStep: targetStep,
              capturedColor,
              timestamp: Date.now(),
            },
          ],
        };

        if (isGameOver) {
          soundManager.playVictory();
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

          // Update ELO rating for Human Player
          const humanRank = newRankings.indexOf('red') + 1 || 4;
          const opponentElos = updatedPlayers
            .filter((p) => p.color !== 'red')
            .map((p) => p.elo);

          const delta = calculateEloChange(userProfile.elo, opponentElos, humanRank);
          setEloDelta(delta);

          const newElo = Math.max(800, userProfile.elo + delta);
          const updatedProfile: UserProfile = {
            ...userProfile,
            elo: newElo,
            matchesPlayed: userProfile.matchesPlayed + 1,
            wins: humanRank === 1 ? userProfile.wins + 1 : userProfile.wins,
            losses: humanRank > 1 ? userProfile.losses + 1 : userProfile.losses,
          };

          setUserProfile(updatedProfile);
          saveUserProfile(updatedProfile);
          setTimeout(() => setShowAnalysis(true), 1200);
        }

        return nextState;
      });
    },
    [gameState, currentTurnPlayer, userProfile]
  );

  // AI Bot Automated Turn Effect (Two-Step Roll & Move Pipeline)
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    if (!currentTurnPlayer || currentTurnPlayer.type !== 'bot') return;

    let botTimer: NodeJS.Timeout;

    if (!gameState.hasRolled) {
      // Step 1: Bot Automatically Rolls Dice
      botTimer = setTimeout(() => {
        const dice = Math.floor(Math.random() * 6) + 1;
        soundManager.playDiceRoll();

        let sixes = gameState.diceValue === 6 ? gameState.sixesInARow + 1 : 0;
        if (dice === 6) sixes++;

        // 3 Consecutive 6s Forfeit Rule
        if (sixes >= 3) {
          const nextTurn = getNextTurnColor(
            gameState.currentTurnColor,
            gameState.players,
            gameState.rankings
          );
          setGameState((prev) => ({
            ...prev,
            diceValue: 6,
            hasRolled: false,
            sixesInARow: 0,
            currentTurnColor: nextTurn,
            commentary: `${currentTurnPlayer.name} rolled 3 sixes in a row! Turn forfeited.`,
            logs: [
              ...prev.logs,
              {
                turnNumber: prev.turnCount,
                color: prev.currentTurnColor,
                playerName: currentTurnPlayer.name,
                dice: 6,
                action: 'three_sixes_forfeit',
                tokenId: -1,
                fromStep: -1,
                toStep: -1,
                timestamp: Date.now(),
              },
            ],
          }));
          return;
        }

        const validMoves = getValidMovesForPlayer(currentTurnPlayer, dice);

        if (validMoves.length === 0) {
          const nextTurn =
            dice === 6
              ? gameState.currentTurnColor
              : getNextTurnColor(
                  gameState.currentTurnColor,
                  gameState.players,
                  gameState.rankings
                );

          setGameState((prev) => ({
            ...prev,
            diceValue: dice,
            hasRolled: false,
            validMoves: [],
            sixesInARow: dice === 6 ? sixes : 0,
            currentTurnColor: nextTurn,
            commentary: `${currentTurnPlayer.name} rolled a ${dice}. No valid moves.`,
          }));
        } else {
          setGameState((prev) => ({
            ...prev,
            diceValue: dice,
            hasRolled: true,
            validMoves,
            sixesInARow: dice === 6 ? sixes : 0,
            commentary: `${currentTurnPlayer.name} rolled a ${dice}! Selecting best tactical move...`,
          }));

          // Contextual reaction trigger for bot rolling 6
          if (dice === 6 && Math.random() < 0.5) {
            handleSendReaction('🔥', 'emoji', currentTurnPlayer.color);
          }
        }
      }, 600);
    } else if (gameState.hasRolled && gameState.diceValue !== null) {
      // Step 2: Bot Chooses & Executes Best Move on Board
      botTimer = setTimeout(() => {
        const botChoice = selectBotMove(currentTurnPlayer, gameState, gameState.diceValue!);
        if (botChoice) {
          handleExecuteMove(botChoice.tokenId, gameState.diceValue!);
        } else if (gameState.validMoves.length > 0) {
          handleExecuteMove(gameState.validMoves[0].tokenId, gameState.diceValue!);
        } else {
          const nextTurn = getNextTurnColor(
            gameState.currentTurnColor,
            gameState.players,
            gameState.rankings
          );
          setGameState((prev) => ({
            ...prev,
            hasRolled: false,
            validMoves: [],
            currentTurnColor: nextTurn,
            commentary: `${currentTurnPlayer.name} turn passed.`,
          }));
        }
      }, 650);
    }

    return () => clearTimeout(botTimer);
  }, [gameState, currentTurnPlayer, handleExecuteMove, handleSendReaction]);

  // Turn Timeout Auto-Action
  useEffect(() => {
    if (turnSecondsLeft === 0 && gameState.status === 'playing') {
      const currentTurn = gameState.players.find((p) => p.color === gameState.currentTurnColor);
      if (!gameState.hasRolled) {
        handleRollDice();
      } else {
        if (gameState.validMoves.length > 0) {
          handleExecuteMove(gameState.validMoves[0].tokenId, gameState.diceValue || 1);
        } else {
          const nextTurn = getNextTurnColor(
            gameState.currentTurnColor,
            gameState.players,
            gameState.rankings
          );
          setGameState((prev) => ({
            ...prev,
            hasRolled: false,
            validMoves: [],
            currentTurnColor: nextTurn,
            commentary: `Time expired for ${currentTurn?.name || 'Player'}! Turn passed.`,
          }));
        }
      }
    }
  }, [turnSecondsLeft, gameState, handleRollDice, handleExecuteMove]);

  // Handle Gesture Trigger Actions
  const handleGestureAction = useCallback((gesture: GestureType) => {
    if (gameState.status !== 'playing') return;
    const currentTurn = gameState.players.find((p) => p.color === gameState.currentTurnColor);
    if (currentTurn?.type !== 'human') return;

    if (gesture === 'open_hand') {
      if (!gameState.hasRolled) {
        handleRollDice();
      } else if (gameState.validMoves.length > 0) {
        handleExecuteMove(gameState.validMoves[0].tokenId, gameState.diceValue || 1);
      }
    } else if (gameState.hasRolled && gameState.diceValue) {
      let targetTokenId = -1;
      if (gesture === 'one_finger') targetTokenId = 0;
      if (gesture === 'two_fingers') targetTokenId = 1;
      if (gesture === 'three_fingers') targetTokenId = 2;
      if (gesture === 'four_fingers') targetTokenId = 3;

      if (targetTokenId !== -1) {
        const isValid = gameState.validMoves.some((m) => m.tokenId === targetTokenId);
        if (isValid) {
          handleExecuteMove(targetTokenId, gameState.diceValue);
        } else if (gameState.validMoves.length > 0) {
          // Fallback to first moveable token
          handleExecuteMove(gameState.validMoves[0].tokenId, gameState.diceValue);
        }
      }
    }
  }, [gameState, handleRollDice, handleExecuteMove]);

  const userTier = getRankTier(userProfile.elo);

  const BG_THEME_CLASSES: Record<string, string> = {
    slate: 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900',
    midnight: 'bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950',
    emerald: 'bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950',
    purple: 'bg-gradient-to-br from-purple-950 via-slate-950 to-violet-950',
    crimson: 'bg-gradient-to-br from-rose-950 via-slate-950 to-red-950',
    obsidian: 'bg-gradient-to-br from-zinc-950 via-black to-neutral-900',
    amber: 'bg-gradient-to-br from-amber-950 via-slate-950 to-orange-950',
    teal: 'bg-gradient-to-br from-teal-950 via-slate-950 to-cyan-950',
  };

  useEffect(() => {
    try {
      const PRESET_BODY_COLORS: Record<string, string> = {
        slate: '#0f172a',
        midnight: '#0b1329',
        emerald: '#022c22',
        purple: '#2e1065',
        crimson: '#4c0519',
        amber: '#451a03',
        obsidian: '#09090b',
        teal: '#042f2e',
      };

      const targetColor = bgTheme === 'custom' ? customBgColor : (PRESET_BODY_COLORS[bgTheme] || '#0f172a');

      // Clear cached Tailwind background classes on body & documentElement that interfere
      document.body.className = document.body.className.replace(/\bbg-\S+/g, '').trim();
      document.documentElement.className = document.documentElement.className.replace(/\bbg-\S+/g, '').trim();

      // Force immediate DOM update on body & documentElement style
      document.body.style.backgroundColor = targetColor;
      document.body.style.background = targetColor;
      document.documentElement.style.backgroundColor = targetColor;
      document.documentElement.style.background = targetColor;
      document.body.setAttribute('data-bg-theme', bgTheme);
    } catch (e) {
      console.error('Failed to sync theme to DOM body', e);
    }
  }, [bgTheme, customBgColor]);

  const currentBgStyle = bgTheme === 'custom' ? { backgroundColor: customBgColor } : undefined;
  const currentBgClass = bgTheme === 'custom' ? '' : (BG_THEME_CLASSES[bgTheme] || BG_THEME_CLASSES.slate);

  return (
    <div
      className={`min-h-screen ${currentBgClass} text-slate-100 flex flex-col justify-between font-sans select-none overflow-x-hidden transition-colors duration-300`}
      style={currentBgStyle}
    >
      {/* Top Professional Polish Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-4 sm:px-6 flex items-center justify-between w-full z-10">
        <div className="flex items-center gap-3">
          <div
            onClick={() => handleSelectGameSuiteTab('home')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-blue-600/30">
              G
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-0.5">
              <span>GAMEBOT</span>
              <span className="text-blue-500 font-extrabold">.AI</span>
            </h1>
            <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-widest border border-slate-700/50">
              v2.4 Pro
            </span>
          </div>

          {activeGameSuiteTab !== 'home' && (
            <button
              onClick={() => handleSelectGameSuiteTab('home')}
              className="ml-2 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-300" />
              <span>All Games</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin-only Test & Diagnostic Suite Button */}
          {isAdmin && (
            <button
              onClick={() => setShowTestingModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Test & Diagnostic Suite</span>
              <span className="sm:hidden">Tests</span>
            </button>
          )}

          <button
            onClick={() => setShowSocialInvite(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-pink-600/20 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Invite FB & IG Friends</span>
            <span className="sm:hidden">Invite</span>
          </button>

          <div className="hidden md:block h-8 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeaderboard(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-2"
              title="Leaderboard & Rankings"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline-block text-xs font-bold">Rankings</span>
            </button>

            {/* Top Navbar Camera Toggle & Listening Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={handleToggleCamera}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isGestureEnabled
                    ? 'bg-blue-600/30 border-blue-500/50 text-blue-200 hover:bg-blue-600/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isGestureEnabled ? 'Disable Camera Gestures' : 'Enable Camera Gestures'}
              >
                {isGestureEnabled ? (
                  <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <CameraOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden sm:inline-block">Camera</span>
              </button>

              {/* Listening Status Indicator */}
              {isGestureEnabled ? (
                <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-extrabold flex items-center gap-1.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LISTENING</span>
                </span>
              ) : (
                <span className="px-2 py-1 rounded-md bg-slate-950 text-slate-500 border border-slate-800/80 text-[10px] font-mono font-bold hidden sm:inline-block">
                  OFF
                </span>
              )}
            </div>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Admin-Only Security Shield Badge */}
            {isAdmin && (
              <button
                onClick={() => setShowSecurityModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Security Architecture Matrix"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline-block font-mono">Security Shield</span>
              </button>
            )}

            {/* Language Quick Switcher */}
            <button
              onClick={() => setShowSettings(true)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={t('language', language)}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="uppercase font-mono">{language}</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                isColorblindMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={t('settings', language)}
            >
              <Sliders className="w-4 h-4" />
              {isColorblindMode && (
                <span className="hidden sm:inline-block text-[10px] font-bold font-mono uppercase tracking-wider">
                  Colorblind Mode
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Game Sub-Header (Only displayed when playing an active game) */}
      {activeGameSuiteTab !== 'home' && (
        <div className="w-full bg-slate-900/70 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto z-10">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
            <button
              onClick={() => handleSelectGameSuiteTab('home')}
              className="text-slate-400 hover:text-white font-mono flex items-center gap-1 transition cursor-pointer"
            >
              ← Back to Games
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-mono">Active Game:</span>
            <span className="uppercase text-white font-black tracking-wide">
              {activeGameSuiteTab.replace('_', ' ')}
            </span>

            {isCoachEnabled && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) > 0
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                <Lightbulb className="w-3 h-3 text-amber-300" />
                <span>
                  {Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) > 0
                    ? `AI Coach (${Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0))}/3 Uses Left)`
                    : `AI Coach Limit Reached (3/3 used)`}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) > 0) {
                  setIsCoachEnabled(true);
                  setShowCoachTooltip(true);
                }
              }}
              disabled={Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) === 0}
              className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition ${
                Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) === 0
                  ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                  : isCoachEnabled
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 cursor-pointer'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) === 0
                  ? 'Coach Limit Reached (3/3)'
                  : isCoachEnabled
                  ? `AI Coach On (${Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0))}/3 Left)`
                  : `Enable AI Coach (${Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0))}/3 Left)`}
              </span>
            </button>

            <button
              onClick={() => setShowDemoGuideModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-200" />
              <span>📖 Rules Guide</span>
            </button>

            <button
              onClick={() => setShowQuitModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
              title="Quit & Forfeit Current Match"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Quit Match</span>
            </button>
          </div>
        </div>
      )}

      {/* Universal Multiplayer Mode Toolbar (Online Room vs Pass & Play vs Single Player) */}
      {activeGameSuiteTab !== 'home' && (
        <div className="w-full max-w-7xl mx-auto pt-3 px-4">
          <GameMultiplayerToolbar
            playMode={gamePlayModes[activeGameSuiteTab] || 'vs_ai'}
            roomCode={gameRoomCodes[activeGameSuiteTab]}
            onOpenLobby={() => setShowMultiplayerLobbyModal(true)}
          />
        </div>
      )}

      {/* Render AI Coach Tooltip (Max 3 Uses Per Match) */}
      {isCoachEnabled && showCoachTooltip && activeGameSuiteTab !== 'home' && Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0)) > 0 && (
        <div className="w-full max-w-7xl mx-auto pt-2 px-4">
          <CoachTooltip
            gameKey={activeGameSuiteTab}
            turnNumber={coachTurnCounts[activeGameSuiteTab] || 1}
            usesRemaining={Math.max(0, 3 - (coachUsesCount[activeGameSuiteTab] || 0))}
            isHumanTurn={true}
            language={language}
            onDismiss={() => {
              setShowCoachTooltip(false);
              setCoachUsesCount((prev) => ({
                ...prev,
                [activeGameSuiteTab]: (prev[activeGameSuiteTab] || 0) + 1,
              }));
              setCoachTurnCounts((prev) => ({
                ...prev,
                [activeGameSuiteTab]: (prev[activeGameSuiteTab] || 1) + 1,
              }));
            }}
            onHighlightMove={() => {
              soundManager.playMoveStep();
            }}
          />
        </div>
      )}

      {/* Main Game Container */}
      {activeGameSuiteTab === 'home' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4">
          <GameHubHomePage
            language={language}
            onSelectGame={(gKey) => handleSelectGameSuiteTab(gKey)}
            onOpenGuide={(gKey) => {
              handleSelectGameSuiteTab(gKey);
              setShowDemoGuideModal(true);
            }}
            activeGameKey={lastPlayedGameKey}
            userProfile={userProfile}
            onProfileUpdated={(updated) => setUserProfile(updated)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'chess' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <ChessGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['chess'] || 'vs_ai'}
            roomCode={gameRoomCodes['chess']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'CHESS', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'teen_patti' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <TeenPattiGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['teen_patti'] || 'vs_ai'}
            roomCode={gameRoomCodes['teen_patti']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'TEEN PATTI', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'rummy' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <RummyGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['rummy'] || 'vs_ai'}
            roomCode={gameRoomCodes['rummy']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'RUMMY', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'satte' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <SattePeSattaGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['satte'] || 'vs_ai'}
            roomCode={gameRoomCodes['satte']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'SATTE PE SATTA', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'coat_piece' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <CoatPieceGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['coat_piece'] || 'vs_ai'}
            roomCode={gameRoomCodes['coat_piece']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'COAT PIECE', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'bhabhi' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <BhabhiGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['bhabhi'] || 'vs_ai'}
            roomCode={gameRoomCodes['bhabhi']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'BHABHI ARENA', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'poker' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <PokerGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['poker'] || 'vs_ai'}
            roomCode={gameRoomCodes['poker']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'TEXAS HOLDEM POKER', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'blackjack' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <BlackjackGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['blackjack'] || 'vs_ai'}
            roomCode={gameRoomCodes['blackjack']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'CASINO BLACKJACK', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'solitaire' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <SolitaireGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['solitaire'] || 'vs_ai'}
            roomCode={gameRoomCodes['solitaire']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'SOLITAIRE', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'donkey' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <DonkeyGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['donkey'] || 'vs_ai'}
            roomCode={gameRoomCodes['donkey']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'REFLEX DONKEY', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'bluff' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <BluffGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['bluff'] || 'vs_ai'}
            roomCode={gameRoomCodes['bluff']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'BLUFF ARENA', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'snakes' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <SnakesAndLadders
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['snakes'] || 'vs_ai'}
            roomCode={gameRoomCodes['snakes']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'SNAKES & LADDERS', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'carrom' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <CarromGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['carrom'] || 'vs_ai'}
            roomCode={gameRoomCodes['carrom']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'CARROM ARENA', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'snooker' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <SnookerGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['snooker'] || 'vs_ai'}
            roomCode={gameRoomCodes['snooker']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'SNOOKER & POOL', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'tt' && (
        <section className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
          <TableTennisGame
            language={language}
            isMuted={isMuted}
            isColorblindMode={isColorblindMode}
            playMode={gamePlayModes['tt'] || 'vs_ai'}
            roomCode={gameRoomCodes['tt']}
            onDeclareWinner={(name, isHuman, title, text) => handleDeclareWinner(name, isHuman, title || 'TABLE TENNIS', text)}
          />
        </section>
      )}

      {activeGameSuiteTab === 'ludo' && (
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row p-3 sm:p-6 gap-6 items-start justify-center">
        {/* Left Side Game Session & Players Panel */}
        <aside className="w-full lg:w-72 flex flex-col gap-4">
          {/* Mode Switcher Buttons */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-1">
            <button
              onClick={() => handleStartNewGame('offline_bot')}
              className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'offline_bot'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>VS AI</span>
            </button>

            <button
              onClick={() => handleStartNewGame('local_pass')}
              className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'local_pass'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pass&Play</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('online_room');
                setIsOnlineLobbyOpen(true);
              }}
              className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                activeTab === 'online_room'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Online</span>
            </button>
          </div>

          {activeTab === 'online_room' && isOnlineLobbyOpen ? (
            <OnlineLudo
              userProfile={userProfile}
              initialRoomCode={urlRoomCode}
              onStartOnlineMatch={(code, color) => {
                handleStartNewGame('online_room', color);
              }}
              onBack={() => setActiveTab('offline_bot')}
            />
          ) : (
            <>
              {/* Game Session Info Card */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xl">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Game Session
                </h2>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Mode</span>
                    <span className="font-semibold text-blue-400">
                      {activeTab === 'offline_bot'
                        ? 'VS AI Adaptive'
                        : activeTab === 'local_pass'
                        ? 'Local Pass & Play'
                        : 'Ranked Online'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">World Ranking</span>
                    <span className="font-mono text-blue-400 font-extrabold">#4,102 (Top 0.8%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Stakes</span>
                    <span className="font-mono text-slate-200 font-bold">500 ELO Pt</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Turn Limit</span>
                    <span className="font-mono text-amber-400 font-bold">15s / Turn</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Difficulty</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-400 text-[10px] font-extrabold uppercase">
                      ADAPTIVE
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* Center Board View with Integrated Controls */}
        {!(activeTab === 'online_room' && isOnlineLobbyOpen) && (
          <section className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center w-full">
              <Board
                gameState={gameState}
                userProfile={userProfile}
                onTokenClick={(tokenId) => {
                  if (!gameState.hasRolled) {
                    if (currentTurnPlayer?.type === 'human') {
                      handleRollDice();
                    }
                  } else if (gameState.diceValue) {
                    handleExecuteMove(tokenId, gameState.diceValue);
                  }
                }}
                onRollDice={handleRollDice}
                selectedTokenId={selectedTokenId}
                interactiveColor={gameState.currentTurnColor}
                activeReactions={activeReactions}
                isColorblindMode={isColorblindMode}
                turnSecondsLeft={turnSecondsLeft}
                maxTurnSeconds={TURN_TIMEOUT_SECONDS}
                currentTurnPlayerName={currentTurnPlayer?.name}
                isCurrentTurnHuman={currentTurnPlayer?.type === 'human'}
                isGestureEnabled={isGestureEnabled}
                onToggleGesture={setIsGestureEnabled}
                onGestureAction={handleGestureAction}
                onSendReaction={handleSendReaction}
              />

              {/* Quick AI Strategy Action */}
              <div className="mt-4 flex items-center justify-center gap-3 w-full max-w-md">
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer border border-blue-400/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Get Live AI Tactical Strategy</span>
                </button>
              </div>

              {/* ELO Delta Banner when Game Finishes */}
              {gameState.status === 'finished' && eloDelta !== null && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-500/40 text-center animate-bounce shadow-2xl">
                  <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>Match Completed!</span>
                  </h3>
                  <p className="text-xs text-blue-300 font-bold mt-1">
                    ELO Rating Change: {eloDelta >= 0 ? `+${eloDelta}` : eloDelta}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Right Side AI Insights Panel */}
        {activeTab !== 'online_room' && (
          <aside className="w-full lg:w-72 flex flex-col gap-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                <span>AI Personalized Insights</span>
              </h2>

              <div className="space-y-3 text-[11px] leading-relaxed">
                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <p className="text-blue-400 font-bold mb-1">Adaptive Playstyle Analysis</p>
                  <p className="text-slate-400">
                    Bots adapt dynamically based on your movement safety index and base exit velocity.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <p className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Win Probability</span>
                    <span className="text-blue-400 font-mono font-bold">68%</span>
                  </p>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[68%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                <BotCommentaryOverlay
                  commentary={gameState.commentary}
                  botName={currentTurnPlayer?.name}
                  botColor={gameState.currentTurnColor}
                  isMuted={isMuted}
                  language={language}
                />
              </div>
            </div>

            {/* Hand Gesture Active Box */}
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center text-center shadow-lg">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-2 text-white shadow-md shadow-blue-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white mb-1">Camera Gestures Active</p>
              <p className="text-[10px] text-slate-400">
                Open palm to roll. Raise 1-4 fingers to select and move token.
              </p>
            </div>
          </aside>
        )}
      </main>
      )}

      {/* Professional Polish Footer */}
      <footer className="h-12 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-500 z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Online Multiplayer:</span> 12,401 Players
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            AI Model: Gemini-Pro-Ludo
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 font-medium">
          <button onClick={() => setShowAnalysis(true)} className="hover:text-white transition cursor-pointer">
            Rules
          </button>
          <button onClick={() => setShowAnalysis(true)} className="hover:text-white transition cursor-pointer">
            Analysis History
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="hover:text-white transition cursor-pointer">
            Global Leaderboard
          </button>
        </div>
      </footer>

      {/* Modals */}
      {showAnalysis && (
        <AIAnalysisModal
          gameState={gameState}
          userProfile={userProfile}
          onClose={() => setShowAnalysis(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          userProfile={userProfile}
          currentGame={activeGameSuiteTab}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showSocialInvite && (
        <SocialInviteModal
          roomCode={urlRoomCode || 'LUDO88'}
          userProfile={userProfile}
          onClose={() => setShowSocialInvite(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          language={language}
          onChangeLanguage={handleLanguageChange}
          isColorblindMode={isColorblindMode}
          onToggleColorblindMode={handleToggleColorblindMode}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isGestureEnabled={isGestureEnabled}
          onToggleGesture={handleToggleCamera}
          bgTheme={bgTheme}
          onChangeBgTheme={handleBgThemeChange}
          customBgColor={customBgColor}
          onChangeCustomBgColor={handleCustomBgColorChange}
          isAdmin={isAdmin}
          onToggleAdmin={() => setIsAdmin((prev) => !prev)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Security Architecture Verification Modal */}
      <SecurityShieldModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />

      {/* Interactive Testing & Diagnostic Center */}
      <TestingSuiteModal
        isOpen={showTestingModal}
        onClose={() => setShowTestingModal(false)}
      />

      {/* Interactive Game Demo & Rules Guide Modal */}
      <GameDemoGuideModal
        isOpen={showDemoGuideModal}
        gameKey={activeGameSuiteTab === 'home' ? lastPlayedGameKey : (activeGameSuiteTab as GameKey)}
        language={language}
        onClose={() => setShowDemoGuideModal(false)}
      />

      {/* Camera Permission Explanation Modal */}
      <CameraPermissionModal
        isOpen={showCameraPermissionModal}
        onGrant={handleGrantCameraPermission}
        onClose={() => setShowCameraPermissionModal(false)}
        language={language}
      />

      {/* Quit Match Confirmation Modal */}
      <QuitGameModal
        isOpen={showQuitModal}
        gameTitle={activeGameSuiteTab.replace('_', ' ').toUpperCase()}
        isOnline={activeTab === 'online_room'}
        language={language}
        onConfirmQuit={handleConfirmQuitGame}
        onCancel={() => setShowQuitModal(false)}
      />

      {/* Universal Winner Declaration & Confetti Celebration Modal */}
      <GameVictoryModal
        isOpen={globalVictoryInfo.isOpen}
        winnerName={globalVictoryInfo.winnerName}
        isHumanWinner={globalVictoryInfo.isHumanWinner}
        gameTitle={globalVictoryInfo.gameTitle}
        scoreText={globalVictoryInfo.scoreText}
        onPlayAgain={() => {
          setGlobalVictoryInfo((prev) => ({ ...prev, isOpen: false }));
          if (activeGameSuiteTab === 'ludo') {
            setGameState(createInitialGameState('offline_bot', 'red', 'adaptive'));
          }
        }}
        onBackToHub={() => {
          setGlobalVictoryInfo((prev) => ({ ...prev, isOpen: false }));
          setActiveGameSuiteTab('home');
        }}
      />

      {/* Universal Multiplayer Lobby & Online Room Modal */}
      <GameMultiplayerLobbyModal
        isOpen={showMultiplayerLobbyModal}
        gameKey={activeGameSuiteTab}
        gameTitle={activeGameSuiteTab.replace('_', ' ').toUpperCase()}
        userProfile={userProfile}
        onClose={() => setShowMultiplayerLobbyModal(false)}
        onStartMatch={(mode, roomCode) => {
          setGamePlayModes((prev) => ({ ...prev, [activeGameSuiteTab]: mode }));
          if (roomCode) {
            setGameRoomCodes((prev) => ({ ...prev, [activeGameSuiteTab]: roomCode }));
          }
        }}
      />

      {/* SEO & GEO Knowledge Hub for Search Engines and AI LLMs */}
      <SeoKnowledgeGuide language={language} />
    </div>
  );
}
