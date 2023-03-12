import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { useEffect, useState } from 'react';

import { getRandomIndex } from '~/utils/getRandomIndex';
import { getUniqueColor } from '~/utils/getUniqueColor';
import type { Maybe } from '~/utils/typescript';

type GameSquare = {
  x: number;
  y: number;
  color: string;
  pairingId: string;
  key: string;
};
type GameGrid = Array<Array<GameSquare>>;

const getSquareKey = (x: number, y: number) => `${x}_${y}`;

type GridConfig = {
  x: number;
  y: number;
  optionCount: number;
};
const createBoard = (config: GridConfig) => {
  const { x, y, optionCount } = config;

  const squareCount = x * y;
  const duplicateOptionCount = squareCount / 2 - optionCount;
  // x * y must be even
  if (squareCount % 2 === 1) {
    throw Error(
      `Grid must have an even number of squares (Ex: x=3, y=1 is not valid). x was ${x}, y was ${y}.`,
    );
  }

  // optionCount must be < (x * y) / 2
  if (squareCount / 2 < optionCount) {
    throw Error('Option count greater than number of pairs');
  }

  // create available options
  // Available options are filled as follows
  //  1. Add 2 to each item
  //  2. With the remaining spots randomly pick an option and add 2
  const totalPairs = optionCount + duplicateOptionCount;
  let optionsAddedCount = 0;
  const availableOptionsCounts: Record<string, number> = {};
  for (let i = 0; i < totalPairs; i++) {
    // Do one of each first
    if (optionsAddedCount <= optionCount) {
      const color = getUniqueColor({ index: i });
      availableOptionsCounts[color] = 2;
      optionsAddedCount += 1;
      continue;
    }
    // Add in duplicates
    const optionIndex = getRandomIndex(optionCount);
    const color = getUniqueColor({ index: optionIndex });
    if (!(color in availableOptionsCounts)) {
      availableOptionsCounts[color] = 0;
    }
    availableOptionsCounts[color] += 2;
    optionsAddedCount += 1;
  }
  // Steps:
  //  1. Randomly pick an option that remains
  //  2. Create a new Square and add it to the grid
  //  3. Update options added data and remove option from available options if we have reached its max
  let abailableOptions = Object.keys(availableOptionsCounts);

  // fill grid
  const grid: GameGrid = [];
  for (let i = 0; i < x; i++) {
    grid.push([]);
    for (let j = 0; j < y; j++) {
      const option = abailableOptions[getRandomIndex(abailableOptions.length)];
      const square: GameSquare = {
        x: i,
        y: j,
        color: option,
        pairingId: option,
        key: getSquareKey(i, j),
      };
      grid[i].push(square);
      availableOptionsCounts[option] -= 1;
      // Remove if we have used all of them
      if (availableOptionsCounts[option] === 0) {
        abailableOptions = abailableOptions.filter((o) => o !== option);
      }
    }
  }
  return { config, grid };
};

type Board = {
  config: GridConfig;
  grid: GameGrid;
};

const MAX_LEVEL = 6;
const GAME_SQAURE_SIZE = 100;
const GAME_SQUARE_GAP = GAME_SQAURE_SIZE * 0.15;
const POINTS_PER_MATCH_BASE = 10;
const POINTS_LEVEL_MODIFIER = 0.1;
const getPointsPerPairForLevel = (level: number) =>
  Math.ceil(POINTS_PER_MATCH_BASE * (1 + POINTS_LEVEL_MODIFIER * (level - 1)));
const POINTS_PER_REMAINING_TIME = 0.25;
// TODO: ?? This could instead be done as a function of the number of squares at the start of a round
const TIME_LEVEL_BASE = 0.25 * 60 * 1000; // 15 seconds
const TIME_LEVEL_MODIFIER = 1.5; // 150% increase per level
const getTimeForLevel = (level: number) =>
  Math.ceil(TIME_LEVEL_BASE * (1 + TIME_LEVEL_MODIFIER * (level - 1)));
const INITIAL_GRID_CONFIG: GridConfig = {
  x: 2,
  y: 2,
  optionCount: 2,
};
const MAX_OPTIONS = 12;
const getNextGridConfig = (level: number) => {
  const config = { ...INITIAL_GRID_CONFIG };
  // Level starts at 1
  for (let i = 1; i < level; i++) {
    // Increment lower between x and y but don't produce an odd number
    // [2,3] => [2,4]
    // [2,4] => [3,4]
    // [3,4] => [4,4]
    const [lowerKey, higherKey] = [
      { key: 'x', val: config.x } as const,
      { key: 'y', val: config.y } as const,
    ]
      .sort((a, b) => a.val - b.val)
      .map(({ key }) => key);
    let keyToIncrement = higherKey;
    if (((config[lowerKey] + 1) * config[higherKey]) % 2 === 0) {
      keyToIncrement = lowerKey;
    }
    config[keyToIncrement] += 1;
    // Likelihood of having duplicates goes up with the number of pairs
    // TODO: Figure out a nice equation that relates number of pairs and number of options
    // For right now we will just be 1 to 1 until we hit a max
    if (config.optionCount < MAX_OPTIONS) {
      config.optionCount += 1;
    }
  }
  return config;
};

// Determine if the pair of game squares are a valid paid
//  - Matching Color
// TODO: add in pathing
const isValidPair = (square1: GameSquare, square2: GameSquare) => {
  // Not Matching
  // Same Square
  if (square1.pairingId !== square2.pairingId || square1.key === square2.key) {
    return false;
  }

  // Valid Pair!
  return true;
};

export const meta: MetaFunction = () => ({
  title: 'Matching Moments',
  description: 'A matching game with a twist',
});

