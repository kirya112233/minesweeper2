export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'special';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
  emoji: string;
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
