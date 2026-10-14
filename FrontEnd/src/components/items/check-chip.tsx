import { Check } from "lucide-react";

// Checked = outline chip with a green tick. Not checked = dashed border (not finished yet).
export function CheckChip({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <span className="inline-flex h-5 items-center gap-1 border border-ink px-1.5 text-[11px] whitespace-nowrap">
        <Check strokeWidth={2} className="size-3 text-up" aria-hidden />
        Checked
      </span>
    );
  }
  return (
    <span className="inline-flex h-5 items-center border border-dashed border-ink px-1.5 text-[11px] whitespace-nowrap">
      Not checked
    </span>
  );
}
