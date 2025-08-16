"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import type { Objective, SubTask } from '@/lib/types';

interface TodaysMissionsProps {
    objectives: Objective[];
    onSubtaskChange: (objectiveId: string, subtaskId: string, completed: boolean) => void;
}

export function TodaysMissions({ objectives, onSubtaskChange }: TodaysMissionsProps) {
    const todaysMissions = useMemo(() => {
        return objectives
            .filter(obj => obj.status === 'active')
            .map(obj => {
                const nextTask = obj.subtasks.find(task => !task.completed);
                return nextTask ? { objective: obj, subtask: nextTask } : null;
            })
            .filter(Boolean) as { objective: Objective; subtask: SubTask }[];
    }, [objectives]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Target className="w-6 h-6 text-primary" />
                    Misiones de Hoy
                </CardTitle>
                <CardDescription>Tu siguiente tarea para cada objetivo activo.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {todaysMissions.length > 0 ? (
                        todaysMissions.map(({ objective, subtask }) => (
                            <div key={subtask.id} className="flex items-center p-3 rounded-lg bg-background hover:bg-muted transition-colors group">
                                <Checkbox
                                    id={subtask.id}
                                    checked={subtask.completed}
                                    onCheckedChange={(checked) => onSubtaskChange(objective.id, subtask.id, !!checked)}
                                    className="mr-4 h-5 w-5"
                                />
                                <div className="flex-1">
                                    <Label htmlFor={subtask.id} className="font-medium cursor-pointer group-hover:text-primary transition-colors">
                                        {subtask.title}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{objective.title}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Todas las tareas completadas. ¡Buen trabajo! 🎉</p>
                            <p className="text-xs">Añade más objetivos en la configuración.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
