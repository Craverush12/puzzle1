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
}

export interface JigsawConfig {
  gridSize: number;
  pieceSize: number;
  tabSize: number;
  tabDepth: number;
}

// Generate jigsaw piece SVG path with proper interlocking tabs and blanks
export function generateJigsawPiece(
  row: number, 
  col: number, 
  config: JigsawConfig
): string {
  const { pieceSize, tabSize, tabDepth } = config;
  const halfSize = pieceSize / 2;
  const tabWidth = tabSize;
  const tabHeight = tabDepth;
  
  // Calculate which edges have tabs/blanks based on neighbors
  const hasTopNeighbor = row > 0;
  const hasBottomNeighbor = row < config.gridSize - 1;
  const hasLeftNeighbor = col > 0;
  const hasRightNeighbor = col < config.gridSize - 1;
  
  // Create a proper interlocking pattern
  // Use a more sophisticated pattern that ensures pieces actually interlock
  const topTabOut = (row * config.gridSize + col) % 2 === 0;
  const bottomTabOut = ((row + 1) * config.gridSize + col) % 2 === 0;
  const leftTabOut = (row * config.gridSize + col) % 2 === 0;
  const rightTabOut = (row * config.gridSize + (col + 1)) % 2 === 0;
  
  // Start from top-left corner
  let path = `M 0 0`;
  
  // Top edge
  if (hasTopNeighbor) {
    // Draw straight line to start of tab area
    path += ` L ${halfSize - tabWidth/2} 0`;
    
    if (topTabOut) {
      // Tab extends outward (upward) - this piece has a tab
      path += ` C ${halfSize - tabWidth/4} ${-tabHeight/2} ${halfSize - tabWidth/8} ${-tabHeight} ${halfSize} ${-tabHeight}`;
      path += ` C ${halfSize + tabWidth/8} ${-tabHeight} ${halfSize + tabWidth/4} ${-tabHeight/2} ${halfSize + tabWidth/2} 0`;
    } else {
      // Blank indents inward (downward) - this piece has a blank
      path += ` C ${halfSize - tabWidth/4} ${tabHeight/2} ${halfSize - tabWidth/8} ${tabHeight} ${halfSize} ${tabHeight}`;
      path += ` C ${halfSize + tabWidth/8} ${tabHeight} ${halfSize + tabWidth/4} ${tabHeight/2} ${halfSize + tabWidth/2} 0`;
    }
    
    // Continue to top-right corner
    path += ` L ${pieceSize} 0`;
  } else {
    // No neighbor above, straight edge
    path += ` L ${pieceSize} 0`;
  }
  
  // Right edge
  if (hasRightNeighbor) {
    // Draw straight line to start of tab area
    path += ` L ${pieceSize} ${halfSize - tabWidth/2}`;
    
    if (rightTabOut) {
      // Tab extends outward (rightward) - this piece has a tab
      path += ` C ${pieceSize + tabHeight/2} ${halfSize - tabWidth/4} ${pieceSize + tabHeight} ${halfSize - tabWidth/8} ${pieceSize + tabHeight} ${halfSize}`;
      path += ` C ${pieceSize + tabHeight} ${halfSize + tabWidth/8} ${pieceSize + tabHeight/2} ${halfSize + tabWidth/4} ${pieceSize} ${halfSize + tabWidth/2}`;
    } else {
      // Blank indents inward (leftward) - this piece has a blank
      path += ` C ${pieceSize - tabHeight/2} ${halfSize - tabWidth/4} ${pieceSize - tabHeight} ${halfSize - tabWidth/8} ${pieceSize - tabHeight} ${halfSize}`;
      path += ` C ${pieceSize - tabHeight} ${halfSize + tabWidth/8} ${pieceSize - tabHeight/2} ${halfSize + tabWidth/4} ${pieceSize} ${halfSize + tabWidth/2}`;
    }
    
    // Continue to bottom-right corner
    path += ` L ${pieceSize} ${pieceSize}`;
  } else {
    // No neighbor to the right, straight edge
    path += ` L ${pieceSize} ${pieceSize}`;
  }
  
  // Bottom edge
  if (hasBottomNeighbor) {
    // Draw straight line to start of tab area
    path += ` L ${halfSize + tabWidth/2} ${pieceSize}`;
    
    if (bottomTabOut) {
      // Tab extends outward (downward) - this piece has a tab
      path += ` C ${halfSize + tabWidth/4} ${pieceSize + tabHeight/2} ${halfSize + tabWidth/8} ${pieceSize + tabHeight} ${halfSize} ${pieceSize + tabHeight}`;
      path += ` C ${halfSize - tabWidth/8} ${pieceSize + tabHeight} ${halfSize - tabWidth/4} ${pieceSize + tabHeight/2} ${halfSize - tabWidth/2} ${pieceSize}`;
    } else {
      // Blank indents inward (upward) - this piece has a blank
      path += ` C ${halfSize + tabWidth/4} ${pieceSize - tabHeight/2} ${halfSize + tabWidth/8} ${pieceSize - tabHeight} ${halfSize} ${pieceSize - tabHeight}`;
      path += ` C ${halfSize - tabWidth/8} ${pieceSize - tabHeight} ${halfSize - tabWidth/4} ${pieceSize - tabHeight/2} ${halfSize - tabWidth/2} ${pieceSize}`;
    }
    
    // Continue to bottom-left corner
    path += ` L 0 ${pieceSize}`;
  } else {
    // No neighbor below, straight edge
    path += ` L 0 ${pieceSize}`;
  }
  
  // Left edge
  if (hasLeftNeighbor) {
    // Draw straight line to start of tab area
    path += ` L 0 ${halfSize + tabWidth/2}`;
    
    if (leftTabOut) {
      // Tab extends outward (leftward) - this piece has a tab
      path += ` C ${-tabHeight/2} ${halfSize + tabWidth/4} ${-tabHeight} ${halfSize + tabWidth/8} ${-tabHeight} ${halfSize}`;
      path += ` C ${-tabHeight} ${halfSize - tabWidth/8} ${-tabHeight/2} ${halfSize - tabWidth/4} 0 ${halfSize - tabWidth/2}`;
    } else {
      // Blank indents inward (rightward) - this piece has a blank
      path += ` C ${tabHeight/2} ${halfSize + tabWidth/4} ${tabHeight} ${halfSize + tabWidth/8} ${tabHeight} ${halfSize}`;
      path += ` C ${tabHeight} ${halfSize - tabWidth/8} ${tabHeight/2} ${halfSize - tabWidth/4} 0 ${halfSize - tabWidth/2}`;
    }
    
    // Close the path back to start
    path += ` L 0 0`;
  } else {
    // No neighbor to the left, straight edge
    path += ` L 0 0`;
  }
  
  path += ' Z';
  return path;
}

