import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


/* =========================================================
   ICONS
========================================================= */

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.2 3.5-7 8-7s8 2.8 8 7" />
    </svg>
  );
}


function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}


function EyeIcon({ show }) {
  if (show) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.8 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7s-3.5 7-10 7c-1.7 0-3.2-.4-4.5-1" />
      <path d="M6.5 6.5C3.5 8.7 2 12 2 12s1.3 2.7 4 4.8" />
    </svg>
  );
}


function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.2 2.4 3.5 5.5 3.5 9S14.2 18.6 12 21" />
      <path d="M12 3c-2.2 2.4-3.5 5.5-3.5 9S9.8 18.6 12 21" />
    </svg>
  );
}


function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}


function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M10 5h4" />
      <circle cx="12" cy="18.5" r=".7" />
    </svg>
  );
}


function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l8 3v5c0 5.1-3.3 8.6-8 10-4.7-1.4-8-4.9-8-10V6l8-3z" />
      <path d="M8.5 12l2.2 2.2 4.8-5" />
    </svg>
  );
}


/* =========================================================
   GOOGLE LOGO
========================================================= */

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.4 5.5-5 7.2v6h8.1c4.7-4.3 7.2-10.6 7.2-17.5z"
      />

      <path
        fill="#34A853"
        d="M24 48c6.7 0 12.3-2.2 16.3-6l-8.1-6c-2.2 1.5-5 2.4-8.2 2.4-6.3 0-11.6-4.2-13.5-9.9H2.1v6.2C6.2 42.5 14.4 48 24 48z"
      />

      <path
        fill="#FBBC05"
        d="M10.5 28.5c-.5-1.5-.8-3-.8-4.5s.3-3.1.8-4.5v-6.2H2.1C.8 15.8 0 19.8 0 24s.8 8.2 2.1 10.7l8.4-6.2z"
      />

      <path
        fill="#EA4335"
        d="M24 9.6c3.6 0 6.8 1.2 9.3 3.6l7-7C36.3 2.2 30.7 0 24 0 14.4 0 6.2 5.5 2.1 13.3l8.4 6.2C12.4 13.8 17.7 9.6 24 9.6z"
      />
    </svg>
  );
}


/* =========================================================
   APPLE LOGO
========================================================= */

function AppleLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.05 12.54c-.02-2.07 1.69-3.07 1.77-3.12a3.8 3.8 0 0 0-2.99-1.62c-1.27-.13-2.5.76-3.15.76-.66 0-1.67-.74-2.75-.72a4.05 4.05 0 0 0-3.4 2.08c-1.46 2.53-.37 6.27 1.03 8.33.68 1 1.5 2.12 2.57 2.08 1.03-.04 1.42-.67 2.67-.67 1.24 0 1.59.67 2.68.65 1.11-.02 1.81-1.01 2.48-2.01.78-1.15 1.1-2.26 1.12-2.32-.02-.01-2.01-.77-2.03-3.44z" />
      <path d="M14.96 6.44c.56-.68.94-1.62.84-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.98 1.56-.86 2.48.9.07 1.82-.46 2.39-1.13z" />
    </svg>
  );
}


/* =========================================================
   MYFITNESS LOGO
========================================================= */

