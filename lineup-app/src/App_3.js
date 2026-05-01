import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

const formations = {
  "4-3-3": [
    [50, 90],
    [15, 70], [38, 70], [62, 70], [85, 70],
    [30, 50], [50, 45], [70, 50],
    [20, 20], [50, 15], [80, 20]
  ],
  "4-4-2": [
    [50, 90],
    [15, 70], [38, 70], [62, 70], [85, 70],
    [15, 50], [38, 50], [62, 50], [85, 50],
    [35, 20], [65, 20]
  ]
};

const createPlayer = (id, zone = "field") => ({
  id,
  name: `Player ${id}`,
  number: id,
  position: "CM",
  captain: false,
  x: 50,
  y: 50,
  url: null,
  zone
});

export default function App() {
  const [players, setPlayers] = useState([
    ...Array.from({ length: 11 }, (_, i) => createPlayer(i + 1, "field")),
    ...Array.from({ length: 5 }, (_, i) => createPlayer(i + 12, "bench"))
  ]);

  const [selected, setSelected] = useState(null);
  const [logo, setLogo] = useState(null);

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
    if (!file || !selected) return;
    const url = URL.createObjectURL(file);
    updatePlayer(selected.id, { url });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogo(url);
  };

  const applyFormation = (name) => {
    const coords = formations[name];
    setPlayers(prev =>
      prev.map((p, i) =>
        p.zone === "field" ? { ...p, x: coords[i][0], y: coords[i][1] } : p
      )
    );
  };

  const handleDragEnd = (p, info) => {
    const pitch = document.querySelector(".pitch");
    if (!pitch) return;

    const rect = pitch.getBoundingClientRect();

    let x = ((info.point.x - rect.left) / rect.width) * 100;
    let y = ((info.point.y - rect.top) / rect.height) * 100;

    // SNAP
    x = Math.round(x / 5) * 5;
    y = Math.round(y / 5) * 5;

    updatePlayer(p.id, { x, y });
  };

  // 🎬 VIDEO EXPORT
  const exportVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
  
      const recorder = new MediaRecorder(stream);
      let chunks = [];
  
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
  
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = "lineup.webm";
        a.click();
      };
  
      recorder.start();
  
      // Stop after 5 seconds
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 5000);
  
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };


  return (
    <div style={{ minHeight: "100vh", background: "#14532d", padding: 16 }}>

      {/* CONTROLS */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => applyFormation("4-3-3")}>4-3-3</button>
        <button onClick={() => applyFormation("4-4-2")} style={{ marginLeft: 6 }}>4-4-2</button>
        <button onClick={() => logoInput.current.click()} style={{ marginLeft: 10 }}>Upload Logo</button>
        <button onClick={exportVideo} style={{ marginLeft: 10 }}>Export Video</button>

        <input ref={logoInput} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
      </div>

      {/* PITCH */}
      <div className="pitch" style={{
        position: "relative",
        margin: "0 auto",
        width: "100%",
        maxWidth: 900,
        aspectRatio: "3/2",
        borderRadius: 12,
        overflow: "hidden",
        background: "repeating-linear-gradient(0deg, #15803d, #15803d 40px, #166534 40px, #166534 80px)"
      }}>

        {/* FIELD LINES */}
        <div style={{ position: "absolute", inset: 10, border: "2px solid white" }} />
        <div style={{ position: "absolute", top: "50%", left: 10, right: 10, height: 2, background: "white", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 120, height: 120, borderRadius: "50%", border: "2px solid white", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 6, height: 6, background: "white", borderRadius: "50%", transform: "translate(-50%, -50%)" }} />
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 200, height: 80, border: "2px solid white", borderTop: "none" }} />
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 200, height: 80, border: "2px solid white", borderTop: "none" }} />

        {/* LOGO */}
        {logo && (
          <img src={logo} alt="" style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            opacity: 0.55
          }} />
        )}

        {/* PLAYERS */}
        {players.filter(p => p.zone === "field").map(p => (
          <motion.div
            key={p.id}
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(p, info)}
            onClick={() => setSelected(p)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)"
            }}
          >
            <div style={{
              width: 120,
              height: 170,
              background: "black",
              borderRadius: 12,
              overflow: "hidden",
              border: p.captain ? "4px solid gold" : "4px solid white",
              position: "relative"
            }}>
              {p.url ? (
                <video src={p.url} autoPlay muted loop style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ color: "white", fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>👤</div>
              )}
              {p.captain && (
                <div style={{ position: "absolute", top: 4, right: 4, background: "gold", padding: "2px 6px", borderRadius: 6 }}>C</div>
              )}
            </div>
            <div style={{ color: "white", textAlign: "center" }}>#{p.number} {p.name}</div>
          </motion.div>
        ))}
      </div>

      {/* BENCH */}
      <div style={{ marginTop: 20, display: "flex", gap: 16, justifyContent: "center" }}>
        {players.filter(p => p.zone === "bench").map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              overflow: "hidden",
              border: p.captain ? "3px solid gold" : "2px solid white"
            }}>
              {p.url ? (
                <video src={p.url} autoPlay muted loop style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ color: "white", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
              )}
            </div>
            <div style={{ color: "white", fontSize: 12 }}>#{p.number}</div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ background: "white", padding: 16 }}>
            <h3>Edit Player</h3>

            <input value={selected.name} onChange={e => updatePlayer(selected.id, { name: e.target.value })} />
            <input value={selected.number} onChange={e => updatePlayer(selected.id, { number: e.target.value })} />

            <button onClick={() => setCaptain(selected.id)}>Make Captain</button>
            <button onClick={() => fileInput.current.click()}>Upload Video</button>

            <input ref={fileInput} type="file" accept="video/*" hidden onChange={handleUpload} />

            <button onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}