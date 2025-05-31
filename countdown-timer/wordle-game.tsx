"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TARGET_WORD = "SUSANA"
const MAX_ATTEMPTS = 6
const WORD_LENGTH = 6

type LetterState = "correct" | "present" | "absent" | "empty"

interface Letter {
  char: string
  state: LetterState
}

export default function WordleGame() {
  const [attempts, setAttempts] = useState<Letter[][]>(
    Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() =>
        Array(WORD_LENGTH)
          .fill(null)
          .map(() => ({ char: "", state: "empty" })),
      ),
  )
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [currentInput, setCurrentInput] = useState("")
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [timer, setTimer] = useState(0)

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Agregar después del useEffect del timer
  useEffect(() => {
    if (gameStatus === "won") {
      const audio = new Audio("/audio/victory-sound.mp3")
      audio.volume = 0.5 // Ajustar volumen al 50%
      audio.play().catch((error) => {
        console.log("Error playing audio:", error)
      })
    }
  }, [gameStatus])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const checkWord = useCallback((word: string): Letter[] => {
    const result: Letter[] = []
    const targetArray = TARGET_WORD.split("")
    const wordArray = word.toUpperCase().split("")

    // First pass: mark correct positions
    const targetCounts: { [key: string]: number } = {}
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (wordArray[i] === targetArray[i]) {
        result[i] = { char: wordArray[i], state: "correct" }
      } else {
        result[i] = { char: wordArray[i], state: "absent" }
        targetCounts[targetArray[i]] = (targetCounts[targetArray[i]] || 0) + 1
      }
    }

    // Second pass: mark present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i].state === "absent") {
        if (targetCounts[wordArray[i]] > 0) {
          result[i].state = "present"
          targetCounts[wordArray[i]]--
        }
      }
    }

    return result
  }, [])

  const submitGuess = () => {
    if (currentInput.length !== WORD_LENGTH || gameStatus !== "playing") return

    const checkedWord = checkWord(currentInput)
    const newAttempts = [...attempts]
    newAttempts[currentAttempt] = checkedWord
    setAttempts(newAttempts)

    // Check if word is correct
    if (currentInput.toUpperCase() === TARGET_WORD) {
      setGameStatus("won")
    } else if (currentAttempt === MAX_ATTEMPTS - 1) {
      setGameStatus("lost")
    } else {
      setCurrentAttempt((prev) => prev + 1)
    }

    setCurrentInput("")
  }

  const resetGame = () => {
    setAttempts(
      Array(MAX_ATTEMPTS)
        .fill(null)
        .map(() =>
          Array(WORD_LENGTH)
            .fill(null)
            .map(() => ({ char: "", state: "empty" })),
        ),
    )
    setCurrentAttempt(0)
    setCurrentInput("")
    setGameStatus("playing")
    setTimer(0)
  }

  const getLetterColor = (state: LetterState) => {
    switch (state) {
      case "correct":
        return "bg-green-500 text-white"
      case "present":
        return "bg-yellow-500 text-white"
      case "absent":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-200 border-2 border-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">WORDLE</CardTitle>
          <div className="space-y-2">
            <div className="text-lg font-semibold">Tiempo: {formatTime(timer)}</div>
            <div className="text-sm text-gray-600">31 de mayo - hoy toca el LAMPA</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Game Grid */}
          <div className="grid gap-2">
            {attempts.map((attempt, attemptIndex) => (
              <div key={attemptIndex} className="grid grid-cols-6 gap-2">
                {attempt.map((letter, letterIndex) => (
                  <div
                    key={letterIndex}
                    className={`
                      w-12 h-12 flex items-center justify-center text-lg font-bold rounded
                      ${getLetterColor(letter.state)}
                    `}
                  >
                    {letter.char}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Input Section */}
          {gameStatus === "playing" && (
            <div className="space-y-3">
              <Input
                value={currentInput}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase()
                  if (value.length <= WORD_LENGTH && /^[A-Z]*$/.test(value)) {
                    setCurrentInput(value)
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    submitGuess()
                  }
                }}
                placeholder="Escribe tu palabra..."
                className="text-center text-lg font-semibold"
                maxLength={WORD_LENGTH}
              />
              <Button onClick={submitGuess} disabled={currentInput.length !== WORD_LENGTH} className="w-full">
                Enviar ({currentInput.length}/{WORD_LENGTH})
              </Button>
            </div>
          )}

          {/* Game Status */}
          {gameStatus !== "playing" && (
            <div className="text-center space-y-3">
              {gameStatus === "won" ? (
                <div className="text-green-600 font-bold text-xl">¡Felicidades! 🎉</div>
              ) : (
                <div className="text-red-600 font-bold text-xl">La palabra era: {TARGET_WORD}</div>
              )}
              <Button onClick={resetGame} className="w-full">
                Jugar de nuevo
              </Button>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Letra correcta en posición correcta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Letra correcta en posición incorrecta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Letra no está en la palabra</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
