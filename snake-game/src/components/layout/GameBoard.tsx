// Game board component for the Snake Game
import { useState, useEffect, useCallback, useRef } from 'react';

// Constants for the game board
const BOARD_SIZE = 36;
const CELL_SIZE = 20;
const CANVAS_WIDTH = BOARD_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = BOARD_SIZE * CELL_SIZE;

// Type for representing a position on the game board
type Position = {
  x: number;
  y: number;
};

export default function GameBoard() {
  // Ref for the canvas element to draw the game
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Ref for the game state to persist across renders
  const gameStateRef = useRef({
    isGameRunning: true,
    score: 0,
    snake: [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
    ] as Position[],
    food: { x: 15, y: 15 } as Position,
    direction: 'right' as 'up' | 'down' | 'left' | 'right',
    lastMoveTime: 0,
    lastRenderTime: 0  // Add this for FPS limiting
  });

  // Only use state for UI elements that need to trigger re-renders
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(true);

  // Keyboard input handling
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const gameState = gameStateRef.current;
    
    if (!gameState.isGameRunning && event.code === 'Space') {
      // Restart game
      gameState.isGameRunning = true;
      gameState.snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
      ];
      gameState.direction = 'right';
      gameState.score = 0;
      setIsGameRunning(true);
      setScore(0);
      return;
    }

    if (!gameState.isGameRunning) return;

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        if (gameState.direction !== 'down') gameState.direction = 'up';
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (gameState.direction !== 'up') gameState.direction = 'down';
        break;
      case 'ArrowLeft':
      case 'KeyA':
        if (gameState.direction !== 'right') gameState.direction = 'left';
        break;
      case 'ArrowRight':
      case 'KeyD':
        if (gameState.direction !== 'left') gameState.direction = 'right';
        break;
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Function to create food in a random empty cell
  const createFood = useCallback((currentSnake: Position[]) => {
    const emptyCells: Position[] = [];
    
    // Find all empty positions
    for (let x = 0; x < BOARD_SIZE; x++) {
      for (let y = 0; y < BOARD_SIZE; y++) {
        const isEmpty = !currentSnake.some(seg => seg.x === x && seg.y === y);
        if (isEmpty) {
          emptyCells.push({ x, y });
        }
      }
    }

    // Pick a random empty position
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const newFood = emptyCells[randomIndex];
      console.log('Creating food at:', newFood); // Debug log
      gameStateRef.current.food = newFood;
    } else {
      console.log('No empty cells for food!'); // Debug log
    }
  }, []); // No dependencies

  // Game loop function
  const gameLoop = useCallback((currentTime: number) => {
    const gameState = gameStateRef.current;
    
    if (gameState.isGameRunning && currentTime - gameState.lastMoveTime >= 90) { // 150ms between moves (slower)
      const newSnake = [...gameState.snake];
      const head = { ...newSnake[0] };

      // Update head position based on direction
      switch (gameState.direction) {
        case 'up':
          head.y -= 1;
          break;
        case 'down':
          head.y += 1;
          break;
        case 'left':
          head.x -= 1;
          break;
        case 'right':
          head.x += 1;
          break;
      }

      // Check for wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        gameState.isGameRunning = false;
        setIsGameRunning(false);
        return;
      }

      // Check for self collision
      const hasCollision = newSnake.some(segment => segment.x === head.x && segment.y === head.y);
      if (hasCollision) {
        gameState.isGameRunning = false;
        setIsGameRunning(false);
        return;
      }

      newSnake.unshift(head);

      // Check if food was eaten
      if (head.x === gameState.food.x && head.y === gameState.food.y) {
        // Don't remove tail (snake grows)
        gameState.score += 10;
        setScore(gameState.score);
        createFood(newSnake);
      } else {
        // Remove tail (normal movement)
        newSnake.pop();
      }

      gameState.snake = newSnake;
      gameState.lastMoveTime = currentTime;
    }
    
    // Continue the animation loop
    requestAnimationFrame(gameLoop);
  }, [createFood]);

  // Canvas rendering function
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameState = gameStateRef.current;

    // Clear the canvas
    ctx.fillStyle = '#15803d'; // Green background (bg-green-700)
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head - slightly different color
        ctx.fillStyle = gameState.isGameRunning ? '#4ade80' : '#6b7280'; // Green-400 or gray when dead
      } else {
        // Snake body
        ctx.fillStyle = gameState.isGameRunning ? '#22c55e' : '#9ca3af'; // Green-500 or gray when dead
      }
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    });

    // Draw food - make it more visible
    ctx.fillStyle = '#dc2626'; // Red-600 (darker red)
    const foodPixelX = gameState.food.x * CELL_SIZE;
    const foodPixelY = gameState.food.y * CELL_SIZE;
    console.log('Drawing food at pixels:', foodPixelX, foodPixelY, 'grid:', gameState.food.x, gameState.food.y); // Debug log
    
    // Draw food as a circle to make it more distinct
    ctx.beginPath();
    ctx.arc(foodPixelX + CELL_SIZE/2, foodPixelY + CELL_SIZE/2, CELL_SIZE/3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw game over text
    if (!gameState.isGameRunning) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
      ctx.font = '16px Arial';
      ctx.fillText('Press SPACE to restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
  }, []);

  // Animation loop for rendering with FPS limit
  const renderLoop = useCallback((currentTime: number) => {
    const gameState = gameStateRef.current;
    const targetFPS = 60; // Change this to set your desired FPS (30 = 30 FPS, 15 = 15 FPS, etc.)
    const frameInterval = 1000 / targetFPS; // milliseconds per frame
    
    if (currentTime - gameState.lastRenderTime >= frameInterval) {
      drawGame();
      gameState.lastRenderTime = currentTime;
    }
    
    requestAnimationFrame(renderLoop);
  }, [drawGame]);

  // Re-render whenever snake or food changes
  useEffect(() => {
    // Start the game loop
    requestAnimationFrame(gameLoop);
    // Start the render loop
    requestAnimationFrame(renderLoop);
  }, [gameLoop, renderLoop]);

  // Initialize food when component mounts
  useEffect(() => {
    // Create initial food with the initial snake position
    createFood(gameStateRef.current.snake);
  }, [createFood]); // Only depend on createFood function

  useEffect(() => {
    // No longer need interval - using requestAnimationFrame instead
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className='bg-green-900 border-2 border-black'
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      <div className="text-white text-sm">
        {isGameRunning 
          ? "Use WASD or Arrow Keys to move" 
          : "Press SPACE to restart"
        }
      </div>
    </div>
  );

}