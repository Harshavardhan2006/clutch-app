import express from 'express'
import { google } from 'googleapis'
import dotenv from 'dotenv'
import { saveCalendarToken, getCalendarToken, saveUser, getUser, markGoalSynced } from '../services/firestore.js'

dotenv.config({ path: '../.env' })

const router = express.Router()

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

router.get('/google/login-url', (req, res) => {
  const oauth2Client = getOAuthClient()
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  })
  res.json({ url })
})

router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body
    const oauth2Client = getOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data: profile } = await oauth2.userinfo.get()

    const userId = `google_${profile.id}`
    const user = {
      id: userId,
      name: profile.name,
      email: profile.email,
      picture: profile.picture
    }

    await saveUser(userId, user)
    await saveCalendarToken(userId, tokens)

    res.json({ user })
  } catch (err) {
    console.error('Auth callback error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/calendar/sync', async (req, res) => {
  try {
    const { userId, tasks, goalTitle } = req.body
    const tokens = await getCalendarToken(userId)
    if (!tokens) return res.status(401).json({ error: 'Calendar not connected' })

    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials(tokens)
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const created = []
    for (const task of tasks) {
      if (task.status === 'pending' || !task.status) {
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: `[Clutch] ${task.title}`,
            description: `${goalTitle} — ${task.description || ''}`,
            start: { date: task.date },
            end: { date: task.date },
            reminders: {
              useDefault: false,
              overrides: [{ method: 'popup', minutes: 480 }]
            }
          }
        })
        created.push(event.data.id)
      }
    }

    if (req.body.goalId) {
      await markGoalSynced(req.body.goalId)
    }

    res.json({ success: true, eventsCreated: created.length })
  } catch (err) {
    console.error('Calendar sync error:', err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/calendar/status/:userId', async (req, res) => {
  try {
    const tokens = await getCalendarToken(req.params.userId)
    res.json({ connected: !!tokens })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router