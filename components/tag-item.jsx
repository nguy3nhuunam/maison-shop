import Link from "next/link";

export default function TagItem({ href, label, active = false }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-w-0 items-center justify-center rounded-full px-[clamp(10px,1vw,14px)] py-[clamp(6px,0.7vw,8px)] text-center text-[clamp(13px,1vw,15px)] font-medium transition ${
        active
          ? "bg-stone-900 text-white"
          : "bg-white/90 text-stone-600 hover:text-stone-900"
      }`}
    >
      {label}
    </Link>
  );
}
