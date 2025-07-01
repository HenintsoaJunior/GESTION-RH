/* eslint-disable jsx-a11y/anchor-is-valid */
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/Button"
import { Input } from "../../components/Input"
import { Label } from "../../components/Label"
import { Eye, EyeOff } from "../../components/Icons"
import { BASE_URL } from "../../config/apiConfig"
import "./Login.css"

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await fetch(`${BASE_URL}/api/Users/login`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (!response.ok) {
        throw new Error('Échec de la connexion')
      }

      const data = await response.json()
      
      if (data.userId) {
        localStorage.setItem('user', JSON.stringify({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          departmentId: data.departmentId
        }))
        navigate("/dashboard")
      } else {
        throw new Error('Réponse API invalide')
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect.")
    }
  }

  const handlePasswordPaste = (e) => {
    // Update password state with pasted content
    const pastedText = e.clipboardData.getData('text')
    setPassword(pastedText)
    // Prevent default to avoid any unexpected behavior
    e.preventDefault()
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="Logo.png" alt="Logo" className="logo" />
        </div>

        <h2 className="login-title">Se connecter</h2>

        <div className="separator"></div>

        <p className="login-description">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Hic sit impedit aspernatur nostrum! Consectetur
          quidem mollitia itaque, eius atque eaque!
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <Label className="form-label">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <Label className="form-label">Mot de passe</Label>
              <a href="#" className="forgot-password">Mot de passe oublié?</a>
            </div>
            <div className="password-input-container">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPaste={handlePasswordPaste}
                required
                className="form-input password-input"
              />
              <button
                type="button"
                key="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

          <Button type="submit" className="login-button">
            Se connecter
          </Button>

          <div className="signup-container">
            Vous n'avez pas encore de compte?{" "}
            <a href="#" className="signup-link">S'inscrire</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage