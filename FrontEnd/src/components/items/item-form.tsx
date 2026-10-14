"use client";

import { useId, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ProfileItemCreateInputSchema,
  ProfileItemUpdateInputSchema,
  ProfileUpdateInputSchema,
} from "@jobhunt/shared";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  FIELDS,
  fieldForKey,
  formValuesFrom,
  isLinkField,
  payloadFrom,
  type Choice,
  type FieldSpec,
  type FormKind,
  type FormValues,
  type LinkChoices,
} from "./fields";

type Props = {
  kind: FormKind;
  mode: "create" | "update";
  saved?: Record<string, unknown> | null; // the item as it is now (update)
  links?: LinkChoices; // choices for "Belongs to", "Skill" and "Proven by" (create)
  submitLabel: string;
  note?: ReactNode; // shown above the buttons, like "This item will need a new check."
  onSubmit: (payload: Record<string, unknown>) => Promise<ActionResult<unknown>>;
  onDone: () => void;
  onCancel: () => void;
};

// Zod's words for the common cases, in plain English.
function plain(message: string): string {
  if (message.startsWith("Too small: expected string")) return "This can't be empty.";
  if (message.startsWith("Invalid input: expected") && message.endsWith("received undefined")) return "This is required.";
  if (message.startsWith("Invalid option")) return "Choose one.";
  if (message === "Invalid URL") return "Use a full link, like https://example.com.";
  if (message === "Invalid email address") return "Use a real email address.";
  return message;
}

function schemaFor(kind: FormKind, mode: "create" | "update") {
  if (kind === "profile") return ProfileUpdateInputSchema;
  return mode === "create" ? ProfileItemCreateInputSchema : ProfileItemUpdateInputSchema;
}

// One form for every kind: the fields come from FIELDS, the rules from @jobhunt/shared.
// It checks the input first, then sends it; the server checks again.
export function ItemForm({ kind, mode, saved, links, submitLabel, note, onSubmit, onDone, onCancel }: Props) {
  const formId = useId();
  const fields = FIELDS[kind].filter((field) => mode === "create" || !isLinkField(field));
  const initial = formValuesFrom(fields, saved);
  const { register, control, handleSubmit, setError, formState } = useForm<FormValues>({ defaultValues: initial });
  const [formError, setFormError] = useState<{ error: string; problems: string[] } | null>(null);
  const names = new Set(fields.map((field) => field.name));

  // Puts each problem under its field; the rest go on top of the form.
  function showProblems(error: string, problems: { key: string; message: string }[]) {
    const left: string[] = [];
    for (const problem of problems) {
      const { key } = problem;
      const message = plain(problem.message);
      const field = fieldForKey(key);
      if (names.has(field)) setError(field, { message });
      else left.push(key ? `${key}: ${message}` : message);
    }
    setFormError({ error, problems: left });
  }

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const payload = payloadFrom(kind, fields, values, mode, initial);
    if (mode === "update" && Object.keys(payload).every((key) => key === "type")) {
      setFormError({ error: "Nothing changed yet.", problems: [] });
      return;
    }

    const parsed = schemaFor(kind, mode).safeParse(payload);
    if (!parsed.success) {
      showProblems(
        "Some fields need a fix.",
        parsed.error.issues.map((issue) => ({ key: String(issue.path[0] ?? ""), message: issue.message })),
      );
      return;
    }

    const result = await onSubmit(parsed.data);
    if (!result.ok) {
      showProblems(
        result.error,
        result.problems.map((line) => {
          const colon = line.indexOf(": ");
          return colon === -1
            ? { key: "", message: line }
            : { key: line.slice(0, colon).split(".")[0]!, message: line.slice(colon + 2) };
        }),
      );
      return;
    }
    onDone();
  });

  function choicesFor(field: FieldSpec): Choice[] {
    if (field.input === "parent") return links?.parents ?? [];
    if (field.input === "skill") return links?.skills ?? [];
    if (field.input === "proof_target") return links?.targets ?? [];
    return (field.choices ?? []).map((choice) => ({ value: choice, label: choice }));
  }

  function control_(field: FieldSpec, id: string, invalid: boolean) {
    const common = { id, "aria-invalid": invalid || undefined, ...register(field.name) };
    switch (field.input) {
      case "long":
      case "links":
        return <Textarea rows={field.input === "links" ? 3 : 4} {...common} />;
      case "choice":
      case "parent":
      case "skill":
      case "proof_target":
        return (
          <NativeSelect className="w-full" {...common}>
            <NativeSelectOption value="">Choose...</NativeSelectOption>
            {choicesFor(field).map((choice) => (
              <NativeSelectOption key={choice.value} value={choice.value}>
                {choice.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        );
      case "order":
        return <Input type="number" min={0} step={1} inputMode="numeric" {...common} />;
      case "email":
        return <Input type="email" {...common} />;
      case "url":
        return <Input type="url" placeholder="https://" {...common} />;
      case "date":
        return <Input placeholder="2022-03" {...common} />;
      default:
        return <Input {...common} />;
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {formError && (
        <div role="alert" className="border-[1.5px] border-destructive p-3 text-xs">
          <p className="font-bold">{formError.error}</p>
          {formError.problems.length > 0 && (
            <ul className="mt-1 ml-4 list-disc">
              {formError.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const id = `${formId}-${field.name}`;
          const error = formState.errors[field.name];
          const wide = ["long", "links", "parent", "proof_target"].includes(field.input);

          if (field.input === "flag") {
            return (
              <Field key={field.name} orientation="horizontal" className="self-end sm:h-8">
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: f }) => (
                    <Checkbox id={id} checked={f.value === true} onCheckedChange={(checked) => f.onChange(checked)} />
                  )}
                />
                <FieldLabel htmlFor={id} className="text-xs">
                  {field.label}
                </FieldLabel>
              </Field>
            );
          }

          return (
            <Field key={field.name} data-invalid={!!error || undefined} className={wide ? "sm:col-span-2" : undefined}>
              <FieldLabel htmlFor={id} className="text-xs text-muted-foreground">
                {field.label}
                {field.required && <span aria-hidden>*</span>}
              </FieldLabel>
              {control_(field, id, !!error)}
              {field.hint && <FieldDescription className="text-[11px]">{field.hint}</FieldDescription>}
              <FieldError className="text-xs">{error?.message}</FieldError>
            </Field>
          );
        })}
      </div>

      {note && <p className="text-xs text-muted-foreground">{note}</p>}

      <div className="-mx-4 -mb-4 flex justify-end gap-2 border-t p-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
