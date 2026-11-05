import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeTripQuery } from "./extractor.ts";
import { modelTripQuerySchema, type ModelTripQuery } from "./trip-query-schema.ts";

const nothingSaid: ModelTripQuery = {
  trip_type: null,
  origin_airport: null,
  destination_airport: null,
  departure_date: null,
  return_date: null,
  stay_length: null,
  stay_unit: null,
  max_price: null,
  max_price_currency: null,
  cabin_class: null,
  passengers: null,
  vibe_tags: null,
  direct_only: null,
  preferred_airlines: null,
  baggage_required: null,
  departure_time: null,
  hotel_rooms: null,
  hotel_max_price: null,
  hotel_max_price_currency: null,
  hotel_min_stars: null,
  hotel_free_cancellation: null,
  hotel_amenities: null,
  destination_country: null,
  destination_country_code: null,
  destination_continent_code: null,
  destination_area: null,
};

const fullSearch: ModelTripQuery = {
  ...nothingSaid,
  trip_type: "return",
  origin_airport: "CPH",
  destination_airport: "FCO",
  departure_date: "2026-12-12",
  return_date: "2026-12-19",
  stay_length: 7,
  stay_unit: "nights",
  max_price: 1500,
  max_price_currency: "DKK",
  cabin_class: "economy",
  passengers: 2,
  vibe_tags: ["beaches"],
  direct_only: true,
  preferred_airlines: ["SK"],
  baggage_required: true,
  departure_time: "morning",
  hotel_rooms: 1,
  hotel_max_price: 150,
  hotel_max_price_currency: "EUR",
  hotel_min_stars: 4,
  hotel_free_cancellation: true,
  hotel_amenities: ["wifi", "pool"],
};

const problemsWith = (changes: Partial<Record<keyof ModelTripQuery, unknown>>) => {
  const result = modelTripQuerySchema.safeParse({ ...fullSearch, ...changes });
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

test("accepts a search where the user said nothing", () => {
  assert.deepEqual(modelTripQuerySchema.parse(nothingSaid), nothingSaid);
});

test("accepts a full search", () => {
  assert.deepEqual(modelTripQuerySchema.parse(fullSearch), fullSearch);
});

test("accepts a broad destination instead of an airport", () => {
  const spain = { destination_airport: null, destination_country: "Spain", destination_country_code: "ES", destination_continent_code: "EU", destination_area: "south of Spain" };
  assert.deepEqual(problemsWith(spain), []);
  assert.deepEqual(problemsWith({ ...spain, destination_country: "Europe", destination_country_code: "EU" }), []);
});

test("accepts what the extractor makes of a typical AI answer", () => {
  const cleaned = normalizeTripQuery({
    origin_airport: "cph",
    destination_airport: "fco",
    departure_date: "2026-12-12",
    return_date: "2026-12-19",
    passengers: "2",
    max_price: "1500",
    max_price_currency: "kr",
    cabin_class: "Business Class",
    preferred_airlines: "SK, LH",
    hotel_amenities: ["Wi-Fi", "swimming pool"],
  });
  assert.deepEqual(problemsWith(cleaned), []);
});

test("rejects dates that are not real calendar dates", () => {
  for (const date of ["July 10", "2026-13-40", "2026-02-30", "12/12/2026", "2026-7-1", "tomorrow"]) {
    assert.deepEqual(problemsWith({ departure_date: date }), ["departure_date"], date);
    assert.deepEqual(problemsWith({ return_date: date }), ["return_date"], date);
  }
});

test("rejects airports that are not 3-letter codes", () => {
  for (const airport of ["Paris", "cph", "LONDON", "CP", "C1H", ""]) {
    assert.deepEqual(problemsWith({ destination_airport: airport }), ["destination_airport"], airport);
    assert.deepEqual(problemsWith({ origin_airport: airport }), ["origin_airport"], airport);
  }
});

test("rejects values outside their range", () => {
  assert.deepEqual(problemsWith({ passengers: 0 }), ["passengers"]);
  assert.deepEqual(problemsWith({ passengers: 12 }), ["passengers"]);
  assert.deepEqual(problemsWith({ passengers: 2.5 }), ["passengers"]);
  assert.deepEqual(problemsWith({ stay_length: 0 }), ["stay_length"]);
  assert.deepEqual(problemsWith({ max_price: -100 }), ["max_price"]);
  assert.deepEqual(problemsWith({ hotel_min_stars: 6 }), ["hotel_min_stars"]);
  assert.deepEqual(problemsWith({ hotel_rooms: 10 }), ["hotel_rooms"]);
});

test("rejects words that are not on the allowed list", () => {
  assert.deepEqual(problemsWith({ trip_type: "round_trip" }), ["trip_type"]);
  assert.deepEqual(problemsWith({ cabin_class: "Business Class" }), ["cabin_class"]);
  assert.deepEqual(problemsWith({ stay_unit: "months" }), ["stay_unit"]);
  assert.deepEqual(problemsWith({ departure_time: "noon" }), ["departure_time"]);
  assert.deepEqual(problemsWith({ hotel_amenities: ["jacuzzi"] }), ["hotel_amenities.0"]);
  assert.deepEqual(problemsWith({ destination_continent_code: "XX" }), ["destination_continent_code"]);
});

test("rejects the wrong kind of value", () => {
  assert.deepEqual(problemsWith({ passengers: "2" }), ["passengers"]);
  assert.deepEqual(problemsWith({ direct_only: "yes" }), ["direct_only"]);
  assert.deepEqual(problemsWith({ max_price_currency: "kr" }), ["max_price_currency"]);
  assert.deepEqual(problemsWith({ destination_country_code: "ESP" }), ["destination_country_code"]);
  assert.deepEqual(problemsWith({ vibe_tags: "beaches" }), ["vibe_tags"]);
});

test("names every bad field, so each one can be dropped on its own", () => {
  assert.deepEqual(problemsWith({ departure_date: "July 10", passengers: 0, cabin_class: "luxury" }).sort(), [
    "cabin_class",
    "departure_date",
    "passengers",
  ]);
});
