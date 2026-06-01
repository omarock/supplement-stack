import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// Server wrapper so the client homepage can carry a self-canonical (a client
// component cannot export metadata). metadataBase is set in layout.tsx.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomeClient />;
}
