import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full bg-blue-600/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-[10%] w-[25vw] h-[25vw] rounded-full bg-amber-600/6 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Brand header */}
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)]">K</div>
          <h1 className="text-3xl font-black tracking-tighter text-white mb-1">Join Kader.</h1>
          <p className="text-zinc-500 text-sm">The Middle East's premier production ecosystem</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
