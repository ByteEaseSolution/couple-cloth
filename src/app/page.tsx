import Link from "next/link";
import { Sparkles, Shirt, Heart, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link href="/signup"><Button size="sm">Get started</Button></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-brand-700 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          AI-styled outfits, planned together
        </div>
        <h1 className="mt-6 bg-gradient-to-br from-fg to-brand-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          Match outfits.<br /> Skip the texts.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-black/60">
          Upload your wardrobe. Invite your partner. Hit one button before a date —
          we&apos;ll style coordinated looks for both of you.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup"><Button size="lg">Start your duet</Button></Link>
          <Link href="/login"><Button size="lg" variant="outline">I already have an account</Button></Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-24 md:grid-cols-3">
        <Feature icon={<Shirt className="h-5 w-5" />} title="Smart wardrobe">
          Snap each top &amp; bottom. AI tags color, season, and what it pairs with.
        </Feature>
        <Feature icon={<Wand2 className="h-5 w-5" />} title="One-tap planning">
          Randomizer picks both of your outfits — with locked matching colors.
        </Feature>
        <Feature icon={<Heart className="h-5 w-5" />} title="Shared closet">
          Confirm a look and your partner sees it on their dashboard.
        </Feature>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-6 backdrop-blur">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-black/60">{children}</p>
    </div>
  );
}
