import Head from "next/head";
import Link from "next/link";
import { Navbar } from "~/components/navbar/Navbar";
import { GameBoard } from "~/components/gameboard/GameBoard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Break Away</title>
      </Head>
      <span>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center bg-green-300">
          <GameBoard />
        </main>
      </span>
    </>
  );
}
