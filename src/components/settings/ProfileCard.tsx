
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronRight, User, Mail, Settings, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ProfileProps {
  className?: string;
}

export function ProfileCard({ className }: ProfileProps) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    toast({
      title: isDarkMode ? "Light mode activated" : "Dark mode activated"
    });
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
    });
    setTimeout(() => navigate('/signin'), 1000);
  };
  
  const menuItems = [
    { 
      icon: <User className="w-5 h-5" />, 
      label: 'My Profile', 
      onClick: () => navigate('/profile'),
      animationDelay: 100
    },
    { 
      icon: <Mail className="w-5 h-5" />, 
      label: 'Email Settings', 
      onClick: () => navigate('/email-settings'),
      animationDelay: 200
    },
    { 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings', 
      onClick: () => navigate('/settings'),
      animationDelay: 300
    },
    { 
      icon: <Moon className="w-5 h-5" />, 
      label: 'Switch to Dark', 
      onClick: toggleDarkMode,
      isSwitch: true,
      value: isDarkMode,
      animationDelay: 400
    },
    { 
      icon: <LogOut className="w-5 h-5" />, 
      label: 'Log Out', 
      onClick: handleLogout,
      danger: true,
      animationDelay: 500
    },
  ];

  return (
    <Card className={cn("w-full max-w-sm animate-fade-in", className)}>
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-20 h-20 border-4 border-tamil-light dark:border-tamil-primary">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold">Alexis Sanchez</h3>
            <p className="text-sm text-muted-foreground">123K followers</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <div 
              key={i}
              onClick={item.onClick}
              className={cn(
                "flex items-center justify-between p-3 rounded-md cursor-pointer animate-fade-in",
                item.danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-muted",
                { "animate-in-delay-100": i === 0 },
                { "animate-in-delay-200": i === 1 },
                { "animate-in-delay-300": i === 2 },
                { "animate-in-delay-400": i === 3 },
                { "animate-in-delay-500": i === 4 }
              )}
              style={{ animationDelay: `${item.animationDelay}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-1 rounded-md",
                  item.danger ? "text-destructive" : "text-tamil-primary dark:text-tamil-secondary"
                )}>
                  {item.icon}
                </div>
                <Label className="cursor-pointer">{item.label}</Label>
              </div>
              
              {item.isSwitch ? (
                <Switch checked={item.value} />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <p className="text-xs text-muted-foreground">
            <a href="/privacy" className="hover:underline">Privacy Policy</a> • <a href="/terms" className="hover:underline">Terms of Service</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
