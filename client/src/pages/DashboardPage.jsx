import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, Flame, CheckCircle2, Clock, Calendar, RefreshCw } from 'lucide-react'
import { getGoals } from '../lib/api'
import { useUser } from '../hooks/useUser'
import { format, parseISO, isToday, isBefore } from 'date-fns'

function StatusBadge({ goal }) {
  const today = new Date().toISOString().split('T')[0]
  const [ty, tm, td] = today.split('-').map(Number)
  const [dy, dm, dd] = (goal.deadline || today).split('-').map(Number)
  const daysLeft = Math.round((Date.UTC(dy, dm - 1, dd) - Date.UTC(ty, tm - 1, td)) / (1000 * 60 * 60 * 24))
  const progress = goal.progress || 0

  if (daysLeft < 0) return <span className="px-2 py-0.5 rounded-full text-xs bg-clutch-red/20 text-clutch-red">Overdue</span>
  if (progress >= 100) return <span className="px-2 py-0.5 rounded-full text-xs bg-clutch-green/20 text-clutch-green">Complete</span>
  if (daysLeft <= 2 && progress < 70) return <span className="px-2 py-0.5 rounded-full text-xs bg-clutch-red/20 text-clutch-red">At Risk</span>
  if (daysLeft <= 5) return <span className="px-2 py-0.5 rounded-full text-xs bg-clutch-amber/20 text-clutch-amber">Closing In</span>
  return <span className="px-2 py-0.5 rounded-full text-xs bg-clutch-green/20 text-clutch-green">On Track</span>
}

