'use client';

import { useState, useEffect, useRef } from 'react';
import { Puzzle } from '@/components/AppProvider';

interface PuzzlePiece {
  id: number;
  correctIndex: number;
  image: string;
  isPlaced: boolean;
  currentSlot: number | null;
}

interface PuzzleGameProps {
  puzzle: Puzzle;
  onComplete: () => void;
}

export default function PuzzleGame({ puzzle, onComplete }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const gridSize = 3; // 3x3 puzzle
  const totalPieces = gridSize * gridSize;

  useEffect(() => {
    initializePuzzle();
  }, [puzzle]);

  useEffect(() => {
    checkCompletion();
  }, [pieces]);

  // Global mouse event listeners for proper drag tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggedPiece) return;
      
      e.preventDefault();
      
      if (dragRef.current) {
        dragRef.current.style.left = `${e.clientX - dragOffset.x}px`;
        dragRef.current.style.top = `${e.clientY - dragOffset.y}px`;
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!draggedPiece) return;
      
      e.preventDefault();
      
      // Find the drop zone under the mouse point
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const dropZone = elements.find(el => el.classList.contains('drop-zone'));
      
      if (dropZone) {
        const slotIndex = parseInt(dropZone.getAttribute('data-slot') || '-1');
        if (slotIndex >= 0) {
          placePiece(draggedPiece, slotIndex);
        }
      }
      
      setDraggedPiece(null);
      if (dragRef.current) {
        dragRef.current.style.display = 'none';
      }
    };

    if (draggedPiece) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedPiece, dragOffset]);

  const initializePuzzle = () => {
    const newPieces: PuzzlePiece[] = [];
    
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctIndex: i,
        image: puzzle.image,
        isPlaced: false,
        currentSlot: null,
      });
    }

    // Shuffle pieces
    const shuffledPieces = [...newPieces];
    for (let i = shuffledPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPieces[i], shuffledPieces[j]] = [shuffledPieces[j], shuffledPieces[i]];
    }

    setPieces(shuffledPieces);
    setIsComplete(false);
  };

  const checkCompletion = () => {
    if (pieces.length === 0) return;
    
    const completed = pieces.every(piece => piece.isPlaced && piece.currentSlot === piece.correctIndex);
    if (completed && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, piece: PuzzlePiece) => {
    if (isComplete) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDraggedPiece(piece);
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedPiece) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    if (dragRef.current) {
      dragRef.current.style.left = `${touch.clientX - dragOffset.x}px`;
      dragRef.current.style.top = `${touch.clientY - dragOffset.y}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedPiece) return;
    
    e.preventDefault();
    const touch = e.changedTouches[0];
    
    // Find the drop zone under the touch point
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dropZone = elements.find(el => el.classList.contains('drop-zone'));
    
    if (dropZone) {
      const slotIndex = parseInt(dropZone.getAttribute('data-slot') || '-1');
      if (slotIndex >= 0) {
        placePiece(draggedPiece, slotIndex);
      }
    }
    
    setDraggedPiece(null);
    if (dragRef.current) {
      dragRef.current.style.display = 'none';
    }
  };

  const handleMouseDown = (e: React.MouseEvent, piece: PuzzlePiece) => {
    if (isComplete) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    
    setDraggedPiece(piece);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedPiece) return;
    
    e.preventDefault();
    
    if (dragRef.current) {
      dragRef.current.style.left = `${e.clientX - dragOffset.x}px`;
      dragRef.current.style.top = `${e.clientY - dragOffset.y}px`;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggedPiece) return;
    
    e.preventDefault();
    
    // Find the drop zone under the mouse point
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const dropZone = elements.find(el => el.classList.contains('drop-zone'));
    
    if (dropZone) {
      const slotIndex = parseInt(dropZone.getAttribute('data-slot') || '-1');
      if (slotIndex >= 0) {
        placePiece(draggedPiece, slotIndex);
      }
    }
    
    setDraggedPiece(null);
    if (dragRef.current) {
      dragRef.current.style.display = 'none';
    }
  };

  const placePiece = (piece: PuzzlePiece, slotIndex: number) => {
    setPieces(prevPieces => {
      const newPieces = [...prevPieces];
      
      // If the piece is already placed, remove it from its current slot first
      if (piece.isPlaced && piece.currentSlot !== null) {
        const currentPieceIndex = newPieces.findIndex(p => p.id === piece.id);
        if (currentPieceIndex >= 0) {
          newPieces[currentPieceIndex].isPlaced = false;
          newPieces[currentPieceIndex].currentSlot = null;
        }
      }
      
      // Remove any piece that's currently in the target slot
      newPieces.forEach(p => {
        if (p.currentSlot === slotIndex && p.id !== piece.id) {
          p.isPlaced = false;
          p.currentSlot = null;
        }
      });
      
      // Place the piece in the new slot
      const pieceIndex = newPieces.findIndex(p => p.id === piece.id);
      if (pieceIndex >= 0) {
        newPieces[pieceIndex].isPlaced = true;
        newPieces[pieceIndex].currentSlot = slotIndex;
      }
      
      return newPieces;
    });
  };

  const getPieceStyle = (piece: PuzzlePiece) => {
    const row = Math.floor(piece.correctIndex / gridSize);
    const col = piece.correctIndex % gridSize;
    
    return {
      backgroundImage: `url(${piece.image})`,
      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
      backgroundPosition: `-${col * 100}% -${row * 100}%`,
    };
  };

  const getSlotPiece = (slotIndex: number) => {
    return pieces.find(piece => piece.currentSlot === slotIndex);
  };

  const availablePieces = pieces.filter(piece => !piece.isPlaced);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {puzzle.title}
        </h2>
        {!isComplete && (
          <p className="text-sm md:text-base text-gray-600">
            Drag pieces from the tray to the board. You can also move placed pieces to different slots.
          </p>
        )}
        {isComplete && (
          <p className="text-lg md:text-xl font-bold text-emerald-600 animate-pulse">
            Puzzle Complete! Well done! 🎉
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Puzzle Board */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="grid grid-cols-3 gap-1 bg-gray-300 p-2 rounded-lg">
            {Array.from({ length: totalPieces }, (_, index) => {
              const slotPiece = getSlotPiece(index);
              return (
                <div
                  key={index}
                  className="drop-zone w-20 h-20 md:w-24 md:h-24 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center"
                  data-slot={index}
                >
                  {slotPiece && (
                    <div
                      className={`w-full h-full rounded-lg puzzle-piece cursor-grab ${slotPiece.isPlaced ? 'placed' : ''}`}
                      style={getPieceStyle(slotPiece)}
                      onTouchStart={(e) => handleTouchStart(e, slotPiece)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={(e) => handleMouseDown(e, slotPiece)}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Piece Tray */}
        <div className="bg-gray-200 p-3 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
            Puzzle Pieces
          </h3>
          <div className="flex flex-wrap justify-center gap-2 max-h-32 overflow-y-auto">
            {availablePieces.map((piece) => (
              <div
                key={piece.id}
                className="puzzle-piece w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-gray-400 bg-white shadow-md"
                style={getPieceStyle(piece)}
                onTouchStart={(e) => handleTouchStart(e, piece)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleMouseDown(e, piece)}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dragged piece */}
      {draggedPiece && (
        <div
          ref={dragRef}
          className="puzzle-piece dragging fixed w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 border-emerald-500 pointer-events-none z-50"
          style={{
            ...getPieceStyle(draggedPiece),
            display: 'block',
            left: '0px',
            top: '0px',
          }}
        />
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={initializePuzzle}
          disabled={isComplete}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl font-semibold transition-colors"
        >
          Shuffle Again
        </button>
      </div>
    </div>
  );
}