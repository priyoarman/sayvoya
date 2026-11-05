import { formatPrice } from "@/app/lib/format";
import type { BudgetView } from "../itinerary-view";
import { cardClass } from "./SectionCard";

type Props = { budget: BudgetView };

export default function BudgetCard({ budget: { lines, days, currency } }: Props) {
  const price = (amount: number) => formatPrice(amount, currency);
  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  const share = (amount: number) => Math.round((amount / total) * 100);

  return (
    <section className={`${cardClass} flex flex-col p-5`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-ink-muted">Total budget</h2>
        <button
          type="button"
          className="rounded-full bg-lavender-soft/60 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-lavender-soft"
        >
          Details
        </button>
      </div>

      <p className="mt-2 flex items-baseline gap-3">
        <span className="text-4xl font-bold tracking-tight text-ink">{price(total)}</span>
        <span className="text-xs text-ink-subtle">≈ {price(Math.round(total / days))} / day</span>
      </p>

      <div className="mt-auto pt-4">
        <div aria-hidden className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {lines.map((line) => (
            <span key={line.label} className={line.color} style={{ width: `${share(line.amount)}%` }} />
          ))}
        </div>

        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((line) => (
            <li key={line.label} className="flex items-center gap-3">
              <span aria-hidden className={`size-2 rounded-full ${line.color}`} />
              <span className="text-ink">{line.label}</span>
              <span className="ml-auto font-bold text-ink">{price(line.amount)}</span>
              <span className="w-8 text-right text-xs text-ink-subtle">{share(line.amount)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
