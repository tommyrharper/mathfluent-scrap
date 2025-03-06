import { useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ReviewProps {
  questions: string[];
  answers: string[];
  isCorrect: boolean[];
}

export default function Review() {
  const router = useRouter();
  const { questions, answers, isCorrect } = router.query as unknown as ReviewProps;
  const [confirmations, setConfirmations] = useState<boolean[]>(isCorrect || []);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          answers,
          is_correct: confirmations
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting results:', error);
    }
  };

  const handlePlayAgain = () => {
    router.push('/');
  };

  const toggleConfirmation = (index: number) => {
    const newConfirmations = [...confirmations];
    newConfirmations[index] = !newConfirmations[index];
    setConfirmations(newConfirmations);
  };

  return (
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
          {questions?.map((question, index) => (
            <tr key={index}>
              <td className="p-2">{question}</td>
              <td className="p-2">
                <img src={answers[index]} alt={`Answer ${index + 1}`} className="w-24 h-24 object-contain" />
              </td>
              <td className="p-2">{confirmations[index] ? '✓' : '✗'}</td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={confirmations[index]}
                  onChange={() => toggleConfirmation(index)}
                  className="w-4 h-4"
                  disabled={isSubmitted}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit Results
        </button>
      ) : (
        <button
          onClick={handlePlayAgain}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Play Again
        </button>
      )}
    </div>
  );
} 