import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex justify-center gap-8 w-full py-8 text-sm text-gray-500 flex-wrap">
      <Link
        href="/privacy"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Privacy Policy
      </Link>
      <span>|</span>
      <Link
        href="/terms-and-conditions"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Terms of Service
      </Link>
      <span>|</span>
      <a
        href="mailto:hello@side0.com"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Contact
      </a>
      <span>|</span>
      <Link
        href="/about"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        About
      </Link>
      <span>|</span>
      <Link
        href="/community-guidelines"
        className="hover:underline hover:text-gray-900 transition-colors hover:cursor-pointer hover:underline-offset-4"
      >
        Guidelines
      </Link>
    </footer>
  );
}
