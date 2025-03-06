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

  const questions = ["sin(2θ) = ?", "cos(2θ) = ?", "tan(2θ) = ?"];
  // const questions = ["3x - 5a = 10a", "x^2 = 9a^2", "e^x = a"];

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
        <DrawingCanvas
          ref={canvasRef}
          onCapture={handleImageCapture}
          question={questions[questionIndex]}
          questionNumber={questionIndex + 1}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
