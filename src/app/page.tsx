
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/task-zen/header';
import { TodaysMissions } from '@/components/task-zen/todays-missions';
import { RecommendedMissions } from '@/components/task-zen/recommended-missions';
import { OverallProgression } from '@/components/task-zen/overall-progression';
import { AiMentorship } from '@/components/task-zen/ai-mentorship';
import type { Objective } from '@/lib/types';
import { Toaster } from '@/components/ui/toaster';
import { getObjectives, addObjective, updateObjective, deleteObjective } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

function WelcomeSplash() {
    const { signInWithGoogle, signInAnonymously } = useAuth();
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-4xl font-bold font-headline mb-4">Bienvenido a TaskZen</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                Tu asistente personal para conquistar objetivos. Inicia sesión para empezar a organizar tus tareas, recibir consejos de la IA y ver tu progreso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={signInWithGoogle} size="lg">Comienza tu viaje con Google</Button>
              <Button onClick={signInAnonymously} size="lg" variant="secondary">Continuar como invitado</Button>
            </div>
        </div>
    );
}


export default function Home() {
    const { user } = useAuth();
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [weeklyCreditGoal, setWeeklyCreditGoal] = useState<number>(7);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) {
            setObjectives([]);
            setLoading(false);
            return;
        };

        const fetchObjectives = async () => {
            setLoading(true);
            const objectivesFromDb = await getObjectives(user.uid);
            setObjectives(objectivesFromDb);
            setLoading(false);
        };
        fetchObjectives();
    }, [user]);

    const handleSubtaskChange = async (objectiveId: string, subtaskId: string, completed: boolean) => {
        if (!user) return;
        
        const newObjectives = objectives.map(obj => {
            if (obj.id === objectiveId) {
                const newSubtasks = obj.subtasks.map(task => 
                    task.id === subtaskId ? { ...task, completed } : task
                );
                return { ...obj, subtasks: newSubtasks };
            }
            return obj;
        });
        setObjectives(newObjectives);
        
        const updatedObjective = newObjectives.find(obj => obj.id === objectiveId);
        if (updatedObjective) {
            try {
                await updateObjective(user.uid, objectiveId, { subtasks: updatedObjective.subtasks });
            } catch (error) {
                toast({ title: 'Error', description: 'No se pudo actualizar la tarea.', variant: 'destructive' });
                // Revert state if update fails
                const objectivesFromDb = await getObjectives(user.uid);
                setObjectives(objectivesFromDb);
            }
        }
    };
    
    if (loading) {
      return (
        <div className="flex flex-col min-h-screen bg-background">
          <AppHeader 
            objectives={objectives} 
            setObjectives={setObjectives}
            weeklyCreditGoal={weeklyCreditGoal}
            setWeeklyCreditGoal={setWeeklyCreditGoal}
          />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Cargando tus objetivos...</p>
          </div>
        </div>
      );
    }

    return (
        <>
          <div className="flex flex-col min-h-screen bg-background">
              <AppHeader 
                objectives={objectives} 
                setObjectives={setObjectives}
                weeklyCreditGoal={weeklyCreditGoal}
                setWeeklyCreditGoal={setWeeklyCreditGoal}
              />
              {user ? (
                  <main className="flex-1 p-4 md:p-8 space-y-8">
                      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                          <div className="lg:col-span-2 space-y-8">
                              <TodaysMissions objectives={objectives} onSubtaskChange={handleSubtaskChange} />
                              <RecommendedMissions objectives={objectives} weeklyCreditGoal={weeklyCreditGoal} onSubtaskChange={handleSubtaskChange} />
                          </div>
                          <div className="space-y-8">
                             <OverallProgression objectives={objectives} />
                             <AiMentorship objectives={objectives} />
                          </div>
                      </div>
                  </main>
              ) : (
                  <WelcomeSplash />
              )}
          </div>
          <Toaster />
        </>
    );
}
