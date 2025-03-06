import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { API_BASE_URL } from "@/config";
import { BackgroundLines } from "@/components/ui/background-lines";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

interface ReviewProps {
  questions: string[];
  answers: string[];
  isCorrect: boolean[];
}

export default function Review() {
  const router = useRouter();
  const [reviewData, setReviewData] = useState<ReviewProps | null>(null);
  const [confirmations, setConfirmations] = useState<boolean[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse query parameters when they're available
  useEffect(() => {
    if (router.isReady) {
      const { questions, answers, isCorrect } = router.query;

      // Convert query parameters to proper types
      const parsedData: ReviewProps = {
        questions: Array.isArray(questions) ? questions : [questions as string],
        answers: Array.isArray(answers) ? answers : [answers as string],
        isCorrect: Array.isArray(isCorrect)
          ? isCorrect.map((val) => val === "true")
          : [isCorrect === "true"],
      };

      setReviewData(parsedData);
      setConfirmations(parsedData.isCorrect);
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async () => {
    if (isSubmitting || !reviewData) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/submit-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: reviewData.questions,
          answers: reviewData.answers,
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
    const newConfirmations = [...confirmations];
    newConfirmations[index] = !newConfirmations[index];
    setConfirmations(newConfirmations);
  };

  if (!router.isReady || !reviewData) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

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
              {reviewData.questions.map((question, index) => (
                <tr key={index} className="border-t border-zinc-800">
                  <td className="p-4 text-zinc-100">{question}</td>
                  <td className="p-4">
                    <img
                      src={reviewData.answers[index]}
                      alt={`Answer ${index + 1}`}
                      className="w-32 h-32 object-contain bg-zinc-800/50 rounded-lg p-2"
                    />
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        confirmations[index] ? "text-green-400" : "text-red-400"
                      }
                    >
                      {confirmations[index] ? "✅" : "❌"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Switch
                      id={`toggle-${index}`}
                      checked={confirmations[index]}
                      setChecked={(checked: boolean) => toggleConfirmation(index)}
                      disabled={isSubmitting}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 text-center">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                {isSubmitting ? "Submitting..." : "Submit Results"}
              </span>
            </button>

            <Link href="/" className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 ml-4">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Back to Home
              </span>
            </Link>
          </div>
        </div>
      </BackgroundLines>
    </>
  );
}
