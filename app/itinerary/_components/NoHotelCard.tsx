import { BedIcon } from "@/app/components/ui/Icons";
import SectionCard from "./SectionCard";

export default function NoHotelCard() {
  return (
    <SectionCard icon={<BedIcon size={17} />} title="Hotel" aside="Not booked" className="flex flex-col">
      <div className="mt-4 flex min-h-28 flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-lavender-soft px-6 py-5 text-center">
        <p className="text-base font-bold text-ink">No hotel yet</p>
        <p className="mt-1 text-sm text-ink-muted">You chose to plan this trip without a hotel.</p>
      </div>
    </SectionCard>
  );
}
