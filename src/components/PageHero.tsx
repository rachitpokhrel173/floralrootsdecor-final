import { Container, Eyebrow } from "./ui";

export default function PageHero({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  return (
    <section className="bg-forest-deep pb-16 pt-40 text-cream md:pb-20 md:pt-48">
      <Container>
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-light leading-[1.08] sm:text-5xl md:text-6xl">
          {title} {accent && <span className="italic text-peach">{accent}</span>}
        </h1>
        {description && (
          <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-cream/70">{description}</p>
        )}
      </Container>
    </section>
  );
}
