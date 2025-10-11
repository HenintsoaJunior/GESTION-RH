/* eslint-disable jsx-a11y/anchor-is-valid */
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "services/auth/user";
import "styles/login.css";

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState({ login: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    await loginUser(
      username,
      password,
      setIsLoading,
      (successData) => {
        // On success, navigate to dashboard
        navigate("/dashboard");
      },
      (errorData) => {
        // On error, display error message
        setError(errorData.message);
      }
    );
  };

  const handlePasswordPaste = (e) => {
    const pastedText = e.clipboardData.getData("text");
    setPassword(pastedText);
    e.preventDefault();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="Logo.JPG" alt="Logo" className="logo" />
        </div>

        <h2 className="login-title">Se connecter</h2>

        <div className="separator"></div>

        <p className="login-description">
          Une vision ambitieuse pour le développement aéroportuaire à Madagascar
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Matricule</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
              disabled={isLoading.login}
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label className="form-label">Mot de passe</label>
              
            </div>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPaste={handlePasswordPaste}
                required
                className="form-input password-input"
                disabled={isLoading.login}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}

          <button type="submit" className="login-button" disabled={isLoading.login}>
            {isLoading.login ? "Connexion..." : "Se connecter"}
          </button>

         
        </form>
      </div>
    </div>
  );
}

export default LoginPage;