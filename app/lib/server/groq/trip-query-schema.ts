import { z } from "zod";
import type { TripQuery } from "../../types/trip-query";

// What a trip query read by the AI must look like before Sayvoya searches with it.
// schema.ts is the JSON schema sent to Groq; this one checks what comes back.
// Every field may be null: null means "the user didn't say" and leads to a question or a default.

const airportCode = z.string().regex(/^[A-Z]{3}$/, "Expected a 3-letter airport code");
const currencyCode = z.string().regex(/^[A-Z]{3}$/, "Expected a 3-letter currency code");
const price = z.number().positive().max(10_000_000);
const shortText = z.string().trim().min(1).max(60);

export const modelTripQuerySchema = z.object({
  trip_type: z.enum(["one_way", "return"]).nullable(),

  origin_airport: airportCode.nullable(),
  destination_airport: airportCode.nullable(),

  departure_date: z.iso.date().nullable(),
  return_date: z.iso.date().nullable(),
  stay_length: z.number().int().min(1).max(99).nullable(),
  stay_unit: z.enum(["days", "nights", "weeks"]).nullable(),

  max_price: price.nullable(),
  max_price_currency: currencyCode.nullable(),

  cabin_class: z.enum(["economy", "premium_economy", "business", "first"]).nullable(),
  passengers: z.number().int().min(1).max(9).nullable(),

  vibe_tags: z.array(z.string().max(40)).max(10).nullable(),

  direct_only: z.boolean().nullable(),
  preferred_airlines: z.array(shortText).max(10).nullable(),
  baggage_required: z.boolean().nullable(),
  departure_time: z.enum(["morning", "afternoon", "evening", "night"]).nullable(),

  hotel_rooms: z.number().int().min(1).max(9).nullable(),
  hotel_max_price: price.nullable(),
  hotel_max_price_currency: currencyCode.nullable(),
  hotel_min_stars: z.number().int().min(1).max(5).nullable(),
  hotel_free_cancellation: z.boolean().nullable(),
  hotel_amenities: z
    .array(z.enum(["wifi", "pool", "spa", "gym", "parking", "restaurant", "room_service", "pet_friendly"]))
    .max(8)
    .nullable(),

  destination_country: shortText.nullable(),
  destination_country_code: z.string().regex(/^[A-Z]{2}$/, "Expected a 2-letter country code").nullable(),
  destination_continent_code: z.enum(["AF", "AN", "AS", "EU", "NA", "OC", "SA"]).nullable(),
  destination_area: z.string().trim().min(1).max(100).nullable(),
}) satisfies z.ZodType<Omit<TripQuery, "explanation">>;

export type ModelTripQuery = z.infer<typeof modelTripQuerySchema>;
