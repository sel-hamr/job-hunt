"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "@jobhunt/shared";
import { CheckChip } from "@/components/items/check-chip";
import { ItemDialog } from "@/components/items/item-dialog";
import { EmptyState, Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { saveProfileAction } from "../actions";

// My main info: name, headline, contact, links, summary. Edit is outline (not the main action).
export function ProfileInfo({ profile }: { profile: Profile | null }) {
  const [editing, setEditing] = useState(false);
  const contact = profile ? [profile.email, profile.phone, profile.city, profile.country].filter(Boolean) : [];

  const dialog = (
    <ItemDialog
      open={editing}
      onOpenChange={setEditing}
      title={profile ? "Edit my info" : "Add my info"}
      kind="profile"
      mode={profile ? "update" : "create"}
      saved={profile}
      submitLabel="Save"
      note={profile?.checked ? "This item will need a new check." : undefined}
      onSubmit={saveProfileAction}
      onDone={() => {
        setEditing(false);
        toast.success("Saved.");
      }}
    />
  );

  if (!profile) {
    return (
      <Section title="My info">
        <EmptyState action={<Button variant="outline" onClick={() => setEditing(true)}>Add my info</Button>}>
          No profile yet. Run the import_cv prompt in Claude, or add your info here.
        </EmptyState>
        {dialog}
      </Section>
    );
  }

  return (
    <Section
      title={profile.name}
      controls={
        <>
          <CheckChip checked={profile.checked} />
          <Button variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </>
      }
    >
      <div className="flex max-w-3xl flex-col gap-2">
        {profile.headline && <p className="text-[13px]">{profile.headline}</p>}
        {contact.length > 0 && <p className="text-xs text-muted-foreground">{contact.join(" · ")}</p>}
        {profile.links.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        {profile.summary && <p className="mt-2 text-xs leading-relaxed whitespace-pre-line">{profile.summary}</p>}
      </div>
      {dialog}
    </Section>
  );
}