// Calculate piece bounds including tabs
export function calculatePieceBounds(
  row: number,
  col: number,
  config: JigsawConfig
): { x: number; y: number; width: number; height: number } {
  const { pieceSize, tabDepth } = config;
  
  // Base piece size
  let minX = 0;
  let minY = 0;
  let maxX = pieceSize;
  let maxY = pieceSize;
  
  // Check for tabs that extend beyond base size
  const hasTopNeighbor = row > 0;
  const hasBottomNeighbor = row < config.gridSize - 1;
  const hasLeftNeighbor = col > 0;
  const hasRightNeighbor = col < config.gridSize - 1;
  
  const topTabOut = row % 2 === 0;
  const bottomTabOut = (row + 1) % 2 === 0;
  const leftTabOut = col % 2 === 0;
  const rightTabOut = (col + 1) % 2 === 0;
  
  // Adjust bounds based on tabs
  if (hasTopNeighbor && topTabOut) {
    minY = -tabDepth;
  }
  if (hasBottomNeighbor && bottomTabOut) {
    maxY = pieceSize + tabDepth;
  }
  if (hasLeftNeighbor && leftTabOut) {
    minX = -tabDepth;
  }
  if (hasRightNeighbor && rightTabOut) {
    maxX = pieceSize + tabDepth;
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Generate a complete puzzle SVG with all pieces cut out
export function generatePuzzleSVG(
  image: string,
  config: JigsawConfig
): string {
  const { gridSize, pieceSize } = config;
  const totalWidth = gridSize * pieceSize;
  const totalHeight = gridSize * pieceSize;
  
  let svg = `<svg width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;
  
  // Add the full image as background
  svg += `<image href="${image}" x="0" y="0" width="${totalWidth}" height="${totalHeight}" preserveAspectRatio="none"/>`;
  
  // Add mask for each piece
  for (let i = 0; i < gridSize * gridSize; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const piecePath = generateJigsawPiece(row, col, config);
    
    svg += `<defs><mask id="mask-${i}"><path d="${piecePath}" fill="white"/></mask></defs>`;
  }
  
  svg += '</svg>';
  return svg;
}

// Generate all jigsaw pieces for a puzzle
export function generateJigsawPieces(
  image: string,
  config: JigsawConfig
): JigsawPiece[] {
  const pieces: JigsawPiece[] = [];
  const totalPieces = config.gridSize * config.gridSize;
  
  for (let i = 0; i < totalPieces; i++) {
    const row = Math.floor(i / config.gridSize);
    const col = i % config.gridSize;
    
    // Calculate correct grid position
    const correctX = col * config.pieceSize;
    const correctY = row * config.pieceSize;
    
    // Random scattered position on the board
    const randomX = Math.random() * (400 - config.pieceSize);
    const randomY = Math.random() * (300 - config.pieceSize);
    
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
    });
  }
  
  return pieces;
}

// Create SVG clip path for a jigsaw piece
export function createJigsawClipPath(
  pieceId: number, 
  svgPath: string
): string {
  return `
    <defs>
      <clipPath id="jigsaw-piece-${pieceId}">
        <path d="${svgPath}" />
      </clipPath>
    </defs>
  `;
}

// Check if a piece is in the correct position with proper collision detection
export function isPieceInCorrectPosition(
  piece: JigsawPiece,
  config: JigsawConfig,
  tolerance: number = 30
): boolean {
  const row = Math.floor(piece.correctIndex / config.gridSize);
  const col = piece.correctIndex % config.gridSize;
  
  // Calculate correct position (center of the piece)
  const correctX = col * config.pieceSize + config.pieceSize / 2;
  const correctY = row * config.pieceSize + config.pieceSize / 2;
  
  // Calculate current position (center of the piece)
  const currentX = piece.currentPosition.x + piece.bounds.width / 2;
  const currentY = piece.currentPosition.y + piece.bounds.height / 2;
  
  // Calculate distance between centers
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

// Generate the complete SVG for all pieces
export function generateJigsawSVG(
  pieces: JigsawPiece[],
  config: JigsawConfig
): string {
  const defs = pieces.map(piece => 
    `<clipPath id="jigsaw-piece-${piece.id}">
      <path d="${piece.svgPath}" />
    </clipPath>`
  ).join('\n');
  
  return `
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        ${defs}
      </defs>
    </svg>
  `;
}
