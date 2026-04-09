"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SlideConfig = {
  eyebrow: string;
  title: string;
  description: string;
  descriptionClassName?: string;
  descriptionLines?: [string, string];
  imageAlt: string;
  imageSrc: string;
  imageClassName: string;
  cardClassName?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
};

const slides: SlideConfig[] = [
  {
    eyebrow: "Welcome",
    title: "Your Garden Starts Here.",
    description:
      "An all-in-one platform for plant identification, community, and personalized care.",
    imageAlt:
      "A welcoming arrangement of potted plants, gardening tools, and a watering can.",
    imageSrc: "/images/figma/slide-1.png",
    imageClassName:
      "absolute left-1/2 top-0 h-[443px] w-[443px] max-w-none -translate-x-[50.7%] object-cover",
  },
  {
    eyebrow: "Garden Stream",
    title: "Connect and Learn.",
    description:
      "Share updates, ask questions, explore newsletters, and watch trusted gardening videos.",
    descriptionClassName: "max-w-[332px]",
    imageAlt:
      "A phone displaying a plant feed beside a potted plant on a bright tabletop.",
    imageSrc: "/images/figma/slide-2.png",
    imageClassName:
      "absolute inset-0 h-full w-full object-cover",
  },
  {
    eyebrow: "Global Plant ID",
    title: "Identify Any Plant.",
    description:
      "Use trusted plant recognition services to discover species and save them to your garden.",
    descriptionClassName: "max-w-[332px]",
    descriptionLines: [
      "Use trusted plant recognition services to discover",
      "species and save them to your garden.",
    ],
    imageAlt:
      "A healthy potted plant next to a phone screen showing plant identification details.",
    imageSrc:
      "/images/figma/slide-3.png",
    imageClassName:
      "absolute inset-0 h-full w-full object-cover",
  },
  {
    eyebrow: "MyGrowMate",
    title: "Smarter Plant Care.",
    description:
      "Get personalized advice based on your location, weather, and saved plants.",
    descriptionClassName: "max-w-[332px]",
    descriptionLines: [
      "Get personalized advice based on your location,",
      "weather, and saved plants.",
    ],
    imageAlt:
      "Three potted plants with care icons representing sunlight, water, and temperature.",
    imageSrc: "/images/figma/slide-4.png",
    imageClassName:
      "absolute left-[-62.5px] top-[-28px] h-[471px] w-[471px] max-w-none object-cover",
  },
  {
    eyebrow: "My Garden",
    title: "Your Garden. Your Data.",
    description:
      "Track your plants, store your memories, and export your full garden archive anytime.",
    descriptionClassName: "max-w-[332px]",
    descriptionLines: [
      "Track your plants, store your memories, and export",
      "your full garden archive anytime.",
    ],
    imageAlt:
      "A collection of indoor plants arranged together in various pots on a bright surface.",
    imageSrc: "/images/figma/slide-5.png",
    imageClassName: "absolute left-[-80.5px] top-[-68px] h-[451px] w-[451px] max-w-none",
    cardClassName: "h-[383px]",
    primaryActionLabel: "Create Account",
    secondaryActionLabel: "Log In",
  },
];

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 4.5L11.25 9L6.75 13.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideData = slides[currentSlide];

  useEffect(() => {
    let isMounted = true;

    async function redirectIfAuthenticated() {
      const meResponse = await fetch("/api/auth/me");
      if (!meResponse.ok) {
        return;
      }

      const me = (await meResponse.json()) as { loggedIn?: boolean };
      if (!isMounted || !me.loggedIn) {
        return;
      }

      const statusResponse = await fetch("/api/profile/onboarding-status");
      if (!statusResponse.ok) {
        router.replace("/pricing");
        return;
      }

      const status = (await statusResponse.json()) as { nextStep?: string };
      router.replace(status.nextStep ?? "/pricing");
    }

    void redirectIfAuthenticated();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleNext = () => {
    setCurrentSlide((index) => Math.min(index + 1, slides.length - 1));
  };

  const handleSkip = () => {
    setCurrentSlide(slides.length - 1);
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-4 py-0 text-[#182a17] sm:grid sm:place-items-center sm:px-8 sm:py-0">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden rounded-none border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header flex items-center justify-between px-4 py-4">
          <p className="text-[24px] font-semibold tracking-[-0.06em] text-[#31674c]">
            Global Gardeners
          </p>
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[14px] font-medium text-[#333333] transition hover:bg-[#ebe6da]"
          >
            <span>Skip</span>
            <ChevronRightIcon />
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-between px-4 pb-8 pt-4">
          <div className="flex flex-1 flex-col justify-center gap-10">
            <div className="flex flex-col items-center gap-4">
              <div
                className={`relative w-[357px] max-w-full overflow-hidden rounded-[16px] border border-black/10 bg-[#ebe5d9] ${
                  slideData.cardClassName ?? "h-[443px]"
                }`}
              >
                {slides.map((item, index) => (
                  <img
                    key={item.imageSrc}
                    alt={index === currentSlide ? item.imageAlt : ""}
                    aria-hidden={index !== currentSlide}
                    className={`${item.imageClassName} transition-opacity duration-200 ease-out ${
                      index === currentSlide ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                    src={item.imageSrc}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2.5" aria-label="Slide progress">
                {Array.from({ length: 5 }, (_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full ${
                      index <= currentSlide ? "bg-[#5a8d4f]" : "bg-[#e7e1d7]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-[16px] border border-[#4579410d] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-[12px] font-medium leading-4 text-[#457941e6]">
                {slideData.eyebrow}
              </div>
              <div className="space-y-4">
                <h1 className="text-[30px] font-semibold leading-[30px] tracking-[-0.033em] text-[#182a17]">
                  {slideData.title}
                </h1>
                <p
                  className={`mx-auto text-[14px] font-medium leading-5 text-[#333333cc] ${
                    slideData.descriptionClassName ?? "max-w-[320px]"
                  }`}
                >
                  {slideData.descriptionLines ? (
                    <>
                      {slideData.descriptionLines[0]}
                      <br />
                      {slideData.descriptionLines[1]}
                    </>
                  ) : (
                    slideData.description
                  )}
                </p>
              </div>
            </div>
          </div>

          {slideData.primaryActionLabel ? (
            <Link
              href="/signup"
              className="mt-8 flex h-[52px] w-full items-center justify-center rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#f4f1e8] transition hover:bg-[#3b6838] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-[#f8f6f1]"
            >
              {slideData.primaryActionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="mt-8 h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#f4f1e8] transition hover:bg-[#3b6838] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-[#f8f6f1]"
            >
              Next
            </button>
          )}
          {slideData.secondaryActionLabel ? (
            <Link
              href="/login"
              className="mt-2 flex h-[52px] w-full items-center justify-center rounded-full bg-white text-[14px] font-medium leading-5 text-black transition hover:bg-[#f7f7f7] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-[#f8f6f1]"
            >
              {slideData.secondaryActionLabel}
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

