import { StatusBar } from "./StatusBar";

/**
 * Centres the app in a phone-width shell (full-bleed on mobile, framed on
 * desktop) with the brand background, status bar, and home indicator.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-black md:items-center md:py-6">
      <div className="app-bg relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden md:min-h-0 md:h-[880px] md:rounded-[2.75rem] md:border md:border-white/10 md:shadow-2xl">
        <StatusBar />
        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-4 pt-2">
          {children}
        </div>
        <div className="flex shrink-0 justify-center pb-2 pt-1">
          <span className="h-1 w-32 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}
