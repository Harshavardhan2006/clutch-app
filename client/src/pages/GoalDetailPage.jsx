import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DndContext, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { ArrowLeft, CheckCircle2, Circle, SkipForward, Flame, Calendar, ExternalLink, RefreshCw, Clock } from 'lucide-react'
import { getGoal, updateTask, updateTaskDate, getCalendarAuthUrl, getCalendarStatus, syncToCalendar } from '../lib/api'
import { useUser } from '../hooks/useUser'
import { format, parseISO, isToday, isPast } from 'date-fns'
import ChatInterface from '../components/ChatInterface'

function TaskItem({ task, goalId, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  } : undefined

  async function toggle(status) {
    setLoading(true)
    const result = await updateTask(goalId, task.id, status)
    if (result?.progress === 100 && status === 'done') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6C63FF', '#00E5A0', '#FFB547', '#FF5C5C'],
          zIndex: 9999
        })
      })
    }
    onUpdate()
    setLoading(false)
  }

  const isOverdue = isPast(parseISO(task.date)) && !isToday(parseISO(task.date)) && task.status === 'pending'

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`group flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${isDragging ? 'shadow-2xl scale-105' : 'hover:-translate-y-0.5'} ${
      task.status === 'done'
        ? 'bg-black/20 border-white/5 opacity-70 hover:opacity-100'
        : task.status === 'skipped'
        ? 'bg-black/20 border-white/5 opacity-50 hover:opacity-80'
        : isToday(parseISO(task.date))
        ? 'bg-clutch-accent/10 border-clutch-accent/30 shadow-[0_0_15px_rgba(108,99,255,0.1)] hover:bg-clutch-accent/15 cursor-grab active:cursor-grabbing'
        : isOverdue
        ? 'bg-clutch-red/10 border-clutch-red/20 shadow-[0_0_15px_rgba(255,92,92,0.1)] cursor-grab active:cursor-grabbing'
        : 'bg-clutch-surface/40 border-white/5 hover:bg-clutch-surface/60 hover:border-white/10 cursor-grab active:cursor-grabbing'
    }`}>
      <div className="flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110">
        {task.status === 'done' ? (
          <CheckCircle2 size={18} className="text-clutch-green drop-shadow-[0_0_5px_rgba(0,229,160,0.5)]" />
        ) : task.status === 'skipped' ? (
          <SkipForward size={18} className="text-white/40" />
        ) : (
          <Circle size={18} className="text-white/40 group-hover:text-clutch-accent transition-colors" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className={`font-display font-medium text-[15px] ${
            task.status === 'done' || task.status === 'skipped' ? 'line-through text-white/50' : 'text-white'
          }`}>
            {task.title}
          </p>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wide ${
            task.priority === 'high' ? 'bg-clutch-red/20 text-clutch-red border border-clutch-red/20' :
            task.priority === 'medium' ? 'bg-clutch-amber/20 text-clutch-amber border border-clutch-amber/20' :
            'bg-white/5 text-clutch-textSecondary border border-white/5'
          }`}>
            {task.priority}
          </span>
          {isToday(parseISO(task.date)) && task.status === 'pending' && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-clutch-accent text-white shadow-glow-sm font-semibold tracking-wide border border-clutch-accentHover">TODAY</span>
          )}
          {isOverdue && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-clutch-red/20 text-clutch-red border border-clutch-red/20 font-semibold tracking-wide">OVERDUE</span>
          )}
        </div>
        {task.description && (
          <p className="text-clutch-textSecondary text-xs leading-relaxed">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-clutch-textMuted font-medium">
          <span className="font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">{format(parseISO(task.date), 'MMM d')}</span>
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <Clock size={10} className="opacity-70" />
              {task.estimatedMinutes}m
            </span>
          )}
        </div>
      </div>

      {(task.status === 'pending' || !task.status) && (
        <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => toggle('done')}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-clutch-green text-white hover:bg-[#00c98d] hover:shadow-[0_0_15px_rgba(0,229,160,0.4)] transition-all disabled:opacity-50 hover:-translate-y-0.5"
          >
            Done
          </button>
          <button
            onClick={() => toggle('skipped')}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50 hover:-translate-y-0.5"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  )
}

function DateDropZone({ date, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: date,
  })

  return (
    <div ref={setNodeRef} className={`rounded-2xl transition-colors duration-300 ${isOver ? 'bg-white/10 ring-2 ring-clutch-accent/50' : ''}`}>
      {children}
    </div>
  )
}

export default function GoalDetailPage() {
  const { goalId } = useParams()
  const { userId } = useUser()
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px drag before activating
      },
    })
  )

  async function fetchGoal() {
    const data = await getGoal(goalId)
    setGoal(data)
    if (data?.calendarSynced) setSyncDone(true)
    setLoading(false)
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const taskId = active.id
    const newDate = over.id
    const task = active.data.current.task
    
    if (task.date === newDate) return // No change

    // Optimistic update
    setGoal(prev => {
      const newTasks = prev.tasks.map(t => t.id === taskId ? { ...t, date: newDate } : t)
      return { ...prev, tasks: newTasks }
    })
    
    try {
      await updateTaskDate(goalId, taskId, newDate)
      fetchGoal()
    } catch (err) {
      console.error('Failed to update task date', err)
      fetchGoal() // Revert on fail
    }
  }

  async function checkCalendar() {
    if (!userId) return
    const { connected } = await getCalendarStatus(userId)
    setCalendarConnected(connected)
  }

  useEffect(() => {
    fetchGoal()
    checkCalendar()
  }, [goalId, userId])

  async function handleCalendarConnect() {
    const url = await getCalendarAuthUrl(userId)
    window.location.href = url
  }

  async function handleCalendarSync() {
    setSyncing(true)
    try {
      await syncToCalendar(userId, goal.tasks, goal.title, goal.id)
      setSyncDone(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white/50 bg-transparent">
        <RefreshCw size={24} className="animate-spin mr-3 text-clutch-accent" />
        <span className="font-display font-medium text-lg tracking-wide">Loading goal...</span>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50 bg-transparent">
        <p className="text-lg font-display">Goal not found.</p>
        <Link to="/dashboard" className="text-clutch-accent mt-3 text-sm hover:underline hover:text-white transition-colors">← Back to Dashboard</Link>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const [ty, tm, td] = today.split('-').map(Number)
  const [dy, dm, dd] = (goal.deadline || today).split('-').map(Number)
  const daysLeft = Math.round((Date.UTC(dy, dm - 1, dd) - Date.UTC(ty, tm - 1, td)) / (1000 * 60 * 60 * 24))
  const pending = goal.tasks?.filter(t => t.status === 'pending') || []
  const done = goal.tasks?.filter(t => t.status === 'done') || []

  const groupedTasks = {}
  goal.tasks?.forEach(task => {
    if (!groupedTasks[task.date]) groupedTasks[task.date] = []
    groupedTasks[task.date].push(task)
  })
  const sortedDates = Object.keys(groupedTasks).sort()

  return (
    <div className="h-full overflow-y-auto bg-transparent relative z-10 custom-scrollbar">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-clutch-textSecondary hover:text-white hover:bg-white/10 transition-all text-sm mb-6 md:mb-8 font-medium border border-white/5 hover:border-white/10">
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        {/* Hero Section */}
        <div className="bg-clutch-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="mb-6 md:mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-3 tracking-tight">{goal.title}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="flex items-center gap-1.5 text-xs text-white/70 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar size={12} className="text-clutch-accent" />
                <span className="font-mono">{format(parseISO(goal.deadline), 'MMMM d, yyyy')}</span>
              </span>
              <span className={`text-xs font-semibold tracking-wide px-3 py-1.5 rounded-lg border ${daysLeft > 0 ? 'bg-clutch-accent/10 text-clutch-accent border-clutch-accent/20' : daysLeft === 0 ? 'bg-clutch-amber/10 text-clutch-amber border-clutch-amber/20' : 'bg-clutch-red/10 text-clutch-red border-clutch-red/20'}`}>
                {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-clutch-accent mb-1">{goal.progress || 0}%</div>
              <div className="text-clutch-textSecondary text-[10px] uppercase tracking-wider font-semibold">Progress</div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-clutch-green mb-1">{done.length}</div>
              <div className="text-clutch-textSecondary text-[10px] uppercase tracking-wider font-semibold">Completed</div>
            </div>
            <div className="bg-black/20 border border-white/5 rounded-2xl p-4 text-center">
              <div className="font-display font-bold text-3xl text-clutch-amber mb-1 flex items-center justify-center gap-1.5">
                <Flame size={20} className="drop-shadow-[0_0_8px_rgba(255,181,71,0.5)]" />
                {goal.streak || 0}
              </div>
              <div className="text-clutch-textSecondary text-[10px] uppercase tracking-wider font-semibold">Day Streak</div>
            </div>
          </div>

          <div>
            <div className="h-3 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-clutch-accent to-clutch-green rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(108,99,255,0.5)]"
                style={{ width: `${goal.progress || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-8 md:mb-10 p-4 md:p-5 bg-clutch-surface/40 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
              <Calendar size={18} className="text-clutch-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-0.5">Google Calendar</p>
              {calendarConnected ? (
                <p className="text-clutch-green text-xs font-medium tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-clutch-green animate-pulse" />
                  Connected
                </p>
              ) : (
                <p className="text-clutch-textSecondary text-xs">Sync tasks to your calendar</p>
              )}
            </div>
          </div>
          
          {calendarConnected ? (
            <button
              onClick={handleCalendarSync}
              disabled={syncing || syncDone}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-clutch-accent to-clutch-accentHover text-white hover:from-clutch-accentHover hover:to-clutch-accent disabled:opacity-50 transition-all shadow-glow hover:shadow-[0_0_20px_rgba(108,99,255,0.6)] hover:-translate-y-0.5"
            >
              {syncing ? <RefreshCw size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              {syncDone ? 'Synced Successfully!' : 'Sync Tasks'}
            </button>
          ) : (
            <button
              onClick={handleCalendarConnect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 hover:border-white/30 shadow-md hover:-translate-y-0.5"
            >
              <Calendar size={14} />
              Connect Calendar
            </button>
          )}
        </div>

        {/* Task List */}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="space-y-10">
            {sortedDates.map(date => (
              <DateDropZone key={date} date={date}>
                <div className="p-2 -m-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`px-3 py-1 rounded-lg border text-xs font-semibold tracking-wider font-mono ${
                      date === today 
                        ? 'bg-clutch-accent/20 border-clutch-accent/40 text-clutch-accent shadow-glow-sm' 
                        : 'bg-white/5 border-white/10 text-clutch-textSecondary'
                    }`}>
                      {isToday(parseISO(date)) ? 'TODAY' : format(parseISO(date), 'EEE, MMM d').toUpperCase()}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                  <div className="space-y-3">
                    {groupedTasks[date].map(task => (
                      <TaskItem key={task.id} task={task} goalId={goalId} onUpdate={fetchGoal} />
                    ))}
                  </div>
                </div>
              </DateDropZone>
            ))}
          </div>
        </DndContext>
        
        {/* Goal Specific Chat */}
        <div className="mt-12 h-[500px] bg-black/20 border border-white/5 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <ChatInterface goalId={goalId} />
        </div>
      </div>
    </div>
  )
}