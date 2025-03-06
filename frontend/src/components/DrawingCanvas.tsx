"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { Excalidraw, MainMenu, exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { InlineMath } from "react-katex";
import { useRouter } from "next/router";

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
    const router = useRouter();
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
          theme="dark"
          excalidrawAPI={(api) => {
            setExcalidrawAPI(api);
            api.setActiveTool({ 
              type: "freedraw"
            });
          }}
          initialData={{
            appState: {
              viewBackgroundColor: "#ffffff",
              theme: "dark",
              currentItemStrokeColor: "#000000",
              currentItemStrokeWidth: 2,
              activeTool: { 
                type: "freedraw"
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
          <MainMenu>
            <MainMenu.Item onSelect={() => router.push("/")}>
              Back to Home
            </MainMenu.Item>
          </MainMenu>
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border border-zinc-800">
            <h2 className="text-xl font-semibold text-center text-zinc-100">
              {/* Solve for x: Question {questionNumber} */}
              Question {questionNumber}
            </h2>
            <div className="text-2xl mt-2 text-zinc-100">
              <InlineMath math={question} />
            </div>
            <div className="flex mt-4 space-x-4 justify-center">
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-zinc-800 text-zinc-100 rounded-md hover:bg-zinc-700 transition-colors"
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button
                onClick={handleCapture}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
