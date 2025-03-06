import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import "katex/dist/katex.min.css";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { useRouter } from "next/router";
import { API_BASE_URL } from "@/config";
import { useAnswerStore } from "@/store/useAnswerStore";

export default function Questions() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  const questions = ["sin(2θ) = ?", "cos(2θ) = ?", "tan(2θ) = ?"];
  const { setAnswer, setCorrectAnswer, initializeStore } = useAnswerStore();

  useEffect(() => {
    initializeStore(questions);
  }, []);

  const handleImageCapture = async (imageData: string) => {
    const currentIndex = questionIndex;

    // Store the answer immediately
    setAnswer(currentIndex, imageData);

    // Move to next question or review page immediately
    if (currentIndex < questions.length - 1) {
      setQuestionIndex(currentIndex + 1);
      canvasRef.current?.clear();
    } else {
      router.push("/review");
    }

    // Check answer asynchronously
    try {
      const response = await fetch(`${API_BASE_URL}/check-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageData,
          question: questions[currentIndex],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      // Update correctness for this question
      setCorrectAnswer(currentIndex, data.is_correct);
    } catch (error) {
      console.error("Error submitting answer:", error);
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
        />
      </div>
    </>
  );
}
