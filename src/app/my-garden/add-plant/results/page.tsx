"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const imgPlant = "https://www.figma.com/api/mcp/asset/3122ca93-4b4a-4191-8c78-37b13080c705";
const imgRightIcon = "https://www.figma.com/api/mcp/asset/af60a1a8-8bf4-462c-884a-2708b905e87a";
const imgSliderDots = "https://www.figma.com/api/mcp/asset/3eb5ee4c-11cb-4eae-8b76-8deccf4394b7";
const imgCheckRing = "https://www.figma.com/api/mcp/asset/5aedf625-371c-4076-aa85-6dce330463e8";
const imgCheck = "https://www.figma.com/api/mcp/asset/29f8e773-9c0d-4968-bb15-0639450c19bb";
const imgLeaf = "https://www.figma.com/api/mcp/asset/39f1608b-e01f-430a-b50c-02d10f0f9f65";
const imgCircle = "https://www.figma.com/api/mcp/asset/1fb23558-3e85-41df-99bf-9fb83530dbed";
const imgSprout = "https://www.figma.com/api/mcp/asset/8deba637-ea7a-400a-8f0b-edba5a765b18";

type MatchOption = {
  id: string;
  score: string;
  scoreTone: "high" | "mid" | "low";
};

const matchOptions: MatchOption[] = [
  { id: "rattlesnake-high", score: "87%", scoreTone: "high" },
  { id: "rattlesnake-mid", score: "60%", scoreTone: "mid" },
  { id: "rattlesnake-low", score: "10%", scoreTone: "low" },
];

function ScorePill({ score, tone }: { score: string; tone: MatchOption["scoreTone"] }) {
  const toneClass =
    tone === "high"
      ? "border-[#4579411a] bg-[#f0fdf4] text-[#457941]"
      : tone === "mid"
        ? "border-[#ca8a041a] bg-[#fefce8] text-[#ca8a04]"
        : "border-[#7373731a] bg-[#f8fafc] text-[#737373]";

  return (
    <div className={`flex h-[51px] items-center justify-center rounded-[8px] border px-3 py-2 ${toneClass}`}>
      <div className="flex flex-col items-center justify-center gap-[6px]">
        <p className="text-[18px] font-semibold leading-[0.8]">{score}</p>
        <p className="text-[12px] font-medium leading-[0.8]">match</p>
      </div>
    </div>
  );
}

function IdentifyResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNoMatchState = searchParams.get("state") === "empty";
  const [selectedResult, setSelectedResult] = useState<string>("rattlesnake-high");

  const handleConfirm = () => {
    if (!selectedResult) return;
    sessionStorage.setItem("ggPlantIdentifySelection", selectedResult);
    router.push("/my-garden/add-plant/detail");
  };

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] pb-[104px]">
        <header className="client-header fixed left-0 right-0 top-0 z-30 flex w-full items-center border-b border-black/10 bg-white p-4">
          <button
            type="button"
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center"
            onClick={() => router.back()}
          >
            <Image src="/icons/back-button.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center pr-10">
            <h1 className="text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#457941]">Possible matches</h1>
          </div>
        </header>

        <div className="px-4 pt-[104px]">
          {isNoMatchState ? (
            <>
              <div className="mt-[48px] flex flex-col items-center justify-center gap-4">
                <div className="rounded-[100px] bg-[#fefce8] p-3">
                  <img src={imgSprout} alt="" aria-hidden="true" className="h-10 w-10" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[20px] font-semibold leading-6 text-[#333333]">No matches found</p>
                  <p className="w-[242px] text-center text-[14px] font-medium leading-5 text-[#333333cc]">
                    We couldn&apos;t find a confident match for this photo.
                  </p>
                </div>
              </div>

              <div className="mt-[72px]">
                <p className="text-[16px] font-medium leading-6 text-[#333333]">Don&apos;t worry, there are other ways to identify your plant.</p>
                <div className="mt-6 flex flex-col gap-3">
                  <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]">
                    Try another photo
                    <img src={imgRightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
                  </button>
                  <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]">
                    Ask the community
                    <img src={imgRightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
                  </button>
                  <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]">
                    Add plant manually
                    <img src={imgRightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-[20px] font-semibold leading-6 text-[#333333]">Which plant is this?</p>
              <p className="mt-2 text-[14px] font-medium leading-5 text-[#333333cc]">Select the closest match based on confidence score.</p>

              <div className="mt-4 flex flex-col gap-4">
                {matchOptions.map((option) => {
                  const isSelected = selectedResult === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedResult(option.id);
                      }}
                      className="w-full rounded-[12px] border border-black/10 bg-white p-4 text-left"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="relative h-[150px] w-full overflow-hidden rounded-[8px] p-2">
                          <img src={imgPlant} alt="Rattlesnake Plant" className="absolute inset-0 h-full w-full rounded-[8px] object-cover" />
                          <div className="absolute right-2 top-2 h-8 w-8">
                            {isSelected ? (
                              <>
                                <img src={imgCheckRing} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
                                <img src={imgCheck} alt="" aria-hidden="true" className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
                              </>
                            ) : (
                              <img src={imgCircle} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" />
                            )}
                          </div>
                          <div className="absolute left-1/2 top-[126px] -translate-x-1/2 rounded-[999px] bg-[#f4f1e8] p-1">
                            <img src={imgSliderDots} alt="" aria-hidden="true" className="h-2 w-[44px]" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[18px] font-semibold leading-[27px] text-[#333333]">Rattlesnake Plant</p>
                            <div className="mt-1 flex items-center gap-1">
                              <span className="rounded-[3px] bg-[#f0fdf4] p-1">
                                <img src={imgLeaf} alt="" aria-hidden="true" className="h-3 w-3" />
                              </span>
                              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">Goeppertia insignis</p>
                            </div>
                          </div>
                          <ScorePill score={option.score} tone={option.scoreTone} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => router.push("/my-garden/add-plant/results?state=empty")}
                className="mt-6 text-left text-[16px] font-medium leading-6 text-[#333333]"
              >
                None of these match your plant?
              </button>
              <div className="mt-6 flex flex-col gap-3">
                <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]">
                  Ask the community
                  <img src={imgRightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
                </button>
                <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]">
                  Add plant manually
                  <img src={imgRightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
        </div>

        {!isNoMatchState ? (
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-[#e5e5e5] bg-[#f8f6f1] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedResult}
              className="h-[52px] w-full rounded-[100px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa] disabled:opacity-50"
            >
              Confirm selection
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function IdentifyResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
          <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] items-center justify-center border border-[#e7e0d2] bg-[#f8f6f1] pb-[104px]">
            <p className="text-[14px] text-[#525252]">Loading...</p>
          </section>
        </main>
      }
    >
      <IdentifyResultsPageContent />
    </Suspense>
  );
}