function GoalCard({ goal }) {
  const today = new Date().toISOString().split('T')[0]
  const [ty, tm, td] = today.split('-').map(Number)
  const [dy, dm, dd] = (goal.deadline || today).split('-').map(Number)
  const daysLeft = Math.round((Date.UTC(dy, dm - 1, dd) - Date.UTC(ty, tm - 1, td)) / (1000 * 60 * 60 * 24))
  const progress = goal.progress || 0
  const todayTasks = goal.tasks?.filter(t => t.date === today && t.status === 'pending') || []

  return (
    <Link to={`/goals/${goal.id}`} className="block">
      <div className="bg-clutch-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:bg-clutch-surface/60 hover:border-white/10 transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display font-semibold text-clutch-textPrimary group-hover:text-clutch-accent transition-colors line-clamp-1">
            {goal.title}
          </h3>
          <StatusBadge goal={goal} />
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-clutch-textMuted font-semibold mb-2">
            <span>Progress</span>
            <span className="text-white/90">{progress}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-clutch-accent to-clutch-accentHover rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(108,99,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-clutch-textMuted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
            </span>
            {goal.streak > 0 && (
              <span className="flex items-center gap-1 text-clutch-amber">
                <Flame size={12} />
                {goal.streak} streak
              </span>
            )}
          </div>
          {todayTasks.length > 0 && (
            <span className="flex items-center gap-1 text-clutch-accent">
              <Target size={12} />
              {todayTasks.length} today
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function CalendarStrip({ goals, selectedDate, onSelectDate }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="bg-clutch-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-clutch-textPrimary flex items-center gap-2">
          <Calendar size={16} className="text-clutch-accent" />
          Next 7 Days
        </h2>
        {selectedDate && (
          <button onClick={() => onSelectDate(null)} className="text-xs text-clutch-textMuted hover:text-clutch-accent transition-colors">
            Show all
          </button>
        )}
      </div>
      <div className="overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 custom-scrollbar">
        <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[320px]">
        {days.map((day, i) => {
          const dateStr = day.toISOString().split('T')[0]
          const dayTasks = goals.flatMap(g => g.tasks?.filter(t => t.date === dateStr && (t.status === 'pending' || !t.status)) || [])
          const doneTasks = goals.flatMap(g => g.tasks?.filter(t => t.date === dateStr && t.status === 'done') || [])
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={i}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-br from-clutch-accent to-clutch-accentHover shadow-glow-sm hover:scale-105'
                  : i === 0
                  ? 'bg-white/10 border border-white/5 hover:border-white/20 hover:bg-white/15'
                  : 'bg-transparent border border-transparent hover:bg-white/5'
              }`}>
              <span className={`text-xs font-mono ${isSelected ? 'text-white' : 'text-clutch-textMuted'}`}>
                {format(day, 'EEE')}
              </span>
              <span className={`text-sm font-display font-semibold ${
                isSelected ? 'text-white' : i === 0 ? 'text-clutch-accent' : 'text-clutch-textPrimary'
              }`}>
                {format(day, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-clutch-accent'}`} />
              )}
              {dayTasks.length === 0 && doneTasks.length > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-clutch-green'}`} />
              )}
              {dayTasks.length === 0 && doneTasks.length === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
              )}
              {dayTasks.length > 0 && (
                <span className={`text-xs font-mono ${isSelected ? 'text-white/80' : 'text-clutch-textMuted'}`}>
                  {dayTasks.length}
                </span>
              )}
            </button>
          )
        })}
        </div>
      </div>
      {selectedDate && (() => {
        const tasks = goals.flatMap(g =>
          (g.tasks?.filter(t => t.date === selectedDate && (t.status === 'pending' || !t.status)) || []).map(t => ({ ...t, goalTitle: g.title, goalId: g.id }))
        )
        if (tasks.length === 0) return <p className="text-clutch-textMuted text-sm mt-4 text-center">No tasks on this day.</p>
        return (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-clutch-textMuted font-mono mb-2">{format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d').toUpperCase()}</p>
            {tasks.map(task => (
              <Link key={task.id} to={`/goals/${task.goalId}`} className="flex items-center gap-3 p-3 bg-clutch-surface rounded-xl hover:bg-clutch-border transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === 'high' ? 'bg-clutch-red' : task.priority === 'medium' ? 'bg-clutch-amber' : 'bg-clutch-green'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-clutch-textPrimary font-medium truncate">{task.title}</p>
                  <p className="text-xs text-clutch-textMuted">{task.goalTitle}</p>
                </div>
                {task.estimatedMinutes && <span className="text-xs text-clutch-textMuted font-mono flex-shrink-0">{task.estimatedMinutes}m</span>}
              </Link>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

export default function DashboardPage() {
  const { userId } = useUser()
  const [goals, setGoals] = useState(() => {
    if (!userId) return []
    const cached = localStorage.getItem(`clutch_dashboard_${userId}`)
    return cached ? JSON.parse(cached) : []
  })
  const [loading, setLoading] = useState(() => !goals.length)
  const [selectedDate, setSelectedDate] = useState(null)

  async function fetchGoals() {
    if (!userId) return
    if (goals.length === 0) setLoading(true)
    try {
      const data = await getGoals(userId)
      setGoals(data)
      localStorage.setItem(`clutch_dashboard_${userId}`, JSON.stringify(data))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGoals() }, [userId])

  const totalTasks = goals.reduce((sum, g) => sum + (g.tasks?.length || 0), 0)
  const doneTasks = goals.reduce((sum, g) => sum + (g.tasks?.filter(t => t.status === 'done').length || 0), 0)
  const maxStreak = goals.reduce((max, g) => Math.max(max, g.streak || 0), 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-row items-center justify-between mb-6 md:mb-8 pt-2">
          <div>
            <h1 className="font-display font-bold text-2xl text-clutch-textPrimary">Dashboard</h1>
            <p className="text-clutch-textMuted text-sm mt-1">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <button
            onClick={fetchGoals}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-clutch-textMuted hover:text-clutch-accent hover:bg-clutch-card transition-all text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Active Goals', value: goals.length, icon: Target, color: 'text-clutch-accent' },
            { label: 'Tasks Done', value: doneTasks, icon: CheckCircle2, color: 'text-clutch-green' },
            { label: 'Best Streak', value: `${maxStreak}d`, icon: Flame, color: 'text-clutch-amber' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="relative group bg-clutch-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-110 duration-500">
                <Icon size={80} className={color} />
              </div>
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 shadow-sm border border-white/5 group-hover:scale-110 transition-transform duration-300 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="font-display font-bold text-3xl text-white mb-1">{value}</div>
              <div className="text-clutch-textSecondary text-[11px] uppercase tracking-wider font-semibold">{label}</div>
            </div>
          ))}
        </div>

        {goals.length > 0 && (
          <div className="mb-6">
            <CalendarStrip goals={goals} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        )}

        <div>
          <h2 className="font-display font-semibold text-clutch-textPrimary mb-4">Your Goals</h2>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-clutch-textMuted">
              <RefreshCw size={20} className="animate-spin mr-2" />
              Loading...
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16 text-clutch-textMuted">
              <Target size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-display">No goals yet.</p>
              <p className="text-sm mt-1">Head to Chat and tell Clutch what you need to get done.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}