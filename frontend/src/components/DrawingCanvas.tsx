'use client';

import React from 'react';
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCapture }) => {
  const [excalidrawAPI, setExcalidrawAPI] = React.useState<ExcalidrawImperativeAPI | null>(null);

  const clearCanvas = () => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
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
          gridMode: false,
          zenMode: true
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
    <div className="flex flex-col items-center w-full max-w-3xl">
      <div className="w-[500px] h-[300px] border border-gray-300 rounded-lg bg-white">
        <Excalidraw
          theme='light'
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            appState: {
              viewBackgroundColor: '#ffffff',
              theme: 'light',
              activeTool: { type: "freedraw" },
              gridMode: false,
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