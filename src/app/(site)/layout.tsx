import { Nav } from "@/components/Nav";

// The Future Creatives pages share the site nav. Tools like /tracker don't.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
