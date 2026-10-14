import { Suspense } from "react";
import { LoadError } from "@/components/layout/load-error";
import { Section } from "@/components/layout/section";
import { TopBar } from "@/components/layout/top-bar";
import { ReviewScreen, type ReviewFocus } from "@/features/review/components/review-screen";
import { ReviewSkeleton } from "@/features/review/components/review-skeleton";
import { load } from "@/lib/api/client";
import { getReview } from "@/lib/api/review";

export default function ReviewPage({ searchParams }: PageProps<"/review">) {
  return (
    <>
      <TopBar title="Review" />
      <Suspense fallback={<ReviewSkeleton />}>
        <ReviewData searchParams={searchParams} />
      </Suspense>
    </>
  );
}

// A tool's review link can point at one item: /review?type=experience&id=3 (or ?type=profile).
async function ReviewData({ searchParams }: Pick<PageProps<"/review">, "searchParams">) {
  const [result, params] = await Promise.all([load(getReview()), searchParams]);
  if (!result.ok) {
    return (
      <Section>
        <LoadError message={result.error} />
      </Section>
    );
  }

  const type = typeof params.type === "string" ? params.type : null;
  const id = typeof params.id === "string" ? Number(params.id) : undefined;
  const focus: ReviewFocus = type ? { type, id: Number.isInteger(id) ? id : undefined } : null;
  return <ReviewScreen data={result.data} focus={focus} />;
}
