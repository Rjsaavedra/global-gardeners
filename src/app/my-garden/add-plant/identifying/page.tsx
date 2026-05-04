"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../../../../../public/lottie/green-circle-loader.json";

export default function IdentifyLoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/my-garden/add-plant/results");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <div className="absolute left-1/2 top-[calc(50%-69px)] flex w-[358px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-10">
          <div className="relative h-[120px] w-[120px] overflow-hidden">
            <Lottie animationData={loaderAnimation} autoplay loop />
          </div>
          <div className="flex h-[66px] w-full flex-col items-center gap-2">
            <p className="w-full text-center text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#182a17]">
              Finding possible matches
            </p>
            <p className="w-[268px] text-center text-[16px] font-medium leading-6 text-[#333333cc]">This may take a few seconds.</p>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 bg-[#f8f6f1] p-4">
          <button
            type="button"
            onClick={() => router.push("/my-garden/add-plant")}
            className="h-[52px] w-full rounded-[100px] bg-[#457941] text-center text-[14px] font-medium leading-5 text-[#fafafa]"
          >
            Cancel
          </button>
        </div>
      </section>
    </main>
  );
}
