'use client'
// @ts-nocheck
import { useState, useRef } from "react";

const LIGHT = {
  bg: "#FAFAF7",
  white: "#FFFFFF",
  text: "#2C2C2C",
  textLight: "#6B7280",
  border: "#E8E8E4",
  cardBg: "#FFFFFF",
  navBg: "#FFFFFF",
  inputBg: "#FFFFFF",
  blue: "#A8C5DA",
  blueDark: "#7AAEC7",
  blueLight: "#D6EAF4",
  peach: "#F4C5A1",
  peachDark: "#EBA876",
  peachLight: "#FBE8D8",
  sage: "#C5DAA8",
  sageDark: "#9DC278",
  sageLight: "#E6F2D6",
  lavender: "#DAC5F4",
  lavenderDark: "#BC9EEE",
  lavenderLight: "#F0E8FC",
  warmGray: "#D4D0C8",
  warmGrayLight: "#F0EEE8",
};

const DARK = {
  bg: "#0F1117",
  white: "#1A1D27",
  text: "#F0EEE8",
  textLight: "#8B909A",
  border: "#2A2D3A",
  cardBg: "#1A1D27",
  navBg: "#13151E",
  inputBg: "#13151E",
  blue: "#A8C5DA",
  blueDark: "#7AAEC7",
  blueLight: "#1A2E3A",
  peach: "#F4C5A1",
  peachDark: "#EBA876",
  peachLight: "#2E2018",
  sage: "#C5DAA8",
  sageDark: "#9DC278",
  sageLight: "#1A2A14",
  lavender: "#DAC5F4",
  lavenderDark: "#BC9EEE",
  lavenderLight: "#221A30",
  warmGray: "#4A4740",
  warmGrayLight: "#1E1C18",
};

let COLORS = { ...LIGHT };

const getStageConfig = (C) => ({
  New: { color: C.peach, light: C.peachLight, dark: C.peachDark },
  Pending: { color: C.lavender, light: C.lavenderLight, dark: C.lavenderDark },
  Reviewed: { color: C.blue, light: C.blueLight, dark: C.blueDark },
  "Interview Scheduled": { color: "#F9E08A", light: "#FEF8D0", dark: "#E8C832" },
  Interviewed: { color: "#F4A8C5", light: "#FCE0EC", dark: "#E87AAF" },
  Accepted: { color: C.sage, light: C.sageLight, dark: C.sageDark },
  Rejected: { color: C.warmGray, light: C.warmGrayLight, dark: "#A09C94" },
});

const initialJobs = [
  { id: 1, title: "Product Designer", department: "Design", location: "Remote", type: "Full-time", status: "Active", applicants: 3 },
  { id: 2, title: "Senior Engineer", department: "Engineering", location: "CDMX", type: "Full-time", status: "Active", applicants: 5 },
  { id: 3, title: "Marketing Lead", department: "Marketing", location: "Monterrey", type: "Full-time", status: "Active", applicants: 2 },
  { id: 4, title: "Data Analyst", department: "Analytics", location: "Remote", type: "Contract", status: "Draft", applicants: 0 },
];

const initialCandidates = [
  { id: 1, name: "Ana García", email: "ana@gmail.com", phone: "+52 55 1234 5678", location: "CDMX", position: "Product Designer", stage: "Interviewed", date: "18 Abr 2026" },
  { id: 2, name: "Carlos Mendez", email: "carlos@outlook.com", phone: "+52 81 9876 5432", location: "Monterrey", position: "Senior Engineer", stage: "Interview Scheduled", date: "19 Abr 2026" },
  { id: 3, name: "Sofia Reyes", email: "sofia@gmail.com", phone: "+52 33 5555 4444", location: "Guadalajara", position: "Marketing Lead", stage: "Reviewed", date: "20 Abr 2026" },
  { id: 4, name: "Diego Torres", email: "diego@proton.me", phone: "+52 55 2222 3333", location: "Remote", position: "Senior Engineer", stage: "New", date: "21 Abr 2026" },
  { id: 5, name: "Valeria Cruz", email: "valeria@gmail.com", phone: "+52 55 8888 7777", location: "CDMX", position: "Product Designer", stage: "Accepted", date: "17 Abr 2026" },
  { id: 6, name: "Rodrigo Vega", email: "rodrigo@gmail.com", phone: "+52 81 1111 2222", location: "Monterrey", position: "Marketing Lead", stage: "Pending", date: "21 Abr 2026" },
];

