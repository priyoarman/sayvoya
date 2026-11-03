const builtWith = [
  { name: "Next.js", href: "https://nextjs.org" },
  { name: "PostgreSQL", href: "https://www.postgresql.org" },
  { name: "Groq", href: "https://groq.com" },
  { name: "Duffel", href: "https://duffel.com" },
  { name: "LiteAPI", href: "https://www.liteapi.travel" },
  { name: "Open-Meteo", href: "https://open-meteo.com" },
];

const linkClass = "font-medium text-ink underline-offset-4 hover:text-iris hover:underline";

export default function Footer() {
  return (
    <footer className="border-t border-lavender-soft bg-lavender-soft/30">
      <div className="mx-auto w-full max-w-278 px-5 py-10 text-center sm:px-10 sm:py-8">
        <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
          Sayvoya is an AI travel planner built by{" "}
          <a href="https://github.com/priyoarman" className={linkClass}>
            Arman Hossain
          </a>
          . It started as TripWeave, portfolio project at HackYourFuture Denmark.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
          © {new Date().getFullYear()} Arman Hossain ·{" "}
          <a href="https://github.com/priyoarman/trip-weave" className={linkClass}>
            Source code on GitHub
          </a>
        </p>

        <p className="mt-4 text-xs font-semibold tracking-widest text-ink-subtle uppercase">
          Built with
        </p>
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {builtWith.map((tool) => (
            <li key={tool.name}>
              <a
                href={tool.href}
                className="text-xl font-bold tracking-tight text-ink-subtle transition-colors hover:text-ink sm:text-2xl"
              >
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
