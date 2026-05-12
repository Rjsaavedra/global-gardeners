"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 10.06A10 10 0 1 0 8.44 19.94v-6.99H5.9V10.06h2.54V7.85c0-2.51 1.5-3.89 3.8-3.89 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.89H11.6v6.99A10.01 10.01 0 0 0 20 10.06z"
        fill="#1877F2"
      />
      <path
        d="M13.92 12.95l.44-2.9H11.6V8.2c0-.8.38-1.57 1.62-1.57h1.26V4.17s-1.14-.2-2.24-.2c-2.3 0-3.8 1.38-3.8 3.88v2.2H5.9v2.9h2.54v6.99c.51.04 1.03.06 1.56.06.54 0 1.08-.02 1.6-.07v-6.98h2.32z"
        fill="#fff"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.61 10.23c0-.68-.06-1.34-.17-1.97H10v3.73h5.39a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.3z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.95-.9 6.6-2.46l-3.24-2.52c-.9.6-2.06.95-3.36.95-2.59 0-4.79-1.74-5.58-4.1H1.07v2.6A10 10 0 0 0 10 20z"
        fill="#34A853"
      />
      <path
        d="M4.42 11.88A6 6 0 0 1 4.1 10c0-.65.11-1.28.32-1.88V5.5H1.07a10 10 0 0 0 0 9l3.35-2.62z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.97 9.97 0 0 0 10 0a10 10 0 0 0-8.93 5.5l3.35 2.62C5.2 5.72 7.4 3.98 10 3.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.93 10.6c0-1.73 1.42-2.56 1.48-2.6-.8-1.2-2.05-1.37-2.5-1.39-1.06-.12-2.08.63-2.62.63-.54 0-1.37-.62-2.26-.6-1.16.02-2.24.68-2.84 1.74-1.21 2.1-.3 5.2.87 6.9.58.83 1.26 1.75 2.16 1.72.86-.03 1.19-.55 2.24-.55 1.05 0 1.34.55 2.26.53.94-.02 1.53-.84 2.1-1.67.66-.95.93-1.88.94-1.93-.02-.01-1.79-.69-1.83-2.78z"
        fill="#000"
      />
      <path
        d="M12.3 5.54c.48-.59.8-1.4.71-2.22-.69.03-1.53.46-2.03 1.05-.44.51-.83 1.34-.72 2.12.77.06 1.56-.39 2.04-.95z"
        fill="#000"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#737373]" fill="none" viewBox="0 0 16 16">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" />
      <path d="M2 4l6 4 6-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-[#737373]"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.42 6.42a2.23 2.23 0 0 1 3.16 3.16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M2 2l12 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M13.1 10.88C14.05 10.1 14.7 9.16 15 8c-.8-3-3.6-5-7-5-.73 0-1.43.09-2.09.26"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="M3.18 5.24C2.34 5.95 1.74 6.87 1.5 8c.8 3 3.6 5 7 5 .72 0 1.42-.1 2.07-.28"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function EyeOnIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.0003 4.83398C11.5185 4.83405 13.0023 5.28514 14.264 6.12956C15.5257 6.97404 16.5087 8.17389 17.0875 9.57747C17.0898 9.58298 17.092 9.58882 17.0941 9.5944C17.1912 9.8563 17.1913 10.1444 17.0941 10.4063C17.092 10.4118 17.0898 10.4177 17.0875 10.4232C16.5086 11.8267 15.5257 13.0266 14.264 13.8711C13.0023 14.7155 11.5185 15.1666 10.0003 15.1667C8.48204 15.1667 6.99775 14.7155 5.73598 13.8711C4.47426 13.0266 3.49132 11.8267 2.91241 10.4232C2.91015 10.4177 2.90798 10.4118 2.9059 10.4063C2.80869 10.1444 2.80873 9.8563 2.9059 9.5944L2.91241 9.57747C3.49131 8.17388 4.47422 6.97404 5.73598 6.12956C6.99776 5.28508 8.482 4.83398 10.0003 4.83398ZM10.0003 5.83398C8.68004 5.83398 7.38917 6.22596 6.29197 6.96029C5.19838 7.69221 4.34548 8.73125 3.84145 9.94661C3.82965 9.98143 3.83022 10.0192 3.8421 10.054C4.34615 11.2692 5.19849 12.3085 6.29197 13.0404C7.38916 13.7747 8.68008 14.1667 10.0003 14.1667C11.3204 14.1666 12.6109 13.7746 13.708 13.0404C14.8014 12.3086 15.6531 11.2691 16.1572 10.054C16.1692 10.0191 16.1698 9.98156 16.1579 9.94661C15.6538 8.73136 14.8015 7.69217 13.708 6.96029C12.6109 6.22602 11.3205 5.83405 10.0003 5.83398Z"
        fill="#737373"
      />
      <path
        d="M11.5 10.0002C11.5 9.17181 10.8284 8.50024 9.99999 8.50024C9.17156 8.50024 8.49999 9.17181 8.49999 10.0002C8.49999 10.8287 9.17156 11.5002 9.99999 11.5002C10.8284 11.5002 11.5 10.8287 11.5 10.0002ZM12.5 10.0002C12.5 11.381 11.3807 12.5002 9.99999 12.5002C8.61928 12.5002 7.49999 11.381 7.49999 10.0002C7.49999 8.61953 8.61928 7.50024 9.99999 7.50024C11.3807 7.50024 12.5 8.61953 12.5 10.0002Z"
        fill="#737373"
      />
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex w-full items-center gap-4 text-[14px] text-[#333333cc]">
      <span className="h-px flex-1 bg-[#e5e5e5]" />
      <span>or</span>
      <span className="h-px flex-1 bg-[#e5e5e5]" />
    </div>
  );
}

