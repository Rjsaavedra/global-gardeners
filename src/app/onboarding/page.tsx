"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const onboardingImage = "/images/figma/onboarding-confirmation.png";

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export default function OnboardingFirstPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkOnboardingStatus() {
      const response = await fetch("/api/profile/onboarding-status");
      if (!response.ok) {
        return;
      }

      const status = (await response.json()) as { nextStep?: string };
      if (!isMounted || !status.nextStep) {
        return;
      }

      if (status.nextStep !== "/onboarding") {
        router.replace(status.nextStep);
      }
    }

    void checkOnboardingStatus();
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17] sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header flex items-center justify-between p-4">
          <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">
            Global Gardeners
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[14px] font-medium text-[#333333] transition hover:bg-[#ebe6da]"
          >
            Skip
            <ChevronRightIcon />
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-between px-4 pb-8 pt-8">
          <div className="flex flex-1 flex-col gap-10">
            <div className="relative h-[587px] w-full overflow-hidden rounded-2xl border border-black/10">
              <Image
                alt="Phone screen with a plant feed beside a potted plant"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 390px) 100vw, 390px"
                src={onboardingImage}
              />
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="w-[326px] text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">
                Add your first post
              </h1>
              <p className="w-[198px] text-[14px] font-medium leading-5 text-[#333333cc]">
                Connect with gardeners around the world.
              </p>
            </div>
          </div>

          <Link
            href="/onboarding/new-post"
            className="mt-8 flex h-[52px] w-full items-center justify-center rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] transition hover:bg-[#3b6838] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-[#f8f6f1]"
          >
            Start
          </Link>
        </div>
      </section>
    </main>
  );
}
