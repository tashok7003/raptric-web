import { SignInFlow } from "@/components/auth/SignInFlow";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="font-display text-[22px] font-bold text-ink">Sign in</h1>
      <p className="mt-1 text-[14px] text-ink-muted">
        One code for new and returning riders. No password to forget.
      </p>
      <SignInFlow />
    </div>
  );
}
