import { useEffect, useRef } from 'react';

const STAGGER_MS = 80;

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

function isEnteringView(rect) {
  const vh = window.innerHeight || 0;
  if (!vh) return false;
  return rect.bottom > 48 && rect.top < vh - 24;
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

    // Only wrap once
    if (!el.querySelector('[data-word]')) {
      wrapWords(el);
    }

    const getWords = () => Array.from(el.querySelectorAll('[data-word]'));

    let pendingTimeouts = [];

    const clearPending = () => {
      pendingTimeouts.forEach((t) => clearTimeout(t));
      pendingTimeouts = [];
    };

    const hide = (words) => {
      clearPending();
      words.forEach((w) => {
        w.style.transition =
          'opacity 0.4s cubic-bezier(0.22,1,0.36,1), transform 0.4s cubic-bezier(0.22,1,0.36,1)';
        w.style.opacity = '0';
        w.style.transform = 'rotateX(90deg) translateY(20px)';
        w.style.transformOrigin = 'bottom center';
        w.style.display = 'inline-block';
      });
    };

    const reveal = (words) => {
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

    const words = getWords();
    hide(words);

    if (play) {
      reveal(words);
      return () => clearPending();
    }

    const apply = (inView) => {
      const current = getWords();
      if (inView) reveal(current);
      else hide(current);
    };

    if (isEnteringView(el.getBoundingClientRect())) {
      reveal(words);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Scroll down → reveal, scroll up / leave → hide
        apply(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearPending();
    };
  }, [staggerMs, play]);

  return (
    <Tag
      ref={ref}
      className={`kinetic-title ${className}`}
      style={{ perspective: '600px', perspectiveOrigin: '50% 100%', overflowAnchor: 'none' }}
    >
      {children}
    </Tag>
  );
}
