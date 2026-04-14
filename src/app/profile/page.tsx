"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DrawerItem, DrawerProfile, SideDrawer } from "@/components/feed-side-drawer";

type ProfileMeResponse = {
  fullName: string;
  nickname: string;
  profilePhotoUrl: string | null;
};

type FeedPost = {
  id: string;
  source: "you" | "following" | "interest";
  username: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  hearts: number;
};

type OnboardingStatus = {
  pricingCompleted: boolean;
  interestsCompleted: boolean;
  firstPostCompleted: boolean;
  nextStep: "/feed" | "/pricing" | "/interests" | "/onboarding";
};

function getInitials(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "GG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M13.0823 20.625C13.2894 20.2663 13.7481 20.1435 14.1067 20.3506C14.4655 20.5577 14.5883 21.0163 14.3812 21.375C14.1398 21.7929 13.7932 22.1405 13.3753 22.3818C12.9574 22.6231 12.4829 22.7499 12.0003 22.75C11.5178 22.75 11.0432 22.623 10.6253 22.3818C10.2073 22.1405 9.85984 21.793 9.61847 21.375C9.41134 21.0163 9.53418 20.5577 9.89288 20.3506C10.2516 20.1435 10.7102 20.2663 10.9173 20.625C11.027 20.815 11.1853 20.9723 11.3753 21.082C11.5653 21.1917 11.7809 21.25 12.0003 21.25C12.2196 21.2499 12.4354 21.1917 12.6253 21.082C12.8151 20.9724 12.9727 20.8148 13.0823 20.625Z" fill="currentColor" />
      <path d="M17.2496 8C17.2496 6.60779 16.6969 5.27262 15.7125 4.28809C14.728 3.30352 13.392 2.75 11.9996 2.75C10.6073 2.75007 9.27223 3.30358 8.28772 4.28809C7.30323 5.27264 6.74963 6.60767 6.74963 8C6.74963 10.3279 6.38421 11.9327 5.80628 13.1562C5.2337 14.3683 4.47511 15.1507 3.81604 15.8311L3.776 15.8906C3.76542 15.9124 3.75748 15.9359 3.75354 15.96C3.74582 16.0076 3.75265 16.0564 3.7721 16.1006C3.7916 16.1448 3.82343 16.1825 3.86389 16.209C3.90447 16.2355 3.95216 16.25 4.00061 16.25H20.0006C20.0487 16.2499 20.096 16.2361 20.1364 16.21C20.1769 16.1836 20.2095 16.1458 20.2291 16.1016C20.2487 16.0573 20.2545 16.0078 20.2467 15.96C20.239 15.9122 20.2177 15.8678 20.1852 15.832C19.5247 15.1513 18.7654 14.3687 18.193 13.1572C17.6148 11.9335 17.2496 10.328 17.2496 8Z" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M20 11.25C20.4142 11.25 20.75 11.5858 20.75 12C20.75 12.4142 20.4142 12.75 20 12.75H4C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H20Z" fill="currentColor" />
      <path d="M20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75H4C3.58579 18.75 3.25 18.4142 3.25 18C3.25 17.5858 3.58579 17.25 4 17.25H20Z" fill="currentColor" />
      <path d="M20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75H4C3.58579 6.75 3.25 6.41421 3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20Z" fill="currentColor" />
    </svg>
  );
}

