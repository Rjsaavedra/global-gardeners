"use client";

import { useState } from "react";

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

function formatTemperatureLabel(value: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return "18 deg - 24 deg";
  if (normalized.toLowerCase().includes("deg")) return normalized;
  const rangeMatch = normalized.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
  if (rangeMatch) return `${rangeMatch[1]} deg - ${rangeMatch[2]} deg`;
  const singleMatch = normalized.match(/^(-?\d+(?:\.\d+)?)$/);
  if (singleMatch) return `${singleMatch[1]} deg`;
  return normalized;
}

export function PlantDetailsContent({
  lightValue,
  waterValue,
  temperatureValue,
  humidityValue,
  description,
  careSections,
  disableActions = false,
}: {
  lightValue: string;
  waterValue: string;
  temperatureValue: string;
  humidityValue: string;
  description: string;
  careSections: Array<{ title: string; content: string }>;
  disableActions?: boolean;
}) {
  const [openAccordion, setOpenAccordion] = useState(careSections[0]?.title || "Watering & Moisture");
  const toggleAccordion = (title: string) => setOpenAccordion((current) => (current === title ? "" : title));

  return (
    <>
      <div className="mt-8 flex flex-col gap-3">
        <button type="button" disabled={disableActions} className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-[14px] font-medium leading-5 text-[#333333] disabled:opacity-60">
          View growth timeline
          <img src={rightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
        </button>
        <button type="button" disabled={disableActions} className="flex min-h-10 items-center justify-between rounded-[100px] border border-black/10 bg-white py-4 pl-6 pr-4 text-left disabled:opacity-60">
          <span>
            <span className="block text-[14px] font-medium leading-5 text-[#333333]">Ask Grow Mate</span>
            <span className="block text-[12px] font-medium leading-4 text-[#333333cc]">Get personalized care tips for this plant.</span>
          </span>
          <img src={rightIcon} alt="" aria-hidden="true" className="h-6 w-6" />
        </button>
      </div>

      <div className="mt-8 space-y-2">
        <div className="flex gap-2">
          <DetailTile label="Light" value={lightValue} icon={sunIcon} tone="yellow" />
          <DetailTile label="Water" value={waterValue} icon={dropletIcon} tone="blue" />
        </div>
        <div className="flex gap-2">
          <DetailTile label="Temperature" value={formatTemperatureLabel(temperatureValue)} icon={thermoIcon} tone="orange" />
          <DetailTile label="Humidity" value={humidityValue} icon={cloudyIcon} tone="teal" />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[14px] font-medium leading-5 text-[#333333]">Description and Care Details</p>
        <p className="mt-2 text-[14px] font-medium leading-5 text-[#333333cc]">{description}</p>
      </div>

      <div className="mt-8 bg-[#f8f6f1]">
        {careSections.map((section) => (
          <div key={section.title} className="border-t border-black/10">
            <button type="button" onClick={() => toggleAccordion(section.title)} className="flex w-full items-center justify-between py-4 text-left">
              <p className="text-[14px] font-medium leading-5 text-[#333333]">{section.title}</p>
              <img src={openAccordion === section.title ? chevronUpIcon : chevronDownIcon} alt="" aria-hidden="true" className="h-4 w-4" />
            </button>
            {openAccordion === section.title ? <div className="pb-4 whitespace-pre-line text-[14px] font-medium leading-5 text-[#333333cc]">{section.content}</div> : null}
          </div>
        ))}
      </div>
    </>
  );
}

