import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveDestination, resolveDestinationAirportInput } from "./destination-resolver.ts";
import { airports } from "./airports.ts";

test("finds the airport for a city name or an airport code", () => {
  assert.equal(resolveDestinationAirportInput("Paris"), "CDG");
  assert.equal(resolveDestinationAirportInput("BER"), "BER");
  assert.equal(resolveDestinationAirportInput("Sao Paulo"), "GRU");
});

test("finds an airport by a word in its name", () => {
  assert.equal(resolveDestinationAirportInput("Heathrow"), "LHR");
  assert.equal(resolveDestinationAirportInput("Billund"), "BLL");
});

// These used to give an airport far away (HSA in Kazakhstan, SID in Cape Verde, TOS in Tromsø).
const cityCodes: [code: string, airport: string][] = [
  ["NYC", "JFK"],
  ["PAR", "CDG"],
  ["ROM", "FCO"],
  ["LON", "LHR"],
  ["nyc", "JFK"],
];

for (const [code, airport] of cityCodes) {
  test(`finds ${airport} for the city code ${code}`, () => {
    assert.equal(resolveDestinationAirportInput(code), airport);
  });
}

test("finds the main airport of a city with two big airports", () => {
  assert.equal(resolveDestinationAirportInput("Bangkok"), "BKK");
});

test("finds no airport for a vague place", () => {
  assert.equal(resolveDestinationAirportInput("SOMEWHERE WARM"), null);
  assert.equal(resolveDestinationAirportInput("GO SOMEWHERE WARM IN DECEMBER"), null);
});

const noHints = {
  destination_airport: null,
  destination_country_code: null,
  destination_continent_code: null,
  destination_area: null,
  vibe_tags: [] as string[],
};

const countryOf = (code: string | null) => airports.find((airport) => airport.iata_code === code)?.iso_country;

test("finds no airport for a vibe it doesn't know", () => {
  for (const vibe of ["warm", "romantic", "snow"]) {
    assert.deepEqual(resolveDestination({ ...noHints, vibe_tags: [vibe] }), { destination_airport: null, explanation: null });
  }
});

test("still picks a beach airport for a vibe it knows, even next to one it doesn't", () => {
  const beach = resolveDestination({ ...noHints, vibe_tags: ["warm", "beaches"] });
  assert.match(beach.explanation!, /\*\*beaches\*\*/);
});

test("an unknown vibe with a country still picks an airport in that country", () => {
  const spain = resolveDestination({ ...noHints, destination_country_code: "ES", vibe_tags: ["warm"] });
  assert.equal(countryOf(spain.destination_airport), "ES");
});
