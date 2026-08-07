/** iOS-style status bar to match the mockups: time left, signal/wifi/battery right. */
export function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 text-text">
      <span className="text-base font-semibold tabular-nums">{time}</span>
      <div className="flex items-center gap-2">
        {/* cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 11.5 5.8 8.9a3.4 3.4 0 0 1 4.4 0L8 11.5Z" />
          <path d="M8 5.2c1.9 0 3.7.7 5 2l-1.4 1.6A5.6 5.6 0 0 0 8 7.2a5.6 5.6 0 0 0-3.6 1.6L3 7.2a7.6 7.6 0 0 1 5-2Z" />
          <path d="M8 .8c2.9 0 5.6 1.1 7.6 3l-1.4 1.6A9 9 0 0 0 8 2.8 9 9 0 0 0 1.8 5.4L.4 3.8A11 11 0 0 1 8 .8Z" />
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" />
          <rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
