import type { FlightOffer, Hotel } from "./types";
import type { StreamHotels } from "./types/stream-events";

export function tripTotal(
  flight: FlightOffer,
  hotel: Hotel | null,
  { nights, nightsAssumed }: Pick<StreamHotels["stay"], "nights" | "nightsAssumed">,
) {
  if (!hotel) return flight.totalPrice;
  if (nightsAssumed || flight.currency !== hotel.currency) return null;
  return flight.totalPrice + hotel.nightlyPrice * nights;
}
