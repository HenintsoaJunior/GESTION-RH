"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "@/api/auth/services";
import type { AuthError, SuccessResponse } from "@/api/auth/services";
import {
  LoginContainer,
  LoginCard,
  LogoContainer,
  Logo,
  LoginTitle,
  Separator,
  LoginDescription,
  LoginForm,
  FormGroup,
  FormLabel,
  FormInput,
  PasswordHeader,
  PasswordInputContainer,
  PasswordInput,
  PasswordToggle,
  ErrorMessage,
  LoginButton,
} from "@/styles/login-styles";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { login, isLoading } = useLoginUser(
    (_successData: SuccessResponse) => {
      navigate("/dashboard");
    },
    (errorData: AuthError) => {
      setError(errorData.message);
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    login({ username, password });
  };

  const handlePasswordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    setPassword(pastedText);
    e.preventDefault();
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <Logo src="Logo.JPG" alt="Logo" />
        </LogoContainer>

        <LoginTitle>Se connecter</LoginTitle>

        <Separator />

        <LoginDescription>
          Une vision ambitieuse pour le développement aéroportuaire à Madagascar
        </LoginDescription>

        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Matricule</FormLabel>
            <FormInput
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              required
              disabled={isLoading}
            />
          </FormGroup>

          <FormGroup>
            <PasswordHeader>
              <FormLabel>Mot de passe</FormLabel>
            </PasswordHeader>
            <PasswordInputContainer>
              <PasswordInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                onPaste={handlePasswordPaste}
                required
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                }
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </PasswordToggle>
            </PasswordInputContainer>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </LoginButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;