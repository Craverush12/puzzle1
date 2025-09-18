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
    
    // Only prevent default for touch events, not mouse events
    if ('touches' in e) {
      e.preventDefault();
    }
    
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
    
    // Only prevent default for touch events, not mouse events
    if ('touches' in e) {
      e.preventDefault();
    }
    
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
    
    // Only prevent default for touch events, not mouse events
    if ('touches' in e) {
      e.preventDefault();
    }
    
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
    <div className="flex flex-col h-full justify-between p-8">
      {/* TOP SECTION */}
      <div className="flex flex-col items-center">
        {/* Title at the very top */}
        <h2 className="text-3xl font-medium text-white mt-16 text-center">
          Puzzle Title
        </h2>
      </div>

      {/* CENTER SECTION - Puzzle */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Name and Timer row - just above progress bar */}
        <div className="flex justify-between items-center mb-6" style={{ width: gridSize * jigsawConfig.pieceSize * 0.8 }}>
          <div className="text-3xl font-bold text-white">
            {userSession.name}
          </div>
          <Timer 
            startTime={userSession.startTime}
            onTimeUpdate={setTimeElapsed}
          />
        </div>

        {/* Progress Bar positioned just above puzzle */}
        <div className="mb-8" style={{ width: gridSize * jigsawConfig.pieceSize * 0.8 }}>
          <div className="w-full h-6 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 relative"
              style={{ 
                width: `${pieces.length > 0 ? (pieces.filter(p => p.isPlaced).length / pieces.length) * 100 : 0}%`,
                background: 'linear-gradient(-45deg, #8FD2CE 25%, #00823F 25%, #00823F 50%, #8FD2CE 50%, #8FD2CE 75%, #00823F 75%)',
                backgroundSize: '20px 20px',
                animation: 'progress-stripes 1s linear infinite'
              }}
            />
          </div>
        </div>

        <div 
          ref={boardRef}
          className="relative rounded-lg"
          style={{ 
            backgroundColor: '#004F53',
            width: gridSize * jigsawConfig.pieceSize,
            height: gridSize * jigsawConfig.pieceSize
          }}
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

        {/* Buttons positioned just below puzzle */}
        <div className="flex justify-between items-center mt-4" style={{ width: gridSize * jigsawConfig.pieceSize }}>
          <button
            onClick={handleBack}
            className="transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <img 
              src="/backbutton.png" 
              alt="Back" 
              className="w-auto h-12 md:h-14"
            />
          </button>
          <button
            onClick={handleHome}
            className="transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <img 
              src="/Homebutton.png" 
              alt="Home" 
              className="w-auto h-12 md:h-14"
            />
          </button>
        </div>
      </div>
    </div>
  );
}