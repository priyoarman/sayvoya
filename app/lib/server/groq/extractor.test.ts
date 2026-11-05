import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  asksForWayBack,
  extractTripQuery,
  normalizeTripQuery,
  parseNaturalTravelDates,
  parseStayLength,
  saysOneWay,
} from "./extractor.ts";

test("cleans a one-way search", () => {
  const oneWay = normalizeTripQuery({
    origin_airport: " cph ",
    destination_airport: "lis",
    departure_date: "2026-07-15",
    max_price: 1500,
    max_price_currency: "DKK",
    vibe_tags: ["budget", "beach"],
  });

  assert.deepEqual(oneWay, {
    trip_type: "one_way",
    origin_airport: "CPH",
    destination_airport: "LIS",
    destination_country: null,
    destination_country_code: null,
    destination_continent_code: null,
    destination_area: null,
    departure_date: "2026-07-15",
    return_date: null,
    stay_length: null,
    stay_unit: null,
    max_price: 1500,
    max_price_currency: "DKK",
    cabin_class: null,
    passengers: null,
    vibe_tags: ["budget", "beach"],
    direct_only: null,
    preferred_airlines: [],
    baggage_required: null,
    departure_time: null,
    hotel_rooms: null,
    hotel_max_price: null,
    hotel_max_price_currency: null,
    hotel_min_stars: null,
    hotel_free_cancellation: null,
    hotel_amenities: [],
  });
});

test("cleans what was asked of the hotel", () => {
  const wishes = normalizeTripQuery({
    hotel_rooms: "2",
    hotel_max_price: "150",
    hotel_max_price_currency: "€",
    hotel_min_stars: 7,
    hotel_free_cancellation: "yes",
    hotel_amenities: ["Swimming pool", "free Wi-Fi", "pool", "dog friendly", "ocean view"],
  });

  assert.equal(wishes.hotel_rooms, 2);
  assert.equal(wishes.hotel_max_price, 150);
  assert.equal(wishes.hotel_max_price_currency, "EUR");
  assert.equal(wishes.hotel_min_stars, 5);
  assert.equal(wishes.hotel_free_cancellation, true);
  assert.deepEqual(wishes.hotel_amenities, ["wifi", "pool", "pet_friendly"]);
  assert.equal(wishes.max_price, null);

  const none = normalizeTripQuery({ hotel_rooms: 0, hotel_min_stars: "many", hotel_max_price_currency: "EUR", hotel_amenities: null });
  assert.equal(none.hotel_rooms, null);
  assert.equal(none.hotel_min_stars, null);
  assert.equal(none.hotel_max_price_currency, null);
  assert.deepEqual(none.hotel_amenities, []);
});

test("cleans how long the stay is", () => {
  const stay = (stay_length: unknown, stay_unit: unknown) => {
    const { stay_length: length, stay_unit: unit } = normalizeTripQuery({ stay_length, stay_unit });
    return [length, unit];
  };

  assert.deepEqual(stay(7, "days"), [7, "days"]);
  assert.deepEqual(stay("5", " Nights "), [5, "nights"]);
  assert.deepEqual(stay(1, "week"), [1, "weeks"]);
  assert.deepEqual(stay(7, null), [null, null]);
  assert.deepEqual(stay(null, "days"), [null, null]);
  assert.deepEqual(stay(0, "days"), [null, null]);
  assert.deepEqual(stay(3, "fortnights"), [null, null]);
});

test("cleans a return search with loosely written filters", () => {
  const returnTrip = normalizeTripQuery({
    trip_type: "round trip",
    origin_airport: "CPH",
    destination_airport: "BCN",
    departure_date: "2026-08-01",
    return_date: "2026-08-10",
    max_price: 2500,
    vibe_tags: ["budget"],
    direct_only: "yes",
    preferred_airlines: "SAS, Lufthansa",
    baggage_required: "true",
    departure_time: "Morning",
  });

  assert.equal(returnTrip.trip_type, "return");
  assert.equal(returnTrip.direct_only, true);
  assert.deepEqual(returnTrip.preferred_airlines, ["SAS", "Lufthansa"]);
  assert.equal(returnTrip.baggage_required, true);
  assert.equal(returnTrip.departure_time, "morning");
  assert.equal(returnTrip.max_price, 2500);
  assert.equal(returnTrip.max_price_currency, null);
});

test("a return date makes it a return trip, whatever trip_type says", () => {
  const backwards = normalizeTripQuery({
    trip_type: "one_way",
    origin_airport: "CPH",
    destination_airport: "BCN",
    departure_date: "2026-08-10",
    return_date: "2026-08-01",
  });

  assert.equal(backwards.trip_type, "return");
  assert.equal(backwards.departure_date, "2026-08-10");
  assert.equal(backwards.return_date, "2026-08-01");
});

