import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex justify-center gap-8 w-full py-8 text-sm text-gray-700">
      <Link
        href="/privacy"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Privacy Policy
      </Link>
      <Link
        href="/terms"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Terms of Service
      </Link>
      <Link
        href="/contact"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Contact
      </Link>
      <Link
        href="/about"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        About
      </Link>
    </footer>
  );
}
