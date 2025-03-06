import { useState, useRef } from "react";
import Head from "next/head";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import DrawingCanvas, { DrawingCanvasRef } from "@/components/DrawingCanvas";
import { useRouter } from "next/router";
import { API_BASE_URL } from "@/config";
import { BackgroundLines } from "@/components/ui/background-lines";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

export default function Questions() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<(boolean | null)[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [confirmations, setConfirmations] = useState<(boolean | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = ["sin(2θ) = ?", "cos(2θ) = ?", "tan(2θ) = ?"];
  // const questions = ["3x - 5a = 10a", "x^2 = 9a^2", "e^x = a"];

  const handleImageCapture = async (imageData: string) => {
    const currentIndex = questionIndex;

    // Store the answer immediately with a null correctness value
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = imageData;
      return newAnswers;
    });

    setCorrectAnswers(prev => {
      const newCorrectAnswers = [...prev];
      newCorrectAnswers[currentIndex] = null;
      return newCorrectAnswers;
    });

    setConfirmations(prev => {
      const newConfirmations = [...prev];
      newConfirmations[currentIndex] = null;
      return newConfirmations;
    });

    // Move to next question or review page immediately
    if (currentIndex < questions.length - 1) {
      setQuestionIndex(currentIndex + 1);
      canvasRef.current?.clear();
    } else {
      setShowReview(true);
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

      // Update correctness for this question using functional updates
      setCorrectAnswers(prev => {
        const updated = [...prev];
        updated[currentIndex] = data.is_correct;
        return updated;
      });

      setConfirmations(prev => {
        const updated = [...prev];
        updated[currentIndex] = data.is_correct;
        return updated;
      });

    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleSubmit = () => {
    canvasRef.current?.submit();
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/submit-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: questions,
          answers: answers,
          is_correct: confirmations,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      router.push("/");
    } catch (error) {
      console.error("Error submitting results:", error);
      setIsSubmitting(false);
    }
  };

  const toggleConfirmation = (index: number) => {
    if (confirmations[index] === null) return;
    const newConfirmations = [...confirmations];
    newConfirmations[index] = !newConfirmations[index];
    setConfirmations(newConfirmations);
  };

  if (showReview) {
    return (
      <>
        <Head>
          <title>MathFluent - Review Answers</title>
          <meta name="description" content="Review your math answers" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <BackgroundLines className="relative">
          <div className="z-10 max-w-4xl mx-auto py-8 px-4">
            <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-600 to-white text-4xl font-sans py-10 relative z-20 font-bold tracking-tight">
              Review Your Answers
            </h2>
            <table className="w-full mb-4 bg-zinc-900/90 backdrop-blur-sm rounded-lg shadow-lg border border-zinc-800">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-100">Question</th>
                  <th className="text-left p-4 text-zinc-100">Answer</th>
                  <th className="text-left p-4 text-zinc-100">Correct</th>
                  <th className="text-left p-4 text-zinc-100">Confirm</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question, index) => (
                  <tr key={index} className="border-t border-zinc-800">
                    <td className="p-4 text-zinc-100">{question}</td>
                    <td className="p-4">
                      <img
                        src={answers[index]}
                        alt={`Answer ${index + 1}`}
                        className="w-32 h-32 object-contain bg-zinc-800/50 rounded-lg p-2"
                      />
                    </td>
                    <td className="p-4">
                      {confirmations[index] === null ? (
                        <span className="text-yellow-400">⏳</span>
                      ) : (
                        <span
                          className={
                            confirmations[index] ? "text-green-400" : "text-red-400"
                          }
                        >
                          {confirmations[index] ? "✅" : "❌"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Switch
                        id={`toggle-${index}`}
                        checked={!!confirmations[index]}
                        setChecked={(checked: boolean) => toggleConfirmation(index)}
                        disabled={isSubmitting || confirmations[index] === null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 text-center">
              <Link href="/" className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  Back to Home
                </span>
              </Link>

              <button 
                onClick={handleFinalSubmit}
                disabled={isSubmitting || confirmations.includes(null)}
                className={`relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 ml-4 ${
                  isSubmitting || confirmations.includes(null) 
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90"
                }`}
              >
                <span className={`absolute inset-[-1000%] ${
                  isSubmitting || confirmations.includes(null)
                    ? "animate-none bg-gradient-to-r from-zinc-600 to-zinc-800"
                    : "animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
                }`} />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                  {isSubmitting 
                    ? "Submitting..." 
                    : confirmations.includes(null)
                    ? "Waiting for results..."
                    : "Submit Results"}
                </span>
              </button>
            </div>
          </div>
        </BackgroundLines>
      </>
    );
  }

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
