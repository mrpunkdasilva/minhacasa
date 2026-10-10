interface MarketPageHeaderProps {
  title: string;
  description: string;
}

export default function MarketPageHeader({
  title,
  description,
}: MarketPageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tighter text-white">
        {title}
      </h1>
      <p className="text-zinc-500 mt-2">{description}</p>
    </div>
  );
}
