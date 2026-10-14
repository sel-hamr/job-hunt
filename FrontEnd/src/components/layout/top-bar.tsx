import { Suspense, type ReactNode } from "react";
import { Avatar, ProfileAvatar } from "./profile-avatar";

// The bar on top of every page: title on the left, page actions on the right, then my avatar.
export function TopBar({ title, actions }: { title: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-4 md:px-6">
      <h1 className="truncate text-[17px] font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
        <Suspense fallback={<Avatar initials="" />}>
          <ProfileAvatar />
        </Suspense>
      </div>
    </header>
  );
}
