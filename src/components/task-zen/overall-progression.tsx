"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import type { Objective } from '@/lib/types';
import { useMemo } from 'react';

interface OverallProgressionProps {
    objectives: Objective[];
}

export function OverallProgression({ objectives }: OverallProgressionProps) {

    const chartData = useMemo(() => {
        return objectives.map(obj => {
            const totalTasks = obj.subtasks.length;
            const completedTasks = obj.subtasks.filter(t => t.completed).length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return {
                name: obj.title,
                progress: progress,
                fill: `hsl(var(--primary))`,
            };
        });
    }, [objectives]);
    
    const chartConfig = {
        progress: {
            label: "Progreso",
            color: "hsl(var(--primary))",
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Progreso General
                </CardTitle>
                <CardDescription>Tu progreso en todos los objetivos.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                                    width={80}
                                    style={{ textTransform: 'capitalize' }}
                                />
                                <Tooltip 
                                  cursor={{fill: 'hsl(var(--muted))'}}
                                  content={<ChartTooltipContent formatter={(value) => `${value}%`} />}
                                />
                                <Bar dataKey="progress" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                        <p>No hay objetivos. ¡Añade uno en la configuración!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
