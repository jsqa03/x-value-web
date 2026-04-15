interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  accent?: string;
  highlight?: string; // word(s) to color
}

export default function SectionHeader({ eyebrow, title, accent = "#00c0f3", highlight }: SectionHeaderProps) {
  const parts = highlight ? title.split(highlight) : [title];
  return (
    <div className="mb-8">
      <p className="text-white/30 text-xs tracking-[0.25em] uppercase mb-2">{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
        {parts[0]}
        {highlight && <span style={{ color: accent }}>{highlight}</span>}
        {parts[1]}
      </h2>
    </div>
  );
}
