"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PROFILE_ITEM_TYPES, type ProfileItem, type ProfileItemType, type ProfileWithItems } from "@jobhunt/shared";
import { CheckChip } from "@/components/items/check-chip";
import { KIND_LABELS, detailsOf, nameOf } from "@/components/items/describe";
import { linkChoicesFrom } from "@/components/items/fields";
import { ItemDialog } from "@/components/items/item-dialog";
import { EmptyState, Section } from "@/components/layout/section";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addItemAction, deleteItemAction, updateItemAction } from "../actions";

const LIST_OF: Record<ProfileItemType, (data: ProfileWithItems) => ProfileItem[]> = {
  experience: (d) => d.experiences,
  achievement: (d) => d.achievements,
  skill: (d) => d.skills,
  skill_proof: (d) => d.skill_proofs,
  project: (d) => d.projects,
  education: (d) => d.education,
  certificate: (d) => d.certificates,
  language: (d) => d.languages,
};

// What a delete also removes (the database cascades), said before I confirm.
const DELETE_NOTE: Record<ProfileItemType, string> = {
  experience: "Its achievements and skill proofs are deleted too.",
  project: "Its achievements and skill proofs are deleted too.",
  skill: "Its skill proofs are deleted too.",
  education: "Its skill proofs are deleted too.",
  certificate: "Its skill proofs are deleted too.",
  achievement: "This can't be undone.",
  skill_proof: "This can't be undone.",
  language: "This can't be undone.",
};

const NEEDS_FIRST: Partial<Record<ProfileItemType, (data: ProfileWithItems) => string | null>> = {
  achievement: (d) => (d.experiences.length + d.projects.length === 0 ? "Add a job or a project first." : null),
  skill_proof: (d) =>
    d.skills.length === 0
      ? "Add a skill first."
      : d.experiences.length + d.projects.length + d.education.length + d.certificates.length === 0
        ? "Add a job, project, education or certificate first."
        : null,
};

// One tab per item kind, each with a table. The one mustard button: "Add <kind>".
export function ProfileItems({ data }: { data: ProfileWithItems }) {
  const [kind, setKind] = useState<ProfileItemType>("experience");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ProfileItem | null>(null);
  const [deleting, setDeleting] = useState<ProfileItem | null>(null);
  const [deletePending, startDelete] = useTransition();

  const items = LIST_OF[kind](data);
  const label = KIND_LABELS[kind];
  const blocked = NEEDS_FIRST[kind]?.(data) ?? null;

  function confirmDelete() {
    if (!deleting) return;
    const item = deleting;
    startDelete(async () => {
      const result = await deleteItemAction(item.type, item.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setDeleting(null);
      toast.success("Deleted.");
    });
  }

  return (
    <Section
      title={label.many}
      controls={
        <Button disabled={blocked !== null} onClick={() => setAdding(true)}>
          <Plus strokeWidth={2} aria-hidden />
          Add {label.one.toLowerCase()}
        </Button>
      }
    >
      <Tabs value={kind} onValueChange={(value) => setKind(value as ProfileItemType)}>
        <div className="no-scrollbar -mx-4 overflow-x-auto overflow-y-hidden px-4 pb-2 md:mx-0 md:px-0">
          <TabsList aria-label="Item kinds">
            {PROFILE_ITEM_TYPES.map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {KIND_LABELS[type].many}
                <span className="text-muted-foreground tabular-nums">{LIST_OF[type](data).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <div className="mt-5">
        {items.length === 0 ? (
          <EmptyState>{blocked ?? `No ${label.many.toLowerCase()} yet.`}</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{label.one}</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-88 min-w-48 align-top whitespace-normal">
                    <p className="text-[13px]">{nameOf(item, data)}</p>
                    <p className="mt-0.5 text-[11px] text-gold">
                      {item.source} · #{item.id}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-88 min-w-40 align-top text-xs whitespace-normal text-muted-foreground">
                    {detailsOf(item, data)}
                  </TableCell>
                  <TableCell className="align-top">
                    <CheckChip checked={item.checked} />
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex justify-end gap-1">
                      {item.type !== "skill_proof" && (
                        <Button variant="ghost" size="icon-lg" aria-label={`Edit ${nameOf(item, data)}`} onClick={() => setEditing(item)}>
                          <Pencil strokeWidth={1.4} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-lg"
                        aria-label={`Delete ${nameOf(item, data)}`}
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 strokeWidth={1.4} className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ItemDialog
        open={adding}
        onOpenChange={setAdding}
        title={`Add ${label.one.toLowerCase()}`}
        description="New items start as not checked. Check them on the Review page."
        kind={kind}
        mode="create"
        links={linkChoicesFrom(data)}
        saved={kind === "achievement" ? { position: data.achievements.length } : null}
        submitLabel={`Add ${label.one.toLowerCase()}`}
        onSubmit={addItemAction}
        onDone={() => {
          setAdding(false);
          toast.success("Added.");
        }}
      />

      <ItemDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing ? `Edit ${KIND_LABELS[editing.type].one.toLowerCase()}` : ""}
        kind={editing?.type ?? kind}
        mode="update"
        saved={editing}
        submitLabel="Save"
        note={editing?.checked ? "This item will need a new check." : undefined}
        onSubmit={(changes) => updateItemAction(editing?.id, changes)}
        onDone={() => {
          setEditing(null);
          toast.success("Saved.");
        }}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[13px] font-bold">
              Delete this {deleting ? KIND_LABELS[deleting.type].one.toLowerCase() : "item"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {deleting && (
                <>
                  “{nameOf(deleting, data)}”. {DELETE_NOTE[deleting.type]}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={deletePending} onClick={confirmDelete}>
              {deletePending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}
