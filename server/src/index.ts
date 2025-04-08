import express, { RequestHandler, Router } from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { supabase } from './lib/supabase.js'

// Load environment variables
config()

const app = express()
const router = Router()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
const createUser: RequestHandler = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ name }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      res.status(500).json({ error: 'Failed to create user' })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const createTeam: RequestHandler = async (req, res) => {
  try {
    const { userId, drivers, constructors, totalCost } = req.body

    if (!userId || !drivers || !constructors || totalCost === undefined) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    const { data, error } = await supabase
      .from('teams')
      .insert([{
        user_id: userId,
        drivers,
        constructors,
        total_cost: totalCost
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      res.status(500).json({ error: 'Failed to create team' })
      return
    }

    res.status(201).json(data)
  } catch (error) {
    console.error('Error creating team:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

const getTeams: RequestHandler = async (req, res) => {
  try {
    // Get all teams from Supabase
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        users (name)
      `)

    if (error) {
      throw error
    }

    // Fetch current F1 standings
    const [driversRes, constructorsRes] = await Promise.all([
      fetch('https://v1.formula-1.api-sports.io/rankings/drivers?season=2025', {
        headers: {
          'x-rapidapi-key': process.env['x-rapidapi-key']
        }
      }),
      fetch('https://v1.formula-1.api-sports.io/rankings/teams?season=2025', {
        headers: {
          'x-rapidapi-key': process.env['x-rapidapi-key']
        }
      })
    ])

    const driversData = await driversRes.json()
    const constructorsData = await constructorsRes.json()
    console.log("driversData", driversData)
    console.log("constructorsData", constructorsData)

    // Calculate points for each team
    const teamsWithPoints = teams.map(team => {
      let totalPoints = 0
      
      // Add driver points
      team.drivers.forEach((driverAcronym: string) => {
        const driverStanding = driversData.response.find(
          (d: any) => d.driver.abbr === driverAcronym
        )
        if (driverStanding) {
          totalPoints += driverStanding.points
        }
      })

      // Add constructor points
      team.constructors.forEach((constructorName: string) => {
        const constructorStanding = constructorsData.response.find(
          (c: any) => c.team.name === constructorName
        )
        if (constructorStanding) {
          totalPoints += constructorStanding.points
        }
      })

      return {
        ...team,
        totalPoints,
        userName: team.users.name
      }
    })

    // Sort by points
    teamsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints)

    res.json(teamsWithPoints)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
}

router.post('/api/users', createUser)
router.post('/api/teams', createTeam)
router.get('/api/teams', getTeams)

// Use router
app.use(router)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})