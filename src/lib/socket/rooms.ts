export const rooms = {
  board: (projectId: string) => `board:${projectId}`,
  sprint: (sprintId: string) => `sprint:${sprintId}`,
  task: (taskId: string) => `task:${taskId}`,
  user: (userId: string) => `user:${userId}`,
  chat: (projectId: string) => `chat:${projectId}`,
};
