import Head from "next/head";
import { useRouter } from "next/router";
import { API_BASE_URL } from "@/config";
import { BackgroundLines } from "@/components/ui/background-lines";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useAnswerStore } from "@/store/useAnswerStore";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function Review() {
  const router = useRouter();
  const { 
    questions,
    answers,
    confirmations,
    analyses,
    isSubmitting,
    toggleConfirmation,
    setIsSubmitting
  } = useAnswerStore();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/submit-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions,
          answers,
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

  if (!questions.length) {
    router.push("/questions");
    return null;
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
        <div className="z-10 max-w-5xl mx-auto py-8 px-4">
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
                <th className="text-left p-4 text-zinc-100">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question, index) => (
                <tr key={index} className="border-t border-zinc-800">
                  <td className="p-4 text-zinc-100">
                    <InlineMath math={question} />
                  </td>
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
                      setChecked={() => toggleConfirmation(index)}
                      disabled={isSubmitting || confirmations[index] === null}
                    />
                  </td>
                  <td className="p-4 text-zinc-100">
                    {analyses[index] === null ? (
                      <span className="text-yellow-400">Waiting...</span>
                    ) : (
                      <div className="max-w-xs overflow-auto text-sm">
                        {analyses[index]}
                      </div>
                    )}
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
              onClick={handleSubmit}
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