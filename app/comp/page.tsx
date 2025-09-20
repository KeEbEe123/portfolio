// app/page.tsx (or any page)
import SpotifyLastPlayed from "@/components/SpotifyLastPlayed";

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <SpotifyLastPlayed />
    </main>
  );
}
