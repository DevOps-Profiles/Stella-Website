import { useEffect, useState } from 'react';
import NumberFlow, { NumberFlowGroup } from '@number-flow/react';

const twoDigitFormat = { minimumIntegerDigits: 2 };
const minuteSecondDigits = { 0: { max: 9 }, 1: { max: 5 } };
const hourDigits = { 0: { max: 9 }, 1: { max: 2 } };

export default function DealsCountdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      let target = new Date();
      if (endTime) {
        target = new Date(endTime);
      } else {
        target.setHours(23, 59, 59, 999);
      }
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [endTime]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <NumberFlowGroup>
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <div className="countdown-digit-box">
                <NumberFlow value={timeLeft.days} trend={-1} digits={hourDigits} format={twoDigitFormat} className="countdown-flow" />
              </div>
              <span className="countdown-label">days</span>
            </div>
            <span className="countdown-separator" aria-hidden="true">:</span>
          </>
        )}

        <div className="flex flex-col items-center">
          <div className="countdown-digit-box">
            <NumberFlow value={timeLeft.hours} trend={-1} digits={hourDigits} format={twoDigitFormat} className="countdown-flow" />
          </div>
          <span className="countdown-label">hours</span>
        </div>

        <span className="countdown-separator" aria-hidden="true">:</span>

        <div className="flex flex-col items-center">
          <div className="countdown-digit-box">
            <NumberFlow value={timeLeft.minutes} trend={-1} digits={minuteSecondDigits} format={twoDigitFormat} className="countdown-flow" />
          </div>
          <span className="countdown-label">mins</span>
        </div>

        <span className="countdown-separator" aria-hidden="true">:</span>

        <div className="flex flex-col items-center">
          <div className="countdown-digit-box countdown-digit-box--accent">
            <NumberFlow value={timeLeft.seconds} trend={-1} digits={minuteSecondDigits} format={twoDigitFormat} className="countdown-flow countdown-flow--accent" />
          </div>
          <span className="countdown-label">secs</span>
        </div>
      </NumberFlowGroup>

      <style>{`
        .countdown-digit-box {
          display: flex; align-items: center; justify-content: center;
          min-width: 3.5rem; height: 3.5rem; padding: 0 0.5rem;
          border-radius: 0.875rem; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .countdown-digit-box--accent {
          border-color: rgba(245,158,11,0.25);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 0 24px rgba(245,158,11,0.08);
        }
        .countdown-flow {
          --number-flow-mask-height: 0.2em; --number-flow-mask-width: 0.35em;
          font-family: var(--font-display); font-size: 1.75rem; font-weight: 900;
          line-height: 0.85; font-variant-numeric: tabular-nums; letter-spacing: -0.04em; color: #fff;
        }
        .countdown-flow--accent { color: #f59e0b; }
        .countdown-separator {
          margin-bottom: 1.25rem; font-family: var(--font-display);
          font-size: 1.5rem; font-weight: 900; line-height: 1; color: rgba(245,158,11,0.7);
        }
        .countdown-label {
          margin-top: 0.5rem; font-size: 0.5rem; font-weight: 900;
          text-transform: uppercase; letter-spacing: 0.3em; color: #f59e0b;
        }
      `}</style>
    </div>
  );
}
