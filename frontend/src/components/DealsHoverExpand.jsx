import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTilt } from '@/hooks/useTilt';

const AUTO_PLAY_MS = 5000;

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return String(price);
  return value.toLocaleString('en-IN');
}

function savingsPercent(price, oldPrice) {
  const current = Number(price);
  const original = Number(oldPrice);
  if (Number.isNaN(current) || Number.isNaN(original) || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

function useAnimatedPrice(target, activeKey) {
  const [display, setDisplay] = useState(() => Number(target) || 0);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = display;
    if (start === end) return undefined;

    let frame;
    const duration = 520;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, activeKey]);

  return display;
}

export default function DealsHoverExpand({ deals = [], onAddToCart, onViewProduct }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heartPop, setHeartPop] = useState(false);
  const [indicator, setIndicator] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const pickerRef = useRef(null);
  const pickRefs = useRef([]);
  const progressStartRef = useRef(performance.now());
  const progressFrameRef = useRef(null);
  const directionRef = useRef(1);

  const { ref: tiltRef, glareRef, onPointerMove, onPointerLeave } = useTilt({ maxTilt: 8, scale: 1.015 });

  const activeDeal = deals[activeIndex] ?? deals[0];
  const inStock = (activeDeal?.stock_quantity ?? 1) > 0;
  const savings = useMemo(
    () => (activeDeal ? savingsPercent(activeDeal.price, activeDeal.oldPrice) : null),
    [activeDeal],
  );
  const animatedPrice = useAnimatedPrice(activeDeal?.price, `${activeIndex}-${activeDeal?.id}`);

  const goTo = useCallback((index, dir) => {
    if (deals.length === 0) return;
    const next = ((index % deals.length) + deals.length) % deals.length;
    directionRef.current = dir;
    setDirection(dir);
    setActiveIndex(next);
    setProgress(0);
    progressStartRef.current = performance.now();
  }, [deals.length]);

  const goNext = useCallback(() => goTo(activeIndex + 1, 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1, -1), [activeIndex, goTo]);

  const updateIndicator = useCallback(() => {
    const pick = pickRefs.current[activeIndex];
    if (!pick) return;

    setIndicator({
      top: pick.offsetTop,
      left: pick.offsetLeft,
      width: pick.offsetWidth,
      height: pick.offsetHeight,
    });
  }, [activeIndex]);

  useEffect(() => {
    if (deals.length > 0 && activeIndex >= deals.length) setActiveIndex(0);
  }, [deals.length, activeIndex]);

  useEffect(() => {
    updateIndicator();
    const picker = pickerRef.current;
    if (!picker) return undefined;

    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [updateIndicator, deals.length]);

  useEffect(() => {
    const pick = pickRefs.current[activeIndex];
    const picker = pickerRef.current;
    if (!pick || !picker) return;

    const targetLeft = pick.offsetLeft - picker.clientWidth / 2 + pick.clientWidth / 2;
    picker.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, [activeIndex]);

  useEffect(() => {
    if (isPaused || deals.length <= 1) {
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
      return undefined;
    }

    progressStartRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - progressStartRef.current;
      const pct = Math.min(elapsed / AUTO_PLAY_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        goTo(activeIndex + 1, 1);
        return;
      }

      progressFrameRef.current = requestAnimationFrame(tick);
    };

    progressFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (progressFrameRef.current) cancelAnimationFrame(progressFrameRef.current);
    };
  }, [activeIndex, deals.length, goTo, isPaused]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev]);

  if (!activeDeal) return null;

  const slideClass = direction >= 0
    ? 'deals-spotlight__hero-image-wrap--right'
    : 'deals-spotlight__hero-image-wrap--left';

  return (
    <div
      className="deals-spotlight"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setProgress(0);
        progressStartRef.current = performance.now();
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="deals-spotlight__hero-wrap">
        <article
          ref={tiltRef}
          className="deals-spotlight__hero"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerUp={onPointerLeave}
          onPointerCancel={onPointerLeave}
        >
          <div className="deals-spotlight__hero-shine" aria-hidden="true" />
          <div
            ref={glareRef}
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{ opacity: 0 }}
          />

          <p className="deals-spotlight__counter" aria-live="polite">
            <span>{String(activeIndex + 1).padStart(2, '0')}</span>
            {' / '}
            {String(deals.length).padStart(2, '0')}
          </p>

          {deals.length > 1 && (
            <>
              <button
                type="button"
                className="deals-spotlight__nav deals-spotlight__nav--prev"
                aria-label="Previous deal"
                onClick={goPrev}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="deals-spotlight__nav deals-spotlight__nav--next"
                aria-label="Next deal"
                onClick={goNext}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="deals-spotlight__hero-media">
            <div className="deals-spotlight__hero-orbit" aria-hidden="true" />
            <div className="deals-spotlight__hero-ring" aria-hidden="true" />
            <div key={`${activeDeal.id}-${direction}`} className={`deals-spotlight__hero-image-wrap ${slideClass}`}>
              <img
                src={activeDeal.img}
                alt={activeDeal.name}
                className="deals-spotlight__hero-image"
                loading="lazy"
              />
            </div>
          </div>

          <div key={`body-${activeDeal.id}-${activeIndex}`} className="deals-spotlight__hero-body">
            <div className="deals-spotlight__hero-top">
              <span className="deals-spotlight__tag">{activeDeal.tag}</span>
              {savings != null && (
                <span className="deals-spotlight__savings">Save {savings}%</span>
              )}
            </div>

            <h3 className="deals-spotlight__name">{activeDeal.name}</h3>
            {activeDeal.subtitle && (
              <p className="deals-spotlight__subtitle">{activeDeal.subtitle}</p>
            )}

            <div className="deals-spotlight__prices">
              <span className="deals-spotlight__price">₹{formatPrice(animatedPrice)}</span>
              {activeDeal.oldPrice && (
                <span className="deals-spotlight__old-price">₹{formatPrice(activeDeal.oldPrice)}</span>
              )}
            </div>

            <div className="deals-spotlight__actions">
              <button
                type="button"
                className="deals-spotlight__btn deals-spotlight__btn--primary"
                disabled={!inStock}
                onClick={() => onAddToCart?.(activeDeal)}
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                type="button"
                className="deals-spotlight__btn deals-spotlight__btn--ghost"
                onClick={() => onViewProduct?.(activeDeal)}
              >
                View Details
              </button>

            </div>
          </div>

          {deals.length > 1 && !isPaused && (
            <div className="deals-spotlight__progress" aria-hidden="true">
              <div
                className="deals-spotlight__progress-fill"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          )}
        </article>
      </div>

      <div className="deals-spotlight__picker-wrap">
        <div
          ref={pickerRef}
          className="deals-spotlight__picker scrollbar-none relative"
          role="tablist"
          aria-label="Choose a deal"
        >
          {indicator.width > 0 && (
            <div
              className="deals-spotlight__picker-indicator"
              style={{
                top: indicator.top,
                left: indicator.left,
                width: indicator.width,
                height: indicator.height,
              }}
              aria-hidden="true"
            />
          )}
          {deals.map((deal, index) => {
            const isActive = index === activeIndex;
            const dealSavings = savingsPercent(deal.price, deal.oldPrice);
            return (
              <button
                key={deal.id}
                ref={(el) => { pickRefs.current[index] = el; }}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`deals-spotlight__pick ${isActive ? 'deals-spotlight__pick--active' : ''}`}
                onClick={() => goTo(index, index > activeIndex ? 1 : -1)}
              >
                <div className="deals-spotlight__pick-thumb">
                  <img src={deal.img} alt="" loading="lazy" />
                </div>
                <div className="deals-spotlight__pick-info">
                  <span className="deals-spotlight__pick-tag">{deal.tag}</span>
                  <span className="deals-spotlight__pick-name">{deal.name}</span>
                  <span className="deals-spotlight__pick-price">₹{formatPrice(deal.price)}</span>
                </div>

              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