const drawerItems: DrawerItem[] = [
  {
    label: "Stream",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M9.25 4C9.25 3.86193 9.13807 3.75 9 3.75H4C3.86193 3.75 3.75 3.86193 3.75 4V9C3.75 9.13807 3.86193 9.25 4 9.25H9C9.13807 9.25 9.25 9.13807 9.25 9V4ZM10.75 9C10.75 9.9665 9.9665 10.75 9 10.75H4C3.0335 10.75 2.25 9.9665 2.25 9V4C2.25 3.0335 3.0335 2.25 4 2.25H9C9.9665 2.25 10.75 3.0335 10.75 4V9Z"
          fill="currentColor"
        />
        <path
          d="M20.25 4C20.25 3.86193 20.1381 3.75 20 3.75H15C14.8619 3.75 14.75 3.86193 14.75 4V9C14.75 9.13807 14.8619 9.25 15 9.25H20C20.1381 9.25 20.25 9.13807 20.25 9V4ZM21.75 9C21.75 9.9665 20.9665 10.75 20 10.75H15C14.0335 10.75 13.25 9.9665 13.25 9V4C13.25 3.0335 14.0335 2.25 15 2.25H20C20.9665 2.25 21.75 3.0335 21.75 4V9Z"
          fill="currentColor"
        />
        <path
          d="M20.25 15C20.25 14.8619 20.1381 14.75 20 14.75H15C14.8619 14.75 14.75 14.8619 14.75 15V20C14.75 20.1381 14.8619 20.25 15 20.25H20C20.1381 20.25 20.25 20.1381 20.25 20V15ZM21.75 20C21.75 20.9665 20.9665 21.75 20 21.75H15C14.0335 21.75 13.25 20.9665 13.25 20V15C13.25 14.0335 14.0335 13.25 15 13.25H20C20.9665 13.25 21.75 14.0335 21.75 15V20Z"
          fill="currentColor"
        />
        <path
          d="M9.25 15C9.25 14.8619 9.13807 14.75 9 14.75H4C3.86193 14.75 3.75 14.8619 3.75 15V20C3.75 20.1381 3.86193 20.25 4 20.25H9C9.13807 20.25 9.25 20.1381 9.25 20V15ZM10.75 20C10.75 20.9665 9.9665 21.75 9 21.75H4C3.0335 21.75 2.25 20.9665 2.25 20V15C2.25 14.0335 3.0335 13.25 4 13.25H9C9.9665 13.25 10.75 14.0335 10.75 15V20Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "My Garden",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M20.2503 10.0004C20.2503 6.96752 19.598 5.0341 18.8186 3.34805C18.0268 4.17592 17.2021 4.77396 16.0852 5.25625C14.6598 5.87171 12.7766 6.28925 9.94167 6.83633C9.93652 6.83732 9.93122 6.83838 9.92605 6.83926C8.3807 7.10331 6.9909 7.9394 6.03249 9.18008C5.07424 10.4207 4.61738 11.9766 4.75222 13.5385C4.88718 15.1003 5.60423 16.5547 6.76101 17.6127C7.91777 18.6705 9.42982 19.255 10.9973 19.2504H11.0003L11.4505 19.2387C16.0919 18.9889 20.2503 14.9143 20.2503 10.0004ZM21.7503 10.0004C21.7503 15.9276 16.6214 20.7487 11.0012 20.7494L11.0022 20.7504C9.05816 20.7563 7.18286 20.0312 5.74831 18.7191C4.31387 17.4072 3.42438 15.6041 3.2571 13.6674C3.08989 11.7306 3.65755 9.80158 4.84597 8.26309C6.0311 6.72891 7.74765 5.69411 9.65749 5.36367C12.5226 4.81076 14.2409 4.41884 15.4905 3.8793C16.6878 3.36227 17.4708 2.70208 18.4163 1.52969L18.4807 1.45938C18.6394 1.30707 18.8585 1.23041 19.0803 1.2543C19.3341 1.28169 19.557 1.43713 19.6712 1.66543C20.6951 3.71331 21.7503 6.01457 21.7503 10.0004Z"
          fill="currentColor"
        />
        <path
          d="M1.25 21.0004C1.25 17.6365 3.35918 14.9735 6.93457 14.265C8.05228 14.0433 9.21104 13.575 10.2178 13.0346C11.2305 12.4909 12.0383 11.9016 12.4697 11.4701C12.7626 11.1772 13.2374 11.1772 13.5303 11.4701C13.8232 11.763 13.8232 12.2378 13.5303 12.5307C12.9617 13.0992 12.0191 13.7695 10.9268 14.3559C9.82866 14.9453 8.52766 15.4775 7.22559 15.7357C4.34105 16.3073 2.75 18.3643 2.75 21.0004C2.75 21.4146 2.41421 21.7504 2 21.7504C1.58579 21.7504 1.25 21.4146 1.25 21.0004Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Plant ID",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M2.25 7V5C2.25 4.27065 2.53994 3.57139 3.05566 3.05566C3.57139 2.53994 4.27065 2.25 5 2.25H7C7.41421 2.25 7.75 2.58579 7.75 3C7.75 3.41421 7.41421 3.75 7 3.75H5C4.66848 3.75 4.35063 3.88179 4.11621 4.11621C3.88179 4.35063 3.75 4.66848 3.75 5V7C3.75 7.41421 3.41421 7.75 3 7.75C2.58579 7.75 2.25 7.41421 2.25 7Z"
          fill="currentColor"
        />
        <path
          d="M20.25 7V5C20.25 4.66848 20.1182 4.35063 19.8838 4.11621C19.6494 3.88179 19.3315 3.75 19 3.75H17C16.5858 3.75 16.25 3.41421 16.25 3C16.25 2.58579 16.5858 2.25 17 2.25H19C19.7293 2.25 20.4286 2.53994 20.9443 3.05566C21.4601 3.57139 21.75 4.27065 21.75 5V7C21.75 7.41421 21.4142 7.75 21 7.75C20.5858 7.75 20.25 7.41421 20.25 7Z"
          fill="currentColor"
        />
        <path
          d="M20.25 19V17C20.25 16.5858 20.5858 16.25 21 16.25C21.4142 16.25 21.75 16.5858 21.75 17V19C21.75 19.7293 21.4601 20.4286 20.9443 20.9443C20.4286 21.4601 19.7293 21.75 19 21.75H17C16.5858 21.75 16.25 21.4142 16.25 21C16.25 20.5858 16.5858 20.25 17 20.25H19C19.3315 20.25 19.6494 20.1182 19.8838 19.8838C20.1182 19.6494 20.25 19.3315 20.25 19Z"
          fill="currentColor"
        />
        <path
          d="M2.25 19V17C2.25 16.5858 2.58579 16.25 3 16.25C3.41421 16.25 3.75 16.5858 3.75 17V19C3.75 19.3315 3.88179 19.6494 4.11621 19.8838C4.35063 20.1182 4.66848 20.25 5 20.25H7C7.41421 20.25 7.75 20.5858 7.75 21C7.75 21.4142 7.41421 21.75 7 21.75H5C4.27065 21.75 3.57139 21.4601 3.05566 20.9443C2.53994 20.4286 2.25 19.7293 2.25 19Z"
          fill="currentColor"
        />
        <path
          d="M14.25 12C14.25 10.7574 13.2426 9.75 12 9.75C10.7574 9.75 9.75 10.7574 9.75 12C9.75 13.2426 10.7574 14.25 12 14.25C13.2426 14.25 14.25 13.2426 14.25 12ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z"
          fill="currentColor"
        />
        <path
          d="M13.5697 13.5697C13.8626 13.2768 14.3374 13.2768 14.6303 13.5697L16.5307 15.4701C16.8232 15.763 16.8234 16.2379 16.5307 16.5307C16.2379 16.8234 15.763 16.8232 15.4701 16.5307L13.5697 14.6303C13.2768 14.3374 13.2768 13.8626 13.5697 13.5697Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "MyGrowMate",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M12.1021 1.25391C12.305 1.27045 12.5007 1.33681 12.6724 1.44629L12.7563 1.50391L12.8345 1.56934C12.9859 1.70506 13.1018 1.87567 13.1724 2.06641L13.2046 2.16309L13.2085 2.17773L14.7896 8.3125L14.8413 8.47168C14.904 8.62573 14.9973 8.76638 15.1157 8.88477C15.2736 9.04257 15.4709 9.15513 15.687 9.21094L21.8218 10.792L21.8345 10.7949C22.0652 10.8586 22.272 10.9872 22.4312 11.1641L22.4966 11.2432L22.5552 11.3271C22.6832 11.5275 22.7524 11.7608 22.7524 12C22.7524 12.2736 22.6623 12.5401 22.4966 12.7578C22.3309 12.9754 22.0981 13.1323 21.8345 13.2051L21.8218 13.209L15.687 14.7891C15.4708 14.8449 15.2736 14.9583 15.1157 15.1162C14.9579 15.2741 14.8454 15.4713 14.7896 15.6875L13.2075 21.8223C13.2063 21.827 13.2049 21.8322 13.2036 21.8369C13.1301 22.0994 12.9725 22.3312 12.7554 22.4961C12.5381 22.6609 12.2723 22.751 11.9995 22.751C11.7267 22.751 11.461 22.661 11.2437 22.4961C11.0265 22.3312 10.8689 22.0995 10.7954 21.8369C10.7941 21.8321 10.7928 21.8271 10.7915 21.8223L9.21045 15.6875C9.15465 15.4713 9.04211 15.2741 8.88428 15.1162C8.72639 14.9583 8.52918 14.8449 8.31299 14.7891L2.17725 13.207C2.17156 13.2056 2.16532 13.2047 2.15967 13.2031C1.89819 13.1288 1.66831 12.9708 1.50439 12.7539C1.3404 12.5369 1.25146 12.272 1.25146 12C1.25152 11.7282 1.34054 11.464 1.50439 11.2471L1.56885 11.168C1.72624 10.9916 1.93095 10.8629 2.15967 10.7979L2.17725 10.793L8.31299 9.20996C8.5291 9.15419 8.7264 9.04155 8.88428 8.88379C9.04218 8.72598 9.15455 8.52863 9.21045 8.3125L10.7925 2.17773C10.7937 2.17284 10.795 2.16795 10.7964 2.16309C10.8699 1.90044 11.0274 1.66877 11.2446 1.50391L11.3286 1.44629C11.5288 1.31866 11.7617 1.25 12.0005 1.25L12.1021 1.25391ZM10.6636 8.6875L10.6626 8.68848C10.5396 9.16367 10.292 9.5973 9.94482 9.94434C9.59735 10.2916 9.16269 10.5395 8.68701 10.6621L3.50244 11.999L8.68701 13.3369C9.16286 13.4597 9.59733 13.7082 9.94482 14.0557C10.2922 14.4031 10.5408 14.8368 10.6636 15.3125L11.9995 20.4971L13.3364 15.3125C13.4592 14.8368 13.7078 14.4031 14.0552 14.0557C14.4027 13.7082 14.8371 13.4597 15.313 13.3369L20.4995 12L15.313 10.6631C14.8372 10.5403 14.4026 10.2927 14.0552 9.94531C13.7511 9.64129 13.5227 9.27087 13.3882 8.86426L13.3364 8.6875L11.9995 3.50293L10.6636 8.6875Z"
          fill="currentColor"
        />
        <path
          d="M19.2499 7.00025V3.00025C19.2499 2.58604 19.5857 2.25025 19.9999 2.25025C20.4142 2.25025 20.7499 2.58604 20.7499 3.00025V7.00025C20.7499 7.41446 20.4142 7.75025 19.9999 7.75025C19.5857 7.75025 19.2499 7.41446 19.2499 7.00025Z"
          fill="currentColor"
        />
        <path
          d="M21.9999 4.25025C22.4142 4.25025 22.7499 4.58604 22.7499 5.00025C22.7499 5.41446 22.4142 5.75025 21.9999 5.75025H17.9999C17.5857 5.75025 17.2499 5.41446 17.2499 5.00025C17.2499 4.58604 17.5857 4.25025 17.9999 4.25025H21.9999Z"
          fill="currentColor"
        />
        <path
          d="M3.24994 19.0002V17.0002C3.24994 16.586 3.58573 16.2502 3.99994 16.2502C4.41415 16.2502 4.74994 16.586 4.74994 17.0002V19.0002C4.74994 19.4145 4.41415 19.7502 3.99994 19.7502C3.58573 19.7502 3.24994 19.4145 3.24994 19.0002Z"
          fill="currentColor"
        />
        <path
          d="M4.99994 17.2502C5.41415 17.2502 5.74994 17.586 5.74994 18.0002C5.74994 18.4145 5.41415 18.7502 4.99994 18.7502H2.99994C2.58573 18.7502 2.24994 18.4145 2.24994 18.0002C2.24994 17.586 2.58573 17.2502 2.99994 17.2502H4.99994Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Guides",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M11.25 21V7C11.25 6.58579 11.5858 6.25 12 6.25C12.4142 6.25 12.75 6.58579 12.75 7V21C12.75 21.4142 12.4142 21.75 12 21.75C11.5858 21.75 11.25 21.4142 11.25 21Z"
          fill="currentColor"
        />
        <path
          d="M18 11.25C18.4142 11.25 18.75 11.5858 18.75 12C18.75 12.4142 18.4142 12.75 18 12.75H16C15.5858 12.75 15.25 12.4142 15.25 12C15.25 11.5858 15.5858 11.25 16 11.25H18Z"
          fill="currentColor"
        />
        <path
          d="M18 7.25C18.4142 7.25 18.75 7.58579 18.75 8C18.75 8.41421 18.4142 8.75 18 8.75H16C15.5858 8.75 15.25 8.41421 15.25 8C15.25 7.58579 15.5858 7.25 16 7.25H18Z"
          fill="currentColor"
        />
        <path
          d="M21.25 4C21.25 3.93369 21.2236 3.87013 21.1768 3.82324C21.1299 3.77636 21.0663 3.75 21 3.75H16C15.138 3.75 14.3116 4.09266 13.7021 4.70215C13.0927 5.31164 12.75 6.13805 12.75 7C12.75 7.41421 12.4142 7.75 12 7.75C11.5858 7.75 11.25 7.41421 11.25 7C11.25 6.13805 10.9073 5.31164 10.2979 4.70215C9.68836 4.09266 8.86195 3.75 8 3.75H3C2.9337 3.75 2.87013 3.77636 2.82324 3.82324C2.77636 3.87013 2.75 3.9337 2.75 4V17C2.75 17.0663 2.77636 17.1299 2.82324 17.1768C2.87013 17.2236 2.93369 17.25 3 17.25H9C9.99456 17.25 10.9481 17.6454 11.6514 18.3486C11.7778 18.475 11.894 18.6096 12 18.751C12.106 18.6096 12.2222 18.475 12.3486 18.3486C13.0519 17.6454 14.0054 17.25 15 17.25H21C21.0663 17.25 21.1299 17.2236 21.1768 17.1768C21.2236 17.1299 21.25 17.0663 21.25 17V4ZM22.75 17C22.75 17.4641 22.5655 17.9091 22.2373 18.2373C21.9091 18.5655 21.4641 18.75 21 18.75H15C14.4033 18.75 13.8311 18.9872 13.4092 19.4092C12.9872 19.8311 12.75 20.4033 12.75 21C12.75 21.4142 12.4142 21.75 12 21.75C11.5858 21.75 11.25 21.4142 11.25 21C11.25 20.4033 11.0128 19.8311 10.5908 19.4092C10.1689 18.9872 9.59674 18.75 9 18.75H3C2.53587 18.75 2.09089 18.5655 1.7627 18.2373C1.43451 17.9091 1.25 17.4641 1.25 17V4C1.25 3.53587 1.43451 3.09088 1.7627 2.7627C2.09088 2.43451 2.53587 2.25 3 2.25H8C9.25978 2.25 10.4676 2.7508 11.3584 3.6416C11.6024 3.88557 11.8169 4.15334 12 4.43945C12.1831 4.15334 12.3976 3.88557 12.6416 3.6416C13.5324 2.7508 14.7402 2.25 16 2.25H21C21.4641 2.25 21.9091 2.43451 22.2373 2.7627C22.5655 3.09089 22.75 3.53587 22.75 4V17Z"
          fill="currentColor"
        />
        <path
          d="M8 11.25C8.41421 11.25 8.75 11.5858 8.75 12C8.75 12.4142 8.41421 12.75 8 12.75H6C5.58579 12.75 5.25 12.4142 5.25 12C5.25 11.5858 5.58579 11.25 6 11.25H8Z"
          fill="currentColor"
        />
        <path
          d="M8 7.25C8.41421 7.25 8.75 7.58579 8.75 8C8.75 8.41421 8.41421 8.75 8 8.75H6C5.58579 8.75 5.25 8.41421 5.25 8C5.25 7.58579 5.58579 7.25 6 7.25H8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Influencer Spotlight",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M5.64062 2.34168C5.88136 2.21025 6.17452 2.22079 6.40527 2.36903L20.4053 11.369C20.6199 11.507 20.75 11.7447 20.75 11.9999C20.75 12.2551 20.6199 12.4927 20.4053 12.6307L6.40527 21.6307C6.17452 21.779 5.88136 21.7895 5.64062 21.6581C5.39983 21.5266 5.25 21.2742 5.25 20.9999V2.99989C5.25 2.72554 5.39983 2.47316 5.64062 2.34168ZM6.75 19.6259L18.6133 11.9999L6.75 4.37293V19.6259Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Notifications",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M13.0823 20.625C13.2894 20.2663 13.7481 20.1435 14.1067 20.3506C14.4655 20.5577 14.5883 21.0163 14.3812 21.375C14.1398 21.7929 13.7932 22.1405 13.3753 22.3818C12.9574 22.6231 12.4829 22.7499 12.0003 22.75C11.5178 22.75 11.0432 22.623 10.6253 22.3818C10.2073 22.1405 9.85984 21.793 9.61847 21.375C9.41134 21.0163 9.53418 20.5577 9.89288 20.3506C10.2516 20.1435 10.7102 20.2663 10.9173 20.625C11.027 20.815 11.1853 20.9723 11.3753 21.082C11.5653 21.1917 11.7809 21.25 12.0003 21.25C12.2196 21.2499 12.4354 21.1917 12.6253 21.082C12.8151 20.9724 12.9727 20.8148 13.0823 20.625Z"
          fill="currentColor"
        />
        <path
          d="M17.2496 8C17.2496 6.60779 16.6969 5.27262 15.7125 4.28809C14.728 3.30352 13.392 2.75 11.9996 2.75C10.6073 2.75007 9.27223 3.30358 8.28772 4.28809C7.30323 5.27264 6.74963 6.60767 6.74963 8C6.74963 10.3279 6.38421 11.9327 5.80628 13.1562C5.2337 14.3683 4.47511 15.1507 3.81604 15.8311L3.776 15.8906C3.76542 15.9124 3.75748 15.9359 3.75354 15.96C3.74582 16.0076 3.75265 16.0564 3.7721 16.1006C3.7916 16.1448 3.82343 16.1825 3.86389 16.209C3.90447 16.2355 3.95216 16.25 4.00061 16.25H20.0006C20.0487 16.2499 20.096 16.2361 20.1364 16.21C20.1769 16.1836 20.2095 16.1458 20.2291 16.1016C20.2487 16.0573 20.2545 16.0078 20.2467 15.96C20.239 15.9122 20.2177 15.8678 20.1852 15.832C19.5247 15.1513 18.7654 14.3687 18.193 13.1572C17.6148 11.9335 17.2496 10.328 17.2496 8ZM18.7496 8C18.7496 10.171 19.0901 11.5444 19.5494 12.5166C20.0095 13.4902 20.6126 14.1188 21.278 14.8047C21.2835 14.8104 21.2892 14.8164 21.2946 14.8223C21.5228 15.0731 21.6728 15.385 21.7272 15.7197C21.7815 16.0545 21.7374 16.3979 21.6002 16.708C21.463 17.0181 21.2389 17.2818 20.9547 17.4668C20.7061 17.6286 20.421 17.7238 20.1266 17.7451L19.9996 17.75H3.99963C3.66057 17.7498 3.32855 17.6511 3.04456 17.4658C2.7605 17.2805 2.53588 17.0164 2.39905 16.7061C2.26226 16.3958 2.21935 16.0524 2.27405 15.7178C2.32882 15.383 2.47903 15.0709 2.70764 14.8203L2.72327 14.8037C3.38742 14.118 3.9908 13.4894 4.45081 12.5156C4.90993 11.5435 5.24963 10.1706 5.24963 8C5.24963 6.20979 5.9613 4.49243 7.22717 3.22656C8.49295 1.96098 10.2097 1.25007 11.9996 1.25C13.7898 1.25 15.5072 1.96077 16.7731 3.22656C18.0389 4.49243 18.7496 6.20979 18.7496 8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Settings",
    icon: (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path
          d="M13.4698 4C13.4698 3.66848 13.338 3.35063 13.1036 3.11621C12.8692 2.88188 12.5513 2.75 12.2198 2.75H11.7804C11.4489 2.75 11.131 2.88188 10.8966 3.11621C10.6621 3.35063 10.5304 3.66848 10.5304 4V4.18066C10.5299 4.66273 10.4024 5.13631 10.1612 5.55371C9.92021 5.97064 9.57318 6.31654 9.15633 6.55762L8.72664 6.80859L8.72469 6.80957C8.30671 7.05081 7.83229 7.17773 7.34969 7.17773C6.8671 7.17767 6.39263 7.05087 5.97469 6.80957L5.84676 6.74219C5.83946 6.73829 5.83244 6.73363 5.82528 6.72949C5.53854 6.56413 5.19779 6.51906 4.87801 6.60449C4.55824 6.69 4.28521 6.89918 4.11922 7.18555L3.89949 7.56543L3.89852 7.56445C3.7332 7.85122 3.68898 8.19291 3.77449 8.5127C3.84938 8.79246 4.01901 9.03637 4.25203 9.2041L4.35555 9.27148L4.39656 9.2959L4.54598 9.39551C4.9432 9.63416 5.27471 9.96905 5.50789 10.3701C5.74896 10.7849 5.87705 11.2556 5.87996 11.7354V12.2471L5.87508 12.4287C5.84887 12.85 5.72581 13.2605 5.51473 13.6279C5.27327 14.0481 4.92462 14.3974 4.50496 14.6396L4.50399 14.6387L4.36629 14.7227L4.35555 14.7295L4.35457 14.7285C4.06856 14.8945 3.86 15.1679 3.77449 15.4873C3.68906 15.8068 3.73355 16.148 3.89852 16.4346L4.11922 16.8145C4.28521 17.1008 4.55824 17.31 4.87801 17.3955C5.19779 17.4809 5.53854 17.4359 5.82528 17.2705L5.84676 17.2578L5.97469 17.1904C6.39263 16.9491 6.8671 16.8223 7.34969 16.8223C7.83229 16.8223 8.30672 16.9492 8.72469 17.1904L8.72664 17.1914L9.15535 17.4404L9.30867 17.5361C9.65797 17.7697 9.95013 18.0811 10.1612 18.4463C10.4024 18.8637 10.5299 19.3373 10.5304 19.8193V20C10.5304 20.3315 10.6621 20.6494 10.8966 20.8838C11.131 21.1181 11.4489 21.25 11.7804 21.25H12.2198C12.5513 21.25 12.8692 21.1181 13.1036 20.8838C13.338 20.6494 13.4698 20.3315 13.4698 20V19.8193C13.4703 19.3373 13.5978 18.8637 13.8389 18.4463C14.0803 18.0288 14.4273 17.6815 14.8448 17.4404L15.2735 17.1914L15.2755 17.1904C15.6934 16.9492 16.1679 16.8223 16.6505 16.8223C17.1331 16.8223 17.6075 16.9491 18.0255 17.1904L18.1534 17.2578L18.1749 17.2705C18.4616 17.4359 18.8024 17.4809 19.1222 17.3955C19.4419 17.31 19.715 17.1008 19.8809 16.8145L20.0968 16.4316L20.1007 16.4248C20.2659 16.1381 20.3112 15.7973 20.2257 15.4775C20.1407 15.16 19.9338 14.8889 19.6505 14.7227L19.5167 14.6514C19.5095 14.6475 19.5023 14.6437 19.4952 14.6396C19.0755 14.3974 18.7269 14.0481 18.4854 13.6279C18.2441 13.2079 18.1183 12.7315 18.1202 12.2471V11.75C18.1188 11.2666 18.2446 10.7913 18.4854 10.3721C18.6967 10.0045 18.9898 9.69088 19.3409 9.45605L19.4952 9.36035L19.6339 9.27734L19.6446 9.27051C19.9308 9.10456 20.1401 8.83226 20.2257 8.5127C20.3112 8.1928 20.2661 7.85129 20.1007 7.56445L19.8809 7.18555C19.715 6.89918 19.4419 6.69 19.1222 6.60449C18.8024 6.51906 18.4616 6.56413 18.1749 6.72949C18.1677 6.73363 18.1607 6.73829 18.1534 6.74219L18.0245 6.80859C17.6066 7.04988 17.133 7.17767 16.6505 7.17773C16.1679 7.17773 15.6934 7.05082 15.2755 6.80957L15.2735 6.80859L14.8429 6.55859C14.4263 6.31753 14.0798 5.97039 13.8389 5.55371C13.5978 5.13631 13.4703 4.66273 13.4698 4.18066V4ZM14.9698 4.17969L14.9805 4.34277C15.0021 4.50464 15.0555 4.66142 15.1378 4.80371C15.2201 4.94609 15.3294 5.07046 15.4591 5.16992L15.5948 5.26074L15.5968 5.26172L16.0255 5.51074L16.172 5.58301C16.323 5.64555 16.4859 5.67773 16.6505 5.67773C16.8698 5.67767 17.0856 5.62039 17.2755 5.51074L17.297 5.49805L17.4473 5.41797C18.0738 5.06423 18.8142 4.97024 19.5098 5.15625C20.2136 5.34446 20.8137 5.80422 21.1788 6.43457L21.3995 6.81445C21.7635 7.44542 21.862 8.19571 21.6739 8.89941C21.4867 9.59953 21.0307 10.1968 20.4054 10.5625L20.2559 10.6533L20.2452 10.6592C20.0544 10.7693 19.896 10.9282 19.7862 11.1191C19.6765 11.3101 19.6193 11.5268 19.6202 11.7471V12.2529C19.6193 12.4732 19.6765 12.6899 19.7862 12.8809C19.8948 13.0699 20.0512 13.2269 20.2393 13.3369L20.3731 13.4082L20.3956 13.4209C21.0258 13.7859 21.4856 14.3863 21.6739 15.0898C21.8615 15.7913 21.7635 16.5382 21.4024 17.168L21.1837 17.5586L21.1788 17.5664L21.1778 17.5654C20.8127 18.1957 20.2135 18.6556 19.5098 18.8438C18.8141 19.0298 18.0739 18.935 17.4473 18.5811L17.297 18.502C17.2896 18.498 17.2827 18.4934 17.2755 18.4893C17.0856 18.3796 16.8698 18.3223 16.6505 18.3223C16.4312 18.3223 16.2154 18.3797 16.0255 18.4893L15.5968 18.7383L15.5948 18.7393C15.4051 18.8488 15.2475 19.0066 15.1378 19.1963C15.0282 19.3859 14.9701 19.6013 14.9698 19.8203V20C14.9698 20.7293 14.6799 21.4286 14.1641 21.9443C13.6484 22.46 12.9491 22.75 12.2198 22.75H11.7804C11.0511 22.75 10.3517 22.46 9.83602 21.9443C9.32029 21.4286 9.03035 20.7293 9.03035 20V19.8203C9.03005 19.6013 8.97201 19.3859 8.86239 19.1963C8.75271 19.0066 8.59511 18.8488 8.40535 18.7393L8.4034 18.7383L7.97469 18.4893C7.78476 18.3797 7.56895 18.3223 7.34969 18.3223C7.13041 18.3223 6.9146 18.3796 6.72469 18.4893C6.71749 18.4934 6.71054 18.498 6.70321 18.502L6.55281 18.582L6.55184 18.5811C5.92548 18.9346 5.18583 19.0297 4.49031 18.8438C3.78661 18.6555 3.18648 18.1958 2.82137 17.5654L2.60067 17.1855C2.2367 16.5546 2.13814 15.8043 2.32625 15.1006C2.51343 14.4006 2.96864 13.8022 3.59383 13.4365L3.74422 13.3467L3.75496 13.3408C3.94571 13.2307 4.10419 13.0718 4.21395 12.8809C4.3237 12.6899 4.38084 12.4732 4.37996 12.2529V11.7441C4.37858 11.5262 4.32049 11.3124 4.21102 11.124C4.10139 10.9355 3.94385 10.779 3.75496 10.6699C3.74101 10.6619 3.72735 10.6525 3.71395 10.6436L3.56453 10.5439C2.95512 10.1768 2.51036 9.58792 2.32625 8.89941C2.13814 8.19571 2.2367 7.4464 2.60067 6.81543L2.82137 6.43457C3.18648 5.80423 3.78661 5.34446 4.49031 5.15625C5.18568 4.97031 5.92557 5.06458 6.55184 5.41797L6.70321 5.49805L6.72469 5.51074C6.9146 5.62039 7.1304 5.67767 7.34969 5.67773C7.56895 5.67773 7.78477 5.6203 7.97469 5.51074L8.4034 5.26172L8.40535 5.26074C8.59511 5.15116 8.75271 4.99341 8.86239 4.80371C8.94463 4.66142 8.99809 4.50464 9.01961 4.34277L9.03035 4.17969V4C9.03035 3.27065 9.32029 2.57139 9.83602 2.05566C10.3517 1.54002 11.0511 1.25 11.7804 1.25H12.2198C12.9491 1.25 13.6484 1.54002 14.1641 2.05566C14.6799 2.57139 14.9698 3.27065 14.9698 4V4.17969Z"
          fill="currentColor"
        />
        <path
          d="M14.2501 12C14.2501 10.7574 13.2427 9.75 12.0001 9.75C10.7574 9.75 9.75008 10.7574 9.75008 12C9.75008 13.2426 10.7574 14.25 12.0001 14.25C13.2427 14.25 14.2501 13.2426 14.2501 12ZM15.7501 12C15.7501 14.0711 14.0711 15.75 12.0001 15.75C9.92901 15.75 8.25008 14.0711 8.25008 12C8.25008 9.92893 9.92901 8.25 12.0001 8.25C14.0711 8.25 15.7501 9.92893 15.7501 12Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [activeTab, setActiveTab] = useState<"grid" | "plants">("grid");
  const [isProgressCardHidden, setIsProgressCardHidden] = useState(false);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const drawerCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const [profileResponse, feedResponse, onboardingResponse] = await Promise.all([
          fetch("/api/profile/me"),
          fetch("/api/feed"),
          fetch("/api/profile/onboarding-status"),
        ]);

        if (profileResponse.status === 401 || feedResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (!profileResponse.ok || !feedResponse.ok || !onboardingResponse.ok) {
          setLoadError("Unable to load profile.");
          return;
        }

        const profileResult = (await profileResponse.json()) as ProfileMeResponse;
        const feedResult = (await feedResponse.json()) as { posts?: FeedPost[] };
        const onboardingResult = (await onboardingResponse.json()) as OnboardingStatus;

        if (cancelled) return;

        setProfile(profileResult);
        setFeedPosts(Array.isArray(feedResult.posts) ? feedResult.posts : []);
        setOnboardingStatus(onboardingResult);
      } catch {
        if (!cancelled) {
          setLoadError("Unable to load profile.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const myPosts = useMemo(() => feedPosts.filter((post) => post.source === "you"), [feedPosts]);

  const followingCount = useMemo(() => {
    const unique = new Set(feedPosts.filter((post) => post.source === "following").map((post) => post.username));
    return unique.size;
  }, [feedPosts]);

  const mediaUrls = useMemo(
    () =>
      myPosts
        .flatMap((post) => (post.mediaUrls?.length ? post.mediaUrls : post.mediaUrl ? [post.mediaUrl] : []))
        .slice(0, 24),
    [myPosts],
  );

  const progressSummary = useMemo(() => {
    if (!onboardingStatus) return { completed: 0, total: 3, percent: 0 };
    const completed = [onboardingStatus.pricingCompleted, onboardingStatus.interestsCompleted, onboardingStatus.firstPostCompleted].filter(Boolean).length;
    const total = 3;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, [onboardingStatus]);

  const showProgressCard = !isProgressCardHidden;
  const drawerProfile: DrawerProfile = {
    fullName: profile?.fullName || "Global Gardener",
    nickname: profile?.nickname || "@globalgardener",
    profilePhotoUrl: profile?.profilePhotoUrl ?? null,
  };

  const openDrawer = () => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    menuTriggerRef.current = document.activeElement as HTMLButtonElement | null;
    if (isDrawerMounted) {
      setIsDrawerVisible(true);
      return;
    }
    setIsDrawerMounted(true);
    requestAnimationFrame(() => setIsDrawerVisible(true));
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    drawerCloseTimerRef.current = setTimeout(() => {
      setIsDrawerMounted(false);
      drawerCloseTimerRef.current = null;
      menuTriggerRef.current?.focus();
    }, 300);
  };

  const handleCreatePost = () => {
    closeDrawer();
    router.push("/new-post");
  };

  const handleOpenProfile = () => {
    closeDrawer();
    router.push("/profile");
  };

  const handleOpenStream = () => {
    closeDrawer();
    router.push("/feed");
  };

  const handleSelectDrawerItem = (item: DrawerItem) => {
    closeDrawer();
    if (item.label === "Stream") {
      router.push("/feed");
      return;
    }
    if (item.label === "Guides") {
      router.push("/guides");
      return;
    }
    if (item.label === "Influencer Spotlight") {
      router.push("/influencer-spotlight");
      return;
    }
    if (item.label === "Notifications") {
      router.push("/notifications");
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      closeDrawer();
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!isDrawerMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerMounted]);

  useEffect(() => {
    if (!isDrawerVisible) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleEscape);
    drawerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDrawerVisible]);

  useEffect(() => {
    return () => {
      if (drawerCloseTimerRef.current) {
        clearTimeout(drawerCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-0 text-[#182a17]">
      <section className="client-shell mx-auto flex min-h-screen w-full flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-white p-4">
          <div className="flex items-center gap-3">
            <button
              ref={menuTriggerRef}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#7a7a7a]"
              aria-label="Open menu"
              onClick={openDrawer}
            >
              <MenuIcon />
            </button>
            <h1 className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">Global Gardners</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/notifications")}
            aria-label="Notifications"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f5] text-[#7a7a7a]"
          >
            <BellIcon />
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="w-full px-4 pb-8 pt-8">
          {isLoading ? <div className="rounded-[12px] border border-black/10 bg-white p-4 text-[14px] text-[#525252]">Loading profile...</div> : null}
          {!isLoading && loadError ? <div className="rounded-[12px] border border-black/10 bg-white p-4 text-[14px] text-[#dc2626]">{loadError}</div> : null}

          {!isLoading && !loadError && profile ? (
            <div className="space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  {profile.profilePhotoUrl ? (
                    <Image
                      src={profile.profilePhotoUrl}
                      alt={profile.fullName}
                      width={94}
                      height={94}
                      unoptimized
                      loader={({ src }) => src}
                      className="h-[94px] w-[94px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="inline-flex h-[94px] w-[94px] items-center justify-center rounded-full bg-[#31674c] text-[24px] font-semibold text-[#fafafa]">
                      {getInitials(profile.fullName)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="truncate text-[16px] font-medium leading-6 text-[#333333]">{profile.fullName}</p>
                      <p className="mt-0.5 text-[12px] font-medium leading-4 text-[#333333cc]">{profile.nickname}</p>
                    </div>
                    <div className="flex items-start gap-10">
                      <div>
                        <p className="text-[14px] font-semibold leading-5 text-[#333333]">{myPosts.length}</p>
                        <p className="text-[12px] font-medium leading-4 text-[#333333cc]">Posts</p>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold leading-5 text-[#333333]">0</p>
                        <p className="text-[12px] font-medium leading-4 text-[#333333cc]">Followers</p>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold leading-5 text-[#333333]">{followingCount}</p>
                        <p className="text-[12px] font-medium leading-4 text-[#333333cc]">Following</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => router.push("/profile/edit")}
                    className="h-8 w-full rounded-lg bg-[#171717] text-[12px] font-semibold leading-4 text-[#fafafa]"
                  >
                    Edit profile
                  </button>
                </div>
              </section>

              {showProgressCard ? (
                <section className="relative rounded-[18px] border border-black/10 bg-white px-6 pb-6 pt-5">
                  <button
                    type="button"
                    aria-label="Dismiss profile progress"
                    onClick={() => setIsProgressCardHidden(true)}
                    className="absolute right-[6px] top-[6px] inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] text-[#666666]"
                  >
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
                      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
                    </svg>
                  </button>
                  <p className="bg-[linear-gradient(90deg,_#182a17_0%,_#3c6838_20%,_#5fa659_70%)] bg-clip-text text-center text-[20px] font-semibold leading-6 tracking-[0] text-transparent">
                    Complete your profile
                  </p>

                  <div className="mt-8 flex flex-col gap-4">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex w-full items-center justify-between text-[12px] font-medium leading-4 text-[#171717]">
                        <span>Pofile progress</span>
                        <span>{progressSummary.percent}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#d4d4d4]">
                        <div className="h-full rounded-full bg-[#171717]" style={{ width: `${progressSummary.percent}%` }} />
                      </div>
                    </div>
                    <p className="text-center text-[14px] font-medium leading-5 text-[#333333cc]">Add a few details to get more personalized tips and recommendations.</p>
                    <button
                      type="button"
                      onClick={() => router.push(onboardingStatus?.nextStep ?? "/feed")}
                      className="h-9 w-full rounded-full bg-[#457941] text-[14px] font-medium leading-5 text-[#fafafa]"
                    >
                      Continue setup
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
          </div>

          <section className="mt-2">
            <div className="flex w-full items-center justify-between px-4">
              <button
                type="button"
                onClick={() => setActiveTab("grid")}
                className={`flex h-11 flex-1 items-center justify-center border-b-[1.5px] ${activeTab === "grid" ? "border-[#31674c]" : "border-transparent"}`}
                aria-label="Grid posts"
              >
                <Image
                  src={activeTab === "grid" ? "/icons/layout-grid-active.svg" : "/icons/layout-grid-inactive.svg"}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("plants")}
                className={`flex h-11 flex-1 items-center justify-center border-b-[1.5px] ${activeTab === "plants" ? "border-[#31674c]" : "border-transparent"}`}
                aria-label="Plant cards"
              >
                <Image
                  src={activeTab === "plants" ? "/icons/sprout-active.svg" : "/icons/sprout-inactive.svg"}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </button>
            </div>

            {activeTab === "grid" ? (
              <div className="mt-2 grid w-full grid-cols-3">
                {mediaUrls.length ? (
                  mediaUrls.map((url, index) => (
                    <div key={`profile-grid-${index}`} className="relative aspect-square overflow-hidden border border-[#fafafa] bg-[#e5e5e5]">
                      <Image src={url} alt={`Profile post ${index + 1}`} fill sizes="130px" className="object-cover" unoptimized loader={({ src }) => src} />
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 mx-4 rounded-[12px] border border-black/10 bg-white p-4 text-center text-[14px] text-[#525252]">No posts yet.</p>
                )}
              </div>
            ) : (
              <div className="mt-2 grid w-full grid-cols-2 gap-4 px-4 pb-6">
                {mediaUrls.length ? (
                  mediaUrls.slice(0, 10).map((url, index) => (
                    <article key={`plant-card-${index}`} className="overflow-hidden rounded-[12px] border border-black/10 bg-white">
                      <div className="relative h-[153px] w-full bg-[#e5e5e5]">
                        <Image src={url} alt={`Plant card ${index + 1}`} fill sizes="171px" className="object-cover" unoptimized loader={({ src }) => src} />
                      </div>
                      <div className="space-y-1 px-3 py-2">
                        <p className="text-[14px] font-medium leading-5 text-[#333333]">Plant name</p>
                        <p className="text-[12px] leading-4 text-[#333333cc]">Species name</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="col-span-2 rounded-[12px] border border-black/10 bg-white p-4 text-center text-[14px] text-[#525252]">No plants yet.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </section>
      {isDrawerMounted ? (
        <SideDrawer
          drawerRef={drawerRef}
          isLoggingOut={isLoggingOut}
          isVisible={isDrawerVisible}
          items={drawerItems}
          onClose={closeDrawer}
          onCreatePost={handleCreatePost}
          onOpenStream={handleOpenStream}
          onLogout={() => {
            void handleLogout();
          }}
          onOpenProfile={handleOpenProfile}
          onSelectItem={handleSelectDrawerItem}
          profile={drawerProfile}
        />
      ) : null}
    </main>
  );
}

