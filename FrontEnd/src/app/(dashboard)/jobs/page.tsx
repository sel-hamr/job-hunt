import { EmptyState, Section } from "@/components/layout/section";
import { TopBar } from "@/components/layout/top-bar";

// The job list comes with build step 2 (Jobs + match): there is no /api/jobs yet.
export default function JobsPage() {
  return (
    <>
      <TopBar title="Jobs" />
      <Section>
        <EmptyState>Jobs are not built yet. They come with build step 2 (Jobs + match).</EmptyState>
      </Section>
    </>
  );
}
