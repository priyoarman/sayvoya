"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PromptLimitNotice from "./ui/PromptLimitNotice";
import { MAX_PROMPT_LENGTH } from "@/app/lib/limits";
import { plannerHref } from "@/app/lib/routes";

const EXAMPLE_PROMPT =
  "Ask Sayvoya AI to build the best 7-day beach vacation itinerary in Greece";

export default function PromptBox() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = prompt.trim() || EXAMPLE_PROMPT;
        router.push(plannerHref(q));
      }}
      className="rounded-[1.75rem] border border-lavender-soft bg-white px-5 pt-5 pb-4 sm:rounded-4xl sm:pt-7 sm:pb-6 shadow-[0_20px_50px_-12px_rgba(167,139,243,0.35)] sm:px-10"
    >
      <label htmlFor="trip-prompt" className="sr-only">
        Describe your trip
      </label>
      <textarea
        id="trip-prompt"
        rows={2}
        maxLength={MAX_PROMPT_LENGTH}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder={EXAMPLE_PROMPT}
        className="h-18 w-full resize-none bg-transparent text-base text-ink placeholder:text-ink-muted focus:outline-none sm:h-14 sm:text-xl"
      />

      <div className="mt-2 flex items-center justify-between gap-4 sm:mt-4">
        <div className="flex min-w-0 items-center gap-2">
          <PromptLimitNotice length={prompt.length} />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <button
            type="submit"
            className="flex items-center gap-3 rounded-full bg-lavender px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-lavender-hover sm:px-10 sm:py-4 sm:text-xl"
          >
            Start planning
            <span aria-hidden>➤</span>
          </button>
        </div>
      </div>
    </form>
  );
}
