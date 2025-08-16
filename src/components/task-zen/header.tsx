
"use client";

import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Objective } from '@/lib/types';
import { SettingsSheet } from "./settings-sheet";


function UserNav() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const getInitials = (name: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const isAnonymous = user.isAnonymous;
    const displayName = isAnonymous ? 'Invitado' : user.displayName;
    const displayEmail = isAnonymous ? 'Sesión anónima' : user.email;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        {!isAnonymous && <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'Usuario'} />}
                        <AvatarFallback>
                            {isAnonymous ? <UserIcon className="h-5 w-5" /> : getInitials(user.displayName)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {displayEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface AppHeaderProps {
    objectives: Objective[];
    setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
    weeklyCreditGoal: number;
    setWeeklyCreditGoal: React.Dispatch<React.SetStateAction<number>>;
}

export function AppHeader({ objectives, setObjectives, weeklyCreditGoal, setWeeklyCreditGoal }: AppHeaderProps) {
  const { user, signInWithGoogle, signInAnonymously } = useAuth();
  return (
    <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <h1 className="text-3xl font-headline font-bold text-foreground">
        Task<span className="text-primary">Zen</span>
      </h1>
      <div className="flex items-center gap-4">
        {user ? (
          <Sheet>
            <UserNav />
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir configuración">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
             <SettingsSheet 
                  objectives={objectives} 
                  setObjectives={setObjectives} 
                  weeklyCreditGoal={weeklyCreditGoal} 
                  setWeeklyCreditGoal={setWeeklyCreditGoal} 
              />
          </Sheet>
        ) : (
          <div className="flex gap-2">
            <Button onClick={signInWithGoogle}>Iniciar Sesión con Google</Button>
            <Button onClick={signInAnonymously} variant="secondary">Entrar como invitado</Button>
          </div>
        )}
      </div>
    </header>
  );
}
