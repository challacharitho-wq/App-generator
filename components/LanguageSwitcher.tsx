"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase">{lang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("en")}>
          English (EN)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("es")}>
          Español (ES)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("hi")}>
          हिन्दी (HI)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
