import { useState, useCallback, useEffect, useRef } from 'react';
import { Cell, Difficulty, DifficultyConfig, GameStatus } from '../types';

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10, label: 'Новичок', emoji: '😊' },
  intermediate: { rows: 16, cols: 16, mines: 40, label: 'Средний', emoji: '🤔' },
  expert: { rows: 16, cols: 30, mines: 99, label: 'Эксперт', emoji: '😎' },
};

function createEmptyBoard(rows: number, cols: number): Cell[][] {
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      };
    }
  }
  return board;
}

function getNeighbors(row: number, col: number, rows: number, cols: number): [number, number][] {
  const neighbors: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let placed = 0;

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    // Don't place mine on the first clicked cell or its neighbors
    const isSafe = r === safeRow && c === safeCol;
    const isNeighborOfSafe = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;
    if (!newBoard[r][c].isMine && !isSafe && !isNeighborOfSafe) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        const neighbors = getNeighbors(r, c, rows, cols);
        newBoard[r][c].adjacentMines = neighbors.filter(
          ([nr, nc]) => newBoard[nr][nc].isMine
        ).length;
      }
    }
  }

  return newBoard;
}

function revealCell(board: Cell[][], row: number, col: number, rows: number, cols: number): Cell[][] {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const queue: [number, number][] = [[row, col]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue;
    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
      const neighbors = getNeighbors(r, c, rows, cols);
      for (const [nr, nc] of neighbors) {
        if (!newBoard[nr][nc].isRevealed && !newBoard[nr][nc].isFlagged) {
          queue.push([nr, nc]);
        }
      }
    }
  }

  return newBoard;
}

function checkWin(board: Cell[][], totalMines: number): boolean {
  let revealedCount = 0;
  const totalCells = board.length * board[0].length;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isRevealed) revealedCount++;
    }
  }
  return revealedCount === totalCells - totalMines;
}

export function useMinesweeper(initialDifficulty: Difficulty = 'beginner') {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const config = DIFFICULTY_CONFIGS[difficulty];
  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard(config.rows, config.cols));
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  }, [stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const resetGame = useCallback((newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    if (newDifficulty) setDifficulty(diff);
    const cfg = DIFFICULTY_CONFIGS[diff];
    setBoard(createEmptyBoard(cfg.rows, cfg.cols));
    setGameStatus('idle');
    setTimer(0);
    setFlagCount(0);
    stopTimer();
  }, [difficulty, stopTimer]);

  const revealAdjacentCells = useCallback((row: number, col: number) => {
    setBoard(prevBoard => {
      const cell = prevBoard[row][col];
      if (!cell.isRevealed || cell.adjacentMines === 0) return prevBoard;

      const rows = prevBoard.length;
      const cols = prevBoard[0].length;
      const neighbors = getNeighbors(row, col, rows, cols);
      const flaggedNeighbors = neighbors.filter(([nr, nc]) => prevBoard[nr][nc].isFlagged);

      if (flaggedNeighbors.length !== cell.adjacentMines) return prevBoard;

      let newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      let hitMine = false;

      for (const [nr, nc] of neighbors) {
        if (!newBoard[nr][nc].isRevealed && !newBoard[nr][nc].isFlagged) {
          if (newBoard[nr][nc].isMine) {
            hitMine = true;
            // Reveal all mines
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                if (newBoard[r][c].isMine) {
                  newBoard[r][c].isRevealed = true;
                }
              }
            }
            break;
          }
          newBoard = revealCell(newBoard, nr, nc, rows, cols);
        }
      }

      if (hitMine) {
        setGameStatus('lost');
        stopTimer();
      } else if (checkWin(newBoard, DIFFICULTY_CONFIGS[difficulty].mines)) {
        setGameStatus('won');
        stopTimer();
      }

      return newBoard;
    });
  }, [difficulty, stopTimer]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    setBoard(prevBoard => {
      const cell = prevBoard[row][col];
      if (cell.isFlagged || cell.isRevealed) return prevBoard;

      let newBoard = prevBoard;
      const rows = prevBoard.length;
      const cols = prevBoard[0].length;

      // First click - place mines
      if (gameStatus === 'idle') {
        newBoard = placeMines(prevBoard, rows, cols, config.mines, row, col);
        setGameStatus('playing');
        startTimer();
      }

      if (newBoard[row][col].isMine) {
        // Hit a mine - reveal all mines
        const lostBoard = newBoard.map(r => r.map(c => ({ ...c })));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (lostBoard[r][c].isMine) {
              lostBoard[r][c].isRevealed = true;
            }
          }
        }
        lostBoard[row][col].isRevealed = true;
        setGameStatus('lost');
        stopTimer();
        return lostBoard;
      }

      // Reveal cell (flood fill if empty)
      newBoard = revealCell(newBoard, row, col, rows, cols);

      // Check win
      if (checkWin(newBoard, config.mines)) {
        setGameStatus('won');
        stopTimer();
      }

      return newBoard;
    });
  }, [gameStatus, config, startTimer, stopTimer]);

  const handleCellRightClick = useCallback((row: number, col: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    setBoard(prevBoard => {
      const cell = prevBoard[row][col];
      if (cell.isRevealed) return prevBoard;

      const newBoard = prevBoard.map(r => r.map(c => ({ ...c })));
      newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;

      setFlagCount(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);

      return newBoard;
    });
  }, [gameStatus]);

  return {
    board,
    gameStatus,
    timer,
    flagCount,
    difficulty,
    config,
    handleCellClick,
    handleCellRightClick,
    revealAdjacentCells,
    resetGame,
  };
}
