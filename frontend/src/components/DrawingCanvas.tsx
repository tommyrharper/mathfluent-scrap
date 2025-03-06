'use client';

import React, { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // Set line style
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        
        // Fill with white background initially
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        setCtx(context);
      }
    }
  }, []);

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (ctx) {
      ctx.beginPath();
      
      // Get coordinates based on event type
      const coordinates = getCoordinates(e);
      if (coordinates) {
        ctx.moveTo(coordinates.x, coordinates.y);
      }
    }
  };

  // Continue drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    // Prevent scrolling when drawing on touch devices
    e.preventDefault();
    
    // Get coordinates based on event type
    const coordinates = getCoordinates(e);
    if (coordinates) {
      ctx.lineTo(coordinates.x, coordinates.y);
      ctx.stroke();
    }
  };

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) {
      ctx.closePath();
    }
  };

  // Helper to get coordinates from different event types
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    // Check if it's a touch event
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      // Fill with white instead of clearing to transparent
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Capture canvas content as image
  const handleCapture = () => {
    if (canvasRef.current && ctx) {
      const imageData = canvasRef.current.toDataURL('image/png');
      onCapture(imageData);
      clearCanvas();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="border border-gray-300 rounded-lg bg-white touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex mt-4 space-x-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Clear
        </button>
        <button
          onClick={handleCapture}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas; 