import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};
export default function ActionButton(props: Props) {
  const { children, ...rest } = props;
  return (
    <button
      {...rest}
      className="text-sm  px-2 py-1 rounded border-2 bg-amber-500 shadow-[2px_2px_0_0_black] hover:shadow-none text-black font-bold hover:cursor-pointer transition-all disabled:bg-amber-500/30"
    >
      {children}
    </button>
  );
}
