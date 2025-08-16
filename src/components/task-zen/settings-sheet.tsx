

"use client";

import { useState } from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Play, Pause, MoreVertical, FileDown, Settings, ListTodo } from 'lucide-react';
import type { Objective, SubTask } from '@/lib/types';
import { WeeklyCalendar } from './weekly-calendar';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { addObjective, updateObjective, deleteObjective, getObjectives } from '@/services/firestore';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsSheetProps {
    objectives: Objective[];
    setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
    weeklyCreditGoal: number;
    setWeeklyCreditGoal: React.Dispatch<React.SetStateAction<number>>;
}

export function SettingsSheet({ objectives, setObjectives, weeklyCreditGoal, setWeeklyCreditGoal }: SettingsSheetProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newObjectiveTitle, setNewObjectiveTitle] = useState('');
    const [newObjectiveTasks, setNewObjectiveTasks] = useState('');
    const [separator, setSeparator] = useState('*');
    const [preferredDays, setPreferredDays] = useState<number[]>([]);

    const handleAddObjective = async () => {
        console.log("Botón 'Añadir Objetivo' pulsado. Iniciando proceso...");
        
        if (!user) {
            toast({ title: 'Error de autenticación', description: "Debes iniciar sesión para añadir objetivos.", variant: 'destructive' });
            return;
        }

        if (!newObjectiveTitle.trim()) {
            toast({ title: 'Campo requerido', description: "El título del objetivo no puede estar vacío.", variant: 'destructive' });
            return;
        }

        const subtasks: SubTask[] = newObjectiveTasks
            .split(/\r?\n/)
            .flatMap(line => line.split(separator))
            .map(task => task.trim())
            .filter(task => task)
            .map((title, index) => ({
                id: `${Date.now()}-${index}`,
                title,
                completed: false,
            }));

        if (subtasks.length === 0) {
            toast({ title: 'Campo requerido', description: "Debes añadir al menos una subtarea.", variant: 'destructive' });
            return;
        }

        const newObjective: Omit<Objective, 'id'> = {
            title: newObjectiveTitle,
            status: 'active',
            subtasks,
            preferredDays
        };

        try {
            console.log("Intentando guardar el nuevo objetivo en Firestore:", newObjective);
            const newId = await addObjective(user.uid, newObjective);
            setObjectives(prev => [...prev, { ...newObjective, id: newId }]);
            toast({ title: '¡Éxito!', description: `Objetivo "${newObjectiveTitle}" añadido.` });
            setNewObjectiveTitle('');
            setNewObjectiveTasks('');
            setPreferredDays([]);
            console.log("Objetivo añadido con éxito.");
        } catch (error) {
            console.error("Error al añadir el objetivo:", error);
            const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
            toast({ title: 'Error de guardado', description: `No se pudo añadir el objetivo: ${errorMessage}`, variant: 'destructive' });
        }
    };
    
    const handleToggleStatus = async (id: string) => {
        if (!user) return;
        const objective = objectives.find(obj => obj.id === id);
        if (!objective) return;

        const newStatus = objective.status === 'active' ? 'paused' : 'active';
        setObjectives(prev => prev.map(obj => obj.id === id ? { ...obj, status: newStatus } : obj));
        
        try {
            await updateObjective(user.uid, id, { status: newStatus });
        } catch (error) {
             toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
             const objectivesFromDb = await getObjectives(user.uid);
             setObjectives(objectivesFromDb);
        }
    }

    const handleDeleteObjective = async (id: string) => {
        if (!user) return;
        const originalObjectives = objectives;
        setObjectives(prev => prev.filter(obj => obj.id !== id));
        try {
            await deleteObjective(user.uid, id);
            toast({ title: 'Objetivo eliminado' });
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo eliminar el objetivo.', variant: 'destructive' });
            setObjectives(originalObjectives);
        }
    }

    return (
        <SheetContent className="w-full sm:w-[540px] p-0 flex flex-col">
            <SheetHeader className="p-6 pb-2 flex-shrink-0">
                <SheetTitle className="font-headline">Configuración</SheetTitle>
                <SheetDescription>Gestiona tus objetivos y preferencias.</SheetDescription>
            </SheetHeader>
            <Tabs defaultValue="objectives" className="flex-1 flex flex-col min-h-0">
                <div className="px-6 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="objectives"><ListTodo className="w-4 h-4 mr-2" />Tus Objetivos</TabsTrigger>
                      <TabsTrigger value="import"><FileDown className="w-4 h-4 mr-2" />Añadir Nuevo</TabsTrigger>
                      <TabsTrigger value="general"><Settings className="w-4 h-4 mr-2" />General</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                    <TabsContent value="objectives" className="p-6 m-0 h-full">
                         <ScrollArea className="h-full pr-4">
                            <h3 className="text-lg font-medium font-headline mb-2">Tus Objetivos</h3>
                            {objectives.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {objectives.map(obj => (
                                        <AccordionItem value={obj.id} key={obj.id} className="border-b-0 mb-2">
                                            <div className="flex items-center justify-between p-2 rounded-lg border bg-card group">
                                                <AccordionTrigger className="flex-1 hover:no-underline p-2">
                                                    <div className='text-left'>
                                                        <p className="font-medium">{obj.title}</p>
                                                        <Badge variant={obj.status === 'active' ? 'secondary' : 'outline'}>{obj.status === 'active' ? 'Activo' : 'Pausado'}</Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(obj.id)}>
                                                            {obj.status === 'active' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                                            <span>{obj.status === 'active' ? 'Pausar' : 'Reanudar'}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteObjective(obj.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>Eliminar</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <AccordionContent className="pt-2 pb-4 px-4">
                                                <div className="space-y-2">
                                                    {obj.subtasks.map(task => (
                                                        <div key={task.id} className="flex items-center gap-2">
                                                            <Checkbox id={`task-${task.id}`} checked={task.completed} disabled className="h-4 w-4"/>
                                                            <Label htmlFor={`task-${task.id}`} className={cn("text-sm text-muted-foreground", {"line-through": task.completed})}>
                                                                {task.title}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <p className="text-muted-foreground text-sm text-center py-8">No tienes objetivos. ¡Añade uno en la pestaña "Añadir Nuevo"!</p>
                            )}
                         </ScrollArea>
                    </TabsContent>
                    <TabsContent value="import" className="p-6 m-0 h-full">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium font-headline">Añadir Nuevo Objetivo</h3>
                                <p className="text-sm text-muted-foreground">Define un objetivo y sus subtareas. Puedes separar las subtareas con un carácter especial o con saltos de línea.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-objective-title">Título del Objetivo</Label>
                                    <Input id="new-objective-title" value={newObjectiveTitle} onChange={e => setNewObjectiveTitle(e.target.value)} placeholder="Ej: Aprender Next.js" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-objective-tasks">Subtareas</Label>
                                    <Textarea id="new-objective-tasks" value={newObjectiveTasks} onChange={e => setNewObjectiveTasks(e.target.value)} placeholder={`Tarea 1\nTarea 2\nTarea 3`} rows={5}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="separator">Separador (además del salto de línea)</Label>
                                    <Input id="separator" value={separator} onChange={e => setSeparator(e.target.value)} className="w-20" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Días de recomendación</Label>
                                    <p className="text-sm text-muted-foreground">Elige qué días de la semana quieres que te recomendemos tareas para este objetivo.</p>
                                    <WeeklyCalendar selectedDays={preferredDays} onDayToggle={setPreferredDays} />
                                </div>
                                <Button onClick={handleAddObjective} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"><Plus className="mr-2 h-4 w-4" />Añadir Objetivo</Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="general" className="p-6 m-0 h-full">
                         <ScrollArea className="h-full pr-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium font-headline">Ajustes Generales</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="weekly-credits">Meta Semanal</Label>
                                    <p className="text-sm text-muted-foreground">Define cuántas tareas (misiones) quieres completar cada semana para mantener la motivación.</p>
                                    <Input id="weekly-credits" type="number" value={weeklyCreditGoal} onChange={e => setWeeklyCreditGoal(Number(e.target.value))} className="w-40" />
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </SheetContent>
    );
}
