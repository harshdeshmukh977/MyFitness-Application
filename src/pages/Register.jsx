import { useState } from "react";
import "./Register.css";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.5-7 8-7s8 2.8 8 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M10 5h4" />
      <circle cx="12" cy="18.5" r=".7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ show }) {
  return show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.8 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7s-3.5 7-10 7c-1.7 0-3.2-.4-4.5-1" />
      <path d="M6.5 6.5C3.5 8.7 2 12 2 12s1.3 2.7 4 4.8" />
    </svg>
  );
}

function MyFitnessLogo() {
  return (
    <div className="register-logo">
      <div className="register-logo-symbol">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="register-logo-text">
        MYFITNESS
      </div>
    </div>
  );
}

export default function Register() {

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(false);

  const [message, setMessage] = useState("");

  function handleRegister(event) {

    event.preventDefault();

    setMessage("");

    if (!fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (fullName.trim().length < 3) {
      setMessage("Name must contain at least 3 characters.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!phone.trim()) {
      setMessage("Please enter your phone number.");
      return;
    }

    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phone.replace(/\s/g, ""))) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!password) {
      setMessage("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setMessage("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setMessage("Please accept the Terms & Conditions.");
      return;
    }

    setMessage(
      "Account details look good. Backend registration will be connected later."
    );
  }

  return (
    <div className="register-page">

      {/* BACKGROUND */}

      <div className="register-background">

        <img
          src="/login-man.jpg"
          alt="Athlete training"
          className="register-hero-image"
        />

        <div className="register-dark-overlay"></div>
        <div className="register-left-overlay"></div>
        <div className="register-right-overlay"></div>
        <div className="register-bottom-overlay"></div>

      </div>


      {/* HEADER */}

      <header className="register-header">

        <MyFitnessLogo />

        <div className="register-header-text">
          Already have an account?
          <button
            type="button"
            onClick={() => window.history.back()}
          >
            Log In
          </button>
        </div>

      </header>


      {/* LEFT CONTENT */}

      <section className="register-left">

        <div className="register-eyebrow">
          <span></span>
          START YOUR JOURNEY
        </div>

        <h1>
          BUILD
          <span>YOUR</span>
          <strong>BEST SELF.</strong>
        </h1>

        <div className="register-line">
          <span></span>
          <b></b>
        </div>

        <p>
          Create your MyFitness account and
          <br />
          let your fitness journey begin.
        </p>

        <div className="register-feature">

          <div className="feature-icon">
            ✦
          </div>

          <div>
            <strong>PERSONALIZED FITNESS</strong>
            <span>Built around your goals</span>
          </div>

        </div>

      </section>


      {/* REGISTER CARD */}

      <main className="register-card">

        <div className="register-card-glow"></div>

        <div className="register-content">

          <div className="register-welcome">
            Let's Get Started 🚀
          </div>

          <h2>
            Create your
            <span>MyFitness</span>
            account
          </h2>

          <p className="register-subtitle">
            Start your personalized fitness journey
          </p>


          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* NAME */}

            <div className="register-input">

              <div className="register-input-icon">
                <UserIcon />
              </div>

              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />

            </div>


            {/* EMAIL */}

            <div className="register-input">

              <div className="register-input-icon">
                <MailIcon />
              </div>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            {/* PHONE */}

            <div className="register-input">

              <div className="register-input-icon">
                <PhoneIcon />
              </div>

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                maxLength="10"
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />

            </div>


            {/* PASSWORD */}

            <div className="register-input">

              <div className="register-input-icon">
                <LockIcon />
              </div>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Create Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="register-eye"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                <EyeIcon show={showPassword} />
              </button>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="register-input">

              <div className="register-input-icon">
                <LockIcon />
              </div>

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="register-eye"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                <EyeIcon
                  show={showConfirmPassword}
                />
              </button>

            </div>


            {/* TERMS */}

            <label className="terms-row">

              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) =>
                  setAgreeTerms(e.target.checked)
                }
              />

              <span className="custom-checkbox"></span>

              <p>
                I agree to the{" "}
                <button type="button">
                  Terms & Conditions
                </button>{" "}
                and{" "}
                <button type="button">
                  Privacy Policy
                </button>
              </p>

            </label>


            {/* MESSAGE */}

            {message && (
              <div className="register-message">
                {message}
              </div>
            )}


            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="create-account-button"
            >

              <span>
                Create Account
              </span>

              <span className="create-arrow">
                →
              </span>

            </button>

          </form>


          {/* DIVIDER */}

          <div className="register-divider">

            <span></span>

            <p>OR</p>

            <span></span>

          </div>


          {/* LOGIN LINK */}

          <div className="login-existing">

            Already have an account?

            <button
              type="button"
              onClick={() => window.history.back()}
            >
              Log In
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}