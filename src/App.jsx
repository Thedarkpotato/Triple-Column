import { useState, useEffect } from "react";
import { DISTORTIONS } from "./distortions";
import "./App.css";

const STORAGE_KEY = "triple-column-journal";

function loadJournal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJournal(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

const newEntry = () => ({
  id: Date.now() + Math.random(),
  automaticThought: "",
  distortions: [],
  rationalResponse: "",
});

const newSession = () => ({
  id: Date.now(),
  createdAt: new Date().toISOString(),
  title: "",
  entries: [newEntry()],
});

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function DistortionDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);

  const toggle = (name) => {
    if (selected.includes(name)) {
      onChange(selected.filter((d) => d !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="dropdown-wrapper">
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="trigger-text">
          {selected.length === 0
            ? "Select distortions…"
            : selected.length === 1
            ? selected[0]
            : `${selected.length} distortions selected`}
        </span>
        <span className="chevron" aria-hidden="true">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div className="dropdown-backdrop" onClick={() => setOpen(false)} />
          <div className="dropdown-menu" role="listbox" aria-multiselectable="true">
            {DISTORTIONS.map((d) => {
              const checked = selected.includes(d.name);
              return (
                <label key={d.name} className={`dropdown-item${checked ? " checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(d.name)}
                  />
                  <span className="item-content">
                    <span className="item-name">{d.name}</span>
                    <span className="item-desc">{d.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </>
      )}

      {selected.length > 0 && (
        <div className="tag-list">
          {selected.map((name) => (
            <span key={name} className="tag">
              {name}
              <button
                type="button"
                className="tag-remove"
                onClick={() => onChange(selected.filter((d) => d !== name))}
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EntryRow({ entry, onChange, onDelete, index, isOnly }) {
  const update = (field, value) => onChange({ ...entry, [field]: value });

  return (
    <div className="entry-row">
      <span className="entry-number" aria-label={`Entry ${index + 1}`}>{index + 1}</span>

      <div className="columns">
        <div className="column col-automatic">
          <textarea
            className="col-textarea"
            placeholder={'Write your automatic thought here…\ne.g., "I\'ll never get this project right and everyone will know."'}
            value={entry.automaticThought}
            onChange={(e) => update("automaticThought", e.target.value)}
          />
        </div>

        <div className="column col-distortions">
          <DistortionDropdown
            selected={entry.distortions}
            onChange={(val) => update("distortions", val)}
          />
        </div>

        <div className="column col-rational">
          <textarea
            className="col-textarea"
            placeholder={'Write a rational response here…\ne.g., "I have completed similar projects. I may need tweaks, but I am fully capable."'}
            value={entry.rationalResponse}
            onChange={(e) => update("rationalResponse", e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        className="delete-btn"
        onClick={onDelete}
        disabled={isOnly}
        aria-label="Delete entry"
        title={isOnly ? "Cannot delete the only entry" : "Delete entry"}
      >
        ✕
      </button>
    </div>
  );
}

function Sidebar({ sessions, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Journal</span>
        <button className="new-session-btn" onClick={onNew} title="New session">
          + New
        </button>
      </div>

      <div className="session-list">
        {sessions.length === 0 && (
          <p className="sidebar-empty">No sessions yet.</p>
        )}
        {[...sessions].reverse().map((s) => {
          const firstThought = s.entries.find((e) => e.automaticThought.trim());
          const preview = firstThought
            ? firstThought.automaticThought.slice(0, 60) + (firstThought.automaticThought.length > 60 ? "…" : "")
            : "Empty session";
          return (
            <div
              key={s.id}
              className={`session-item${s.id === activeId ? " active" : ""}`}
              onClick={() => onSelect(s.id)}
            >
              <div className="session-item-top">
                <span className="session-date">{formatDate(s.createdAt)}</span>
                <button
                  className="session-delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  aria-label="Delete session"
                  title="Delete session"
                >
                  ✕
                </button>
              </div>
              <span className="session-time">{formatTime(s.createdAt)}</span>
              {s.title && <span className="session-custom-title">{s.title}</span>}
              <span className="session-preview">{preview}</span>
              <span className="session-count">
                {s.entries.length} {s.entries.length === 1 ? "thought" : "thoughts"}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = loadJournal();
    if (saved.length > 0) return saved;
    const first = newSession();
    return [first];
  });
  const [activeId, setActiveId] = useState(() => {
    const saved = loadJournal();
    return saved.length > 0 ? saved[saved.length - 1].id : sessions[0]?.id;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[sessions.length - 1];

  useEffect(() => {
    saveJournal(sessions);
  }, [sessions]);

  const updateSession = (updated) =>
    setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

  const addSession = () => {
    const s = newSession();
    setSessions((prev) => [...prev, s]);
    setActiveId(s.id);
  };

  const deleteSession = (id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) {
        const s = newSession();
        setActiveId(s.id);
        return [s];
      }
      if (id === activeId) setActiveId(next[next.length - 1].id);
      return next;
    });
  };

  const addEntry = () =>
    updateSession({ ...active, entries: [...active.entries, newEntry()] });

  const updateEntry = (entryId, updated) =>
    updateSession({
      ...active,
      entries: active.entries.map((e) => (e.id === entryId ? updated : e)),
    });

  const deleteEntry = (entryId) =>
    updateSession({
      ...active,
      entries: active.entries.filter((e) => e.id !== entryId),
    });

  if (!active) return null;

  return (
    <div className={`app-shell${sidebarOpen ? " sidebar-open" : ""}`}>
      {sidebarOpen && (
        <>
          <div className="sidebar-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
          <Sidebar
            sessions={sessions}
            activeId={active.id}
            onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
            onNew={() => { addSession(); setSidebarOpen(false); }}
            onDelete={deleteSession}
          />
        </>
      )}

      <div className="main">
        <header className="app-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle journal sidebar"
            title="Toggle journal"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div className="header-center">
            <h1>Triple Column Technique</h1>
            <p className="subtitle">
              A cognitive behavioral therapy exercise for identifying and reframing negative automatic thoughts.
            </p>
          </div>

          <div className="header-meta">
            <span className="active-date">{formatDate(active.createdAt)}</span>
            <input
              className="session-title-input"
              placeholder="Add a title (optional)…"
              value={active.title}
              onChange={(e) => updateSession({ ...active, title: e.target.value })}
            />
            <span className="autosave-badge">Autosaved</span>
          </div>
        </header>

        <div className="table-wrapper">
          <div className="col-headers">
            <div className="col-num-spacer" aria-hidden="true" />
            <div className="col-header col-automatic">
              <span className="col-label">Column 1</span>
              <h2>Automatic Thoughts</h2>
              <p>Write down the exact negative thought that triggered your emotion.</p>
            </div>
            <div className="col-header col-distortions">
              <span className="col-label">Column 2</span>
              <h2>Cognitive Distortions</h2>
              <p>Identify the thinking error(s) present in the thought.</p>
            </div>
            <div className="col-header col-rational">
              <span className="col-label">Column 3</span>
              <h2>Rational Response</h2>
              <p>Write an objective, fact-based reply to challenge the thought.</p>
            </div>
            <div className="col-del-spacer" aria-hidden="true" />
          </div>

          <div className="entries">
            {active.entries.map((entry, i) => (
              <EntryRow
                key={entry.id}
                index={i}
                entry={entry}
                onChange={(updated) => updateEntry(entry.id, updated)}
                onDelete={() => deleteEntry(entry.id)}
                isOnly={active.entries.length === 1}
              />
            ))}
          </div>
        </div>

        <div className="add-row">
          <button type="button" className="add-btn" onClick={addEntry}>
            + Add Thought
          </button>
        </div>

        <footer className="app-footer">
          <p>
            Based on the Triple Column Technique by Dr. David D. Burns,{" "}
            <em>Feeling Good: The New Mood Therapy</em>.
          </p>
        </footer>
      </div>
    </div>
  );
}
