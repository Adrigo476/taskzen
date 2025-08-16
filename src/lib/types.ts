export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Objective = {
  id:string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  subtasks: SubTask[];
  preferredDays: number[]; // 0 for Sunday, 1 for Monday, etc.
};
