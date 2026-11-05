import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import { airportCity } from "@/app/lib/server/airports";
import { SESSION_COOKIE, userFromToken } from "@/app/lib/server/auth";
import { getTrip, parseTripId, tripForViewer } from "@/app/lib/server/trips";
import BudgetCard from "../_components/BudgetCard";
import EmailTripButton from "../_components/EmailTripButton";
import HotelStayCard from "../_components/HotelStayCard";
import PlanHeader from "../_components/PlanHeader";
import ReturnFlightCard from "../_components/ReturnFlightCard";
import SaveTripButton from "../_components/SaveTripButton";
import TripCalendarCard from "../_components/TripCalendarCard";
import TripOverviewCard from "../_components/TripOverviewCard";
import { toItineraryView } from "../itinerary-view";

const loadItinerary = cache(async (rawId: string) => {
  const id = parseTripId(rawId);
  const trip = id === null ? null : await getTrip(id);
  if (!trip) return null;

  const today = new Date().toISOString().slice(0, 10);
  return { trip, view: toItineraryView(trip, { today, cityOf: airportCity, sample: trip.sample }) };
});

export async function generateMetadata(props: PageProps<"/itinerary/[id]">): Promise<Metadata> {
  const { view } = (await loadItinerary((await props.params).id)) ?? {};
  if (!view) return { title: "Trip not found – Sayvoya" };
  return {
    title: `${view.overview.title} – Sayvoya`,
    description: view.overview.description,
    robots: { index: false },
  };
}

export default async function TripItineraryPage(props: PageProps<"/itinerary/[id]">) {
  const itinerary = await loadItinerary((await props.params).id);
  if (!itinerary) notFound();
  const { view } = itinerary;

  const viewer = userFromToken((await cookies()).get(SESSION_COOKIE)?.value);
  const { owner, savedAt } = tripForViewer(itinerary.trip, viewer?.userId ?? null);
  const canSave = !(viewer && owner === "someone-else");

  return (
    <div className="mx-auto flex w-full max-w-400 flex-1 flex-col gap-5 px-5 pt-6 pb-5 sm:px-7">
      <PlanHeader
        summary={view.summary}
        actions={
          <>
            {canSave && <SaveTripButton tripId={itinerary.trip.id} saved={owner === "you" && savedAt !== null} />}
            <EmailTripButton />
          </>
        }
      />

      {/* From xl up, the cards sit in a 3 × 2 grid that fills the rest of the screen, and every card
          stretches to fill its cell, so the bottom edges line up. A card spans both rows when the
          card that would sit under it is missing. Below xl, the cards simply stack. */}
      <main className="grid flex-1 items-start gap-5 lg:grid-cols-2 xl:grid-cols-3 xl:grid-rows-[auto_1fr] xl:items-stretch">
        <Cell className="xl:col-start-1 xl:row-span-2 xl:row-start-1">
          <TripOverviewCard trip={view.overview} />
        </Cell>

        <Cell className={`xl:col-start-2 xl:row-start-1 ${view.hotel ? "" : "xl:row-span-2"}`}>
          <ReturnFlightCard flight={view.flight} />
        </Cell>

        {view.hotel && (
          <Cell className="xl:col-start-2 xl:row-start-2">
            <HotelStayCard hotel={view.hotel} />
          </Cell>
        )}

        <Cell className={`xl:col-start-3 xl:row-start-1 ${view.budget ? "" : "xl:row-span-2"}`}>
          <TripCalendarCard calendar={view.calendar} plan={null} />
        </Cell>

        {view.budget && (
          <Cell className="xl:col-start-3 xl:row-start-2">
            <BudgetCard budget={view.budget} />
          </Cell>
        )}
      </main>
    </div>
  );
}

/** A grid cell whose card stretches to the cell's full height (a one-item grid stretches its child). */
function Cell({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`grid min-w-0 ${className}`}>{children}</div>;
}
