import {
  createGoal,
  saveTaskPlan,
  getGoal,
  getUserGoals,
  updateTaskStatus,
  replanGoal
} from '../services/firestore.js'

export const functionDeclarations = [
  {
    name: 'create_plan',
    description: 'Create a new goal with a day-by-day action plan broken into tasks. Call this when the user mentions a goal, deadline, exam, interview, project, or any commitment they want to accomplish.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short title of the goal' },
        deadline: { type: 'string', description: 'Deadline date in YYYY-MM-DD format' },
        context: { type: 'string', description: 'Any additional context the user provided about the goal' },
        tasks: {
          type: 'array',
          description: 'Day-by-day breakdown of tasks',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              day: { type: 'number', description: 'Day number starting from 1' },
              date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
              title: { type: 'string' },
              description: { type: 'string' },
              estimatedMinutes: { type: 'number' },
              priority: { type: 'string', enum: ['high', 'medium', 'low'] },
              status: { type: 'string', enum: ['pending', 'done', 'skipped'] }
            }
          }
        }
      },
      required: ['title', 'deadline', 'tasks']
    }
  },
  {
    name: 'update_progress',
    description: 'Mark a task as done or skipped. Call this when the user says they completed, finished, or skipped a task.',
    parameters: {
      type: 'object',
      properties: {
        goalId: { type: 'string', description: 'The goal ID' },
        taskId: { type: 'string', description: 'The task ID to update' },
        status: { type: 'string', enum: ['done', 'skipped'] }
      },
      required: ['goalId', 'taskId', 'status']
    }
  },
  {
    name: 'get_status',
    description: 'Get the current progress and status of a goal. Call this when the user asks how they are doing, their progress, or what is left.',
    parameters: {
      type: 'object',
      properties: {
        goalId: { type: 'string', description: 'The goal ID to check' }
      },
      required: ['goalId']
    }
  },
  {
    name: 'replan',
    description: 'Regenerate the task plan for a goal. Call this when the user missed days, fell behind, or wants to adjust the plan.',
    parameters: {
      type: 'object',
      properties: {
        goalId: { type: 'string', description: 'The goal ID to replan' },
        reason: { type: 'string', description: 'Why the replan is needed' },
        newTasks: {
          type: 'array',
          description: 'Revised day-by-day tasks',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              day: { type: 'number' },
              date: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              estimatedMinutes: { type: 'number' },
              priority: { type: 'string', enum: ['high', 'medium', 'low'] },
              status: { type: 'string', enum: ['pending', 'done', 'skipped'] }
            }
          }
        }
      },
      required: ['goalId', 'newTasks']
    }
  },
  {
    name: 'list_goals',
    description: 'List all active goals for the user. Call this when the user asks what goals they have, or wants an overview.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' }
      },
      required: ['userId']
    }
  }
]

export async function executeFunctionCall(name, args, userId) {
  switch (name) {
    case 'create_plan': {
      const goal = await createGoal(userId, {
        title: args.title,
        deadline: args.deadline,
        context: args.context
      })
      const tasks = args.tasks.map((t, i) => ({ ...t, id: `task_${goal.id}_${i}`, status: 'pending' }))
      await saveTaskPlan(goal.id, tasks)
      return { success: true, goalId: goal.id, title: goal.title, taskCount: tasks.length, tasks }
    }

    case 'update_progress': {
      const result = await updateTaskStatus(args.goalId, args.taskId, args.status)
      if (!result) return { success: false, error: 'Goal not found' }
      const pending = result.tasks.filter(t => t.status === 'pending').length
      const done = result.tasks.filter(t => t.status === 'done').length
      return { success: true, progress: result.progress, streak: result.streak, tasksRemaining: pending, tasksDone: done }
    }

    case 'get_status': {
      const goal = await getGoal(args.goalId)
      if (!goal) return { success: false, error: 'Goal not found' }
      const today = new Date().toISOString().split('T')[0]
      const deadline = goal.deadline
      const daysLeft = Math.ceil((new Date(deadline) - new Date(today)) / (1000 * 60 * 60 * 24))
      const pending = goal.tasks?.filter(t => t.status === 'pending') || []
      const done = goal.tasks?.filter(t => t.status === 'done') || []
      const todayTasks = pending.filter(t => t.date === today)
      return {
        success: true,
        title: goal.title,
        deadline,
        daysLeft,
        progress: goal.progress || 0,
        streak: goal.streak || 0,
        tasksDone: done.length,
        tasksRemaining: pending.length,
        todayTasks,
        isOnTrack: daysLeft > 0 && pending.length <= daysLeft * 2
      }
    }

    case 'replan': {
      const newTasks = args.newTasks.map((t, i) => ({
        ...t,
        id: t.id || `task_${args.goalId}_r${i}`
      }))
      await replanGoal(args.goalId, newTasks)
      return { success: true, newTaskCount: newTasks.length, reason: args.reason }
    }

    case 'list_goals': {
      const goals = await getUserGoals(userId)
      return {
        success: true,
        goals: goals.map(g => ({
          id: g.id,
          title: g.title,
          deadline: g.deadline,
          progress: g.progress || 0,
          streak: g.streak || 0,
          tasksRemaining: g.tasks?.filter(t => t.status === 'pending').length || 0
        }))
      }
    }

    default:
      return { success: false, error: `Unknown function: ${name}` }
  }
}