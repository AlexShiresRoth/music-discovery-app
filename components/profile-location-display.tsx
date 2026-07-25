import clsx from "clsx";

type Props = {
  city: string;
  stateCode: string;
  countryCode: string;
  className?: string;
};

export default function ProfileLocationDisplay({
  city,
  stateCode,
  countryCode,
  className,
}: Props) {
  return (
    <p className={clsx(className)}>
      {city},{" "}
      {stateCode ? `${stateCode.toUpperCase()}, ` : ""}
      {countryCode.toUpperCase()}
    </p>
  );
}
