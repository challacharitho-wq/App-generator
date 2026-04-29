"use client";

import { Search, Bell, Menu, Sparkles, LogOut, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FloatingHeader() {
  const { t } = useTranslation();
  const { data: session } = useSession();

  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-48px)] max-w-6xl px-8 py-3 floating-pill flex items-center justify-between border-black/[0.05] bg-white/90">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 group cursor-pointer">
           <div className="h-6 w-6 rounded-lg orange-gradient flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
           </div>
           <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground transition-colors group-hover:text-primary">System Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-black/[0.03] border border-black/[0.05] rounded-full px-5 py-2 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-black/5 transition-all group">
          <Search className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors mr-3" />
          <input 
            type="text" 
            placeholder={t("Search resources...")} 
            className="bg-transparent border-none outline-none text-xs w-56 text-foreground placeholder:text-muted-foreground/40 font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-black/[0.03]">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
            </Button>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full orange-gradient h-10 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {session.user?.name ?? t("Admin")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] glass">
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-xl flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer p-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => window.location.href = "/login"}
                className="rounded-full orange-gradient h-10 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                  {t("Sign in")}
              </Button>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
        </div>
      </div>
    </header>
  );
}
