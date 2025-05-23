/* eslint-disable jsx-a11y/anchor-is-valid */
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/Button"
import { Input } from "../../components/Input"
import { Label } from "../../components/Label"
import { Eye, EyeOff } from "../../components/Icons"
import "./Login.css"

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    const isAuthenticated = email === "dax@gmail.com" && password === "1234"

    if (isAuthenticated) {
      navigate("/dashboard")
    } else {
      alert("Email ou mot de passe incorrect.")
    }
  }
  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="logo-container">
          <img src="Logo.png" alt="Logo" className="logo" />
        </div>

        {/* Titre */}
        <h2 className="login-title">Se connecter</h2>

        {/* Séparateur */}
        <div className="separator"></div>

        {/* Texte descriptif */}
        <p className="login-description">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Hic sit impedit aspernatur nostrum! Consectetur
          quidem mollitia itaque, eius atque eaque!
        </p>

        {/* Formulaire */}
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
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

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