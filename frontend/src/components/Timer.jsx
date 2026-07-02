import { useEffect, useState } from "react";
import "./Timer.css";

function Timer({ currentQuestion, onTimeUp }) {
  const TOTAL_TIME = 120;

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  useEffect(() => {
    setTimeLeft(TOTAL_TIME);
  }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="timer-container">

      <h2
        className={
          timeLeft <= 30
            ? "timer danger"
            : "timer"
        }
      >
        ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
      </h2>

      {timeLeft <= 30 && (
        <p className="warning">
          ⚠ Hurry! Less than 30 seconds remaining.
        </p>
      )}

    </div>
  );
}

export default Timer;