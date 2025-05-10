import MemoryGame from "@/components/memory-game"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-black bg-[url('/bg-texture.png')] bg-repeat bg-opacity-80">
      <div className="z-10 max-w-5xl w-full items-center justify-center flex flex-col">
        <div className="ornate-title mb-2">
          <div className="ornate-line"></div>
          <h1 className="font-gothic text-6xl font-bold text-center text-red-800 dark:text-red-700 tracking-wider relative">
            <span className="text-red-700 absolute -left-8 top-1/2 transform -translate-y-1/2">†</span>
            Memento Mori
            <span className="text-red-700 absolute -right-8 top-1/2 transform -translate-y-1/2">†</span>
          </h1>
          <div className="ornate-line"></div>
        </div>

        <div className="w-64 h-1 bg-gradient-to-r from-transparent via-red-800 to-transparent mb-6"></div>

        <p className="text-center mb-8 max-w-md text-stone-400 font-gothic tracking-wide">
          Unearth the matching pairs from beyond the veil. Each choice brings you closer to the other side.
        </p>

        <MemoryGame />
      </div>
    </main>
  )
}
