import { Container, Heading, Button } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function SignUp() {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error('Failed to create user')
      }

      const data = await response.json()
      console.log('User created:', data)
      
      // Store user ID in localStorage
      localStorage.setItem('userId', data.id)
      
      // Navigate to team builder
      navigate('/build-team')
      
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="signup-page">
      <div className="auth-container">
        <div className="auth-box">
          <div className="f1-branding">
            <Heading size="8" className="app-title">Cal F1 Fantasy</Heading>
            <div className="red-stripe"></div>
          </div>
          <form onSubmit={handleSubmit} className="signup-form">
            <input 
              type="text"
              placeholder="Enter your name"
              className="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button 
              size="3" 
              className="create-button"
            >
              Create Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}