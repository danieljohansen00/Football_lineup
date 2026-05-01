import React, { useState } from "react";

export default function App() {
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1" },
    { id: 2, name: "Player 2" }
  ]);

  const [editor, setEditor] = useState(null);

  const save = () => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === editor.id ? { ...p, name: editor.name } : p
      )
    );
    setEditor(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Editor</h2>

      {/* LIST */}
      {players.map(p => (
        <div key={p.id}>
          {p.name}
          <button
            onClick={() =>
              setEditor({ id: p.id, name: p.name })
            }
          >
            Edit
          </button>
        </div>
      ))}

      {/* MODAL */}
      {editor && (
        <div style={{
          marginTop: 20,
          padding: 10,
          border: "1px solid black"
        }}>
          <input
            value={editor.name}
            onChange={(e) =>
              setEditor(prev => ({
                ...prev,
                name: e.target.value
              }))
            }
          />

          <button onClick={save}>Save</button>
        </div>
      )}
    </div>
  );
}