function MyFitnessLogo() {
  return (
    <div className="mf-logo">

      <img
        src="/myfitness-m-logo.png"
        alt="MyFitness"
        className="mf-logo-symbol"
      />

      <div className="mf-logo-text">
        MYFITNESS
      </div>

    </div>
  );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function Login() {

    const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [language, setLanguage] = useState("English");

  const [languageOpen, setLanguageOpen] = useState(false);

  const [message, setMessage] = useState("");

 


  function handleLogin(event) {

  event.preventDefault();

  // Remove previous message
  setMessage("");

  // Check email / phone
  if (!email.trim()) {

    setMessage(
      "Please enter your email or phone number."
    );

    return;
  }

  // Check password
  if (!password.trim()) {

    setMessage(
      "Please enter your password."
    );

    return;
  }

  // Basic email validation
  const looksLikeEmail =
    email.includes("@");

  if (looksLikeEmail) {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

      setMessage(
        "Please enter a valid email address."
      );

      return;
    }
  }

  // Basic password length check
  if (password.length < 6) {

    setMessage(
      "Password must be at least 6 characters."
    );

    return;
  }

  // Frontend-only success message
  setMessage(
    "Login details look good. Authentication will be connected with Spring Boot later."
  );

}


  function handleSocialLogin(type) {

    setMessage(
      `${type} authentication will be connected later.`
    );
  }


  return (

    <div className="login-page">


      {/* =====================================================
          BACKGROUND IMAGE
      ===================================================== */}

      <div className="login-background">

        <img
          src="/login-man.jpg"
          alt="Athlete training in gym"
          className="login-hero-image"
        />

        <div className="image-dark-overlay"></div>

        <div className="image-left-overlay"></div>

        <div className="image-right-overlay"></div>

        <div className="image-bottom-overlay"></div>

      </div>


      {/* =====================================================
          AMBIENT GLOW
      ===================================================== */}

      <div className="mint-glow"></div>

      <div className="orange-glow"></div>


      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="login-header">

        <MyFitnessLogo />


        <div className="language-container">

          <button
            className="language-button"
            type="button"
            onClick={() =>
              setLanguageOpen(!languageOpen)
            }
          >

            <GlobeIcon />

            <span>
              {language}
            </span>

            <span className="language-arrow">
              {languageOpen ? "⌃" : "⌄"}
            </span>

          </button>


          {languageOpen && (

            <div className="language-dropdown">

              <button
                type="button"
                onClick={() => {
                  setLanguage("English");
                  setLanguageOpen(false);
                }}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage("Hindi");
                  setLanguageOpen(false);
                }}
              >
                हिन्दी
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage("Marathi");
                  setLanguageOpen(false);
                }}
              >
                मराठी
              </button>

            </div>

          )}

        </div>

      </header>


      {/* =====================================================
          LEFT SIDE CONTENT
      ===================================================== */}

      <section className="left-panel">


        <div className="left-eyebrow">

          <span></span>

          AI POWERED FITNESS

        </div>


        <h1>

          <span>YOUR</span>

          <span className="mint-text">
            JOURNEY
          </span>

          <span>STARTS</span>

          <span>HERE</span>

        </h1>


        <div className="left-line">

          <span></span>

          <b></b>

        </div>


        <p>

          Track workouts, stay
          <br />

          consistent and become
          <br />

          your <strong>best self.</strong>

        </p>


        {/* AI BADGE */}

        <div className="ai-powered-card">

          <div className="ai-icon">

  <svg
    className="ai-neural-logo"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="AI powered"
  >

    {/* Brain outline */}

    <path
      d="M25 14.5
         C19.5 10.5 12 14.5 12 21
         C8 24 8.5 30 12 33
         C9.5 38.5 13.5 44
         19 44
         C20 50 26 53
         31 49"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M39 14.5
         C44.5 10.5 52 14.5 52 21
         C56 24 55.5 30 52 33
         C54.5 38.5 50.5 44 45 44
         C44 50 38 53 33 49"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Center AI circuit */}

    <path
      d="M32 13V51"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />

    <path
      d="M20 23H28"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path
      d="M36 23H44"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path
      d="M20 33H28"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path
      d="M36 33H44"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path
      d="M20 42H28"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    <path
      d="M36 42H44"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Circuit nodes */}

    <circle
      cx="20"
      cy="23"
      r="2.2"
      fill="currentColor"
    />

    <circle
      cx="44"
      cy="23"
      r="2.2"
      fill="currentColor"
    />

    <circle
      cx="20"
      cy="33"
      r="2.2"
      fill="currentColor"
    />

    <circle
      cx="44"
      cy="33"
      r="2.2"
      fill="currentColor"
    />

    <circle
      cx="20"
      cy="42"
      r="2.2"
      fill="currentColor"
    />

    <circle
      cx="44"
      cy="42"
      r="2.2"
      fill="currentColor"
    />

    {/* Center nodes */}

    <circle
      cx="32"
      cy="23"
      r="2.5"
      fill="currentColor"
    />

    <circle
      cx="32"
      cy="33"
      r="2.5"
      fill="currentColor"
    />

    <circle
      cx="32"
      cy="42"
      r="2.5"
      fill="currentColor"
    />

  </svg>

