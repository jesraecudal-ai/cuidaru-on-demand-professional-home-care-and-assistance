import React from 'react';
import { useI18n, LANGUAGES } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function LanguagePicker() {
  const { lang, changeLang } = useI18n();
  const current = LANGUAGES[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm h-9 px-2.5">
          <span className="text-base">{current.flag}</span>
          <span className="hidden sm:inline font-medium">{current.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {Object.values(LANGUAGES).map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLang(language.code)}
            className={`gap-3 cursor-pointer ${lang === language.code ? 'bg-primary/5 font-semibold' : ''}`}
          >
            <span className="text-xl">{language.flag}</span>
            <div>
              <div className="text-sm font-medium">{language.label}</div>
              <div className="text-xs text-muted-foreground">{language.country}</div>
            </div>
            {lang === language.code && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}