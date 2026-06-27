import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { functionDeclarations, executeFunctionCall } from '../functions/agentFunctions.js'
import { getGoal } from './firestore.js'

dotenv.config({ path: '../.env' })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const SYSTEM_PROMPT = `You are Clutch — a sharp, no-nonsense AI productivity companion. Your job is to help users actually complete their goals before deadlines, not just remind them.

Your personality:
- Direct and energetic. You don't sugarcoat.
- You celebrate wins genuinely, but you also call out when someone is falling behind.
- You think in terms of actions, not advice. When someone has a goal, you build a plan immediately.
- You're the friend who makes sure you actually study instead of just saying you will.

Your capabilities:
- You can CREATE a structured day-by-day plan for any goal (create_plan)
- You can TRACK progress when users check in (update_progress)
- You can CHECK status and tell users if they're on track (get_status)
- You can REPLAN dynamically when users miss days or fall behind (replan)
- You can LIST all active goals (list_goals)

Rules:
- When a user mentions any goal, deadline, exam, interview, project, or commitment — immediately call create_plan. Don't ask for permission.
- When a user says they finished or completed something — call update_progress.
- When a user seems behind or missed days — proactively call replan with a recovery plan.
- Always use today's date context when scheduling tasks.
- Keep responses concise and punchy. No bullet-point walls of text.
- Keep responses concise and punchy. No bullet-point walls of text.
- After creating a plan, summarize it in 2-3 sentences max. Don't list every task.`

export async function runAgentChat(userId, userMessage, history, goalId = null) {
  const d = new Date()
  const dateStr = d.toLocaleDateString('en-CA') // YYYY-MM-DD locally
  const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' })
  
  // Generate next 14 days mapping for the AI
  const calendarRef = Array.from({length: 14}, (_, i) => {
    const future = new Date(d);
    future.setDate(future.getDate() + i);
    return `${future.toLocaleDateString('en-US', { weekday: 'long' })}: ${future.toLocaleDateString('en-CA')}`;
  }).join(', ');

  let dynamicPrompt = SYSTEM_PROMPT + `\n- Current date: ${dateStr} (${dayOfWeek})\n- Calendar reference for the next 14 days: ${calendarRef}`

  if (goalId) {
    const goal = await getGoal(goalId)
    if (goal) {
      dynamicPrompt += `\n\nCRITICAL CONTEXT: The user is currently chatting from the Goal Details page for the goal "${goal.title}" (ID: ${goal.id}). Deadline: ${goal.deadline}. Progress: ${goal.progress || 0}%. Tasks: ${JSON.stringify(goal.tasks)}.\n\nKeep all your suggestions and plans strictly focused on this goal. Use the tools to update/replan this specific goal if requested.`
    }
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: dynamicPrompt,
    tools: [{ functionDeclarations }]
  })

  const chat = model.startChat({ history })

  let result = await chat.sendMessage(userMessage)
  let response = result.response

  while (response.functionCalls() && response.functionCalls().length > 0) {
    const calls = response.functionCalls()
    const functionResults = []

    for (const call of calls) {
      const output = await executeFunctionCall(call.name, call.args, userId)
      functionResults.push({
        functionResponse: {
          name: call.name,
          response: output
        }
      })
    }

    result = await chat.sendMessage(functionResults)
    response = result.response
  }

  const text = response.text()
  const updatedHistory = await chat.getHistory()

  return { text, history: updatedHistory }
}
