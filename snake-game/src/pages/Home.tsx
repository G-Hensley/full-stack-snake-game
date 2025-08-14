import Header from "../components/layout/Header";
import GameBoard from "../components/layout/GameBoard";

export default function Home() {
  return (
    <main className="bg-green-800 h-screen w-full relative flex flex-col items-center gap-8">
      <Header />
      <GameBoard />
    </main>
  );
}
