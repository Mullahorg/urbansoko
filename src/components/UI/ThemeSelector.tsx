import { Palette, Sun, Moon } from 'lucide-react';
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
    { id: 'default', name: 'Classic Gold', color: 'bg-yellow-500' },
    { id: 'green', name: 'Forest Green', color: 'bg-green-600' },
    { id: 'african', name: 'African Heritage', color: 'bg-gradient-to-r from-green-600 to-yellow-600' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-50">
        <DropdownMenuLabel>Mode</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={toggleTheme}
          className="cursor-pointer hover:bg-accent"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        {schemes.map((scheme) => (
          <DropdownMenuItem
            key={scheme.id}
            onClick={() => setColorScheme(scheme.id as any)}
            className={`cursor-pointer hover:bg-accent ${
              colorScheme === scheme.id ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${scheme.color} border border-border`} />
              <span>{scheme.name}</span>
              {colorScheme === scheme.id && (
                <span className="ml-auto text-xs text-primary">Active</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;