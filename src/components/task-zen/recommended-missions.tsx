"use client";

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import type { Objective, SubTask } from '@/lib/types';

interface RecommendedMissionsProps {
    objectives: Objective[];
    weeklyCreditGoal: number;
    onSubtaskChange: (objectiveId: string, subtaskId: string, completed: boolean) => void;
}

export function RecommendedMissions({ objectives, onSubtaskChange }: RecommendedMissionsProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const recommendedMissions = useMemo(() => {
        if (!isClient) {
            return [];
        }
        const today = new Date().getDay(); // 0 = Domingo, 1 = Lunes, etc.
        const missions: { objective: Objective; subtask: SubTask }[] = [];
        
        const activeObjectives = objectives.filter(obj => obj.status === 'active' && obj.preferredDays.includes(today));

        for (const obj of activeObjectives) {
            const nextTask = obj.subtasks.find(task => !task.completed);
            if (nextTask) {
                missions.push({ objective: obj, subtask: nextTask });
            }
        }
        
        return missions;
    }, [objectives, isClient]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Star className="w-6 h-6 text-primary" />
                    Misiones Recomendadas
                </CardTitle>
                <CardDescription>Tareas sugeridas para hoy según tus objetivos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recommendedMissions.length > 0 ? (
                        recommendedMissions.map(({ objective, subtask }) => (
                            <div key={subtask.id} className="flex items-center p-3 rounded-lg bg-background hover:bg-muted transition-colors group">
                                <Checkbox
                                    id={`rec-${subtask.id}`}
                                    checked={subtask.completed}
                                    onCheckedChange={(checked) => onSubtaskChange(objective.id, subtask.id, !!checked)}
                                    className="mr-4"
                                />
                                <div className="flex-1">
                                    <Label htmlFor={`rec-${subtask.id}`} className="font-medium cursor-pointer">
                                        {subtask.title}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{objective.title}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No hay recomendaciones para hoy. ¡Disfruta de tu descanso! ✨</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
