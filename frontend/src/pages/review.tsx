import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { API_BASE_URL } from "@/config";

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

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Review Your Answers</h1>
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th className="text-left p-2">Question</th>
              <th className="text-left p-2">Answer</th>
              <th className="text-left p-2">Correct</th>
              <th className="text-left p-2">Confirm</th>
            </tr>
          </thead>
          <tbody>
            {reviewData.questions.map((question, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{question}</td>
                <td className="p-2">
                  <img
                    src={reviewData.answers[index]}
                    alt={`Answer ${index + 1}`}
                    className="w-24 h-24 object-contain"
                  />
                </td>
                <td className="p-2">
                  <span
                    className={
                      confirmations[index] ? "text-green-600" : "text-red-600"
                    }
                  >
                    {confirmations[index] ? "✓" : "✗"}
                  </span>
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={confirmations[index]}
                    onChange={() => toggleConfirmation(index)}
                    className="w-4 h-4"
                    disabled={isSubmitting}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`${
            isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded transition-colors`}
        >
          {isSubmitting ? "Submitting..." : "Submit Results"}
        </button>
      </div>
    </>
  );
}
