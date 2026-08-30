import clsx from "clsx";
import Link from "next/link";

type Props = {
  city: string;
  stateCode: string;
  className?: string;
  lat: number;
  lon: number;
};

export default function ProfileLocationDisplay({
  city,
  stateCode,
  className,
  lat,
  lon,
}: Props) {
  if (!lat || !lon) {
    return (
      <p className={clsx(className)}>
        {city}, {stateCode ? `${stateCode.toUpperCase()} ` : ""}
      </p>
    );
  }
  return (
    <Link
      href={`/location?&q=${city}&lat=${lat}&lon=${lon}`}
      className={clsx(className)}
    >
      {city}, {stateCode ? `${stateCode.toUpperCase()} ` : ""}
    </Link>
  );
}
