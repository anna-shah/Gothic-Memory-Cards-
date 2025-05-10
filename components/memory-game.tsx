"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skull, Hourglass } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotification } from "./notification-provider"

// Gothic themed concepts
const cardTypes = [
  { name: "Raven", symbol: "𝕽" },
  { name: "Skull", symbol: "𝕾" },
  { name: "Candle", symbol: "ℭ" },
  { name: "Coffin", symbol: "𝕮" },
  { name: "Bat", symbol: "𝕭" },
  { name: "Ghost", symbol: "𝕲" },
  { name: "Moon", symbol: "𝕸" },
  { name: "Spider", symbol: "𝕾" },
]

type CardType = {
  id: number
  content: (typeof cardTypes)[number]
  flipped: boolean
  matched: boolean
}

export default function MemoryGame() {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const { showNotification } = useNotification()

  // Initialize game
  useEffect(() => {
    initGame()
    // Load best score from localStorage
    const savedBestScore = localStorage.getItem("memoryGameBestScore")
    if (savedBestScore) {
      setBestScore(Number.parseInt(savedBestScore))
    }
  }, [])

  // Record move with serverless function
  const recordMove = async (cardId: number) => {
    try {
      const response = await fetch("/api/record-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moveCount: moves + 1, cardId }),
      })

      const data = await response.json()
      showNotification(data.message, data.functionName)
    } catch (error) {
      console.error("Error recording move:", error)
    }
  }

  // Check match with serverless function
  const checkMatch = async (firstId: number, secondId: number, isMatch: boolean) => {
    try {
      const response = await fetch("/api/check-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardIds: [firstId, secondId],
          isMatch,
        }),
      })

      const data = await response.json()
      showNotification(data.message, data.functionName)
    } catch (error) {
      console.error("Error checking match:", error)
    }
  }

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards
      const firstCard = cards.find((card) => card.id === firstId)
      const secondCard = cards.find((card) => card.id === secondId)
      const isMatch = firstCard?.content.name === secondCard?.content.name

      // Call serverless function to check match
      checkMatch(firstId, secondId, isMatch)

      if (isMatch) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card) => (card.id === firstId || card.id === secondId ? { ...card, matched: true } : card)),
        )
        setMatchedPairs((prev) => prev + 1)
        setFlippedCards([])
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) => (card.id === firstId || card.id === secondId ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])
        }, 1000)
      }

      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards])

  // Check if game is over
  useEffect(() => {
    if (matchedPairs === cardTypes.length && cards.length > 0) {
      setGameOver(true)

      // Update best score
      if (bestScore === null || moves < bestScore) {
        setBestScore(moves)
        localStorage.setItem("memoryGameBestScore", moves.toString())
      }
    }
  }, [matchedPairs, cards.length, moves, bestScore])

  const initGame = () => {
    // Create pairs of cards
    const duplicatedCards = [...cardTypes, ...cardTypes]

    // Shuffle cards
    const shuffledCards = duplicatedCards
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        flipped: false,
        matched: false,
      }))

    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameOver(false)
  }

  const handleCardClick = async (id: number) => {
    // Ignore if already two cards flipped or this card is already flipped/matched
    const clickedCard = cards.find((card) => card.id === id)
    if (flippedCards.length === 2 || clickedCard?.flipped || clickedCard?.matched || flippedCards.includes(id)) {
      return
    }

    // Record the move with serverless function
    await recordMove(id)

    // Flip the card
    setCards((prevCards) => prevCards.map((card) => (card.id === id ? { ...card, flipped: true } : card)))

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, id])
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex gap-4">
          <Badge
            variant="outline"
            className="px-3 py-1 text-base bg-black/70 border-red-900/50 text-stone-300 font-gothic"
          >
            <Skull className="h-4 w-4 mr-1 text-red-700" />
            <span className="text-red-700">†</span> Attempts: {moves}
          </Badge>

          {bestScore !== null && (
            <Badge
              variant="outline"
              className="px-3 py-1 text-base bg-black/70 border-red-900/50 text-stone-300 font-gothic"
            >
              <Hourglass className="h-4 w-4 mr-1 text-amber-700" />
              <span className="text-amber-700">†</span> Best: {bestScore}
            </Badge>
          )}
        </div>

        <Button
          onClick={initGame}
          variant="outline"
          className="flex items-center gap-2 bg-black/70 border-red-900/50 text-stone-300 hover:bg-red-950/50 hover:text-stone-200 font-gothic"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Begin Anew
        </Button>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center p-8 bg-black/80 border border-red-900/50 rounded-md mb-8 shadow-[0_0_15px_rgba(127,29,29,0.5)]"
          >
            <div className="blood-drips">
              <div className="blood-drip" style={{ left: "20%" }}></div>
              <div className="blood-drip" style={{ left: "50%", animationDelay: "1s" }}></div>
              <div className="blood-drip" style={{ left: "80%", animationDelay: "2s" }}></div>
            </div>
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <h2 className="text-3xl font-bold mb-2 text-red-700 font-gothic tracking-wider">
                <span className="text-red-700">†</span> The Veil Has Lifted <span className="text-red-700">†</span>
              </h2>
              <p className="mb-4 text-stone-400 font-gothic">
                You have completed your journey in <span className="font-bold text-red-700">{moves}</span> attempts.
                {bestScore === moves && (
                  <span className="block mt-1 text-amber-700">A new record etched in blood.</span>
                )}
              </p>
              <Button
                onClick={initGame}
                className="bg-red-900/80 hover:bg-red-800 text-stone-200 shadow-md border-red-950 font-gothic tracking-wide"
              >
                Begin Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`aspect-square cursor-pointer overflow-hidden transition-all duration-300 transform ${
                card.matched ? "opacity-70" : "opacity-100"
              } hover:shadow-[0_0_10px_rgba(127,29,29,0.5)] bg-transparent border-red-900/30`}
              onClick={() => handleCardClick(card.id)}
              style={{ perspective: "1000px" }}
            >
              <div
                className={`relative w-full h-full transition-all duration-500 transform-gpu ${
                  card.flipped || card.matched ? "rotate-y-180" : ""
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Card Back */}
                <div
                  className={`absolute w-full h-full flex items-center justify-center bg-[url('/card-back.png')] bg-cover bg-center backface-hidden ${
                    card.flipped || card.matched ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 to-black/60 backdrop-blur-sm"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="pentagram">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-red-800 opacity-80"
                      >
                        <path
                          d="M50 5L61.7 38.3H96.6L68.5 59.3L80.1 92.7L50 72.5L19.9 92.7L31.5 59.3L3.4 38.3H38.3L50 5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card Front */}
                <div
                  className={`absolute w-full h-full flex items-center justify-center bg-[url('/card-front.png')] bg-cover bg-center backface-hidden rotate-y-180 ${
                    card.flipped || card.matched ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]"></div>
                  <div className="absolute inset-2 border border-red-900/30 rounded-sm"></div>
                  <div className="absolute inset-4 border border-red-900/20 rounded-sm"></div>

                  {/* Ornate corners */}
                  <div className="absolute top-1 left-1 w-6 h-6 border-t border-l border-red-900/50"></div>
                  <div className="absolute top-1 right-1 w-6 h-6 border-t border-r border-red-900/50"></div>
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-b border-l border-red-900/50"></div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 border-b border-r border-red-900/50"></div>

                  <div className="relative z-10 text-stone-200 p-2 flex flex-col items-center justify-center w-full h-full">
                    <div className="gothic-card-content">
                      <div className="symbol text-4xl md:text-5xl font-gothic text-red-700 mb-2 card-symbol">
                        {card.content.symbol}
                      </div>
                      <div className="name text-xs uppercase tracking-widest font-gothic text-stone-300 card-name">
                        {card.content.name}
                      </div>
                    </div>
                  </div>

                  {/* Blood drip for matched cards */}
                  {card.matched && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-0 bg-red-800 blood-drip-card"></div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-stone-500 bg-black/70 border border-red-900/30 p-3 rounded-md font-gothic tracking-wide">
        <span className="text-red-700">†</span> Uncover all {cardTypes.length} matching pairs to complete the ritual{" "}
        <span className="text-red-700">†</span>
      </div>

      {/* Candle flicker effect */}
      <div className="candle-container">
        <div className="candle-light"></div>
      </div>
    </div>
  )
}