test("works out relative dates from a Monday", () => {
  const referenceDate = new Date(2026, 6, 6);
  const dates = (text: string) => parseNaturalTravelDates(text, referenceDate);

  assert.deepEqual(dates("Flights to Rome tomorrow"), { departure_date: "2026-07-07", return_date: null });
  assert.deepEqual(dates("Flights to Rome this weekend"), { departure_date: "2026-07-11", return_date: null });
  assert.deepEqual(dates("Flights to Rome next weekend"), { departure_date: "2026-07-18", return_date: null });
  assert.deepEqual(dates("Flights to Rome next friday"), { departure_date: "2026-07-10", return_date: null });

  const september = dates("Flights to Rome in September");
  assert.match(september.departure_date!, /^2026-09-\d{2}$/);
  assert.equal(september.return_date, null);
});

// The weekday or "tomorrow" guess used to replace a date the user typed out in full:
// with a Monday as today, "Friday, December 12" became Friday 10 July. When the user typed an
// exact date, the parser returns nothing, so the date the model read is kept.
const typedDates = [
  "Fly to Rome on Friday, December 12",
  "Rome on Saturday the 14th of November",
  "Barcelona 2026-12-12 to 2026-12-19, back Sunday",
  "Lisbon on Friday 11/12",
  "Oslo on Friday 11.12.2026",
];

for (const text of typedDates) {
  test(`keeps the typed date in "${text}"`, () => {
    assert.deepEqual(parseNaturalTravelDates(text, new Date(2026, 6, 6)), { departure_date: null, return_date: null });
  });
}

test("still reads a relative date next to numbers that are not dates", () => {
  const date = (text: string) => parseNaturalTravelDates(text, new Date(2026, 6, 6)).departure_date;

  assert.equal(date("Paris tomorrow for 5 nights"), "2026-07-07");
  assert.equal(date("Leaving tomorrow at 7.30"), "2026-07-07");
  assert.equal(date("Friday, 2 adults, max 1500 kr"), "2026-07-10");
  assert.equal(date("Beaches next weekend, 3 nights, under 500 euros"), "2026-07-18");
});

test("finds how long the stay is in the message", () => {
  const stay = (text: string) => {
    const { stay_length, stay_unit } = parseStayLength(text);
    return [stay_length, stay_unit];
  };

  assert.deepEqual(stay("A seven-day plan to Greece"), [7, "days"]);
  assert.deepEqual(stay("5 nights in Rome next month"), [5, "nights"]);
  assert.deepEqual(stay("A week in Lisbon in December"), [1, "weeks"]);
  assert.deepEqual(stay("two weeks in Japan"), [2, "weeks"]);
  assert.deepEqual(stay("a 10 day trip to Bali"), [10, "days"]);
  assert.deepEqual(stay("Paris for 3 Nights"), [3, "nights"]);

  assert.deepEqual(stay("A weekend in Paris"), [2, "days"]);
  assert.deepEqual(stay("weekend getaway to Prague"), [2, "days"]);
  assert.deepEqual(stay("Barcelona for the weekend"), [2, "days"]);

  assert.deepEqual(stay("Flights to Lisbon next Friday"), [null, null]);
  assert.deepEqual(stay("Flights to Paris next weekend"), [null, null]);
  assert.deepEqual(stay("Fly to Rome this weekend"), [null, null]);
  assert.deepEqual(stay("Flights to Rome in 2 weeks"), [null, null]);
  assert.deepEqual(stay("Somewhere sunny 3 days from now"), [null, null]);
  assert.deepEqual(stay("Leaving in two weeks, staying 4 nights"), [4, "nights"]);
  assert.deepEqual(stay('Previous flight search JSON: {"stay_length":7,"stay_unit":"days"}'), [null, null]);
});

test("finds a way back asked for in so many words", () => {
  assert.equal(asksForWayBack("Round trip to Rome next Friday"), true);
  assert.equal(asksForWayBack("a round-trip to Oslo"), true);
  assert.equal(asksForWayBack("Return flights to Athens on 12 November"), true);
  assert.equal(asksForWayBack("Berlin there and back"), true);

  assert.equal(asksForWayBack("Flights to Lisbon next Friday"), false);
  assert.equal(asksForWayBack("I want to return to Lisbon"), false);
  assert.equal(asksForWayBack("One way, no return flight"), false);
  assert.equal(asksForWayBack('Previous flight search JSON: {"trip_type":"return"}'), false);
  assert.equal(asksForWayBack(null), false);
});

