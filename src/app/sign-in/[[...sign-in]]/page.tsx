import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4 py-20">
      <SignIn />
    </div>
  );
}
