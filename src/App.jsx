import { useState } from "react";
import { DISTORTIONS } from "./distortions";
import "./App.css";

const newEntry = () => ({
  id: Date.now() + Math.random(),
  automaticThought: "",
  distortions: [],
  rationalResponse: "",
});

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
            placeholder={`Write your automatic thought here…\ne.g., "I'll never get this project right and everyone will know."`}
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
            placeholder={`Write a rational response here…\ne.g., "I have completed similar projects. I may need tweaks, but I am fully capable."`}
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

export default function App() {
  const [entries, setEntries] = useState([newEntry()]);

  const addEntry = () => setEntries((prev) => [...prev, newEntry()]);
  const updateEntry = (id, updated) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  const deleteEntry = (id) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="app">
      <header className="app-header">
        <h1>Triple Column Technique</h1>
        <p className="subtitle">
          A cognitive behavioral therapy exercise for identifying and reframing negative automatic thoughts.
        </p>
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
          {entries.map((entry, i) => (
            <EntryRow
              key={entry.id}
              index={i}
              entry={entry}
              onChange={(updated) => updateEntry(entry.id, updated)}
              onDelete={() => deleteEntry(entry.id)}
              isOnly={entries.length === 1}
            />
          ))}
        </div>
      </div>

      <div className="add-row">
        <button type="button" className="add-btn" onClick={addEntry}>
          + Add Entry
        </button>
      </div>

      <footer className="app-footer">
        <p>
          Based on the Triple Column Technique by Dr. David D. Burns,{" "}
          <em>Feeling Good: The New Mood Therapy</em>.
        </p>
      </footer>
    </div>
  );
}
