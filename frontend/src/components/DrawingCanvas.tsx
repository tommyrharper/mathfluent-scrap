"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { Excalidraw, MainMenu, exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { InlineMath } from "react-katex";

interface DrawingCanvasProps {
  onCapture: (imageData: string) => void;
  onClear?: () => void;
  question: string;
  questionNumber: number;
  isSubmitting: boolean;
}

export interface DrawingCanvasRef {
  submit: () => void;
  clear: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ onCapture, onClear, question, questionNumber, isSubmitting }, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] =
      React.useState<ExcalidrawImperativeAPI | null>(null);

    useImperativeHandle(ref, () => ({
      submit: handleCapture,
      clear: clearCanvas,
    }));

    const clearCanvas = () => {
      if (excalidrawAPI) {
        excalidrawAPI.resetScene();
        excalidrawAPI.setActiveTool({ type: "freedraw" });
        onClear?.();
      }
    };

    const handleCapture = async () => {
      if (excalidrawAPI) {
        const elements = excalidrawAPI.getSceneElements();
        const blob = await exportToBlob({
          elements,
          files: null,
          mimeType: "image/png",
          appState: {
            exportWithDarkMode: false,
            exportBackground: true,
            viewBackgroundColor: "#ffffff",
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
          theme="light"
          excalidrawAPI={(api) => {
            setExcalidrawAPI(api);
            api.setActiveTool({ 
              type: "freedraw", 
              locked: true
            });
          }}
          initialData={{
            appState: {
              viewBackgroundColor: "#ffffff",
              theme: "light",
              currentItemStrokeColor: "#000000",
              currentItemStrokeWidth: 2,
              activeTool: { 
                type: "freedraw", 
                locked: true
              },
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
            },
          }}
        >
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-center">
              Question {questionNumber}
            </h2>
            <div className="text-2xl mt-2">
              <InlineMath math={question} />
            </div>
            <div className="flex mt-4 space-x-4 justify-center">
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button
                onClick={handleCapture}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </Excalidraw>
      </div>
    );
  }
);

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
