import { useState, useRef } from "react";
import Head from "next/head";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { useRouter } from "next/router";
import { API_BASE_URL } from "@/config";

export default function Questions() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);

  const questions = ["sin(2θ) = ?", "cos(2θ) = ?"];

  const handleImageCapture = async (imageData: string) => {
    setIsSubmitting(true);

    try {
      console.log("Submitting answer to backend...");

      const response = await fetch(`${API_BASE_URL}/check-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          question: questions[questionIndex],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      // Store answer and correctness from API response
      const newAnswers = [...answers, imageData];
      const newCorrectAnswers = [...correctAnswers, data.is_correct];

      setAnswers(newAnswers);
      setCorrectAnswers(newCorrectAnswers);

      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
        // Only clear canvas when moving to next question
        canvasRef.current?.clear();
      } else {
        // For the final question, navigate immediately without clearing
        router.push({
          pathname: "/review",
          query: {
            questions: questions,
            answers: newAnswers,
            isCorrect: newCorrectAnswers,
          },
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearCanvas = () => {
    // Implementation of clearCanvas function
  };

  const handleSubmit = () => {
    if (!isSubmitting) {
      canvasRef.current?.submit();
    }
  };

  return (
    <>
      <Head>
        <title>MathFluent - Practice</title>
        <meta name="description" content="Practice math problems" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative h-screen w-screen">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-center">
            Question {questionIndex + 1}
          </h2>
          <div className="text-2xl mt-2">
            <InlineMath math={questions[questionIndex]} />
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
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
        <DrawingCanvas
          ref={canvasRef}
          onCapture={handleImageCapture}
          onClear={clearCanvas}
        />
      </div>
    </>
  );
}
