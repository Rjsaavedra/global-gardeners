"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return email;
  }

  const visible = local.slice(0, 1);
  const masked = "*".repeat(Math.max(local.length - 1, 4));
  return `${visible}${masked}@${domain}`;
}

function ForgotPasswordVerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(32);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const normalizedOtp = otp.replace(/\D/g, "");
  const canSubmit = /^\d{8}$/.test(normalizedOtp);

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setResendSeconds((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [resendSeconds]);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(resendSeconds / 60);
    const seconds = resendSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [resendSeconds]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^\d{8}$/.test(normalizedOtp)) {
      setError("Please enter a valid 8-digit code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: normalizedOtp }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to verify code.");
        return;
      }

      router.push("/forgot-password/reset");
    } catch {
      setError("Unexpected error while verifying code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || isResending) {
      return;
    }

    setError("");
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to resend code.");
        return;
      }

      setResendSeconds(32);
    } catch {
      setError("Unexpected error while resending code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-4 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] px-4 pb-10 pt-4 shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header pb-10">
          <p className="text-[24px] font-semibold leading-[28.8px] tracking-[-1px] text-[#31674c]">Global Gardeners</p>
        </header>

        <div className="mx-auto flex w-full flex-1 flex-col">
          <div className="space-y-4">
            <h1 className="text-[30px] font-semibold leading-[30px] tracking-[-1px] text-[#182a17]">Enter OTP Code</h1>
            <p className="text-[16px] leading-6 text-[#333333cc]">
              Enter the 8 digit code just sent to {maskEmail(email)}
            </p>
          </div>

          <form className="mt-8 flex min-h-0 flex-1 flex-col" noValidate onSubmit={handleSubmit}>
            <div className="space-y-6">
              <label htmlFor="otp" className="sr-only">
                Enter 8-digit OTP
              </label>
              <input
                ref={otpInputRef}
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))}
                aria-invalid={Boolean(error)}
                className="sr-only"
              />

              <button
                type="button"
                onClick={() => otpInputRef.current?.focus()}
                className="grid w-full grid-cols-8 gap-2"
                aria-label="Enter OTP code"
              >
                {Array.from({ length: 8 }).map((_, index) => {
                  const digit = normalizedOtp[index] ?? "";
                  const isActive = index === normalizedOtp.length && normalizedOtp.length < 8;

                  return (
                    <span
                      key={index}
                      className={`flex h-14 items-center justify-center rounded-[8px] border text-center text-[32px] leading-none text-[#182a17] ${digit || isActive ? "border-[#5fa659]" : "border-[#e7e8f0]"}`}
                    >
                      {digit}
                    </span>
                  );
                })}
              </button>

              <div className="flex items-center justify-between text-[14px] font-medium leading-6">
                <span className="text-[#333333cc]">Didn&apos;t receive code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendSeconds > 0 || isResending}
                  className="text-[#333333] disabled:text-[#33333399]"
                >
                  {resendSeconds > 0 ? `Resend in ${formattedTimer}` : isResending ? "Resending..." : "Resend code"}
                </button>
              </div>

              {error ? <p className="text-[12px] leading-4 text-[#ef4444]">{error}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="mt-auto h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium text-[#f4f1e8] transition hover:bg-[#3b6838] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-[#f8f6f1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-4 sm:grid sm:place-items-center sm:px-8">
          <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] items-center justify-center border border-[#e7e0d2] bg-[#f8f6f1] px-4 py-10 shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
            <p className="text-[14px] text-[#525252]">Loading...</p>
          </section>
        </main>
      }
    >
      <ForgotPasswordVerifyPageContent />
    </Suspense>
  );
}
