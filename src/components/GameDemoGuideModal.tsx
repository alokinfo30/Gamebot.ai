import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Award,
  Gamepad2,
  CheckCircle2,
  Target,
  Zap,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  Bot,
  Volume2,
} from 'lucide-react';
import { LanguageCode, t } from '../logic/i18n';

export type GameKey =
  | 'ludo'
  | 'chess'
  | 'teen_patti'
  | 'rummy'
  | 'satte'
  | 'coat_piece'
  | 'bhabhi'
  | 'poker'
  | 'blackjack'
  | 'solitaire'
  | 'donkey'
  | 'bluff'
  | 'snakes'
  | 'carrom'
  | 'snooker'
  | 'tt';

interface GameDemoGuideModalProps {
  isOpen: boolean;
  gameKey: GameKey;
  language: LanguageCode;
  onClose: () => void;
  onStartGame?: () => void;
}

interface GameGuideDetails {
  title: string;
  emoji: string;
  subtitle: string;
  category: 'Board Game' | 'Card Game' | 'Sports Game' | 'Casino Strategy';
  objective: string;
  playersCount: string;
  estimatedTime: string;
  howToPlaySteps: string[];
  keyRulesAndPenalties: string[];
  proTips: string[];
  demoDiagram: {
    type: 'ludo' | 'chess' | 'cards' | 'rummy' | 'poker' | 'board' | 'sports';
    heading: string;
    description: string;
    highlights: { label: string; detail: string; color: string }[];
  };
}

