import Image from "next/image";
import Link from "next/link";
import { destinationHref } from "@/app/lib/routes";

type Place = {
  name: string;
  searchName?: string;
  tagline: string;
  photo: string;
  facts: { label: string; value: string }[];
  events: { year: string; text: string }[];
};

const places: Place[] = [
  {
    name: "Barcelona",
    tagline: "City on the coast of Catalonia, Spain",
    photo: "/images/destinations/barcelona.jpg",
    facts: [
      { label: "Population", value: "1.7M" },
      { label: "Area", value: "101 km²" },
    ],
    events: [
      { year: "1882", text: "Work begins on the Sagrada Família" },
      { year: "1888", text: "Hosts Spain's first World's Fair" },
      { year: "1992", text: "Welcomes the Summer Olympics" },
    ],
  },
  {
    name: "Lisbon",
    tagline: "Capital and largest city of Portugal",
    photo: "/images/destinations/lisbon.jpg",
    facts: [
      { label: "Population", value: "546K" },
      { label: "Area", value: "100 km²" },
    ],
    events: [
      { year: "1147", text: "Captured by Afonso Henriques" },
      { year: "1755", text: "A great earthquake destroys much of the city" },
      { year: "1974", text: "The Carnation Revolution ends the dictatorship" },
    ],
  },
  {
    name: "Paris",
    tagline: "Capital and largest city of France",
    photo: "/images/destinations/paris.jpg",
    facts: [
      { label: "Population", value: "2.1M" },
      { label: "Area", value: "105 km²" },
    ],
    events: [
      { year: "1789", text: "The storming of the Bastille" },
      { year: "1889", text: "The Eiffel Tower opens to the public" },
      { year: "1900", text: "The first Métro line starts running" },
    ],
  },
  {
    name: "London",
    tagline: "Capital of England and the United Kingdom",
    photo: "/images/destinations/london.jpg",
    facts: [
      { label: "Population", value: "9.1M" },
      { label: "Area", value: "1,572 km²" },
    ],
    events: [
      { year: "1666", text: "The Great Fire sweeps through the city" },
      { year: "1863", text: "The world's first underground railway opens" },
      { year: "2012", text: "Hosts the Summer Olympics for a third time" },
    ],
  },
  {
    name: "Madrid",
    tagline: "Capital and largest city of Spain",
    photo: "/images/destinations/madrid.jpg",
    facts: [
      { label: "Population", value: "3.4M" },
      { label: "Area", value: "604 km²" },
    ],
    events: [
      { year: "1561", text: "Philip II moves the royal court to Madrid" },
      { year: "1819", text: "The Prado Museum opens its doors" },
      { year: "1919", text: "The first Metro line starts running" },
    ],
  },
  {
    name: "Palma",
    searchName: "Palma de Mallorca",
    tagline: "Capital of the Balearic Islands, Spain",
    photo: "/images/destinations/palma.jpg",
    facts: [
      { label: "Population", value: "430K" },
      { label: "Area", value: "209 km²" },
    ],
    events: [
      { year: "1229", text: "James I of Aragon conquers Mallorca" },
      { year: "1601", text: "The Gothic cathedral, La Seu, is completed" },
      { year: "1983", text: "Becomes capital of the new Balearic region" },
    ],
  },
];

export default function PlaceStories() {
  return (
    <section
      id="places"
      className="relative mx-auto w-full max-w-278 px-5 pt-10 pb-20 sm:px-10 sm:pt-14 sm:pb-28"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-[3.5rem] sm:leading-tight">
          Get to know the places
        </h2>
        <p className="mt-2 text-base text-ink sm:mt-3 sm:text-2xl">
          The history and stories behind where you could go next
        </p>
      </div>

      <ul className="mt-8 grid gap-5 sm:mt-12 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <li
            key={place.name}
            className="group relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_-16px_rgba(42,27,61,0.3)] transition-transform hover:-translate-y-1"
          >
            <div className="relative h-44 bg-ink sm:h-60">
              <Image
                src={place.photo}
                alt=""
                fill
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="px-6 pt-5 pb-7">
              <h3 className="text-2xl font-semibold text-ink">
                <Link
                  href={destinationHref(place.searchName ?? place.name)}
                  className="after:absolute after:inset-0"
                >
                  {place.name}
                </Link>
              </h3>
              <p className="mt-1 text-base text-ink-muted">{place.tagline}</p>

              <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-ink/10 py-3">
                {place.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-sm text-ink-muted">{fact.label}</dt>
                    <dd className="text-lg font-semibold text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-4 space-y-2">
                {place.events.map((event) => (
                  <li key={event.year} className="flex gap-3 text-sm text-ink">
                    <span className="w-10 shrink-0 font-semibold tabular-nums">{event.year}</span>
                    <span>{event.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