const emailTemplates = [
  { id: 1, name: "Bienvenida a candidato", subject: "Tu aplicación fue recibida — {{position}}", body: "Hola {{firstName}},\n\nGracias por aplicar a {{position}} en SOE Consulting. Revisaremos tu perfil y te contactaremos pronto.\n\nSaludos,\nEquipo SOE" },
  { id: 2, name: "Invitación a entrevista", subject: "¡Te invitamos a una entrevista! — {{position}}", body: "Hola {{firstName}},\n\nNos gustaría invitarte a una entrevista para el rol de {{position}}. Por favor responde con tu disponibilidad.\n\nSaludos,\nEquipo SOE" },
  { id: 3, name: "Oferta de trabajo", subject: "Oferta de trabajo — {{position}}", body: "Hola {{firstName}},\n\nCon mucho gusto te comunicamos que hemos decidido extenderte una oferta para el puesto de {{position}}.\n\nSaludos,\nEquipo SOE" },
  { id: 4, name: "Proceso cerrado", subject: "Actualización de tu aplicación", body: "Hola {{firstName}},\n\nGracias por tu interés en {{position}}. En esta ocasión decidimos continuar con otros candidatos.\n\nSaludos,\nEquipo SOE" },
];

// @ts-nocheck
// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

const Badge = ({ label, color, light, small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: small ? "2px 8px" : "4px 10px",
    borderRadius: 999,
    fontSize: small ? 11 : 12,
    fontWeight: 600,
    background: light || "#F0EEE8",
    color: color || "#6B7280",
    whiteSpace: "nowrap",
  }}>{label}</span>
);

const StageBadge = ({ stage, small, C }) => {
  const cfg = getStageConfig(C || LIGHT)[stage] || getStageConfig(C || LIGHT)["Pending"];
  return <Badge label={stage} color={cfg.dark} light={cfg.light} small={small} />;
};

const StatusBadge = ({ status, C }) => {
  const T = C || LIGHT;
  const map = {
    Active: { color: T.sageDark, light: T.sageLight },
    Draft: { color: T.lavenderDark, light: T.lavenderLight },
    Closed: { color: "#9CA3AF", light: T.warmGrayLight },
  };
  const cfg = map[status] || map.Draft;
  return <Badge label={status} color={cfg.color} light={cfg.light} />;
};

const Card = ({ children, style, C }) => {
  const T = C || LIGHT;
  return (
    <div style={{
      background: T.cardBg,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: 24,
      ...style,
    }}>{children}</div>
  );
};

const Btn = ({ children, onClick, variant = "primary", small, style, C }) => {
  const T = C || LIGHT;
  const variants = {
    primary: { background: T.peach, color: T.text, border: "none" },
    ghost: { background: "transparent", color: T.textLight, border: `1px solid ${T.border}` },
    danger: { background: "#FEE2E2", color: "#DC2626", border: "none" },
    sage: { background: T.sageLight, color: T.sageDark, border: "none" },
    dark: { background: T.lavenderLight, color: T.lavenderDark, border: "none" },
  };
  return (
    <button onClick={onClick} style={{
      ...variants[variant],
      padding: small ? "6px 14px" : "9px 18px",
      borderRadius: 10,
      fontSize: small ? 12 : 13,
      fontWeight: 600,
      cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 6,
      transition: "opacity 0.15s",
      fontFamily: "inherit",
      ...style,
    }}
    onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
    onMouseOut={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, style, C }) => {
  const T = C || LIGHT;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.textLight }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "9px 14px",
          fontSize: 13,
          color: T.text,
          background: T.inputBg,
          outline: "none",
          fontFamily: "inherit",
          ...style,
        }}
      />
    </div>
  );
};

