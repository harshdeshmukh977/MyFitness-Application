import { useNavigate } from "react-router-dom";

function WhatNext() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f3f8f5 0%, #eef5f1 50%, #fff5ed 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#18251f",
        paddingBottom: "40px",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "90%",
          maxWidth: "1050px",
          margin: "auto",
          padding: "28px 0 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => navigate("/profile-summary")}
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "14px",
            border: "1px solid #dce5df",
            background: "#fff",
            fontSize: "23px",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
              fontWeight: "800",
            }}
          >
            MYFITNESS
          </div>

          <div style={{ fontSize: "15px", fontWeight: "700" }}>
            What's Next?
          </div>
        </div>

        <div style={{ fontSize: "13px" }}>
          <small>STEP </small>
          <strong style={{ fontSize: "20px" }}>06</strong>
          <span> / 09</span>
        </div>
      </header>

      {/* Progress */}
      <div
        style={{
          width: "90%",
          maxWidth: "1050px",
          margin: "auto",
        }}
      >
        <div
          style={{
            height: "5px",
            background: "#dfe7e2",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              width: "67%",
              height: "100%",
              borderRadius: "20px",
              background: "linear-gradient(90deg,#55b88f,#ef945c)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "8px",
            fontSize: "10px",
            color: "#829088",
          }}
        >
          <span>Body</span>
          <strong>Profile</strong>
          <span>Goal</span>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          maxWidth: "650px",
          margin: "55px auto 30px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            color: "#4ca47e",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "3px",
            marginBottom: "12px",
          }}
        >
          YOUR JOURNEY STARTS HERE
        </div>

        <h1
          style={{
            fontSize: "clamp(45px, 8vw, 75px)",
            lineHeight: "0.95",
            letterSpacing: "-4px",
            margin: 0,
          }}
        >
          You're all
          <br />
          <span style={{ color: "#55a887" }}>set.</span>
        </h1>

        <p
          style={{
            color: "#718078",
            lineHeight: "1.7",
            fontSize: "15px",
            marginTop: "20px",
          }}
        >
          Your profile is ready. Now let's personalize your
          fitness journey and create goals that work for you.
        </p>
      </section>

      {/* Main Card */}
      <main
        style={{
          width: "90%",
          maxWidth: "680px",
          margin: "auto",
          background: "rgba(255,255,255,0.94)",
          borderRadius: "30px",
          overflow: "hidden",
          boxShadow: "0 25px 70px rgba(30,55,42,0.14)",
        }}
      >
        {/* Visual */}
        <div
          style={{
            height: "175px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            background:
              "linear-gradient(135deg,#e5f5ed,#fff0e4)",
          }}
        >
          <div
            style={{
              width: "145px",
              height: "145px",
              borderRadius: "50%",
              border: "1px solid rgba(70,160,125,.25)",
              position: "absolute",
            }}
          />

          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "25px",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "#55a887",
              boxShadow: "0 15px 35px rgba(40,80,60,.12)",
            }}
          >
            ✦
          </div>

          <div
            style={{
              position: "absolute",
              marginLeft: "85px",
              marginTop: "65px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "#ef9258",
              color: "#fff",
              border: "4px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            ✓
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          <div
            style={{
              color: "#55a887",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: "800",
            }}
          >
            NEXT STEP
          </div>

          <h2
            style={{
              fontSize: "32px",
              lineHeight: "1.1",
              margin: "10px 0",
            }}
          >
            Let's personalize
            <br />
            your fitness plan.
          </h2>

          <p
            style={{
              color: "#718078",
              lineHeight: "1.6",
              fontSize: "14px",
            }}
          >
            Your basic profile is complete. Next, tell us
            what you want to achieve so we can build the
            right fitness experience for you.
          </p>

          {/* Options */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "25px",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "#f6faf8",
                border: "1px solid #e7efea",
                display: "flex",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "25px" }}>🎯</div>
              <div>
                <strong>Set Your Goal</strong>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7d8982",
                    marginTop: "4px",
                  }}
                >
                  Choose what you want to achieve
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "#fff8f2",
                border: "1px solid #f4e8dc",
                display: "flex",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "25px" }}>💪</div>
              <div>
                <strong>Build Your Plan</strong>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7d8982",
                    marginTop: "4px",
                  }}
                >
                  Get workouts made for your goal
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                borderRadius: "16px",
                background: "#f6faf8",
                border: "1px solid #e7efea",
                display: "flex",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "25px" }}>📈</div>
              <div>
                <strong>Track Progress</strong>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7d8982",
                    marginTop: "4px",
                  }}
                >
                  Monitor your fitness journey
                </div>
              </div>
            </div>
          </div>

          {/* IMPORTANT: Fitness Goal */}
          <button
            onClick={() => navigate("/fitness-goal")}
            style={{
              width: "100%",
              marginTop: "25px",
              padding: "17px",
              border: "none",
              borderRadius: "16px",
              background: "#18251f",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Continue to Fitness Goal</span>
            <span style={{ fontSize: "23px" }}>→</span>
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#9aa49f",
              fontSize: "11px",
              marginTop: "17px",
            }}
          >
            Your journey. Your pace. Your progress.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          width: "90%",
          maxWidth: "1050px",
          margin: "30px auto 0",
          display: "flex",
          justifyContent: "space-between",
          color: "#87918b",
          fontSize: "9px",
          letterSpacing: "1.5px",
        }}
      >
        <span>MYFITNESS</span>
        <span>TRAIN SMARTER · MOVE STRONGER</span>
        <strong>06 / 09</strong>
      </footer>
    </div>
  );
}

export default WhatNext;