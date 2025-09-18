// Enhanced jigsaw cutting algorithm with dynamic grid support
export interface JigsawPiece {
  id: number;
  correctIndex: number;
  image: string;
  isPlaced: boolean;
  currentPosition: { x: number; y: number };
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  svgPath: string;
  bounds: { x: number; y: number; width: number; height: number };
  baseSize: number;
  gridPosition: { row: number; col: number };
}

export interface JigsawConfig {
  gridSize: number;
  pieceSize: number;
  tabSize: number;
  tabDepth: number;
}

// Generate a simple square piece
export function generateJigsawPiece(
  row: number, 
  col: number, 
  config: JigsawConfig
): string {
  const { pieceSize } = config;
  
  // Simple square path
  return `M 0 0 L ${pieceSize} 0 L ${pieceSize} ${pieceSize} L 0 ${pieceSize} Z`;
}

// Calculate piece bounds for square pieces
export function calculatePieceBounds(
  row: number,
  col: number,
  config: JigsawConfig
): { x: number; y: number; width: number; height: number } {
  const { pieceSize } = config;
  
  // Simple square bounds
  return {
    x: 0,
    y: 0,
    width: pieceSize,
    height: pieceSize
  };
}

// Generate all jigsaw pieces for a puzzle
export function generateJigsawPieces(
  image: string,
  config: JigsawConfig
): JigsawPiece[] {
  const pieces: JigsawPiece[] = [];
  const totalPieces = config.gridSize * config.gridSize;
  
  // Calculate board dimensions for scattered placement
  const boardWidth = Math.max(400, config.gridSize * config.pieceSize + 100);
  const boardHeight = Math.max(300, config.gridSize * config.pieceSize + 100);
  
  for (let i = 0; i < totalPieces; i++) {
    const row = Math.floor(i / config.gridSize);
    const col = i % config.gridSize;
    
    // Calculate correct grid position
    const correctX = col * config.pieceSize;
    const correctY = row * config.pieceSize;
    
    // Random scattered position on the board (avoiding overlap)
    const randomX = Math.random() * (boardWidth - config.pieceSize - 20) + 10;
    const randomY = Math.random() * (boardHeight - config.pieceSize - 20) + 10;
    
    // Calculate piece bounds
    const bounds = calculatePieceBounds(row, col, config);
    
    pieces.push({
      id: i,
      correctIndex: i,
      image,
      isPlaced: false,
      currentPosition: { x: randomX, y: randomY },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      svgPath: generateJigsawPiece(row, col, config),
      bounds,
      baseSize: config.pieceSize,
      gridPosition: { row, col },
    });
  }
  
  return pieces;
}

// Check if a piece is in the correct position with proper collision detection
export function isPieceInCorrectPosition(
  piece: JigsawPiece,
  config: JigsawConfig,
  tolerance: number = 20
): boolean {
  const row = Math.floor(piece.correctIndex / config.gridSize);
  const col = piece.correctIndex % config.gridSize;
  
  // Calculate correct position (top-left corner of the piece)
  const correctX = col * config.pieceSize;
  const correctY = row * config.pieceSize;
  
  // Calculate current position (top-left corner of the piece)
  const currentX = piece.currentPosition.x;
  const currentY = piece.currentPosition.y;
  
  // Calculate distance between top-left corners
  const distance = Math.sqrt(
    Math.pow(currentX - correctX, 2) + 
    Math.pow(currentY - correctY, 2)
  );
  
  return distance <= tolerance;
}

// Get the correct position for a piece
export function getCorrectPiecePosition(
  pieceIndex: number,
  config: JigsawConfig
): { x: number; y: number } {
  const row = Math.floor(pieceIndex / config.gridSize);
  const col = pieceIndex % config.gridSize;
  
  return {
    x: col * config.pieceSize,
    y: row * config.pieceSize
  };
}

