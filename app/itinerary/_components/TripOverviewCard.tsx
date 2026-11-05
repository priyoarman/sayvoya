import type { OverviewView } from "../itinerary-view";
import { cardClass } from "./SectionCard";
import TripImage from "./TripImage";

type Props = { trip: OverviewView };

export default function TripOverviewCard({ trip }: Props) {
  return (
    <section className={`${cardClass} flex flex-col p-4`}>
      <div className="relative min-h-48 flex-1 overflow-hidden rounded-2xl">
        <TripImage image={trip.image} />
      </div>

      <div className="px-1.5 pt-4 pb-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{trip.title}</h1>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            {trip.airportCode}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{trip.description}</p>

        <ul className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
          {trip.chips.map((chip) => (
            <li key={chip} className="rounded-full bg-lavender-soft/60 px-3 py-1.5 text-ink">
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
