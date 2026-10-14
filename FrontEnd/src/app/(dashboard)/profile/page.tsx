import { Suspense } from "react";
import { LoadError } from "@/components/layout/load-error";
import { Section } from "@/components/layout/section";
import { TopBar } from "@/components/layout/top-bar";
import { ProfileInfo } from "@/features/profile/components/profile-info";
import { ProfileItems } from "@/features/profile/components/profile-items";
import { ProfileSkeleton } from "@/features/profile/components/profile-skeleton";
import { load } from "@/lib/api/client";
import { getProfile } from "@/lib/api/profile";

export default function ProfilePage() {
  return (
    <>
      <TopBar title="Profile" />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileData />
      </Suspense>
    </>
  );
}

async function ProfileData() {
  const result = await load(getProfile());
  if (!result.ok) {
    return (
      <Section>
        <LoadError message={result.error} />
      </Section>
    );
  }
  return (
    <>
      <ProfileInfo profile={result.data.profile} />
      <ProfileItems data={result.data} />
    </>
  );
}