function SocialButtonsStack() {
  const router = useRouter();
  const [ssoError, setSsoError] = useState("");
  const [isSsoSubmitting, setIsSsoSubmitting] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const oauthMode = query.get("oauth");
    const source = query.get("source");
    const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
    const refreshToken = new URLSearchParams(window.location.hash.slice(1)).get("refresh_token");

    if (oauthMode !== "implicit" || source !== "signup" || !accessToken || !refreshToken) return;

    const completeOAuthSession = async () => {
      setIsSsoSubmitting(true);
      setSsoError("");

      try {
        const response = await fetch("/api/auth/oauth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            refreshToken,
            persistent: query.get("persistent") !== "0",
          }),
        });

        const result = (await response.json()) as { error?: string; nextStep?: string };
        if (!response.ok) {
          setSsoError(result.error ?? "Unable to complete Facebook sign up.");
          return;
        }

        window.history.replaceState(null, "", "/signup");
        router.push(result.nextStep ?? "/");
      } catch {
        setSsoError("Unexpected error while finalizing Facebook sign up.");
      } finally {
        setIsSsoSubmitting(false);
      }
    };

    void completeOAuthSession();
  }, [router]);

  const handleFacebookSignUp = async () => {
    if (isSsoSubmitting) return;
    setSsoError("");
    setIsSsoSubmitting(true);

    try {
      const response = await fetch("/api/auth/oauth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepSignedIn: true, source: "signup" }),
      });

      const result = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !result.url) {
        setSsoError(result.error ?? "Unable to start Facebook sign up.");
        setIsSsoSubmitting(false);
        return;
      }

      window.location.href = result.url;
    } catch {
      setSsoError("Unexpected error while starting Facebook sign up.");
      setIsSsoSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={handleFacebookSignUp}
        disabled={isSsoSubmitting}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FacebookIcon />
        Continue with Facebook
      </button>
      <button
        type="button"
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-medium text-black"
      >
        <GoogleIcon />
        Continue with Google
      </button>
      <button
        type="button"
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-medium text-black"
      >
        <AppleIcon />
        Continue with Apple
      </button>
      {ssoError ? <p className="text-[12px] leading-4 text-[#ef4444]">{ssoError}</p> : null}
    </div>
  );
}

function EmailForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (
    name: "firstName" | "email" | "password" | "confirmPassword",
    value: string,
    allValues: typeof formValues,
  ) => {
    if (!value.trim()) {
      return "*This field contains validation errors.";
    }

    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value.trim())) {
        return "*This field contains validation errors.";
      }
    }

    if (name === "password") {
      const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
      if (!strongPasswordPattern.test(value)) {
        return "*This field contains validation errors.";
      }
    }

    if (name === "confirmPassword" && value !== allValues.password) {
      return "*This field contains validation errors.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitMessage("");

    const firstNameError = validateField("firstName", formValues.firstName, formValues);
    const emailError = validateField("email", formValues.email, formValues);
    const passwordError = validateField("password", formValues.password, formValues);
    const confirmPasswordError = validateField("confirmPassword", formValues.confirmPassword, formValues);

    setErrors({
      firstName: firstNameError || undefined,
      email: emailError || undefined,
      password: passwordError || undefined,
      confirmPassword: confirmPasswordError || undefined,
    });

    if (firstNameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    if (!acceptedTerms) {
      setSubmitError("Please accept the Terms & Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formValues.firstName,
          email: formValues.email,
          password: formValues.password,
        }),
      });

      const result = (await response.json()) as { error?: string; requiresEmailConfirmation?: boolean };
      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to create account.");
        return;
      }

      if (result.requiresEmailConfirmation) {
        setSubmitMessage("Account created. Please verify your email before logging in.");
        return;
      }

      router.push("/pricing");
    } catch {
      setSubmitError("Unexpected error while creating account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClass =
    "h-14 w-full rounded-[8px] border bg-white px-4 text-[14px] text-[#1f1f1f] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#457941]";

  return (
    <form className="client-form w-full space-y-4" noValidate onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="first-name" className="text-[14px] font-semibold leading-5 text-[#333333]">
          First name
        </label>
        <input
          id="first-name"
          type="text"
          value={formValues.firstName}
          onChange={(event) => setFormValues((current) => ({ ...current, firstName: event.target.value }))}
          aria-invalid={Boolean(errors.firstName)}
          placeholder="First name"
          className={`${inputBaseClass} ${errors.firstName ? "border-[#ef4444]" : "border-black/5"}`}
        />
        {errors.firstName ? <p className="text-[12px] leading-4 text-[#ef4444]">{errors.firstName}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-[14px] font-semibold leading-5 text-[#333333]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formValues.email}
          onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
          aria-invalid={Boolean(errors.email)}
          placeholder="Email"
          className={`${inputBaseClass} ${errors.email ? "border-[#ef4444]" : "border-black/5"}`}
        />
        {errors.email ? <p className="text-[12px] leading-4 text-[#ef4444]">{errors.email}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[14px] font-semibold leading-5 text-[#333333]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formValues.password}
            onChange={(event) => setFormValues((current) => ({ ...current, password: event.target.value }))}
            aria-invalid={Boolean(errors.password)}
            placeholder="Password"
            className={`h-14 w-full rounded-[8px] border bg-white px-4 pr-12 text-[14px] text-[#1f1f1f] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#457941] ${errors.password ? "border-[#ef4444]" : "border-black/5"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOnIcon /> : <EyeOffIcon />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-[12px] leading-4 text-[#ef4444]">{errors.password}</p>
        ) : (
          <p className="text-[12px] leading-4 text-[#333333cc]">Minimum 8 characters</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-[14px] font-semibold leading-5 text-[#333333]">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={formValues.confirmPassword}
            onChange={(event) => setFormValues((current) => ({ ...current, confirmPassword: event.target.value }))}
            aria-invalid={Boolean(errors.confirmPassword)}
            placeholder="Confirm password"
            className={`h-14 w-full rounded-[8px] border bg-white px-4 pr-12 text-[14px] text-[#1f1f1f] placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#457941] ${errors.confirmPassword ? "border-[#ef4444]" : "border-black/5"}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOnIcon /> : <EyeOffIcon />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p className="text-[12px] leading-4 text-[#ef4444]">{errors.confirmPassword}</p>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 pt-1 text-[14px] font-medium text-[#333333]">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          className="h-4 w-4 rounded-[4px] border border-black/10 bg-white accent-[#457941]"
        />
        I agree to the Terms & Privacy Policy
      </label>

      <button
        type="submit"
        disabled={isSubmitting || !acceptedTerms}
        className="mt-2 h-[52px] w-full rounded-full bg-[#457941] text-[14px] font-medium text-[#f4f1e8] transition hover:bg-[#3b6838] focus:outline-none focus:ring-2 focus:ring-[#457941] focus:ring-offset-2 focus:ring-offset-[#f8f6f1] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
      {submitError ? <p className="text-[12px] leading-4 text-[#ef4444]">{submitError}</p> : null}
      {submitMessage ? <p className="text-[12px] leading-4 text-[#457941]">{submitMessage}</p> : null}
    </form>
  );
}

function SocialIconButtons() {
  return (
    <div className="flex items-center justify-center gap-6">
      <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white">
        <FacebookIcon />
      </button>
      <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white">
        <GoogleIcon />
      </button>
      <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white">
        <AppleIcon />
      </button>
    </div>
  );
}

export default function SignupPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <main className="client-main min-h-screen bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#f8f6f1_50%,_#efe9dc_100%)] px-4 sm:grid sm:place-items-center sm:px-8">
      <section className="client-shell mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#e7e0d2] bg-[#f8f6f1] px-4 pb-10 pt-4 shadow-[0_24px_80px_rgba(56,71,45,0.12)]">
        <header className="client-header pb-10">
          <p className="text-[24px] font-semibold tracking-[-0.06em] text-[#31674c]">Global Gardeners</p>
        </header>

        <div className="mx-auto flex w-full flex-1 flex-col items-center gap-10">
          <h1 className="text-center text-[30px] font-semibold leading-[30px] tracking-[-0.033em] text-[#182a17]">
            Create an account
          </h1>

          {showEmailForm ? (
            <>
              <EmailForm />
              <Divider />
              <SocialIconButtons />
            </>
          ) : (
            <>
              <SocialButtonsStack />
              <Divider />
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-medium text-black"
              >
                <MailIcon />
                Create account with Email
              </button>
            </>
          )}

          <p className="text-center text-[16px] font-medium leading-6 text-[#333333cc]">
            Don&apos;t have an account yet?{" "}
            <Link href="/login" className="text-[#333333] underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

