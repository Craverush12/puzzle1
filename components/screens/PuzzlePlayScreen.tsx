'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext, DIFFICULTY_CONFIGS, MAIN_PUZZLE } from '@/components/AppProvider';
import Timer from '@/components/Timer';
import { JigsawPiece, generateJigsawPieces, JigsawConfig, isPieceInCorrectPosition, getCorrectPiecePosition } from '@/lib/jigsaw-cutter';
import { calculateScore } from '@/lib/scoring';

export default function PuzzlePlayScreen() {
  const { setCurrentScreen, userSession, setUserSession } = useAppContext();
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [pieces, setPieces] = useState<JigsawPiece[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'full' | 'breaking' | 'complete'>('loading');
  const [showFullPuzzle, setShowFullPuzzle] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<JigsawPiece | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Get difficulty configuration
  const jigsawConfig: JigsawConfig = DIFFICULTY_CONFIGS[userSession.selectedDifficulty];
  const gridSize = jigsawConfig.gridSize;
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    if (!gameStarted) {
      const startTime = Date.now();
      setUserSession({ startTime });
      setGameStarted(true);
    }
  }, [gameStarted, setUserSession]);

  useEffect(() => {
    if (userSession.selectedDifficulty) {
      initializePuzzle();
    }
  }, [userSession.selectedDifficulty]);

  useEffect(() => {
    checkCompletion();
  }, [pieces]);

  const initializePuzzle = () => {
    if (!userSession.selectedDifficulty) return;
    
    setAnimationPhase('loading');
    setShowAnimation(true);
    setShowFullPuzzle(false);
    
    // First phase: Show loading
    setTimeout(() => {
      setAnimationPhase('full');
      setShowFullPuzzle(true);
      
      // Second phase: Show full puzzle for a moment
      setTimeout(() => {
        setAnimationPhase('breaking');
        
        // Generate pieces during breaking
        const newPieces = generateJigsawPieces(
          MAIN_PUZZLE.image,
          jigsawConfig
        );

        setPieces(newPieces);
        setIsComplete(false);
        setShowFullPuzzle(false);
        
        // Third phase: Breaking animation complete
        setTimeout(() => {
          setAnimationPhase('complete');
          
          // Fourth phase: Hide animation
          setTimeout(() => {
            setShowAnimation(false);
          }, 1000);
        }, 2000);
      }, 1500);
    }, 1000);
  };

  const checkCompletion = () => {
    if (pieces.length === 0) return;
    
    const completed = pieces.every(piece => 
      isPieceInCorrectPosition(piece, jigsawConfig, 20)
    );
    
    if (completed && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        handlePuzzleComplete();
      }, 1500);
    }
  };

  const handlePuzzleComplete = () => {
    const endTime = Date.now();
    const completionTime = endTime - userSession.startTime;
    const score = calculateScore(completionTime, userSession.selectedDifficulty);
    
    setUserSession({ 
      endTime, 
      completionTime,
      score
    });
    setCurrentScreen('completion');
  };

  const handleHome = () => {
    setCurrentScreen('welcome');
  };

  const handleBack = () => {
    setCurrentScreen('puzzleSelection');
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent, piece: JigsawPiece) => {
    if (isComplete) return;
    
    e.preventDefault();
    const boardRect = boardRef.current?.getBoundingClientRect();
    
    if (!boardRect) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDraggedPiece(piece);
    setPieces(prevPieces => 
      prevPieces.map(p => 
        p.id === piece.id 
          ? { 
              ...p, 
              isDragging: true,
              dragOffset: {
                x: clientX - boardRect.left - p.currentPosition.x,
                y: clientY - boardRect.top - p.currentPosition.y
              }
            }
          : p
      )
    );
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedPiece) return;
    
    e.preventDefault();
    const boardRect = boardRef.current?.getBoundingClientRect();
    
    if (!boardRect) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - boardRect.left - draggedPiece.dragOffset.x;
    const newY = clientY - boardRect.top - draggedPiece.dragOffset.y;
    
    setPieces(prevPieces => 
      prevPieces.map(p => 
        p.id === draggedPiece.id 
          ? { ...p, currentPosition: { x: newX, y: newY } }
          : p
      )
    );
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedPiece) return;
    
    e.preventDefault();
    
    // Check if piece is near correct position using proper collision detection
    if (isPieceInCorrectPosition(draggedPiece, jigsawConfig, 30)) {
      // Get the correct position for this piece
      const correctPos = getCorrectPiecePosition(draggedPiece.correctIndex, jigsawConfig);
      
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === draggedPiece.id 
            ? { 
                ...p, 
                currentPosition: correctPos,
                isPlaced: true,
                isDragging: false
              }
            : p
        )
      );
    } else {
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === draggedPiece.id 
            ? { ...p, isDragging: false }
            : p
        )
      );
    }
    
    setDraggedPiece(null);
  };

  const getPieceStyle = (piece: JigsawPiece) => {
    // Check if piece is near correct position for magnetic effect
    const isNearCorrect = isPieceInCorrectPosition(piece, jigsawConfig, 30) && !piece.isPlaced;
    
    return {
      position: 'absolute' as const,
      left: piece.currentPosition.x,
      top: piece.currentPosition.y,
      width: piece.bounds.width,
      height: piece.bounds.height,
      zIndex: piece.isDragging ? 1000 : 1,
      filter: isNearCorrect ? 'drop-shadow(0 0 10px #10b981)' : 'none',
      transition: piece.isDragging ? 'none' : 'all 0.3s ease',
    };
  };

  const getCorrectPosition = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      x: col * jigsawConfig.pieceSize,
      y: row * jigsawConfig.pieceSize
    };
  };

  if (!userSession.selectedDifficulty) {
    return null;
  }

  return (
    <div className="kiosk-container flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg md:text-xl font-bold text-gray-800">
          Player: {userSession.name}
        </div>
        <Timer 
          startTime={userSession.startTime}
          onTimeUpdate={setTimeElapsed}
        />
      </div>

      {/* Puzzle Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {MAIN_PUZZLE.title}
        </h2>
        <div className="text-sm md:text-base text-gray-600 mb-2">
          Difficulty: <span className="font-bold capitalize">{userSession.selectedDifficulty}</span> • 
          Pieces: <span className="font-bold">{totalPieces}</span> • 
          Grid: <span className="font-bold">{gridSize}×{gridSize}</span>
        </div>
        {!isComplete && (
          <p className="text-sm md:text-base text-gray-600">
            Drag the jigsaw pieces to their correct positions. They'll snap into place when close!
          </p>
        )}
        {isComplete && (
          <p className="text-lg md:text-xl font-bold text-emerald-600 animate-pulse">
            Puzzle Complete! Well done! 🎉
          </p>
        )}
      </div>

      {/* Puzzle Board */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div 
          ref={boardRef}
          className="relative bg-gray-100 border-4 border-gray-300 rounded-lg"
          style={{ width: gridSize * jigsawConfig.pieceSize, height: gridSize * jigsawConfig.pieceSize }}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >

          {/* Grid overlay for reference */}
          <div className={`absolute inset-0 grid gap-0`} style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}>
            {Array.from({ length: totalPieces }, (_, index) => {
              const pos = getCorrectPosition(index);
              return (
                <div
                  key={index}
                  className="border border-dashed border-gray-400 opacity-30"
                  style={{
                    position: 'absolute',
                    left: pos.x,
                    top: pos.y,
                    width: jigsawConfig.pieceSize,
                    height: jigsawConfig.pieceSize,
                  }}
                />
              );
            })}
          </div>

          {/* Puzzle Pieces */}
          {pieces.map((piece, index) => {
            const isNearCorrect = isPieceInCorrectPosition(piece, jigsawConfig, 30) && !piece.isPlaced;
            const row = Math.floor(piece.correctIndex / gridSize);
            const col = piece.correctIndex % gridSize;
            
            return (
              <svg
                key={piece.id}
                className={`cursor-grab active:cursor-grabbing ${
                  piece.isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105'
                } ${isNearCorrect ? 'animate-pulse' : ''} ${
                  showAnimation ? 'animate-bounce' : ''
                }`}
                style={{
                  ...getPieceStyle(piece),
                  animationDelay: showAnimation ? `${index * 0.1}s` : '0s',
                }}
                viewBox={`${piece.bounds.x} ${piece.bounds.y} ${piece.bounds.width} ${piece.bounds.height}`}
                onMouseDown={(e) => handleStart(e, piece)}
                onTouchStart={(e) => handleStart(e, piece)}
              >
                <defs>
                  <clipPath id={`clip-${piece.id}`}>
                    <path d={piece.svgPath} />
                  </clipPath>
                </defs>
                <image
                  href={piece.image}
                  x={-col * jigsawConfig.pieceSize}
                  y={-row * jigsawConfig.pieceSize}
                  width={gridSize * jigsawConfig.pieceSize}
                  height={gridSize * jigsawConfig.pieceSize}
                  clipPath={`url(#clip-${piece.id})`}
                  preserveAspectRatio="none"
                />
                <path
                  d={piece.svgPath}
                  fill="none"
                  stroke="#000"
                  strokeWidth="1"
                />
              </svg>
            );
          })}

          {/* Full Puzzle Display */}
          {showFullPuzzle && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <img
                src={MAIN_PUZZLE.image}
                alt={MAIN_PUZZLE.title}
                className="w-full h-full object-cover rounded-lg"
                style={{
                  animation: animationPhase === 'breaking' ? 'puzzleBreak 2s ease-in-out forwards' : 'none'
                }}
              />
            </div>
          )}

          {/* Animation overlay */}
          {showAnimation && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              {animationPhase === 'loading' && (
                <div className="text-center">
                  <div className="text-white text-2xl font-bold animate-pulse mb-4">
                    Loading puzzle...
                  </div>
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
              {animationPhase === 'full' && (
                <div className="text-center">
                  <div className="text-white text-2xl font-bold animate-pulse">
                    Preparing your puzzle...
                  </div>
                </div>
              )}
              {animationPhase === 'breaking' && (
                <div className="text-center">
                  <div className="text-white text-2xl font-bold animate-bounce mb-4">
                    Breaking into pieces...
                  </div>
                  <div className="flex space-x-2 justify-center">
                    {Array.from({ length: totalPieces }, (_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 bg-white rounded-full animate-ping"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {animationPhase === 'complete' && (
                <div className="text-center">
                  <div className="text-white text-2xl font-bold animate-pulse">
                    Ready to play! 🧩
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={handleBack}
          className="transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <img 
            src="/Back.png" 
            alt="Back" 
            className="w-auto h-12 md:h-14"
          />
        </button>
        <button
          onClick={handleHome}
          className="transform hover:scale-105 transition-all duration-200 active:scale-95"
        >
          <img 
            src="/Home.png" 
            alt="Home" 
            className="w-auto h-12 md:h-14"
          />
        </button>
      </div>
    </div>
  );
}