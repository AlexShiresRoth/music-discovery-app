type Props = {
  size?: number | string;
  className?: string;
};

export default function BandcampIcon({ size = 24, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 791.667h694.444L1000 208.333H333.334z" />
    </svg>
  );
}
