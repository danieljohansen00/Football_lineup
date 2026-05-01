import React, { useState, useRef } from "react";

const formation433 = [
  [50, 90],
  [15, 75], [38, 78], [62, 78], [85, 75],
  [25, 58], [50, 55], [75, 58],
  [20, 30], [50, 25], [80, 30]
];

const createPlayer = (id) => ({
  id,
  name: `Player ${id}`,
  number: id,
  captain: false,
  x: formation433[id - 1][0],
  y: formation433[id - 1][1],
  video: null
});

export default function App() {
  const [players, setPlayers] = useState(
    Array.from({ length: 11 }, (_, i) => createPlayer(i + 1))
  );

  const [editor, setEditor] = useState(null);
  const [teamName, setTeamName] = useState("My Team");
  const [logo, setLogo] = useState(null);

  const [showIntro, setShowIntro] = useState(false);
  const [introIndex, setIntroIndex] = useState(-1);

  const [isRecording, setIsRecording] = useState(false);

  const fileInput = useRef();
  const logoInput = useRef();

  const updatePlayer = (id, updates) => {
    setPlayers(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const setCaptain = (id) => {
    setPlayers(prev =>
      prev.map(p => ({ ...p, captain: p.id === id }))
    );
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !editor) return;

    updatePlayer(editor.id, {
      video: URL.createObjectURL(file)
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(URL.createObjectURL(file));
  };

  // 🎬 INTRO
  const startIntro = () => {
    setShowIntro(true);
    setIntroIndex(0);

    let i = 0;

    const next = () => {
      const isCaptain = players[i]?.captain;
      const duration = isCaptain ? 2600 : 1800;

      setIntroIndex(i);
      i++;

      if (i < players.length) {
        setTimeout(next, duration);
      } else {
        setTimeout(() => {
          setShowIntro(false);
          setIntroIndex(-1);
        }, 1500);
      }
    };

    setTimeout(next, 1000);
  };

  // 🎥 EXPORT
  const exportVideo = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });

    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "cinematic-lineup.webm";
      a.click();

      stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    };

    setIsRecording(true);
    recorder.start();

    setTimeout(startIntro, 500);
    setTimeout(() => recorder.stop(), 30000);
  };

  return (
    <div style={{ background: "#14532d", minHeight: "100vh", padding: 16 }}>

      {/* CONTROLS (HIDDEN DURING RECORDING) */}
      {!isRecording && (
        <div style={{ marginBottom: 10 }}>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <button onClick={() => logoInput.current.click()}>Logo</button>
          <button onClick={exportVideo}>Export</button>

          <input ref={logoInput} type="file" hidden onChange={handleLogoUpload} />
        </div>
      )}

      {/* PITCH */}
      <div className="pitch" style={{
        position: "relative",
        width: "100%",
        maxWidth: 450,
        aspectRatio: "2/3",
        margin: "auto",
        background: "linear-gradient(#166534, #15803d)",
        borderRadius: 12,
        overflow: "hidden"
      }}>

        {/* ⚽ PITCH LINES */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 2,
          background: "white",
          opacity: 0.6
        }} />

        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 120,
          height: 120,
          border: "2px solid white",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.6
        }} />

        <div style={{
          position: "absolute",
          top: 0,
          left: "25%",
          width: "50%",
          height: 60,
          border: "2px solid white",
          borderTop: "none",
          opacity: 0.6
        }} />

        <div style={{
          position: "absolute",
          bottom: 0,
          left: "25%",
          width: "50%",
          height: 60,
          border: "2px solid white",
          borderBottom: "none",
          opacity: 0.6
        }} />

        {/* LOGO */}
        {logo && (
          <img src={logo} alt="" style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            opacity: 0.5
          }} />
        )}

        {/* TOP BAR */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: 6,
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>{teamName}</span>
          <span>4-3-3</span>
        </div>

        {/* 🎬 INTRO */}
        {showIntro && introIndex >= 0 && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            zIndex: 20
          }}>
            <h2>{teamName}</h2>

            <div style={{
              width: 180,
              height: 260,
              borderRadius: 14,
              overflow: "hidden",
              background: "#111"
            }}>
              {players[introIndex].video ? (
                <video src={players[introIndex].video} autoPlay muted loop style={{ width: "100%", height: "100%" }} />
              ) : "👤"}
            </div>

            <div style={{ marginTop: 10 }}>
              #{players[introIndex].number} {players[introIndex].name}
            </div>

            {players[introIndex].captain && (
              <div style={{ color: "gold", marginTop: 6 }}>
                CAPTAIN
              </div>
            )}
          </div>
        )}

        {/* PLAYERS */}
        {!showIntro && players.map(p => (
          <div
            key={p.id}
            onClick={() =>
              setEditor({ id: p.id, name: p.name, number: p.number })
            }
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <div style={{
              width: 100,
              height: 140,
              background: "black",
              borderRadius: 10,
              overflow: "hidden",
              position: "relative"
            }}>
              {p.video ? (
                <video src={p.video} autoPlay muted loop style={{ width: "100%", height: "100%" }} />
              ) : "👤"}

              {p.captain && (
                <div style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "gold",
                  padding: "2px 6px",
                  borderRadius: 6
                }}>
                  C
                </div>
              )}
            </div>

            <div style={{ color: "white", marginTop: 4 }}>
              #{p.number} {p.name}
            </div>
          </div>
        ))}
      </div>

      {/* EDITOR */}
      {editor && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ background: "white", padding: 20 }}>

            <input
              value={editor.name}
              onChange={(e) =>
                setEditor(prev => ({ ...prev, name: e.target.value }))
              }
            />

            <input
              value={editor.number}
              onChange={(e) =>
                setEditor(prev => ({
                  ...prev,
                  number: e.target.value.replace(/\D/g, "")
                }))
              }
            />

            <button onClick={() => setCaptain(editor.id)}>Captain</button>

            <button onClick={() => fileInput.current.click()}>
              Upload Video
            </button>

            <input ref={fileInput} type="file" hidden onChange={handleUpload} />

            <button onClick={() => {
              updatePlayer(editor.id, editor);
              setEditor(null);
            }}>
              Save
            </button>

            <button onClick={() => setEditor(null)}>Close</button>

          </div>
        </div>
      )}
    </div>
  );
}