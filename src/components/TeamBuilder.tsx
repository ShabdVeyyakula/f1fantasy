import { useState, useEffect } from 'react'
import { Container, Heading, Button, Flex, Text, Badge } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

interface Driver {
  id: string
  name: string
  team: string
  cost: number
  number: string
  headshot_url: string
  team_colour: string
  country_code: string
  name_acronym: string
}

interface Constructor {
  id: number
  name: string
  cost: number
  color: string
}

export function TeamBuilder() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([])
  const [constructors] = useState<Constructor[]>([
    { id: 1, name: 'McLaren Mercedes', cost: 35, color: '#F58020' },
    { id: 2, name: 'Ferrari', cost: 33, color: '#DC0000' },
    { id: 3, name: 'Red Bull Racing', cost: 40, color: '#3671C6' },
    { id: 4, name: 'Mercedes', cost: 30, color: '#6CD3BF' },
    { id: 5, name: 'Aston Martin', cost: 25, color: '#358C75' },
    { id: 6, name: 'Alpine', cost: 20, color: '#2293D1' },
    { id: 7, name: 'Haas', cost: 15, color: '#B6BABD' },
    { id: 8, name: 'RB', cost: 15, color: '#6592FF' },
    { id: 9, name: 'Williams', cost: 12, color: '#37BEDD' },
    { id: 10, name: 'Kick Sauber', cost: 10, color: '#52E252' }
  ])
  const [selectedConstructors, setSelectedConstructors] = useState<Constructor[]>([])
  const [budget, setBudget] = useState(175)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/drivers?session_key=10006')
      const data = await response.json()
      
      const driverCosts = {
        'VER': 40, 'LEC': 35, 'NOR': 33, 'HAM': 32, 'PER': 30,
        'SAI': 30, 'RUS': 28, 'PIA': 25, 'ALO': 25, 'STR': 20,
        'GAS': 20, 'OCO': 18, 'ALB': 18, 'BOT': 15, 'ZHO': 15,
        'MAG': 15, 'TSU': 15, 'RIC': 15, 'SAR': 12, 'BEA': 12
      }
      
      const formattedDrivers = data.map((driver: any) => ({
        id: driver.driver_number,
        name: `${driver.first_name} ${driver.last_name}`,
        team: driver.team_name,
        number: driver.driver_number,
        cost: driverCosts[driver.name_acronym] || 20,
        headshot_url: driver.headshot_url,
        team_colour: driver.team_colour,
        country_code: driver.country_code,
        name_acronym: driver.name_acronym
      }))
      
      setDrivers(formattedDrivers)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const handleDriverSelect = (driver: Driver) => {
    if (selectedDrivers.includes(driver)) {
      setSelectedDrivers(selectedDrivers.filter(d => d.id !== driver.id))
      setBudget(budget + driver.cost)
    } else if (selectedDrivers.length < 5 && budget >= driver.cost) {
      setSelectedDrivers([...selectedDrivers, driver])
      setBudget(budget - driver.cost)
    }
  }

  const handleConstructorSelect = (constructor: Constructor) => {
    if (selectedConstructors.includes(constructor)) {
      setSelectedConstructors(selectedConstructors.filter(c => c.id !== constructor.id))
      setBudget(budget + constructor.cost)
    } else if (selectedConstructors.length < 2 && budget >= constructor.cost) {
      setSelectedConstructors([...selectedConstructors, constructor])
      setBudget(budget - constructor.cost)
    }
  }

  const handleSubmitTeam = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      console.error('No user ID found')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          drivers: selectedDrivers.map(d => d.name_acronym),
          constructors: selectedConstructors.map(c => c.name),
          totalCost: 100 - budget
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      const data = await response.json()
      console.log('Team created:', data)
      
      // Navigate to dashboard
      navigate('/dashboard')
      
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="team-builder-page">
      <Container size="3">
        <div className="team-builder-content">
          <Heading size="8" className="page-title">Build Your F1 Fantasy Team</Heading>
          <div className="budget-display">
            <Badge size="2" color={budget < 0 ? 'red' : 'green'} className="budget-badge">
              Budget Remaining: {budget} pts
            </Badge>
          </div>
          
          <div className="selection-area">
            <div className="constructors-section">
              <Heading size="4" className="section-title">Select Constructors (2)</Heading>
              <Flex gap="4" wrap="wrap" className="cards-container">
                {constructors.map(constructor => (
                  <div 
                    key={constructor.id}
                    className={`constructor-card ${selectedConstructors.includes(constructor) ? 'selected' : ''}`}
                    onClick={() => handleConstructorSelect(constructor)}
                    style={{
                      '--team-color': constructor.color
                    } as React.CSSProperties}
                  >
                    <div className="constructor-content">
                      <Text size="5" weight="bold">{constructor.name}</Text>
                      <Badge className="cost-badge">{constructor.cost} pts</Badge>
                    </div>
                  </div>
                ))}
              </Flex>
            </div>

            <div className="drivers-section">
              <Heading size="4" className="section-title">Select Drivers (5)</Heading>
              <Flex gap="4" wrap="wrap" className="cards-container">
                {drivers.map(driver => (
                  <div 
                    key={driver.id}
                    className={`driver-card ${selectedDrivers.includes(driver) ? 'selected' : ''}`}
                    onClick={() => handleDriverSelect(driver)}
                    style={{
                      '--team-color': `#${driver.team_colour}`
                    } as React.CSSProperties}
                  >
                    <div className="driver-image">
                      <img src={driver.headshot_url} alt={driver.name} />
                    </div>
                    <div className="driver-content">
                      <div className="driver-info">
                        <Text size="2" weight="bold">{driver.name}</Text>
                        <Text size="1" className="team-name">{driver.team}</Text>
                      </div>
                      <div className="driver-details">
                        <Badge className="country-badge">{driver.country_code}</Badge>
                        <Badge className="cost-badge">{driver.cost} pts</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </Flex>
            </div>
          </div>

          <Button 
            size="3"
            className="submit-team"
            disabled={selectedDrivers.length !== 5 || selectedConstructors.length !== 2}
            onClick={handleSubmitTeam}
          >
            Confirm Team
          </Button>
        </div>
      </Container>
    </div>
  )
} 