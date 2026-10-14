import { Suspense } from "react";
import { LoadError } from "@/components/layout/load-error";
import { Section } from "@/components/layout/section";
import { TopBar } from "@/components/layout/top-bar";
import { HomeScreen } from "@/features/home/components/home-screen";
import { HomeSkeleton } from "@/features/home/components/home-skeleton";
import { load } from "@/lib/api/client";
import { getStats } from "@/lib/api/stats";

export default function HomePage() {
  return (
    <>
      <TopBar title="Home" />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeData />
      </Suspense>
    </>
  );
}

async function HomeData() {
  const result = await load(getStats());
  if (!result.ok) {
    return (
      <Section>
        <LoadError message={result.error} />
      </Section>
    );
  }
  return <HomeScreen stats={result.data} />;
}
