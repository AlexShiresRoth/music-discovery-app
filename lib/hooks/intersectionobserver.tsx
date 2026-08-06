import { useEffect, useRef } from "react";

type Props = {
  selector: string;
  callback: (index: number) => void;
  scrollRef: React.RefObject<HTMLElement | null>;
};

function slideIndex(el: HTMLElement) {
  const raw = el.dataset.profileIndex ?? el.dataset.clipIndex;
  if (raw == null || raw === "") return -1;
  const index = Number(raw);
  return Number.isFinite(index) ? index : -1;
}

export const useIntersectionObserver = ({
  selector,
  callback,
  scrollRef,
}: Props) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!mostVisible) return;

        const index = slideIndex(mostVisible.target as HTMLElement);
        if (index >= 0) {
          callbackRef.current(index);
        }
      },
      {
        root,
        threshold: [0.5, 0.75, 1],
      },
    );

    const observeSlides = () => {
      root.querySelectorAll<HTMLElement>(selector).forEach((slide) => {
        if (observed.has(slide)) return;
        observed.add(slide);
        observer.observe(slide);
      });
    };

    observeSlides();

    // Newly fetched slides are appended after mount — observe them too.
    const mutationObserver = new MutationObserver(observeSlides);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [selector, scrollRef]);

  return <></>;
};
