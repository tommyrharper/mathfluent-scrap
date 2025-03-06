import { useState } from 'react';
import Head from 'next/head';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import DrawingCanvas from '@/components/DrawingCanvas';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const questions = [
    'sin(2θ) = ?',
    'cos(2θ) = ?'
  ];

  const handleImageCapture = async (imageData: string) => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting answer...");
      // For testing purposes, simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In production, would call real API:
      // const response = await fetch('/api/check-answer', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ image: imageData }),
      // });
      // const data = await response.json();
      
      // Move to next question or show completion
      if (questionIndex < questions.length - 1) {
        setQuestionIndex(questionIndex + 1);
      } else {
        // Show completion message
        alert('Quiz completed! All answers submitted.');
        setQuestionIndex(0);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>MathFluent</title>
        <meta name="description" content="A responsive math learning application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">MathFluent</h1>
        
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-2">Question {questionIndex + 1}</h2>
          
          <div className="text-3xl mb-8 flex justify-center">
            <InlineMath math={questions[questionIndex]} />
          </div>
          
          <p className="mb-4 text-gray-600">Draw your answer below:</p>
          
          <DrawingCanvas onCapture={handleImageCapture} />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Write your answer as clearly as possible.</p>
        </div>
      </main>
    </>
  );
} 