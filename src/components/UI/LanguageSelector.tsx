import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const LanguageSelector = () => {
  const { language, setLanguage, availableLanguages, isLoading } = useLanguage();

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-md" />;
  }

  if (availableLanguages.length <= 1) {
    return null;
  }

  const currentLang = availableLanguages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={currentLang?.name || 'Language'}>
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-muted' : ''}
          >
            <span className="mr-2">{lang.native_name}</span>
            <span className="text-muted-foreground text-xs">({lang.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