const Select = ({ label, value, onChange, options, C }) => {
  const T = C || LIGHT;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.textLight }}>{label}</label>}
      <select value={value} onChange={onChange} style={{
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "9px 14px",
        fontSize: 13,
        color: T.text,
        background: T.inputBg,
        outline: "none",
        fontFamily: "inherit",
        cursor: "pointer",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};

// ─── NAV ─────────────────────────────────────────────────────────────────────

const Logo = ({ onClick, C }) => {
  const T = C || LIGHT;
  return (
    <div onClick={onClick} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: `linear-gradient(135deg, ${T.peach}, ${T.lavender})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color: "#fff",
      }}>F</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1 }}>Forma</div>
        <div style={{ fontSize: 10, color: T.textLight, lineHeight: 1, marginTop: 2 }}>by SOE Consulting</div>
      </div>
    </div>
  );
};

// ─── PUBLIC JOB BOARD ────────────────────────────────────────────────────────

const JobBoard = ({ jobs, onApply, onGoAdmin, C, darkMode, setDarkMode }) => {
  const T = C;
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const depts = ["All", ...new Set(jobs.map(j => j.department))];
  const deptColors = { Design: T.lavender, Engineering: T.blue, Marketing: T.peach, Analytics: T.sage };

  const filtered = jobs.filter(j =>
    j.status === "Active" &&
    (dept === "All" || j.department === dept) &&
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: T.navBg, borderBottom: `1px solid ${T.border}`, padding: "0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Logo C={T} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
              background: T.white, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
            }}>{darkMode ? "☀️" : "🌙"}</button>
            <Btn variant="ghost" small onClick={onGoAdmin} C={T}>Admin →</Btn>
          </div>
        </div>
      </div>

      <div style={{ background: T.navBg, borderBottom: `1px solid ${T.border}`, padding: "60px 40px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: T.blueLight, opacity: 0.6 }} />
            <div style={{ position: "absolute", top: 10, right: 20, width: 40, height: 40, borderRadius: 12, background: T.lavenderLight, opacity: 0.8, transform: "rotate(15deg)" }} />
            <div style={{ position: "absolute", top: -10, right: 140, width: 24, height: 24, borderRadius: 6, background: T.peachLight, opacity: 0.9, transform: "rotate(25deg)" }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.peachDark, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            SOE Consulting · {filtered.length} posiciones abiertas
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, color: T.text, margin: "0 0 12px", lineHeight: 1.15, fontFamily: "'Fraunces', serif" }}>
            Encuentra tu próximo<br /><span style={{ color: T.peachDark }}>capítulo.</span>
          </h1>
          <p style={{ color: T.textLight, fontSize: 16, margin: "0 0 32px" }}>Únete a un equipo que construye cosas que importan.</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input placeholder="Buscar posición..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "11px 18px", fontSize: 14, color: T.text, background: T.bg, outline: "none", fontFamily: "inherit", minWidth: 240 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {depts.map(d => (
                <button key={d} onClick={() => setDept(d)} style={{
                  padding: "9px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  background: dept === d ? T.text : T.bg, color: dept === d ? T.bg : T.textLight,
                  border: `1.5px solid ${dept === d ? T.text : T.border}`,
                }}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 40px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: T.textLight }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>◇</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No encontramos posiciones con esos filtros</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filtered.map(job => (
              <div key={job.id} style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 4, background: deptColors[job.department] || T.peach }} />
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <Badge label={job.department} color={T.text} light={(deptColors[job.department] || T.peach) + "44"} />
                    <Badge label={job.type} color={T.textLight} light={T.warmGrayLight} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>{job.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.textLight, fontSize: 13, marginBottom: 20 }}>📍 {job.location}</div>
                  <Btn onClick={() => onApply(job)} C={T} style={{ width: "100%", justifyContent: "center" }}>Aplicar →</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", padding: "32px", borderTop: `1px solid ${T.border}`, color: T.textLight, fontSize: 13 }}>
        Forma by SOE Consulting · soeconsulting.ai
      </div>
    </div>
  );
};

// ─── APPLICATION FORM ────────────────────────────────────────────────────────

const ApplicationForm = ({ job, onBack, onSubmit, C }) => {
  const T = C;
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", location: "", cover: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); setTimeout(() => onSubmit(), 2000); };

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✦</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: T.text, fontFamily: "'Fraunces', serif" }}>¡Aplicación enviada!</h2>
        <p style={{ color: T.textLight }}>Te contactaremos pronto, {form.firstName}.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: T.navBg, borderBottom: `1px solid ${T.border}`, padding: "0 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 16 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.textLight }}>←</button>
          <Logo C={T} />
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 40 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.peachDark, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Posición</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: T.text, fontFamily: "'Fraunces', serif", margin: "0 0 16px" }}>{job.title}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <Badge label={job.department} color={T.text} light={T.peachLight} />
            <Badge label={job.location} color={T.textLight} light={T.warmGrayLight} />
            <Badge label={job.type} color={T.textLight} light={T.warmGrayLight} />
          </div>
          <Card C={T} style={{ background: T.sageLight, border: `1px solid ${T.sage}` }}>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>Buscamos a alguien apasionado, con ganas de crecer y de impactar positivamente en nuestro equipo.</div>
          </Card>
        </div>
        <Card C={T}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 24px" }}>Tu aplicación</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input C={T} label="Nombre" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Ana" />
              <Input C={T} label="Apellido" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="García" />
            </div>
            <Input C={T} label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ana@email.com" type="email" />
            <Input C={T} label="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+52 55 0000 0000" />
            <Input C={T} label="Ciudad" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ciudad de México" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textLight }}>Carta de presentación (opcional)</label>
              <textarea value={form.cover} onChange={e => setForm({ ...form, cover: e.target.value })} placeholder="Cuéntanos por qué eres la persona ideal..."
                style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: T.text, background: T.inputBg, outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 80 }} />
            </div>
            <div style={{ border: `2px dashed ${T.border}`, borderRadius: 12, padding: "20px", textAlign: "center", color: T.textLight, fontSize: 13 }}>
              📎 Subir CV (PDF) · Max 5MB
            </div>
            <Btn C={T} onClick={handleSubmit} style={{ justifyContent: "center", padding: "12px" }}>Enviar aplicación →</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

const AdminDashboard = ({ jobs, setJobs, candidates, setCandidates, onGoPublic, C, darkMode, setDarkMode }) => {
  const T = C;
  const [tab, setTab] = useState("positions");
  const [boardPublic, setBoardPublic] = useState(true);

  const tabs = [
    { id: "positions", label: "Posiciones", icon: "⬡" },
    { id: "candidates", label: "Candidatos", icon: "◎" },
    { id: "pipeline", label: "Pipeline", icon: "◈" },
    { id: "email", label: "Email", icon: "✉" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: T.navBg, borderBottom: `1px solid ${T.border}`, padding: "0 40px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 32 }}>
          <Logo onClick={onGoPublic} C={T} />
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: tab === t.id ? T.text : "transparent",
                color: tab === t.id ? T.bg : T.textLight,
                border: "none",
              }}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
              background: T.white, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
            }}>{darkMode ? "☀️" : "🌙"}</button>
            <Btn variant="ghost" small onClick={onGoPublic} C={T}>Ver Job Board</Btn>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${T.peach}, ${T.lavender})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>S</div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px" }}>
        {tab === "positions" && <PositionsTab jobs={jobs} setJobs={setJobs} boardPublic={boardPublic} setBoardPublic={setBoardPublic} C={T} />}
        {tab === "candidates" && <CandidatesTab candidates={candidates} setCandidates={setCandidates} C={T} />}
        {tab === "pipeline" && <PipelineTab candidates={candidates} setCandidates={setCandidates} C={T} />}
        {tab === "email" && <EmailTab candidates={candidates} C={T} />}
      </div>
    </div>
  );
};

// ─── POSITIONS TAB ───────────────────────────────────────────────────────────

const PositionsTab = ({ jobs, setJobs, boardPublic, setBoardPublic, C }) => {
  const T = C;
  const [showNew, setShowNew] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", department: "", location: "", type: "Full-time" });

  const addJob = () => {
    if (!newJob.title) return;
    setJobs([...jobs, { id: Date.now(), ...newJob, status: "Active", applicants: 0 }]);
    setNewJob({ title: "", department: "", location: "", type: "Full-time" });
    setShowNew(false);
  };
  const deleteJob = (id) => setJobs(jobs.filter(j => j.id !== id));

  return (
    <div>
      <Card C={T} style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: boardPublic ? T.sageLight : T.warmGrayLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {boardPublic ? "🌐" : "🔒"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Job Board Público</div>
            <div style={{ fontSize: 12, color: T.textLight }}>{boardPublic ? "soeconsulting.ai/jobs · visible para candidatos" : "Oculto — solo tú puedes ver las posiciones"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {boardPublic && <span style={{ fontSize: 12, color: T.sageDark, fontWeight: 600 }}>● En línea</span>}
          <div onClick={() => setBoardPublic(!boardPublic)} style={{ width: 48, height: 26, borderRadius: 999, cursor: "pointer", transition: "background 0.2s", background: boardPublic ? T.sageDark : T.warmGray, position: "relative" }}>
            <div style={{ position: "absolute", top: 3, left: boardPublic ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Posiciones</h2>
          <div style={{ fontSize: 13, color: T.textLight, marginTop: 2 }}>{jobs.filter(j => j.status === "Active").length} activas · {jobs.length} / 100 total</div>
        </div>
        <Btn C={T} onClick={() => setShowNew(!showNew)}>+ Nueva posición</Btn>
      </div>

      {showNew && (
        <Card C={T} style={{ marginBottom: 20, background: T.peachLight, border: `1px solid ${T.peach}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
            <Input C={T} label="Título" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} placeholder="Ej. UX Designer" />
            <Input C={T} label="Departamento" value={newJob.department} onChange={e => setNewJob({ ...newJob, department: e.target.value })} placeholder="Ej. Design" />
            <Input C={T} label="Ubicación" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} placeholder="Ej. Remote" />
            <Select C={T} label="Tipo" value={newJob.type} onChange={e => setNewJob({ ...newJob, type: e.target.value })}
              options={[{ value: "Full-time", label: "Full-time" }, { value: "Part-time", label: "Part-time" }, { value: "Contract", label: "Contract" }, { value: "Remote", label: "Remote" }]} />
            <Btn C={T} onClick={addJob} variant="sage">Crear</Btn>
          </div>
        </Card>
      )}

      <Card C={T} style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Título", "Departamento", "Ubicación", "Tipo", "Estado", "Candidatos", "Acciones"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? `1px solid ${T.border}` : "none" }}
                onMouseOver={e => e.currentTarget.style.background = T.bg}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "16px 20px", fontWeight: 600, fontSize: 14, color: T.text }}>{job.title}</td>
                <td style={{ padding: "16px 20px" }}><Badge label={job.department} color={T.text} light={T.peachLight} /></td>
                <td style={{ padding: "16px 20px", fontSize: 13, color: T.textLight }}>📍 {job.location}</td>
                <td style={{ padding: "16px 20px" }}><Badge label={job.type} color={T.textLight} light={T.warmGrayLight} /></td>
                <td style={{ padding: "16px 20px" }}><StatusBadge status={job.status} C={T} /></td>
                <td style={{ padding: "16px 20px", fontSize: 13, color: T.textLight }}>👤 {job.applicants}</td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn C={T} small variant="ghost">✏️</Btn>
                    <Btn C={T} small variant="danger" onClick={() => deleteJob(job.id)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── CANDIDATES TAB ──────────────────────────────────────────────────────────

const CandidatesTab = ({ candidates, setCandidates, C }) => {
  const T = C;
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [docs, setDocs] = useState({});
  const fileRefs = useRef({});

  const emptyForm = { name: "", email: "", phone: "", location: "", position: "Product Designer", stage: "New", date: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) };
  const [form, setForm] = useState(emptyForm);

  const filtered = candidates.filter(c =>
    (stageFilter === "All" || c.stage === stageFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase()))
  );

  const saveCandidate = () => {
    if (!form.name || !form.email) return;
    if (editId) {
      setCandidates(candidates.map(c => c.id === editId ? { ...c, ...form } : c));
      setEditId(null);
    } else {
      setCandidates([...candidates, { id: Date.now(), ...form }]);
    }
    setForm(emptyForm);
    setShowAdd(false);
  };

  const startEdit = (c) => { setForm({ name: c.name, email: c.email, phone: c.phone, location: c.location, position: c.position, stage: c.stage, date: c.date }); setEditId(c.id); setShowAdd(true); };
  const deleteCandidate = (id) => setCandidates(candidates.filter(c => c.id !== id));
  const updateStage = (id, stage) => setCandidates(candidates.map(c => c.id === id ? { ...c, stage } : c));

  const handleFileUpload = (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocs(prev => ({ ...prev, [id]: { name: file.name, url: URL.createObjectURL(file) } }));
  };

  const handleDownload = (id) => {
    const doc = docs[id];
    if (!doc) return;
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.name;
    a.click();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Candidatos</h2>
          <div style={{ fontSize: 13, color: T.textLight, marginTop: 2 }}>{candidates.length} en total</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", fontSize: 13, color: T.text, background: T.inputBg, outline: "none", fontFamily: "inherit" }} />
          <Select C={T} value={stageFilter} onChange={e => setStageFilter(e.target.value)}
            options={[{ value: "All", label: "Todas las etapas" }, ...Object.keys(getStageConfig(T)).map(s => ({ value: s, label: s }))]} />
          <Btn C={T} onClick={() => { setForm(emptyForm); setEditId(null); setShowAdd(!showAdd); }}>+ Agregar candidato</Btn>
        </div>
      </div>

      {showAdd && (
        <Card C={T} style={{ marginBottom: 20, background: T.lavenderLight, border: `1px solid ${T.lavender}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 16 }}>{editId ? "✏️ Editar candidato" : "➕ Nuevo candidato"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Input C={T} label="Nombre completo" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ana García" />
            <Input C={T} label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ana@email.com" type="email" />
            <Input C={T} label="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+52 55 0000 0000" />
            <Input C={T} label="Ciudad" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="CDMX" />
            <Input C={T} label="Posición" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="Product Designer" />
            <Select C={T} label="Etapa inicial" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}
              options={Object.keys(getStageConfig(T)).map(s => ({ value: s, label: s }))} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn C={T} onClick={saveCandidate} variant="sage">{editId ? "Guardar cambios" : "Crear candidato"}</Btn>
            <Btn C={T} onClick={() => { setShowAdd(false); setEditId(null); }} variant="ghost">Cancelar</Btn>
          </div>
        </Card>
      )}

      <Card C={T} style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Candidato", "Posición", "Etapa", "Documentos", "Fecha", "Acciones"].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textLight, textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
                onMouseOver={e => e.currentTarget.style.background = T.bg}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${T.peach}, ${T.lavender})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: T.textLight }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: T.textLight }}>{c.position}</td>
                <td style={{ padding: "14px 20px" }}>
                  <select value={c.stage} onChange={e => updateStage(c.id, e.target.value)}
                    style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: T.text, background: T.inputBg, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                    {Object.keys(getStageConfig(T)).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="file" accept=".pdf,.doc,.docx" ref={el => fileRefs.current[c.id] = el}
                      onChange={e => handleFileUpload(c.id, e)} style={{ display: "none" }} />
                    <Btn C={T} small variant="ghost" onClick={() => fileRefs.current[c.id]?.click()}>📎 Subir</Btn>
                    {docs[c.id] && (
                      <Btn C={T} small variant="sage" onClick={() => handleDownload(c.id)}>⬇ {docs[c.id].name.length > 12 ? docs[c.id].name.slice(0, 12) + "…" : docs[c.id].name}</Btn>
                    )}
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 12, color: T.textLight }}>{c.date}</td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn C={T} small variant="ghost" onClick={() => startEdit(c)}>✏️</Btn>
                    <Btn C={T} small variant="danger" onClick={() => deleteCandidate(c.id)}>🗑</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// ─── PIPELINE TAB ────────────────────────────────────────────────────────────

const PipelineTab = ({ candidates, setCandidates, C }) => {
  const T = C;
  const [dragging, setDragging] = useState(null);
  const stages = Object.keys(getStageConfig(T));
  const moveCandidate = (id, newStage) => { setCandidates(candidates.map(c => c.id === id ? { ...c, stage: newStage } : c)); setDragging(null); };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Pipeline</h2>
        <div style={{ fontSize: 13, color: T.textLight, marginTop: 2 }}>Arrastra candidatos entre etapas</div>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
        {stages.map(stage => {
          const cfg = getStageConfig(T)[stage];
          const stageCandidates = candidates.filter(c => c.stage === stage);
          return (
            <div key={stage} style={{ minWidth: 180, flex: "0 0 180px" }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragging && moveCandidate(dragging, stage)}>
              <div style={{ padding: "10px 14px", borderRadius: "12px 12px 0 0", background: cfg.light, borderBottom: `2px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: cfg.dark }}>{stage}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: cfg.color, color: cfg.dark, borderRadius: 999, padding: "1px 8px" }}>{stageCandidates.length}</span>
              </div>
              <div style={{ background: cfg.light + "66", border: `1px solid ${cfg.color}44`, borderTop: "none", borderRadius: "0 0 12px 12px", minHeight: 180, padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {stageCandidates.map(c => (
                  <div key={c.id} draggable onDragStart={() => setDragging(c.id)}
                    style={{ background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: 10, cursor: "grab", transition: "transform 0.15s" }}
                    onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                    onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${cfg.color}, ${T.lavender})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: T.textLight }}>{c.position}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: T.textLight }}>{c.date}</div>
                  </div>
                ))}
                {stageCandidates.length === 0 && <div style={{ textAlign: "center", padding: "16px 0", color: T.textLight, fontSize: 12 }}>Vacío</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EmailTab = ({ candidates, C }) => {
  const T = C;
  const [subTab, setSubTab] = useState("individual");
  const [selected, setSelected] = useState("");
  const [template, setTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [groupSelected, setGroupSelected] = useState([]);

  const VARS = ["{{firstName}}", "{{lastName}}", "{{position}}", "{{department}}", "{{company}}"];
  const insertVar = (v) => setBody(prev => prev + v);
  const loadTemplate = (t) => { setSubject(t.subject); setBody(t.body); setTemplate(t.id.toString()); };
  const handleSend = () => { setSent(true); setTimeout(() => setSent(false), 2500); };
  const toggleGroup = (id) => setGroupSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const composeArea = (
    <Card C={T}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textLight, marginBottom: 6 }}>Variables de personalización</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {VARS.map(v => (
              <button key={v} onClick={() => insertVar(v)} style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "none", background: T.peachLight, color: T.peachDark }}>{v}</button>
            ))}
          </div>
        </div>
        <Input C={T} label="Asunto" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ej. Tu aplicación fue recibida" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textLight }}>Mensaje</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escribe tu mensaje aquí..."
            style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: T.text, background: T.inputBg, outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 150 }} />
        </div>
        <Btn C={T} onClick={handleSend} style={{ justifyContent: "center" }}>
          {subTab === "group" ? `Enviar a ${groupSelected.length} candidato${groupSelected.length !== 1 ? "s" : ""} →` : "Enviar email →"}
        </Btn>
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Centro de Email</h2>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4, width: "fit-content" }}>
        {["individual", "group", "templates"].map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            padding: "7px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: "none", transition: "all 0.15s",
            background: subTab === t ? T.text : "transparent", color: subTab === t ? T.bg : T.textLight,
          }}>{{ individual: "Individual", group: "Grupo", templates: "Templates" }[t]}</button>
        ))}
      </div>

      {sent && <div style={{ background: T.sageLight, border: `1px solid ${T.sage}`, borderRadius: 12, padding: "12px 20px", marginBottom: 20, fontSize: 14, color: T.sageDark, fontWeight: 600 }}>✓ Email enviado correctamente</div>}

      {subTab === "individual" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Select C={T} label="Candidato" value={selected} onChange={e => setSelected(e.target.value)}
              options={[{ value: "", label: "Seleccionar..." }, ...candidates.map(c => ({ value: c.id, label: c.name }))]} />
            {selected && (() => {
              const c = candidates.find(x => x.id === parseInt(selected));
              return c ? (
                <Card C={T} style={{ background: T.lavenderLight, border: `1px solid ${T.lavender}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${T.peach}, ${T.lavender})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: T.textLight }}>{c.email}</div>
                    </div>
                  </div>
                  <StageBadge stage={c.stage} small C={T} />
                </Card>
              ) : null;
            })()}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textLight, marginBottom: 8 }}>Templates guardados</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {emailTemplates.map(t => (
                  <button key={t.id} onClick={() => loadTemplate(t)} style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.15s",
                    background: template === t.id.toString() ? T.peachLight : T.bg,
                    border: `1px solid ${template === t.id.toString() ? T.peach : T.border}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: T.textLight, marginTop: 2 }}>{t.subject}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {composeArea}
        </div>
      )}

      {subTab === "group" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
          <Card C={T}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Candidatos ({groupSelected.length}/{candidates.length})</div>
            <button onClick={() => setGroupSelected(groupSelected.length === candidates.length ? [] : candidates.map(c => c.id))}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: T.peachDark, fontWeight: 600, marginBottom: 12, fontFamily: "inherit" }}>
              {groupSelected.length === candidates.length ? "Deseleccionar todos" : "Seleccionar todos"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {candidates.map(c => (
                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: groupSelected.includes(c.id) ? T.peachLight : "transparent" }}>
                  <input type="checkbox" checked={groupSelected.includes(c.id)} onChange={() => toggleGroup(c.id)} style={{ accentColor: T.peachDark }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: T.textLight }}>{c.position}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>
          {composeArea}
        </div>
      )}

      {subTab === "templates" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <Btn C={T}>+ Nuevo template</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {emailTemplates.map(t => (
              <Card C={T} key={t.id} style={{ cursor: "pointer" }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 6 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: T.peachDark, fontWeight: 600, marginBottom: 8 }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: T.textLight, marginBottom: 16, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.body}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn C={T} small variant="ghost">✏️ Editar</Btn>
                  <Btn C={T} small variant="danger">🗑</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("jobs");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState(initialJobs);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [darkMode, setDarkMode] = useState(false);

  const C = darkMode ? DARK : LIGHT;

  if (view === "apply" && selectedJob) {
    return <ApplicationForm job={selectedJob} onBack={() => setView("jobs")} onSubmit={() => setView("jobs")} C={C} />;
  }
  if (view === "admin") {
    return <AdminDashboard jobs={jobs} setJobs={setJobs} candidates={candidates} setCandidates={setCandidates} onGoPublic={() => setView("jobs")} C={C} darkMode={darkMode} setDarkMode={setDarkMode} />;
  }
  return (
    <JobBoard jobs={jobs} onApply={(job) => { setSelectedJob(job); setView("apply"); }} onGoAdmin={() => setView("admin")} C={C} darkMode={darkMode} setDarkMode={setDarkMode} />
  );
}
