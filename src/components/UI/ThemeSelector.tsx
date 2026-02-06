import { Palette, Sun, Moon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeSelector = () => {
  const { theme, colorScheme, setColorScheme, toggleTheme, isDark } = useTheme();

  const schemes = [
    { id: 'default', name: 'UrbanSoko Blue', colorClass: 'bg-primary' },
    { id: 'green', name: 'Emerald Green', colorClass: 'bg-secondary' },
    { id: 'african', name: 'Royal Purple', colorClass: 'bg-accent' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 glass-premium">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Mode</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={toggleTheme}
          className="cursor-pointer hover:bg-primary/10"
        >
          <div className="flex items-center gap-3 w-full">
            {isDark ? (
              <Sun className="h-4 w-4 text-primary" />
            ) : (
              <Moon className="h-4 w-4 text-primary" />
            )}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Color Scheme</DropdownMenuLabel>
        {schemes.map((scheme) => (
          <DropdownMenuItem
            key={scheme.id}
            onClick={() => setColorScheme(scheme.id as any)}
            className="cursor-pointer hover:bg-primary/10"
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`w-4 h-4 rounded-full ${scheme.colorClass} border border-border`} />
              <span className="flex-1">{scheme.name}</span>
              {colorScheme === scheme.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
