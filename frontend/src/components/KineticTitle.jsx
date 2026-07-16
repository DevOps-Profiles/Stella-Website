import { useEffect, useRef } from 'react';

const STAGGER_MS = 80;

function wordSpan(text, key) {
  const span = document.createElement('span');
  span.dataset.word = '';
  span.className = 'inline-block';
  span.style.perspective = '400px';
  span.style.display = 'inline-block';
  span.textContent = text;
  return span;
}

/**
 * Wraps every word in a data-word span for 3D flip animation.
 * Works on any DOM subtree without JSX cloning bugs.
 */
function wrapWords(el) {
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text) return;
      const parts = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (part.trim() === '') {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.setAttribute('data-word', '');
          span.className = 'inline-block';
          span.style.perspective = '400px';
          span.textContent = part;
          // Preserve Tailwind gradient-text styling (e.g. `text-transparent` + `bg-clip-text`)
          // by forcing inherited background/clip/color on the generated word nodes.
          span.style.background = 'inherit';
          span.style.color = 'inherit';
          span.style.WebkitBackgroundClip = 'inherit';
          span.style.backgroundClip = 'inherit';
          span.style.WebkitTextFillColor = 'inherit';
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !node.hasAttribute('data-word')
    ) {
      Array.from(node.childNodes).forEach(walk);
    }
  };
  Array.from(el.childNodes).forEach(walk);
}

export default function KineticTitle({
  children,
  className = '',
  tag: Tag = 'h2',
  staggerMs = STAGGER_MS,
  play = false,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    // Wrap raw DOM text nodes into data-word spans
    wrapWords(el);

    const getWords = () => Array.from(el.querySelectorAll('[data-word]'));

    let pendingTimeouts = [];
    let isVisible = false;

    const clearPending = () => {
      pendingTimeouts.forEach((t) => clearTimeout(t));
      pendingTimeouts = [];
    };

    const hide = (words) => {
      clearPending();
      isVisible = false;
      words.forEach((w) => {
        w.style.transition = 'none';
        w.style.opacity = '0';
        w.style.transform = 'rotateX(90deg) translateY(20px)';
        w.style.transformOrigin = 'bottom center';
        w.style.display = 'inline-block';
      });
    };

    const reveal = (words) => {
      if (isVisible) return;
      isVisible = true;
      clearPending();
      words.forEach((w, i) => {
        const t = setTimeout(() => {
          w.style.transition =
            'opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)';
          w.style.opacity = '1';
          w.style.transform = 'rotateX(0deg) translateY(0px)';
        }, i * staggerMs);
        pendingTimeouts.push(t);
      });
    };

    let words = getWords();
    hide(words);

    if (play) {
      reveal(words);
      return () => clearPending();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        words = getWords();
        if (entry.isIntersecting) {
          reveal(words);
        } else {
          if (isVisible) hide(words);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -4% 0px' },
    );

    observer.observe(el);

    // Fire immediately if already in view
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
      reveal(words);
    }

    // Safety fallback: on refresh, IO callback can be delayed.
    const safety = window.setTimeout(() => {
      if (isVisible) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.98 && r.bottom > 0) {
        words = getWords();
        reveal(words);
      }
    }, 700);

    return () => {
      window.clearTimeout(safety);
      observer.disconnect();
      clearPending();
    };
  }, [staggerMs, play]);

  return (
    <Tag
      ref={ref}
      className={`kinetic-title ${className}`}
      style={{ perspective: '600px', perspectiveOrigin: '50% 100%' }}
    >
      {children}
    </Tag>
  );
}