</div>

          <div>

            <strong>
              AI POWERED
            </strong>

            <span>
              Personalized for you
            </span>

          </div>

        </div>


      </section>


      {/* =====================================================
          MAIN LOGIN CARD
      ===================================================== */}

      <main className="login-card">


        <div className="card-glow"></div>


        <div className="card-content">


          {/* WELCOME */}

          <div className="welcome-text">

            Welcome Back! 👋

          </div>


          {/* HEADING */}

          <h2>

            Log in to

            <span>
              MyFitness
            </span>

          </h2>


          {/* SUBTITLE */}

          <p className="subtitle">

            Continue your fitness journey

          </p>


          {/* =================================================
              LOGIN / SIGNUP SWITCH
          ================================================= */}

          <div className="auth-switch">

            <button
              type="button"
              className={
                activeTab === "login"
                  ? "switch-button active"
                  : "switch-button"
              }
              onClick={() => {
                setActiveTab("login");
                setMessage("");
              }}
            >
              Login
            </button>


            <button
              type="button"
              className={
                activeTab === "signup"
                  ? "switch-button active"
                  : "switch-button"
              }
             onClick={() => navigate("/register")}
            >
              Sign Up
            </button>

          </div>


          {/* =================================================
              LOGIN CONTENT
          ================================================= */}

          {activeTab === "login" ? (

            <>

              <form
                className="login-form"
                onSubmit={handleLogin}
              >


                {/* EMAIL */}

                <div className="input-box">

                  <div className="input-icon">
                    <UserIcon />
                  </div>

                  <input
                    type="text"
                    placeholder="Email or Phone Number"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>


                {/* PASSWORD */}

                <div className="input-box">

                  <div className="input-icon">
                    <LockIcon />
                  </div>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >

                    <EyeIcon
                      show={showPassword}
                    />

                  </button>

                </div>


                {/* FORGOT PASSWORD */}

                <div className="forgot-row">

                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        "Password recovery will be connected later."
                      )
                    }
                  >
                    Forgot Password?
                  </button>

                </div>


                {/* LOGIN BUTTON */}

                <button
                  className="login-button"
                  type="submit"
                >

                  <span>
                    Log In
                  </span>

                  <div className="login-arrow">

                    <ArrowIcon />

                  </div>

                </button>


              </form>


              {/* MESSAGE */}

              {message && (

                <div className="login-message">

                  {message}

                </div>

              )}


              {/* =================================================
                  OR
              ================================================= */}

              <div
  
  className="or-section"
  id="social-login-section"
>

  <span></span>

  <p>OR</p>

  <span></span>

</div>


              {/* =================================================
                  CONTINUE WITH MOBILE
              ================================================= */}

              <button
                type="button"
                className="social-login"
                onClick={() =>
                  handleSocialLogin("Mobile")
                }
              >

                <div className="social-icon phone">
                  <PhoneIcon />
                </div>

                <span>
                  Continue with Mobile
                </span>

              </button>


              {/* =================================================
                  CONTINUE WITH GOOGLE
              ================================================= */}

              <button
                type="button"
                className="social-login"
                onClick={() =>
                  handleSocialLogin("Google")
                }
              >

                <div className="social-icon">

                  <GoogleLogo />

                </div>

                <span>
                  Continue with Google
                </span>

              </button>


              {/* =================================================
                  CONTINUE WITH APPLE
              ================================================= */}

              <button
                type="button"
                className="social-login"
                onClick={() =>
                  handleSocialLogin("Apple")
                }
              >

                <div className="social-icon apple">

                  <AppleLogo />

                </div>

                <span>
                  Continue with Apple
                </span>

              </button>


              {/* =================================================
                  SECURITY
              ================================================= */}

              <div className="secure-text">

                <ShieldIcon />

                <span>
                  Your data is{" "}
                  <strong>
                    100% secure
                  </strong>
                </span>

              </div>

            </>

          ) : (

            /* =================================================
               SIGN UP VIEW
            ================================================= */

            <div className="signup-view">

              <div className="signup-symbol">
                +
              </div>

              <h3>
                Create your account
              </h3>

              <p>
                Your registration page will be
                connected next.
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("login")
                }
              >
                Back to Login
              </button>

            </div>

          )}


        </div>

      </main>

{/* =====================================================
    MORE OPTIONS / SCROLL BUTTON
===================================================== */}




      {/* =====================================================
          BOTTOM STATISTICS
      ===================================================== */}

      <section className="stats-bar">


        <div className="stat">

          <div className="stat-circle mint">

            <span>
              ✚
            </span>

          </div>

          <div>

            <strong>
              1000+
            </strong>

            <p>
              Workouts
            </p>

          </div>

        </div>


        <div className="stat-divider"></div>


        <div className="stat">

          <div className="stat-circle orange">

            <span>
              ↗
            </span>

          </div>

          <div>

            <strong>
              AI Plan
            </strong>

            <p>
              Just for you
            </p>

          </div>

        </div>


        <div className="stat-divider"></div>


        <div className="stat">

          <div className="stat-circle mint">

            <span>
              ◯
            </span>

          </div>

          <div>

            <strong>
              2M+
            </strong>

            <p>
              Happy Users
            </p>

          </div>

        </div>


      </section>


    </div>
  );
}