const GAME_GUIDES: Record<GameKey, GameGuideDetails> = {
  ludo: {
    title: 'Ludo AI Champion',
    emoji: '🎲',
    subtitle: 'Classic 4-Player Cross & Circle Board Game',
    category: 'Board Game',
    objective: 'Be the first player to move all 4 of your tokens from the Base Yard into the Home Triangle in the center of the board.',
    playersCount: '2 to 4 Players (Humans or AI)',
    estimatedTime: '10 - 15 Mins',
    howToPlaySteps: [
      'Roll a 6 on the die to release a token from your Base Yard onto your Start Star square.',
      'Rolling a 6 grants you an additional bonus dice roll immediately!',
      'Move your tokens clockwise along the 52-step main circuit according to your dice roll.',
      'Landing on an opponent token cuts (captures) it, sending it back to their Base Yard and granting you a bonus roll!',
      'Tokens sitting on Star squares or Colored Start spaces are completely SAFE from being cut.',
      'Navigate into your color Home Corridor and land on exact roll count to reach the center Home.',
    ],
    keyRulesAndPenalties: [
      'Exact Roll Required: You must roll the exact number remaining to enter the Home center.',
      'Safe Zones: No token can be cut while standing on a Star cell or Starting space.',
      'Three 6s Penalty: Rolling three consecutive 6s forfeits your turn to prevent unfair loops.',
    ],
    proTips: [
      'Keep at least one token on a Star square as an anchor to ambush passing opponents.',
      'Prioritize bringing all 4 tokens onto the board rather than rushing a single token alone.',
      'Block opponents behind you by positioning your token on safe stars right in front of their start.',
    ],
    demoDiagram: {
      type: 'ludo',
      heading: 'Ludo Board Circuit & Safe Star Zones',
      description: 'Understanding the 52-cell main circuit, home corridors, and safe star sanctuaries.',
      highlights: [
        { label: 'Base Yard', detail: 'Tokens wait here. Need roll of 6 to exit onto start.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
        { label: 'Safe Star ⭐', detail: 'Tokens cannot be cut by opponents on star cells.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
        { label: 'Home Track 🏠', detail: 'Color-locked safe path directly into center victory.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
      ],
    },
  },

  chess: {
    title: 'Grandmaster Chess AI',
    emoji: '♟️',
    subtitle: 'International 8x8 Tactical Strategy Game',
    category: 'Board Game',
    objective: 'Checkmate the opponent King by placing it under inescapable threat of capture.',
    playersCount: '1 v 1 (vs Adaptive AI Bot)',
    estimatedTime: '15 - 30 Mins',
    howToPlaySteps: [
      'White moves first, followed by Black in alternating turns.',
      'Pawns move 1 square forward (or 2 on first move) and capture diagonally.',
      'Knights move in an "L" shape (2 steps + 1 step) and can jump over other pieces.',
      'Bishops move diagonally any distance; Rooks move horizontally or vertically.',
      'Queens move in any straight or diagonal direction across open squares.',
      'Place opponent King in "Check" and deliver "Checkmate" where no legal escape move exists.',
    ],
    keyRulesAndPenalties: [
      'Castling: Move King 2 squares towards Rook to safeguard King and activate Rook (if neither moved).',
      'En Passant: Special pawn capture when opponent pawn advances 2 squares past your pawn.',
      'Pawn Promotion: Reaching the 8th rank upgrades your pawn into a Queen, Rook, Bishop, or Knight.',
    ],
    proTips: [
      'Control the 4 center squares (d4, e4, d5, e5) early with pawns and knights.',
      'Develop minor pieces (Knights & Bishops) before moving heavy pieces or launching attacks.',
      'Keep your King safe through early castling before opening up central files.',
    ],
    demoDiagram: {
      type: 'chess',
      heading: 'Chess Piece Vectors & Center Control',
      description: 'Mastering piece control, king safety, and offensive center control tactics.',
      highlights: [
        { label: 'Center Dominance', detail: 'Control d4/e4/d5/e5 to restrict opponent piece mobility.', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' },
        { label: 'Castling Move 🏰', detail: 'Safeguard King into corner while bringing Rook into active play.', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
        { label: 'Pawn Promotion 👑', detail: 'Upgrade pawns reaching rank 8 into powerful Queens.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
      ],
    },
  },

  teen_patti: {
    title: 'Teen Patti 3-Card Poker',
    emoji: '🎴',
    subtitle: 'Popular Indian 3-Card Brag & Bet Game',
    category: 'Card Game',
    objective: 'Form the highest-ranking 3-card combination or bluff opponents into folding their hands.',
    playersCount: '3 to 6 Players vs AI Bots',
    estimatedTime: '5 - 10 Mins',
    howToPlaySteps: [
      'Every player contributes an initial boot amount to the central pot.',
      '3 cards are dealt face-down to each player.',
      'Play as "Blind" (without looking at cards, paying 1x bet) or "Seen" (view cards, paying 2x bet).',
      'Betting proceeds clockwise: Call, Raise, or Fold.',
      'In Seen vs Seen, request a "Sideshow" with the previous player to compare hands confidentially.',
      'When 2 players remain, a final "Show" reveals hands to claim the pot!',
    ],
    keyRulesAndPenalties: [
      '1. Trail / Trio (AAA highest) > 2. Pure Sequence (Straight Flush) > 3. Sequence (Straight) > 4. Color (Flush) > 5. Pair (A-A-K) > 6. High Card.',
      'Sideshow Rule: The requested player can accept or decline the private hand comparison.',
      'Blind Multiplier: Seen players must always bet double the current Blind bet amount.',
    ],
    proTips: [
      'Playing Blind for 1-2 turns keeps betting costs low while pressuring timid Seen players.',
      'Fold low high-card hands early when betting escalates to preserve virtual chip balance.',
      'Use Sideshow when holding a medium Pair (e.g. 10-10-5) to eliminate single opponents safely.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Teen Patti Hand Hierarchy (Best to Lowest)',
      description: 'Understanding 3-card evaluation rankings from Trio down to High Card.',
      highlights: [
        { label: 'Trio / Trail (A-A-A)', detail: '3 identical rank cards. Highest winning hand.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
        { label: 'Pure Sequence (A-K-Q)', detail: '3 consecutive cards of the exact same suit.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
        { label: 'Color Flush (A-10-6)', detail: '3 cards of the same suit in non-consecutive ranks.', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' },
      ],
    },
  },

  rummy: {
    title: '13-Card Indian Rummy',
    emoji: '🃏',
    subtitle: 'Skill-Based Card Meld & Declaration Game',
    category: 'Card Game',
    objective: 'Arrange all 13 cards into valid Sequences and Sets, making a valid declaration with 0 penalty points.',
    playersCount: '2 to 6 Players',
    estimatedTime: '10 - 20 Mins',
    howToPlaySteps: [
      '13 cards are dealt to each player from a standard 52-card deck + Wild Jokers.',
      'Draw 1 card from Open Deck or Closed Stockpile on your turn.',
      'Meld cards into valid Sequences (consecutive ranks same suit) and Sets (same rank different suits).',
      'Discard 1 unwanted card into the Open Deck at the end of every turn.',
      'Must form at least TWO Sequences, including at least ONE Pure Sequence (no Joker allowed!).',
      'Discard final 14th card to the Finish Slot and click "Declare" to win!',
    ],
    keyRulesAndPenalties: [
      'Mandatory Pure Sequence: A sequence without Jokers (e.g. 5♠ 6♠ 7♠) is strictly required for valid declaration.',
      'Impure Sequence: Second sequence can utilize Wild Jokers or Printed Jokers.',
      'Invalid Declaration Penalty: Wrong declaration incurs maximum 80 points penalty!',
    ],
    proTips: [
      'Prioritize building your Pure Sequence immediately before trying to form sets.',
      'Discard high-value unmatched court cards (A, K, Q, J = 10 pts each) in early turns to minimize loss.',
      'Observe opponent discards from the open deck to deduce their sequence requirements.',
    ],
    demoDiagram: {
      type: 'rummy',
      heading: '13-Card Valid Meld Architecture',
      description: 'Visual breakdown of Pure Sequence, Impure Sequence, and 3-Card Sets.',
      highlights: [
        { label: 'Pure Sequence (Req.)', detail: '3+ consecutive cards same suit, ZERO Jokers (e.g. 7♥️ 8♥️ 9♥️).', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
        { label: 'Impure Sequence', detail: 'Consecutive suit cards using Wild/Printed Joker (e.g. 4♣️ 5♣️ 🃏).', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
        { label: 'Set (3-4 Cards)', detail: 'Same rank across different suits (e.g. 8♠️ 8♦️ 8♣️).', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
      ],
    },
  },

  satte: {
    title: 'Satte Pe Satta (7 of Hearts)',
    emoji: '♥️',
    subtitle: 'Strategic Sequence Building Card Game',
    category: 'Card Game',
    objective: 'Be the first player to play out all the cards from your hand onto the shared grid.',
    playersCount: '3 to 5 Players vs AI Bots',
    estimatedTime: '8 - 15 Mins',
    howToPlaySteps: [
      'Entire 52-card deck is distributed equally among all players.',
      'Player holding the 7 of Hearts MUST start the game by playing it to the table.',
      'Once a 7 of any suit is played, players can play the 6 (descending) or 8 (ascending) of that suit.',
      'Other suit 7s can also be introduced to open new suit tracks on the table.',
      'If you have no playable cards in your hand, you must PASS your turn.',
      'First player to shed all cards wins the round!',
    ],
    keyRulesAndPenalties: [
      'Strict Grid Sequence: Cards must be placed in exact sequence (7 -> 8 -> 9 -> 10 or 7 -> 6 -> 5 -> 4).',
      'Forced Play: If you hold a playable card, you CANNOT pass; you are required to play it.',
    ],
    proTips: [
      'Hold 6s and 8s of suits where you hold high or low ends to block opponents from shedding cards.',
      'Play 7s of suits where you hold dominant sequential chains to unlock your own cards first.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Satte Pe Satta Table Grid Expansion',
      description: 'How 7s open suit tracks expanding upward to Kings and downward to Aces.',
      highlights: [
        { label: 'Anchor 7s', detail: '7 of Hearts opens table. 7♠️ 7♦️ 7♣️ open other suit lines.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
        { label: 'Ascending Track ⬆️', detail: '8 -> 9 -> 10 -> J -> Q -> K played sequentially above 7.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
        { label: 'Descending Track ⬇️', detail: '6 -> 5 -> 4 -> 3 -> 2 -> A played sequentially below 7.', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' },
      ],
    },
  },

  coat_piece: {
    title: 'Coat Piece / Hokm',
    emoji: '👑',
    subtitle: 'Classic 4-Player Partnership Trick Taking Game',
    category: 'Card Game',
    objective: 'Win 7 tricks (Rung) out of 13 with your partner, or achieve 7 consecutive tricks for a "Coat".',
    playersCount: '2 v 2 Team Partnership',
    estimatedTime: '12 - 20 Mins',
    howToPlaySteps: [
      '4 players play in two fixed partnerships sitting opposite each other.',
      'Hakeem (Trump Caller) receives 5 initial cards and declares the Trump Suit (Hokm).',
      'Remaining 8 cards dealt to each player (total 13 cards each).',
      'First player leads a card; all players MUST follow suit if they hold cards of that suit.',
      'Highest card of led suit wins trick, UNLESS a Trump card is played, which cuts any suit!',
      'Winner of trick leads the next trick. First team to 7 tricks wins round.',
    ],
    keyRulesAndPenalties: [
      'Coat Bonus: Winning first 7 tricks consecutively scores a "Coat" (2x or 3x points).',
      'Mandatory Suit Follow: Failing to follow suit when holding cards of the led suit is illegal.',
    ],
    proTips: [
      'Hakeem should pick Trump suit based on holding at least 4-5 high cards of that suit.',
      'Save high Trump cards to win critical late-round tricks when opponents run out of suit cards.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Coat Piece Partnership Trick Arena',
      description: 'How trump suits cut trick piles and partner cooperation guarantees 7 tricks.',
      highlights: [
        { label: 'Trump Suit (Hokm)', detail: 'Trump suit beats all non-trump cards regardless of rank.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
        { label: '7 Tricks Goal 🏆', detail: 'First team to collect 7 trick piles claims match victory.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
      ],
    },
  },

  bhabhi: {
    title: 'Bhabhi Thulla Card Game',
    emoji: '🎴',
    subtitle: 'High-Stakes Card Shedding Elimination Game',
    category: 'Card Game',
    objective: 'Shed all cards from your hand! Avoid being the last player holding cards (the "Bhabhi").',
    playersCount: '3 to 6 Players',
    estimatedTime: '10 - 15 Mins',
    howToPlaySteps: [
      'Entire deck is distributed to all players.',
      'Player with Ace of Spades leads the first trick.',
      'Players must follow the led suit in clockwise order.',
      'If a player lacks the led suit, they throw an off-suit card ("Thulla" cut).',
      'When a Thulla is played, the trick stops immediately! The player who played the HIGHEST card of the led suit must pick up ALL cards played in that trick.',
      'Players who empty their hands exit safely. Last player remaining is crowned "Bhabhi".',
    ],
    keyRulesAndPenalties: [
      'Thulla Penalty: Off-suit card forces the highest suit card owner to swallow the entire trick pile.',
      'No Winners, One Loser: The sole objective is avoiding the Bhabhi title.',
    ],
    proTips: [
      'Hold onto low cards of various suits so you never run out of suit and get forced into a Thulla.',
      'Throw high cards early when you know everyone has the suit to avoid holding them late.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Bhabhi "Thulla" Penalty Mechanism',
      description: 'How playing off-suit forces the trick pile onto the highest suit player.',
      highlights: [
        { label: 'Led Suit', detail: 'Everyone must play led suit if held in hand.', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
        { label: 'Thulla Cut 💥', detail: 'Off-suit card played when void in suit stops trick.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
        { label: 'Pile Collection 📥', detail: 'Highest suit player collects all trick cards into hand.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
      ],
    },
  },

  poker: {
    title: 'Texas Hold\'em Poker AI',
    emoji: '♠️',
    subtitle: 'World Popular 7-Card Poker Game',
    category: 'Casino Strategy',
    objective: 'Form the best 5-card poker hand combining your 2 Hole Cards + 5 Community Cards.',
    playersCount: '2 to 6 Players',
    estimatedTime: '10 - 20 Mins',
    howToPlaySteps: [
      'Small Blind & Big Blind forced bets posted before deal.',
      '2 private Hole Cards dealt face-down to each player.',
      'Pre-Flop betting round: Fold, Call, or Raise.',
      'Flop (3 community cards) revealed face-up on table, followed by betting.',
      'Turn (4th card) and River (5th card) dealt with betting rounds after each.',
      'Showdown: Remaining players reveal hands. Best 5-card combination wins the pot!',
    ],
    keyRulesAndPenalties: [
      'Hand Ranking: Royal Flush > Straight Flush > 4 of a Kind > Full House > Flush > Straight > 3 of a Kind > Two Pair > One Pair > High Card.',
      'All-In Rule: Betting all chips risks elimination but caps potential main pot winnings.',
    ],
    proTips: [
      'Fold weak starting hands (e.g. 7-2 offsuit) pre-flop to conserve chip stack.',
      'Pay close attention to position; acting last on Turn and River grants huge tactical advantage.',
    ],
    demoDiagram: {
      type: 'poker',
      heading: 'Texas Hold\'em 5-Stage Poker Round',
      description: 'Hole cards, 5 community board cards, and strategic betting flow.',
      highlights: [
        { label: 'Hole Cards (2)', detail: 'Private cards dealt face down to you only.', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' },
        { label: 'Community Board (5)', detail: 'Flop (3) + Turn (1) + River (1) shared cards.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
      ],
    },
  },

  blackjack: {
    title: 'Blackjack 21 Master',
    emoji: '🎰',
    subtitle: 'Casino Card Game vs Dealer AI',
    category: 'Casino Strategy',
    objective: 'Achieve a hand total closer to 21 than the Dealer without exceeding 21 ("Busting").',
    playersCount: 'Player vs AI Dealer',
    estimatedTime: '3 - 8 Mins',
    howToPlaySteps: [
      'Place chip bet to start round.',
      '2 cards dealt to Player (both face up) and 2 to Dealer (1 face up, 1 hidden face down).',
      'Card values: 2-10 = face value, J/Q/K = 10 points, Ace = 1 or 11 points.',
      'HIT to request another card; STAND to keep current total.',
      'DOUBLE DOWN to double bet and receive exactly 1 final card.',
      'SPLIT pairs (e.g., 8-8) into two separate hands with equal bets.',
      'Dealer reveals hidden card and MUST hit until reaching 17 or higher.',
    ],
    keyRulesAndPenalties: [
      'Blackjack 21: Natural Ace + 10-value card on first 2 cards pays 3:2 payout!',
      'Bust: Hand total over 21 instantly loses bet regardless of Dealer hand.',
    ],
    proTips: [
      'Always Double Down when your starting hand total is 11.',
      'Always Split Aces and 8s; never split 10s or 5s.',
      'Stand on hard 17 or higher when Dealer shows 2 through 6.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Blackjack Basic Strategy Matrix',
      description: 'When to Hit, Stand, Double Down, or Split against Dealer Upcard.',
      highlights: [
        { label: 'Natural 21 ♠️', detail: 'Ace + 10/J/Q/K pays 3 to 2 bonus.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
        { label: 'Soft Total (Ace = 11)', detail: 'Flexible hands where Ace cannot bust next hit.', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' },
      ],
    },
  },

  solitaire: {
    title: 'Klondike Solitaire Pro',
    emoji: '🎴',
    subtitle: 'Classic Single Player Card Puzzle',
    category: 'Card Game',
    objective: 'Move all 52 cards onto the 4 Foundation piles sorted by suit from Ace to King.',
    playersCount: 'Single Player Solitaire',
    estimatedTime: '5 - 12 Mins',
    howToPlaySteps: [
      'Tableau consists of 7 columns with cards face-down except top card.',
      'Build Tableau columns down in ALTERNATING colors (e.g. Red 8 on Black 9).',
      'Draw cards 1 or 3 at a time from Stockpile into Waste pile.',
      'Move Aces directly onto empty Foundation slots at the top.',
      'Build Foundations UP in the SAME suit from Ace to King (A♠ -> 2♠ ... K♠).',
      'Only Kings can fill empty Tableau column slots.',
    ],
    keyRulesAndPenalties: [
      'Alternating Color Rule: Red cards must stack on Black cards and vice versa in Tableau.',
      'Foundation Order: Must be exact ascending suit sequence from Ace to King.',
    ],
    proTips: [
      'Expose hidden face-down Tableau cards as top priority before drawing from Stockpile.',
      'Keep empty Tableau columns open until you have a King ready to place.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Solitaire Layout & Foundations',
      description: '4 Foundation suit piles, 7 Tableau columns, and Stock draw pile.',
      highlights: [
        { label: 'Foundations (Top)', detail: '4 piles built Ace to King by suit.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
        { label: 'Tableau (Columns)', detail: 'Stacked down alternating red/black colors.', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' },
      ],
    },
  },

  donkey: {
    title: 'Donkey Card Game',
    emoji: '🐴',
    subtitle: 'Fast-Paced Card Passing & Trick Game',
    category: 'Card Game',
    objective: 'Avoid collecting penalty trick cards; shed all cards first so you don\'t become the "Donkey".',
    playersCount: '3 to 5 Players',
    estimatedTime: '5 - 10 Mins',
    howToPlaySteps: [
      'Deck dealt equally among players.',
      'Players lead suit tricks or pass cards in rapid rounds.',
      'Must follow led suit if held; highest card takes trick.',
      'If off-suit played, trick stops and highest card owner eats the pile!',
      'Shed all cards to qualify safe. Last player with cards is the Donkey 🐴!',
    ],
    keyRulesAndPenalties: [
      'Donkey Penalty: Losing player receives Donkey badge and loses match chips.',
    ],
    proTips: [
      'Pass high cards to opponents during initial card swap if mode active.',
      'Get rid of high non-suit cards quickly to avoid winning dangerous trick piles.',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Donkey Elimination & Shedding Flow',
      description: 'Avoiding high card penalties and shedding hand rapidly.',
      highlights: [
        { label: 'Card Shedding', detail: 'Empty your hand to escape Donkey penalty.', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
      ],
    },
  },

  bluff: {
    title: 'Bluff / I Doubt It',
    emoji: '🤥',
    subtitle: 'Deception & Card Claim Game',
    category: 'Card Game',
    objective: 'Shed all cards from your hand by playing face-down cards and claiming their rank.',
    playersCount: '3 to 6 Players',
    estimatedTime: '8 - 15 Mins',
    howToPlaySteps: [
      'Cards distributed equally among all players.',
      'Player leads by placing 1-4 cards face down and announcing a rank (e.g. "Two Kings").',
      'You can tell the TRUTH or BLUFF (play different cards face-down)!',
      'Any opponent can shout "BLUFF!" before the next turn.',
      'If challenged: Cards revealed! If bluffer lied, bluffer takes entire discard pile. If bluffer told truth, challenger takes entire discard pile!',
      'First player with 0 cards wins!',
    ],
    keyRulesAndPenalties: [
      'Challenge Risk: Wrong challenge adds all pile cards into challenger hand.',
      'Bluff Risk: Caught bluffer swallows the entire cumulative table pile.',
    ],
    proTips: [
      'Bluff when the pile is small so getting caught adds only 1-2 cards.',
      'Play truthful cards when the pile is massive to trick suspicious callers into eating the pile!',
    ],
    demoDiagram: {
      type: 'cards',
      heading: 'Bluff Claim & Challenge Mechanism',
      description: 'Face-down card claims, truth checks, and pile penalty distribution.',
      highlights: [
        { label: 'Face-Down Claim 🎴', detail: 'Place cards face down and announce rank.', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
        { label: 'BLUFF Call 📢', detail: 'Opponents challenge claim accuracy.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
      ],
    },
  },

  snakes: {
    title: 'Snakes & Ladders AI',
    emoji: '🐍',
    subtitle: '100-Square Classic Family Board Game',
    category: 'Board Game',
    objective: 'Navigate your token from Square 1 to exact Square 100 on the grid.',
    playersCount: '2 to 4 Players vs AI',
    estimatedTime: '5 - 10 Mins',
    howToPlaySteps: [
      'Roll 6-sided die on your turn to advance token forward.',
      'Landing at the bottom of a Ladder 🪜 climbs up to ladder top!',
      'Landing on the head of a Snake 🐍 slides down to snake tail!',
      'Rolling a 6 grants a bonus die roll.',
      'Must land on exact Square 100 to win game.',
    ],
    keyRulesAndPenalties: [
      'Exact 100 Rule: Overshooting 100 bounces back remaining spaces.',
      'Snake Penalty: Instant slide down to tail square.',
    ],
    proTips: [
      'Target ladders near rows 50-80 to bypass dangerous snake clusters near 90-99.',
    ],
    demoDiagram: {
      type: 'board',
      heading: 'Snakes & Ladders Board Mechanics',
      description: 'Ladder ascents vs Snake descents on 100-square grid.',
      highlights: [
        { label: 'Ladder Climb 🪜', detail: 'Instant vertical shortcut upward.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
        { label: 'Snake Slide 🐍', detail: 'Slide down from head to tail.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
      ],
    },
  },

  carrom: {
    title: 'Carrom Board Simulator',
    emoji: '⚪',
    subtitle: 'Precision Physics Striker Board Game',
    category: 'Sports Game',
    objective: 'Pocket all your assigned carrom men (White or Black) + Queen (Red) before opponent.',
    playersCount: '1 v 1 or 2 v 2 vs AI',
    estimatedTime: '10 - 15 Mins',
    howToPlaySteps: [
      'Set striker position along baseline drag track.',
      'Aim line & power slider to shoot striker towards carrom men.',
      'Pocketing a carrom man grants extra shot turn.',
      'Queen (Red, 3 pts) must be COVERED by pocketing another piece on same or next strike.',
      'Fouls (pocketing striker or shooting backward illegally) incur 1 piece penalty.',
    ],
    keyRulesAndPenalties: [
      'Queen Cover: Uncovered Queen returns to center circle.',
      'Striker Foul: Pocketing striker penalty piece returned to board.',
    ],
    proTips: [
      'Use cushion bank shots to hit clustered carrom men behind opponent pieces.',
      'Pocket Queen early when a clean cover piece is easily accessible.',
    ],
    demoDiagram: {
      type: 'sports',
      heading: 'Carrom Striker Trajectory & Pocketing',
      description: 'Baseline positioning, vector aiming line, and Queen cover rule.',
      highlights: [
        { label: 'Striker Baseline', detail: 'Position striker along baseline before shot.', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
        { label: 'Queen Cover 👑', detail: 'Red Queen requires immediate follow-up pocket.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
      ],
    },
  },

  snooker: {
    title: '3D Snooker Master',
    emoji: '🎱',
    subtitle: 'Realistic Cue Sports Simulation',
    category: 'Sports Game',
    objective: 'Score more points than opponent by potting Red (1 pt) and Color (2-7 pts) balls in correct sequence.',
    playersCount: '1 v 1 vs AI Bot',
    estimatedTime: '15 - 25 Mins',
    howToPlaySteps: [
      'Aim cue stick towards cue ball (white) aiming line.',
      'Must hit a RED ball first when reds remain on table.',
      'Pot Red (1 pt) -> Pot any Color ball (Yellow 2, Green 3, Brown 4, Blue 5, Pink 6, Black 7 pts).',
      'Color balls return to spots while reds remain on table.',
      'Once all 15 Reds cleared, pot Colors in ascending point order (2 to 7).',
      'Fouls (missing target ball, potting cue ball) grant opponent 4-7 penalty points.',
    ],
    keyRulesAndPenalties: [
      'Sequential Target: Alternate Red -> Color -> Red -> Color.',
      'Foul Points: 4 to 7 penalty points awarded to opponent on foul.',
    ],
    proTips: [
      'Focus on cue ball positioning for your next color shot after pocketing a red.',
      'Play safety shots when no direct pocket is available to tuck cue ball behind blocking balls.',
    ],
    demoDiagram: {
      type: 'sports',
      heading: 'Snooker Ball Sequence & Scoring Values',
      description: 'Red (1 pt) to Color (2-7 pts) alternating cycle.',
      highlights: [
        { label: 'Red Balls (1 pt)', detail: '15 reds. Must pot red before color target.', color: 'border-rose-500/50 bg-rose-500/10 text-rose-300' },
        { label: 'Colors (2-7 pts)', detail: 'Yellow(2), Green(3), Brown(4), Blue(5), Pink(6), Black(7).', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
      ],
    },
  },

  tt: {
    title: 'Table Tennis 3D',
    emoji: '🏓',
    subtitle: 'Fast-Paced Ping Pong Rally Game',
    category: 'Sports Game',
    objective: 'Score 11 points (win by 2) by hitting ping pong ball onto opponent court side.',
    playersCount: '1 v 1 vs AI Ping Pong Bot',
    estimatedTime: '5 - 10 Mins',
    howToPlaySteps: [
      'Move paddle using mouse/touch gesture or directional controls.',
      'Serve alternates every 2 points.',
      'Ball must bounce ONCE on your side before returning across net.',
      'Time your swing to apply Topspin, Cut Spin, or Power Smash shots!',
      'Out of bounds or hitting net grants point to opponent.',
    ],
    keyRulesAndPenalties: [
      'Net Fault: Ball failing to clear net awards point to opponent.',
      'Double Bounce: Allowing ball to bounce twice on your court loses point.',
    ],
    proTips: [
      'Apply topspin on high returns for aggressive smash points.',
      'Vary serve speed and placement between short net drops and deep corner pushes.',
    ],
    demoDiagram: {
      type: 'sports',
      heading: 'Table Tennis Court Bounce & Stroke Vectors',
      description: 'Rally physics, spin variations, and court bounce target zones.',
      highlights: [
        { label: 'Court Bounce 🏓', detail: 'Must bounce once on opponent court side.', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
        { label: 'Topspin Smash ⚡', detail: 'Aggressive stroke vector for high returns.', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' },
      ],
    },
  },
};

export const GameDemoGuideModal: React.FC<GameDemoGuideModalProps> = ({
  isOpen,
  gameKey,
  language,
  onClose,
  onStartGame,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'tips' | 'demo' | 'ai'>('rules');
  const [dontShowAuto, setDontShowAuto] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`gamebot_auto_guide_${gameKey}`) === 'false';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      setDontShowAuto(localStorage.getItem(`gamebot_auto_guide_${gameKey}`) === 'false');
    } catch {}
  }, [gameKey]);

  if (!isOpen) return null;

  const guide = GAME_GUIDES[gameKey] || GAME_GUIDES.ludo;

  const handleToggleAutoShow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDontShowAuto(checked);
    try {
      localStorage.setItem(`gamebot_auto_guide_${gameKey}`, checked ? 'false' : 'true');
    } catch {}
  };

  const handleLetPlay = () => {
    onClose();
    if (onStartGame) onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-md shadow-blue-600/30">
              {guide.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{guide.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {guide.category}
                </span>
              </div>
              <p className="text-xs text-slate-400">{guide.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Meta Bar */}
        <div className="px-6 py-2.5 bg-slate-800/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>{guide.playersCount}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Est. Time: {guide.estimatedTime}</span>
            </span>
          </div>

          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAMEBOT.AI Interactive Guide</span>
          </span>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3 text-xs font-bold text-slate-400">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to Play & Rules</span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'demo' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Visual Demo Diagram</span>
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tips' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Pro Tips & Winning Strategy</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai' ? 'border-blue-500 text-blue-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Bot & Commentary</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Main Objective Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 border border-blue-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-300 uppercase font-mono tracking-wider">
                Primary Winning Objective
              </h3>
              <p className="text-xs text-slate-200 font-medium mt-1 leading-relaxed">
                {guide.objective}
              </p>
            </div>
          </div>

          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Step by Step Flow */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Step-By-Step Game Sequence</span>
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {guide.howToPlaySteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Rules & Penalties */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Key Rules & Penalties</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {guide.keyRulesAndPenalties.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-start gap-2.5 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-slate-300">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{guide.demoDiagram.heading}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{guide.demoDiagram.description}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[11px] font-bold">
                    Visual Diagram
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {guide.demoDiagram.highlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${hl.color} space-y-1`}
                    >
                      <div className="font-bold text-xs">{hl.label}</div>
                      <div className="text-[11px] text-slate-300 leading-normal">{hl.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Expert Strategy & Tactical Advice</span>
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {guide.proTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs"
                  >
                    <span className="p-1 rounded bg-amber-500/20 text-amber-400 font-bold shrink-0">
                      💡
                    </span>
                    <p className="text-amber-100/90 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    GAMEBOT.AI Adaptive Intelligence & Audio Features
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Adaptive AI Bot Engine</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Calculates move heuristics, probabilities, and tactical threat vectors based on your ELO rating and selected difficulty (Easy, Medium, Adaptive, Hard).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Multilingual Voice Commentary</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Real-time audio speech synthesis commentary available in English, Hindi (हिंदी), Spanish, French, German, Bengali, Tamil, & Telugu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAuto}
              onChange={handleToggleAutoShow}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <span>Don't show this guide automatically on game start</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Close
            </button>
            <button
              onClick={handleLetPlay}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Let's Play {guide.title}!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