const MatchingMoments = () => {
  const [board, setBoard] = useState<Maybe<Board>>(null);
  const [pairedSquares, setPairdSquares] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<Maybe<GameSquare>>(null);
  const [points, setPoints] = useState(0);
  const [remainingSquares, setRemainingSquares] = useState(
    board ? board.config.x * board.config.y : 0,
  );
  const [level, setLevel] = useState(1);
  const [gameStatusMessage, setGameStatusMessage] =
    useState<Maybe<string>>(null);
  const [levelRemainingTime, setLevelRemainingTime] = useState(0);
  const [gamePaused, setGamePaused] = useState(true);

  // Count down
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (!gamePaused) {
      intervalId = setInterval(() => {
        setLevelRemainingTime((prev) => {
          const newTime = prev - 1000;
          if (newTime < 0) {
            setGameStatusMessage('Time is up!');
            setGamePaused(true);
            setGamePaused(true);
            setBoard(null);
            setRemainingSquares(0);
            setLevelRemainingTime(0);
            setPairdSquares({});
            setSelected(null);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gamePaused]);

  const onSquareClick = (square: GameSquare) => {
    const { x, y } = square;
    // Select if nothing is selected yet
    if (!selected) {
      setSelected(square);
      return;
    }
    // Do nothing if the same square is selected
    if (selected.key === square.key) {
      return;
    }

    // Select new square if invalid pair
    if (!isValidPair(selected, square)) {
      setSelected(square);
      return;
    }

    // Valid Pair

    // Remove Squares
    setPairdSquares((prev) => ({
      ...prev,
      [getSquareKey(x, y)]: true,
      [getSquareKey(selected.x, selected.y)]: true,
    }));

    // Reduce remaining square count
    setRemainingSquares((prev) => prev - 2);

    // Unselect
    setSelected(null);

    const isEndOfLevel = remainingSquares - 2 === 0;

    // Give Points
    setPoints((prev) => {
      let newTotal = prev + getPointsPerPairForLevel(level);
      if (isEndOfLevel) {
        newTotal += (levelRemainingTime / 1000) * POINTS_PER_REMAINING_TIME;
      }
      return Math.round(newTotal);
    });

    // Check to see if game is over and we should go to next level
    if (isEndOfLevel) {
      // Check to see if we are at the last level
      if (level === MAX_LEVEL) {
        setGameStatusMessage('You Win!');
        setGamePaused(true);
        setBoard(null);
        setRemainingSquares(0);
        setLevelRemainingTime(0);
        setPairdSquares({});
        setSelected(null);
        return;
      }

      const newLevel = level + 1;
      setLevel(newLevel);
      const config = getNextGridConfig(newLevel);
      setBoard(createBoard(config));
      setRemainingSquares(config.x * config.y);
      setLevelRemainingTime(getTimeForLevel(newLevel));
      setPairdSquares({});
      setSelected(null);
    }
  };

  return (
    <div className='flex min-h-screen w-screen justify-center bg-zinc-100 p-4'>
      <div className='w-[1200px]'>
        <Link to='/' className='mb-2 block underline'>
          Return Home
        </Link>
        <div className='mb-6 flex justify-between'>
          <h1 className='text-2xl'>Matching Moments</h1>
          <p className='text-xl'>Total Points: {points}</p>
          <p className='text-xl'>Level: {level}</p>
          <p className='text-xl'>
            Remaining Time: {Math.ceil(levelRemainingTime / 1000)}
          </p>
          <p className='text-xl'>Remaining Squares: {remainingSquares}</p>
        </div>
        {gameStatusMessage && <p>{gameStatusMessage}</p>}
        <div className='flex justify-center'>
          {!board ? (
            /* New Game Screen */
            <button
              type='button'
              onClick={() => {
                const config = INITIAL_GRID_CONFIG;
                const board = createBoard(config);
                setBoard(board);
                setPairdSquares({});
                setSelected(null);
                setPoints(0);
                setRemainingSquares(config.x * config.y);
                setLevel(1);
                setGameStatusMessage(null);
                setLevelRemainingTime(getTimeForLevel(1));
                setGamePaused(false);
              }}
            >
              New Game
            </button>
          ) : (
            <div
              className='grid'
              style={{
                gap: `${GAME_SQUARE_GAP}px`,
                width: `${
                  GAME_SQAURE_SIZE * board.config.x +
                  GAME_SQUARE_GAP * (board.config.x - 1)
                }px`,
                height: `${
                  GAME_SQAURE_SIZE * board.config.y +
                  GAME_SQUARE_GAP * (board.config.y - 1)
                }px`,
              }}
            >
              {board.grid.map((column) =>
                column.map((square) => {
                  const { color, x, y } = square;

                  // Remove if paired
                  const paired = pairedSquares[getSquareKey(x, y)];
                  if (paired) {
                    return (
                      <div
                        style={{
                          width: GAME_SQAURE_SIZE,
                          height: GAME_SQAURE_SIZE,
                          gridColumn: x + 1,
                          gridRow: y + 1,
                        }}
                        key={`${x}_${y}`}
                      />
                    );
                  }

                  const isSelected = x === selected?.x && y === selected?.y;
                  return (
                    <button
                      type='button'
                      onClick={() => onSquareClick(square)}
                      className={`rounded-lg border-2 transition hover:scale-110 ${
                        isSelected
                          ? 'border-black hover:border-black'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{
                        width: GAME_SQAURE_SIZE,
                        height: GAME_SQAURE_SIZE,
                        backgroundColor: color,
                        gridColumn: x + 1,
                        gridRow: y + 1,
                      }}
                      key={`${x}_${y}`}
                    />
                  );
                }),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingMoments;
