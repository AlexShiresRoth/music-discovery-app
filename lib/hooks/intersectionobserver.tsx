import { useEffect, useRef } from "react";

type Props = {
  selector: string;
  callback: (index: number) => void;
  scrollRef: React.RefObject<HTMLElement | null>;
};

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

    const slides = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!mostVisible) return;

        const index = slides.indexOf(mostVisible.target as HTMLElement);
        if (index >= 0) {
          callbackRef.current(index);
        }
      },
      {
        root,
        threshold: [0.5, 0.75, 1],
      },
    );

    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [selector, scrollRef]);

  return <></>;
};
