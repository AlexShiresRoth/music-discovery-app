import { useEffect } from "react";

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
          callback(index);
        }
      },
      {
        root,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [selector, callback, scrollRef]);

  return <></>;
};
