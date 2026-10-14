import { getProfile } from "@/lib/api/profile";

export function Avatar({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden
      className="grid size-[34px] shrink-0 place-items-center rounded-full border border-ink bg-mustard-soft text-[10px] font-bold"
    >
      {initials}
    </span>
  );
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

// My initials, from the saved profile. Empty until the profile has a name.
export async function ProfileAvatar() {
  const name = await getProfile().then(
    (data) => data.profile?.name ?? "",
    () => "",
  );
  return <Avatar initials={initialsOf(name)} />;
}
