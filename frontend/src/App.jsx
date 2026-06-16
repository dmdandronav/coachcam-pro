import React, { useRef, useState } from "react";
import PoseTracker, { EXERCISES } from "./PoseTracker.jsx";

const APP_NAME = "CoachCam Pro";
const TAGLINE = "Your training plan, watching your every rep.";

export default function App() {
  const [exercise, setExercise] = useState("squat");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [sources, setSources] = useState([]);
  const trackerRef = useRef(null);

  async function getFeedback() {
    if (!trackerRef.current) return;
    const summary = trackerRef.current.getSummary();
    if (!summary) {
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "Not enough movement data yet — make sure your full body is visible and move around a bit first.",
        },
      ]);
      return;
    }
    setLoading(true);

    const message = `My ${summary.exercise} angles over the last few seconds: min ${summary.min.toFixed(1)}°, max ${summary.max.toFixed(1)}°, avg ${summary.avg.toFixed(1)}°. How does this compare to my training plan?`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatHistory, { role: "user", content: message }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatHistory(prev => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.reply },
      ]);
      setSources(data.sources || []);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "Couldn't reach the backend. Make sure the Flask server is running on port 5000 and your API key is set.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 gap-6">
      <header className="text-center max-w-xl">
        <h1 className="text-3xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {APP_NAME}
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(15% 0.02 160 / 0.6)" }}>
          {TAGLINE}
        </p>
      </header>

      <div className="flex gap-2 flex-wrap justify-center">
        {Object.entries(EXERCISES).map(([key, ex]) => (
          <button
            key={key}
            onClick={() => setExercise(key)}
            style={
              exercise === key
                ? {
                    backgroundColor: "var(--color-accent)",
                    borderColor: "var(--color-accent)",
                    color: "white",
                  }
                : {
                    borderColor: "var(--color-line)",
                    color: "oklch(15% 0.02 160 / 0.7)",
                    backgroundColor: "transparent",
                  }
            }
            className="text-xs px-3 py-1.5 rounded-full border transition"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <PoseTracker ref={trackerRef} exercise={exercise} />

      <button
        onClick={getFeedback}
        disabled={loading}
        className="rounded-xl font-medium px-6 py-2 text-sm disabled:opacity-50 transition"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "oklch(15% 0.02 160)",
        }}
      >
        {loading ? "Analyzing…" : "Get Coaching"}
      </button>

      {chatHistory.length > 0 && (
        <div
          className="max-w-xl w-full rounded-2xl border px-5 py-4 flex flex-col gap-4"
          style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-muted)" }}
        >
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "oklch(15% 0.02 160 / 0.45)" }}
              >
                {msg.role === "user" ? "You" : "Coach"}
              </span>
              <div
                className="text-sm leading-relaxed rounded-xl px-4 py-3 max-w-prose"
                style={
                  msg.role === "user"
                    ? {
                        backgroundColor: "var(--color-accent)",
                        color: "oklch(15% 0.02 160)",
                      }
                    : {
                        backgroundColor: "white",
                        color: "var(--color-ink)",
                        border: "1px solid var(--color-line)",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {sources.length > 0 && (
        <div
          className="max-w-xl w-full rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--color-line)", backgroundColor: "var(--color-surface)" }}
        >
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2"
            style={{ color: "oklch(15% 0.02 160 / 0.45)" }}
          >
            Sources from your training plan
          </p>
          <ul className="flex flex-col gap-1">
            {sources.map((src, i) => (
              <li
                key={i}
                className="text-xs rounded px-2 py-1"
                style={{
                  backgroundColor: "var(--color-muted)",
                  color: "var(--color-accent)",
                  fontFamily: "monospace",
                }}
              >
                {src}
              </li>
            ))}
          </ul>
        </div>
      )}

      {chatHistory.length === 0 && (
        <div
          className="max-w-xl w-full rounded-2xl border px-5 py-4 text-sm leading-relaxed"
          style={{
            borderColor: "var(--color-line)",
            backgroundColor: "var(--color-muted)",
            color: "oklch(15% 0.02 160 / 0.6)",
          }}
        >
          Move for a few seconds, then hit "Get Coaching" to see how your form compares to your training plan targets.
        </div>
      )}
    </div>
  );
}
