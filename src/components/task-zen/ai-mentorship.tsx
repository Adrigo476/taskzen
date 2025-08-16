"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { getAiMentorship } from '@/ai/flows/ai-mentor';
import type { Objective } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AiMentorshipProps {
    objectives: Objective[];
}

export function AiMentorship({ objectives }: AiMentorshipProps) {
    const [isPending, startTransition] = useTransition();
    const [mentorship, setMentorship] = useState('');
    const { toast } = useToast();

    const handleGetMentorship = () => {
        const activeObjectives = objectives
            .filter(obj => obj.status === 'active')
            .map(obj => obj.title)
            .join(', ');

        if (!activeObjectives) {
            toast({
                title: 'No hay objetivos activos',
                description: 'Por favor, añade o activa algún objetivo para recibir ayuda.',
                variant: 'destructive',
            });
            return;
        }

        startTransition(async () => {
            try {
                const result = await getAiMentorship({ objectives: activeObjectives });
                setMentorship(result.mentorship);
            } catch (error) {
                console.error(error);
                toast({
                    title: 'Error al obtener la mentoría',
                    description: 'Algo ha salido mal. Por favor, inténtalo más tarde.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="w-6 h-6 text-primary" />
                    A este ritmo
                </CardTitle>
                <CardDescription>Consejos de la IA para ayudarte a alcanzar tus metas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleGetMentorship} disabled={isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Recibir consejo
                </Button>

                {isPending && (
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    </div>
                )}
                
                {mentorship && !isPending && (
                    <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-sm text-muted-foreground">
                        {mentorship}
                    </blockquote>
                )}
            </CardContent>
        </Card>
    );
}
