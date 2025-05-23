import React, { useState } from 'react';
import './Login.css'; // si tu veux ajouter du style

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Exemple simple de validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    // Appel API ou logique de connexion
    console.log('Connexion avec :', { email, password });
    setError('');
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <p className="error">{error}</p>}

        <div className="form-group">
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
          />
        </div>

        <div className="form-group">
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
          />
        </div>

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}

export default Login;
