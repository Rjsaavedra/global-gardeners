"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const heroImage = "/images/figma/placeholder-expired.png";
const closeIcon = "/icons/new-plant/x.svg";
const moreIcon = "/icons/new-plant/ellipsis-vertical.svg";
const leafIcon = "/icons/logs/leaf.svg";
const rightIcon = "/icons/my-garden-chevron-right.svg";
const sunIcon = "/icons/new-plant/sun.svg";
const dropletIcon = "/icons/new-plant/droplet.svg";
const thermoIcon = "/icons/new-plant/thermometer.svg";
const cloudyIcon = "/icons/new-plant/cloudy.svg";
const chevronUpIcon = "/icons/new-plant/chevron-up.svg";
const chevronDownIcon = "/icons/new-plant/chevron-down.svg";

function DetailTile({ label, value, icon, tone }: { label: string; value: string; icon: string; tone: "yellow" | "blue" | "orange" | "teal" }) {
  const toneClass =
    tone === "yellow"
      ? "bg-[rgba(212,167,44,0.1)] text-[#d4a72c]"
      : tone === "blue"
        ? "bg-[rgba(47,128,197,0.1)] text-[#2f80c5]"
        : tone === "orange"
          ? "bg-[rgba(224,107,79,0.1)] text-[#e06b4f]"
          : "bg-[rgba(95,168,154,0.1)] text-[#5fa89a]";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[8px] bg-white p-3">
      <div className={`rounded-[6px] p-2 ${toneClass}`}>
        <img src={icon} alt="" aria-hidden="true" className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className={`text-[14px] font-medium leading-5 ${toneClass.split(" ")[1]}`}>{label}</p>
        <p className="text-[14px] font-medium leading-5 text-[#333333]">{value}</p>
      </div>
    </div>
  );
}

function AccordionRow({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-t border-black/10">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between py-4 text-left">
        <p className="text-[14px] font-medium leading-5 text-[#333333]">{title}</p>
        <img src={expanded ? chevronUpIcon : chevronDownIcon} alt="" aria-hidden="true" className="h-4 w-4" />
      </button>
      {expanded ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

export default function PlantDetailPage() {
  const router = useRouter();
  const [openAccordion, setOpenAccordion] = useState("Watering & Moisture");
  const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  const toggleAccordion = (title: string) => {
    setOpenAccordion((current) => (current === title ? "" : title));
  };

  return (
    <main className="client-main min-h-screen bg-[#f8f6f1] px-0 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1]">
        <div className="relative h-[357px] w-full overflow-hidden">
          <img src={heroImage} alt="Rattlesnake Plant" className="h-full w-full object-cover" />

          <div className="absolute left-1/2 top-[325px] -translate-x-1/2 rounded-[999px] bg-[#f4f1e8] px-2 py-1.5">
            <div aria-hidden="true" className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7d2c8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#182a17]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7d2c8]" />
            </div>
          </div>

          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <button type="button" onClick={() => router.push("/my-garden")} className="flex min-h-10 min-w-10 items-center justify-center rounded-full border-[1.111px] border-[rgba(146,146,146,0.24)] bg-white p-[8.889px]">
              <img src={closeIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
            <button type="button" className="flex min-h-10 min-w-10 items-center justify-center rounded-full border border-black/10 bg-white p-[8.889px]">
              <img src={moreIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-[104px] pt-6">
          <h1 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">Rattlesnake Plant</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-[#f0fdf4] p-1.5">
              <img src={leafIcon} alt="" aria-hidden="true" className="h-4 w-4" />
            </span>
            <p className="text-[16px] font-medium leading-6 text-[#333333cc]">Goeppertia insignis</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push("/plant/growth-timeline?returnTo=/plant")}
              className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333]"
            >
              View growth timeline
              <img src={rightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
            <button type="button" className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-left">
              <span>
                <span className="block text-[14px] font-medium leading-5 text-[#333333]">Ask Grow Mate</span>
                <span className="block text-[12px] font-medium leading-4 text-[#333333cc]">Get personalized care tips for this plant.</span>
              </span>
              <img src={rightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex gap-2">
              <DetailTile label="Light" value="Medium Light" icon={sunIcon} tone="yellow" />
              <DetailTile label="Water" value="Every 5 days" icon={dropletIcon} tone="blue" />
            </div>
            <div className="flex gap-2">
              <DetailTile label="Temperature" value="65 deg - 75 deg" icon={thermoIcon} tone="orange" />
              <DetailTile label="Humidity" value="70%" icon={cloudyIcon} tone="teal" />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[14px] font-medium leading-5 text-[#333333]">Description and Care Details</p>
            <p className="mt-2 text-[14px] font-medium leading-5 text-[#333333cc]">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s.</p>
          </div>

          <div className="mt-8 bg-[#f8f6f1]">
            <AccordionRow title="Watering & Moisture" expanded={openAccordion === "Watering & Moisture"} onToggle={() => toggleAccordion("Watering & Moisture")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">
                Our flagship product combines cutting-edge technology with sleek design. Built with premium materials, it offers unparalleled performance and reliability.
              </p>
            </AccordionRow>
            <AccordionRow title="Light" expanded={openAccordion === "Light"} onToggle={() => toggleAccordion("Light")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{loremIpsum}</p>
            </AccordionRow>
            <AccordionRow title="Temperature" expanded={openAccordion === "Temperature"} onToggle={() => toggleAccordion("Temperature")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{loremIpsum}</p>
            </AccordionRow>
            <AccordionRow title="Humidity" expanded={openAccordion === "Humidity"} onToggle={() => toggleAccordion("Humidity")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{loremIpsum}</p>
            </AccordionRow>
            <AccordionRow title="Fertilizing" expanded={openAccordion === "Fertilizing"} onToggle={() => toggleAccordion("Fertilizing")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{loremIpsum}</p>
            </AccordionRow>
            <AccordionRow title="Repotting" expanded={openAccordion === "Repotting"} onToggle={() => toggleAccordion("Repotting")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{loremIpsum}</p>
            </AccordionRow>
            <AccordionRow title="Soil" expanded={openAccordion === "Soil"} onToggle={() => toggleAccordion("Soil")}>
              <p className="text-[14px] font-medium leading-5 text-[#333333cc]">{loremIpsum}</p>
            </AccordionRow>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 bg-[#f8f6f1] px-4 pb-4 pt-5">
          <button type="button" className="h-[52px] w-full rounded-[1000px] bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]">
            Add to My Garden
          </button>
        </div>
      </section>
    </main>
  );
}


