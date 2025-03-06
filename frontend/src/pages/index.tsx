import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>MathFluent</title>
        <meta
          name="description"
          content="A responsive math learning application"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">MathFluent</h1>
        <div className="text-center">
          <button
            onClick={() => router.push("/questions")}
            className="bg-blue-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all"
          >
            Practice Trig Identities
          </button>
        </div>
      </main>
    </>
  );
}
