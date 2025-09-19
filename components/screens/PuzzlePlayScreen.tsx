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
  const [draggedPiece, setDraggedPiece] = useState<JigsawPiece | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Get difficulty configuration
  const originalConfig: JigsawConfig = DIFFICULTY_CONFIGS[userSession.selectedDifficulty];
  const gridSize = originalConfig.gridSize;
  const totalPieces = gridSize * gridSize;
  
  // Create modified config with correct piece size for 256px board
  const pieceSize = 256 / gridSize;
  const jigsawConfig: JigsawConfig = {
    ...originalConfig,
    pieceSize: pieceSize
  };

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
    
    // Generate pieces immediately without animations
    const newPieces = generateJigsawPieces(
      MAIN_PUZZLE.image,
      jigsawConfig
    );

    setPieces(newPieces);
    setIsComplete(false);
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
    if (isComplete || piece.isPlaced) return; // Prevent dragging placed pieces
    
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
    
    let newX = clientX - boardRect.left - draggedPiece.dragOffset.x;
    let newY = clientY - boardRect.top - draggedPiece.dragOffset.y;
    
    // Constrain pieces within the visible puzzle area (256px x 256px)
    const maxX = 256 - draggedPiece.bounds.width;
    const maxY = 256 - draggedPiece.bounds.height;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    // Check if piece is close enough to correct position for auto-snap
    const correctPos = getCorrectPiecePosition(draggedPiece.correctIndex, jigsawConfig);
    const distance = Math.sqrt(
      Math.pow(newX - correctPos.x, 2) + 
      Math.pow(newY - correctPos.y, 2)
    );
    
    // Auto-snap if within 25 pixels of correct position
    const shouldSnap = distance <= 25;
    if (shouldSnap) {
      // Ensure exact positioning at grid boundaries
      newX = Math.round(correctPos.x);
      newY = Math.round(correctPos.y);
    }
    
    setPieces(prevPieces => 
      prevPieces.map(p => 
        p.id === draggedPiece.id 
          ? { 
              ...p, 
              currentPosition: { x: newX, y: newY }
              // Don't mark as placed during drag - only on release
            }
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
    
    // Check if piece should be permanently placed at release
    const correctPos = getCorrectPiecePosition(draggedPiece.correctIndex, jigsawConfig);
    const currentPiece = pieces.find(p => p.id === draggedPiece.id);
    
    if (currentPiece) {
      const distance = Math.sqrt(
        Math.pow(currentPiece.currentPosition.x - correctPos.x, 2) + 
        Math.pow(currentPiece.currentPosition.y - correctPos.y, 2)
      );
      
      const shouldPlace = distance <= 25;
      
      setPieces(prevPieces => 
        prevPieces.map(p => 
          p.id === draggedPiece.id 
            ? { 
                ...p, 
                isDragging: false,
                isPlaced: shouldPlace || p.isPlaced,
                currentPosition: shouldPlace ? correctPos : p.currentPosition
              }
            : p
        )
      );
    }
    
    setDraggedPiece(null);
  };

  const getPieceStyle = (piece: JigsawPiece) => {
    return {
      position: 'absolute' as const,
      left: piece.currentPosition.x,
      top: piece.currentPosition.y,
      width: piece.bounds.width,
      height: piece.bounds.height,
      zIndex: piece.isDragging ? 1000 : (piece.isPlaced ? 2 : 1),
      filter: piece.isPlaced ? 'drop-shadow(0 0 5px #10b981)' : 'none',
      transition: piece.isDragging ? 'none' : 'all 0.2s ease',
      opacity: piece.isPlaced ? 0.9 : 1,
    };
  };

  const getCorrectPosition = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return {
      x: Math.round(col * jigsawConfig.pieceSize),
      y: Math.round(row * jigsawConfig.pieceSize)
    };
  };

  if (!userSession.selectedDifficulty) {
    return null;
  }

  return (
    <div className="kiosk-container flex flex-col items-center justify-center">
      {/* Puzzle Play Screen Image - Center of screen */}
      <div className="flex justify-center h-full">
        <img 
          src="/puzzleplayscreen.png" 
          alt="Puzzle Play Screen" 
          className="w-auto h-full object-contain"
        />
      </div>

      {/* Centered content - positioned within the border area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* TOP SECTION */}
        {/*  */}

        {/* CENTER SECTION - Puzzle */}
        <div className="flex-1 flex flex-col items-center justify-center">
        {/* Name and Timer row - just above progress bar */}
        <div className="flex justify-between items-center mb-4" style={{ width: '256px' }}>
          <div className="text-sm font-bold text-white">
            {userSession.name}
          </div>
          <div className="text-xs">
            <Timer 
              startTime={userSession.startTime}
              onTimeUpdate={setTimeElapsed}
            />
          </div>
        </div>

        {/* Progress Bar positioned just above puzzle */}
        <div className="mb-4" style={{ width: '256px' }}>
          <div className="w-full h-4 bg-gray-600 rounded-full overflow-hidden">
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
          className="relative rounded-lg border-2 border-gray-400"
          style={{ 
            backgroundColor: '#004F53',
            width: '256px',
            height: '256px'
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
            const row = Math.floor(piece.correctIndex / gridSize);
            const col = piece.correctIndex % gridSize;
            
            return (
              <svg
                key={piece.id}
                className={`${
                  piece.isPlaced 
                    ? 'cursor-default' 
                    : 'cursor-grab active:cursor-grabbing'
                }`}
                style={getPieceStyle(piece)}
                viewBox={`${piece.bounds.x} ${piece.bounds.y} ${piece.bounds.width} ${piece.bounds.height}`}
                onMouseDown={piece.isPlaced ? undefined : (e) => handleStart(e, piece)}
                onTouchStart={piece.isPlaced ? undefined : (e) => handleStart(e, piece)}
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
                  width="256"
                  height="256"
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

        </div>

        {/* Buttons positioned just below puzzle */}
        <div className="flex justify-between items-center mt-4" style={{ width: '256px' }}>
          <button
            onClick={handleBack}
            className="transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <img 
              src="/backbutton.png" 
              alt="Back" 
              className="w-auto h-8"
            />
          </button>
          <button
            onClick={handleHome}
            className="transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            <img 
              src="/Homebutton.png" 
              alt="Home" 
              className="w-auto h-8"
            />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}