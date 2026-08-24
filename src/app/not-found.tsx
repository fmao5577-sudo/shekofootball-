import Link from "next/link";

export default function NotFound() {
  return (
    <div className="sheko-card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-[var(--muted)]">This page is not on the pitch.</p>
      <Link href="/" className="mt-5 inline-flex rounded-full bg-[var(--pitch)] px-4 py-2 text-sm text-black">
        SHEKO SPORTS
      </Link>
    </div>
  );
}
