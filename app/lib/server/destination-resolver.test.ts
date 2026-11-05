import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveDestinationAirportInput } from "./destination-resolver.ts";

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
