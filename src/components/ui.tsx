import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("mx-auto w-full max-w-8xl px-6 md:px-10 lg:px-16", className)}>{children}</div>;
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={clsx("eyebrow", light && "eyebrow--light")}>{children}</span>;
}

export function ButtonPrimary({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex items-center gap-2.5 rounded-full bg-forest px-7 py-3.5",
        "text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-cream",
        "transition-all duration-500 ease-editorial hover:bg-emerald hover:shadow-[0_8px_30px_rgba(15,169,88,0.35)]",
        className
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

export function ButtonSecondary({
  href,
  children,
  className,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "group inline-flex items-center gap-2.5 rounded-full border px-7 py-3.5",
        "text-[0.8rem] font-semibold uppercase tracking-[0.14em]",
        "transition-all duration-500 ease-editorial",
        dark
          ? "border-cream/40 text-cream hover:border-cream hover:bg-cream/10"
          : "border-forest/30 text-forest hover:border-forest hover:bg-forest/[0.04]",
        className
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
