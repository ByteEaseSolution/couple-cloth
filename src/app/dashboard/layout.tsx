import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogOut, Shirt, Sparkles, Users } from "lucide-react";
import { LogoutForm } from "@/components/dashboard/logout-form";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/dashboard" icon={<Sparkles className="h-4 w-4" />}>Today</NavLink>
          <NavLink href="/dashboard/wardrobe" icon={<Shirt className="h-4 w-4" />}>Wardrobe</NavLink>
          <NavLink href="/dashboard/partner" icon={<Users className="h-4 w-4" />}>Partner</NavLink>
        </nav>
        <LogoutForm>
          <Button variant="ghost" size="sm" type="submit"><LogOut className="h-4 w-4" /> Log out</Button>
        </LogoutForm>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-fit gap-1 rounded-full border border-black/5 bg-white/80 p-1 shadow-xl backdrop-blur md:hidden">
        <NavLink href="/dashboard" icon={<Sparkles className="h-4 w-4" />}>Today</NavLink>
        <NavLink href="/dashboard/wardrobe" icon={<Shirt className="h-4 w-4" />}>Wardrobe</NavLink>
        <NavLink href="/dashboard/partner" icon={<Users className="h-4 w-4" />}>Partner</NavLink>
      </nav>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black/70 hover:bg-black/5">
      {icon}{children}
    </Link>
  );
}
