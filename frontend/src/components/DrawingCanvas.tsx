'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
  onClear?: () => void;
}

export interface DrawingCanvasRef {
  submit: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ onCapture, onClear }, ref) => {
  const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);

  useImperativeHandle(ref, () => ({
    submit: handleCapture
  }));

  const clearCanvas = () => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
      onClear?.();
    }
  };

  const handleCapture = async () => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      const blob = await exportToBlob({
        elements,
        files: null,
        mimeType: 'image/png',
        appState: {
          exportWithDarkMode: false,
          exportBackground: true,
          viewBackgroundColor: '#ffffff',
        },
      });
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onCapture(base64data);
        clearCanvas();
      };
    }
  };

  return (
    <div className="fixed inset-0">
      <Excalidraw
        theme='light'
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          appState: {
            viewBackgroundColor: '#ffffff',
            theme: 'light',
            activeTool: { type: "freedraw", customType: null, locked: false, lastActiveTool: null },
            zenMode: true
          },
        }}
        UIOptions={{
          tools: {
            image: false,
          },
          canvasActions: {
            export: false,
            loadScene: false,
            saveAsImage: false,
            saveToActiveFile: false,
            toggleTheme: false,
            clearCanvas: false,
          }
        }}
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas; 