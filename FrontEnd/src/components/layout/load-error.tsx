"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// When the data can't load: what went wrong, in plain words, and a Retry button.
export function LoadError({ message }: { message: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div role="alert" className="flex flex-col items-start gap-3 border-[1.5px] border-destructive p-4">
      <p className="flex items-start gap-2">
        <TriangleAlert strokeWidth={1.4} className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        {message}
      </p>
      <Button variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>
        {pending ? "Retrying..." : "Retry"}
      </Button>
    </div>
  );
}