test("finds a way back declined", () => {
  assert.equal(saysOneWay("make it one way"), true);
  assert.equal(saysOneWay("One-way to Oslo"), true);
  assert.equal(saysOneWay("no return needed"), true);
  assert.equal(saysOneWay("Flights to Lisbon next Friday"), false);
  assert.equal(saysOneWay('Previous flight search JSON: {"trip_type":"one_way"}'), false);
});

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

async function extractWhenGroqReads(query: Record<string, unknown>) {
  process.env.GROQ_API_KEY = "test";
  globalThis.fetch = (() =>
    Promise.resolve(
      Response.json({
        id: "x",
        model: "test",
        choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(query) } }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    )) as typeof fetch;

  const result = await extractTripQuery("a trip", { referenceDate: new Date(2026, 6, 6) });
  assert.equal(result.ok, true);
  return result.parsed!;
}

test("turns place names from the AI into airport codes", async () => {
  const parsed = await extractWhenGroqReads({ origin_airport: "Copenhagen", destination_airport: "Paris" });
  assert.equal(parsed.origin_airport, "CPH");
  assert.equal(parsed.destination_airport, "CDG");
});

test("turns city codes from the AI into airport codes", async () => {
  const parsed = await extractWhenGroqReads({ origin_airport: "LON", destination_airport: "NYC" });
  assert.equal(parsed.origin_airport, "LHR");
  assert.equal(parsed.destination_airport, "JFK");
});

test("keeps airport codes from the AI as they are", async () => {
  const parsed = await extractWhenGroqReads({ origin_airport: "aal", destination_airport: "BER" });
  assert.equal(parsed.origin_airport, "AAL");
  assert.equal(parsed.destination_airport, "BER");
});

test("drops a place from the AI that is no airport", async () => {
  const parsed = await extractWhenGroqReads({ origin_airport: "XYZ", destination_airport: "Somewhere warm" });
  assert.equal(parsed.origin_airport, null);
  assert.equal(parsed.destination_airport, null);
});

test("an unknown airport still leaves room for the country the AI read", async () => {
  const parsed = await extractWhenGroqReads({ destination_airport: "Costa del Nada", destination_country_code: "ES", destination_continent_code: "EU" });
  assert.match(parsed.destination_airport!, /^[A-Z]{3}$/);
  assert.match(parsed.explanation!, /\*\*Spain\*\*/);
});

async function extractWithWarnings(query: Record<string, unknown>) {
  const warnings: string[] = [];
  const realWarn = console.warn;
  console.warn = (message: string) => warnings.push(message);
  try {
    return { parsed: await extractWhenGroqReads(query), warnings };
  } finally {
    console.warn = realWarn;
  }
}

test("drops a date from the AI that is not a real calendar date", async () => {
  const { parsed, warnings } = await extractWithWarnings({
    destination_airport: "LIS",
    departure_date: "July 10",
    return_date: "2026-02-30",
  });
  assert.equal(parsed.departure_date, null);
  assert.equal(parsed.return_date, null);
  assert.equal(parsed.destination_airport, "LIS");
  assert.deepEqual(warnings, [
    "AI returned an invalid departure_date; ignoring it.",
    "AI returned an invalid return_date; ignoring it.",
  ]);
});

test("drops only the fields the AI got wrong and keeps the rest", async () => {
  const { parsed } = await extractWithWarnings({
    destination_airport: "LIS",
    departure_date: "2026-12-12",
    passengers: 2,
    cabin_class: "business",
    destination_country_code: "SPAIN",
    destination_continent_code: "EUROPE",
    destination_area: "x".repeat(101),
  });
  assert.equal(parsed.destination_country_code, null);
  assert.equal(parsed.destination_continent_code, null);
  assert.equal(parsed.destination_area, null);
  assert.equal(parsed.destination_airport, "LIS");
  assert.equal(parsed.departure_date, "2026-12-12");
  assert.equal(parsed.passengers, 2);
  assert.equal(parsed.cabin_class, "business");
});

test("logs only the field name, never what the user or the AI wrote", async () => {
  const { warnings } = await extractWithWarnings({ departure_date: "my birthday in Lisbon" });
  assert.deepEqual(warnings, ["AI returned an invalid departure_date; ignoring it."]);
});

test("a valid answer from the AI passes without warnings", async () => {
  const { parsed, warnings } = await extractWithWarnings({
    origin_airport: "CPH",
    destination_airport: "FCO",
    departure_date: "2026-12-12",
    return_date: "2026-12-19",
    passengers: 2,
    destination_country_code: "IT",
    destination_continent_code: "EU",
  });
  assert.deepEqual(warnings, []);
  assert.equal(parsed.return_date, "2026-12-19");
});
