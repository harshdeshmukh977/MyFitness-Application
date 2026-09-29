const API = "http://localhost:8080/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const getAchievements = () => request("/achievements");
export const getWeeklyProgress = () => request("/progress/weekly");
export const completeWorkout = (payload) => request("/workouts", {
  method: "POST",
  body: JSON.stringify(payload),
});
