"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user-context";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signup } = useUser();
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await signup({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });
      
      if (success) {
        router.push("/academy");
      } else {
        setError("An account with this email already exists.");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-left"></div>
      <div className="login-background-right"></div>
      
      <div className="signup-container">
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

        <h2 className="signup-title">Create Your Account</h2>
        <p className="signup-subtitle">Join The Piped Peony Academy and start your buttercream artistry journey!</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="name" className="login-label">
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Password *
            </label>
            <div className="login-password-wrapper">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
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
            <small className="signup-password-hint">
              Must be at least 6 characters long
            </small>
          </div>

          <div className="login-form-group">
            <label htmlFor="confirmPassword" className="login-label">
              Confirm Password *
            </label>
            <div className="login-password-wrapper">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="login-input login-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="login-password-toggle"
              >
                {showConfirmPassword ? (
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

          <div className="signup-terms-wrapper">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="login-remember-input"
              />
              I agree to the <Link href="#" className="signup-link">Terms of Service</Link> and <Link href="#" className="signup-link">Privacy Policy</Link>
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
              {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </Button>
          </div>
        </form>

        <div className="signup-login-link">
          <p>Already have an account? <Link href="/login" className="signup-link">Sign in here</Link></p>
        </div>

        <div className="login-footer">
          <Link href="/" className="login-back-home">
            ← Go to The Piped Peony
          </Link>
        </div>
      </div>
    </div>
  );
}
