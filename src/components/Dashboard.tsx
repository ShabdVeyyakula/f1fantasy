import { useState, useEffect } from 'react'
import { Container, Heading, Table, Dialog, Flex, Text, Badge, Button } from '@radix-ui/themes'
import { useNavigate } from 'react-router-dom'

interface Team {
  id: string
  userName: string
  drivers: string[]
  constructors: string[]
  total_cost: number
  totalPoints: number
}

export function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/teams')
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  return (
    <div className="dashboard-page">
      <Container size="3">
        <div className="dashboard-content">
          <Heading size="8" className="page-title">F1 Fantasy Leaderboard</Heading>
          
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Position</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Team Manager</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Points</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Team Cost</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {teams.map((team, index) => (
                <Table.Row 
                  key={team.id} 
                  className="team-row"
                  onClick={() => setSelectedTeam(team)}
                >
                  <Table.Cell>
                    <Badge 
                      color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'gray'}
                    >
                      {index + 1}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{team.userName}'s Team</Table.Cell>
                  <Table.Cell>{team.totalPoints}</Table.Cell>
                  <Table.Cell>{team.total_cost} pts</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          <Dialog.Root open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
            <Dialog.Content className="team-dialog">
              <Dialog.Title>{selectedTeam?.userName}'s Team</Dialog.Title>
              
              <div className="team-details">
                <div className="section">
                  <Heading size="3">Constructors</Heading>
                  <div className="items-list">
                    {selectedTeam?.constructors.map(constructor => (
                      <Badge key={constructor} size="2">{constructor}</Badge>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <Heading size="3">Drivers</Heading>
                  <div className="items-list">
                    {selectedTeam?.drivers.map(driver => (
                      <Badge key={driver} size="2">{driver}</Badge>
                    ))}
                  </div>
                </div>

                <Flex gap="4" className="team-stats">
                  <div className="stat">
                    <Text size="2">Total Points</Text>
                    <Text size="6" weight="bold">{selectedTeam?.totalPoints}</Text>
                  </div>
                  <div className="stat">
                    <Text size="2">Team Cost</Text>
                    <Text size="6" weight="bold">{selectedTeam?.total_cost} pts</Text>
                  </div>
                </Flex>
              </div>
            </Dialog.Content>
          </Dialog.Root>
          
          <Button 
            size="3"
            className="quit-button"
            onClick={() => navigate('/')}
          >
            Quit Game
          </Button>
        </div>
      </Container>
    </div>
  )
} 