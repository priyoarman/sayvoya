import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { clearSearchCache } from "./duffel.ts";
import { clearStaysCache } from "./duffel-stays.ts";
import { runFlightSearch } from "./flight-search-stream.ts";
import type { SearchContext } from "../types/stream-events";

const realFetch = globalThis.fetch;

function stubProviders(groqReads: Record<string, unknown>) {
  globalThis.fetch = ((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("open-meteo")) return Promise.resolve(Response.json({}));
    if (url.includes("/stays/")) return Promise.resolve(Response.json({ data: { results: [] } }));
    if (url.includes("duffel")) return Promise.resolve(Response.json({ data: { offers: [] } }));
    const content = JSON.stringify(groqReads);
    return Promise.resolve(
      Response.json({
        id: "x",
        model: "test",
        choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    );
  }) as typeof fetch;
}

async function search(prompt: string, context?: SearchContext) {
  const events: [string, Record<string, unknown>][] = [];
  await runFlightSearch({ prompt, context }, new Headers(), (event, data) => events.push([event, data]));
  return events;
}

const eventNamed = (events: [string, Record<string, unknown>][], name: string) =>
  events.find(([event]) => event === name)?.[1];

beforeEach(() => {
  clearSearchCache();
  clearStaysCache();
  process.env.GROQ_API_KEY = "test";
  process.env.DUFFEL_TOKEN = "test";
  delete process.env.DUFFEL_USE_MOCK;
  delete process.env.LITEAPI_KEY;
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

test("keeps the destination from earlier when a later message has the word 'to' in it", async () => {
  stubProviders({ origin_airport: "CPH", destination_airport: null, departure_date: "2099-01-05" });

  const events = await search("I want to leave on 5 January 2099", { destination: "LIS" });

  assert.equal(eventNamed(events, "complete")?.destination, "LIS");
});

test("asks where to go instead of guessing a place from the words after 'to'", async () => {
  stubProviders({ origin_airport: "CPH", destination_airport: null, departure_date: "2099-01-05" });

  const events = await search("I'd like to see Victoria Falls on 5 January 2099");

  assert.equal(eventNamed(events, "complete"), undefined);
  assert.deepEqual(eventNamed(events, "done"), { needsInput: true, asking: "destination" });
});

test("asks where to go when the only wish is a vibe Sayvoya doesn't know", async () => {
  stubProviders({ origin_airport: "CPH", destination_airport: null, departure_date: "2099-01-05", vibe_tags: ["warm"] });

  const events = await search("Somewhere warm on 5 January 2099");

  assert.equal(eventNamed(events, "complete"), undefined);
  assert.deepEqual(eventNamed(events, "done"), { needsInput: true, asking: "destination" });
});
