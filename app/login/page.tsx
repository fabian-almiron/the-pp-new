"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user-context";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email);
      if (success) {
        router.push("/academy");
      } else {
        setError("Invalid email or password. Try 'dara@pipedpeony.com' for demo.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-left"></div>
      <div className="login-background-right"></div>
      
      <div className="login-container">
        <div className="login-logo">
          <Image
            src="/piped-peony-logo-2048x452.png"
            alt="The Piped Peony"
            width={400}
            height={88}
            className="login-logo-img"
            priority
          />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Username or Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <div className="login-password-wrapper">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input login-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-blue-500" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-500" />
                )}
              </button>
            </div>
          </div>

          {/* reCAPTCHA placeholder */}
          <div className="login-recaptcha">
            <div className="recaptcha-checkbox">
              <input type="checkbox" id="recaptcha" className="recaptcha-input" />
              <label htmlFor="recaptcha" className="recaptcha-label">
                I'm not a robot
              </label>
            </div>
            <div className="recaptcha-logo">
              <div className="recaptcha-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#4285F4"/>
                </svg>
              </div>
              <span className="recaptcha-text">reCAPTCHA</span>
              <div className="recaptcha-privacy">
                <span>Privacy - Terms</span>
              </div>
            </div>
          </div>

          <div className="login-remember-wrapper">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-remember-input"
              />
              Remember Me
            </label>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-submit-wrapper">
            <Button
              type="submit"
              variant="clean"
              className="login-submit-button"
              disabled={isLoading}
            >
              {isLoading ? "LOGGING IN..." : "LOG IN"}
            </Button>
          </div>
        </form>

        <div className="login-footer">
          <Link href="#" className="login-forgot-password">
            Lost your password?
          </Link>
          <Link href="/" className="login-back-home">
            ← Go to The Piped Peony
          </Link>
        </div>
      </div>
    </div>
  );
}
