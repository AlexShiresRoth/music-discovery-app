import clsx from "clsx";

type Props = {
  city: string;
  stateCode: string;
  className?: string;
};

export default function ProfileLocationDisplay({
  city,
  stateCode,
  className,
}: Props) {
  return (
    <p className={clsx(className)}>
      {city}, {stateCode ? `${stateCode.toUpperCase()} ` : ""}
    </p>
  );
}
