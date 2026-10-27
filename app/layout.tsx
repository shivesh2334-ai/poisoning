import "./globals.css";
export const metadata = { title: "Poisoning & Drug Overdose Assistant", description: "Clinical decision support based on Harrison's Ch.459" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
