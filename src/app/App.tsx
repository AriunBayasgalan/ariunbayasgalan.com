import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import headshotSrc from "../imports/Headshot-1.jpg";
import gitTogether1 from "../imports/Git-Together_1_.png";
import gitTogether2 from "../imports/Git-Together_2_.png";
import planPandasImg from "../imports/PlanPandas.png";
import npcForgeImg from "../imports/NPCForge.png";
import cleanSight3 from "../imports/CleanSight_3_.png";
import cleanSight1 from "../imports/CleanSight_1_.png";
import cleanSight7 from "../imports/CleanSight_7_.png";
import personalWebsiteImg from "../imports/Personal-website-1.png";
import { RESUME_B64 } from "../resumeData";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";

const resumeUrl = `data:application/pdf;base64,${RESUME_B64}`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 1,
    title: "Git-Together",
    category: "Full-Stack · Web App · WebDev@GT",
    year: "Jan 2026 – Present",
    desc: "Launched a web development application for project discovery aimed at 250,000+ Atlanta students using a MERN stack with JWT authentication.",
    img: gitTogether1 as string,
    imgs: [gitTogether1 as string, gitTogether2 as string],
    color: "#e8f0f8",
    tags: ["React", "Node.js", "Express", "MongoDB", "JWT/Auth", "Figma"],
  },
  {
    id: 2,
    title: "Clean Sight",
    category: "AI · Full-Stack · Healthcare",
    year: "Feb 2026",
    desc: "Architected a full-stack AI platform for hospital infection control, converting surface cleaning sessions into 202-dimensional spatial risk embeddings to power real-time infection risk recommendations and clinical decision support. Overlaid live 30×20 infection heatmap visualizations via OpenCV on an MJPEG camera stream.",
    img: cleanSight3 as string,
    imgs: [cleanSight3 as string, cleanSight1 as string, cleanSight7 as string],
    color: "#fdf8e1",
    tags: ["Python", "FastAPI", "OpenCV", "VectorAI DB", "gRPC", "Sphinx", "SafetyKit"],
  },
  {
    id: 3,
    title: "Plan Panda",
    category: "Full-Stack · Hackathon · HackGT 12",
    year: "2025",
    desc: "Plan Pandas is a tool that aid professors in turning a class name, lesson title, and a few description notes into ready-to-use lesson plans, lecture slides, and worksheets. It uses the OpenAI API to generate content, compiles LaTeX Beamer slides into previewable/downloadable PDFs via a Python/FastAPI microservice, and wraps it all in a React/TypeScript frontend with a Hono + SQLite backend, authenticated with BetterAuth. The frontend is deployed on Vercel and the LaTeX-processing service runs in Docker on a VPS.",
    img: planPandasImg as string,
    color: "#e8f2e8",
    tags: ["HackGT 2025", "Full-Stack", "Web App"],
  },
  {
    id: 4,
    title: "NPC Forge",
    category: "Agentic AI · Web App · Hackathon",
    year: "Jun 2025",
    desc: "Captured 1 of 4 notable mentions at the Amazon Nova Partner Demo Hackathon. Developed an end-to-end agentic web app yielding an NPC generation platform with persistent player memory and conversational AI. Built a console command to automate Unity-compatible code generation, reducing developer integration time by an estimated 15 hours per project.",
    img: npcForgeImg as string,
    color: "#eee8f0",
    tags: ["Python", "Svelte", "Tailwind", "AWS Nova Sonic", "Lambda", "DynamoDB"],
  },
  {
    id: 5,
    title: "Personal Website",
    category: "Frontend · Design · Portfolio",
    year: "2026",
    desc: "Designed and built this portfolio site from scratch. It is a minimalist, animated showcase featuring floating interactive cards, a drag-and-drop layout editor (password-gated), an in-page resume modal, and a full About page with experience, skills, and project history. Engineered entirely in React with motion-driven transitions.",
    img: personalWebsiteImg as string,
    color: "#f0ede8",
    tags: ["React", "TypeScript", "motion/react", "Vite", "Figma"],
  },
];

const SKILLS = [
  { group: "Languages", items: ["Python", "Java", "C / C++", "TypeScript", "Lua", "R"] },
  { group: "Frontend", items: ["React", "Svelte", "Tailwind", "JavaScript", "Figma"] },
  { group: "Backend & Data", items: ["Node.js", "FastAPI", "PostgreSQL", "MongoDB", "Neo4j"] },
  { group: "AI / ML", items: ["PyTorch", "TensorFlow", "LangChain", "GraphRAG", "FastAPI"] },
  { group: "Cloud & DevOps", items: ["AWS", "Docker", "Terraform", "Azure", "CI/CD"] },
];

// ─── Shared styles ─────────────────────────────────────────────────────────────

const glassMixin: React.CSSProperties = {
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  border: "1px solid rgba(0,0,0,0.1)",
  background: "#ffffff",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: "1.125rem",
  color: "#000",
  fontFamily: "'Roboto Mono', monospace",
};

const MONO: React.CSSProperties = { fontFamily: "'Roboto Mono', monospace" };
const SERIF: React.CSSProperties = { fontFamily: "'Source Serif 4', serif" };
const SANS: React.CSSProperties = { fontFamily: "'Inter', sans-serif" };

// ─── Tooltip card ─────────────────────────────────────────────────────────────

function CardWithTooltip({
  children,
  tooltip,
  style,
  onMouseDown,
  onMouseUp,
  onMouseLeave: onML,
  onClick,
}: {
  children: React.ReactNode;
  tooltip?: string;
  style?: React.CSSProperties;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Spring-tracked position for the tooltip — fluid, low stiffness
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 160, damping: 22, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 160, damping: 22, mass: 0.6 });

  const toRelative = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return null;
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top, rect };
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const r = toRelative(e);
    if (!r) return;
    const { mx, my, rect } = r;
    // Vector from card center to entry point → pull tooltip back along approach direction
    const dx = mx - rect.width / 2;
    const dy = my - rect.height / 2;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const PULL = 32;
    rawX.set(mx - (dx / len) * PULL - 52);
    rawY.set(my - (dy / len) * PULL - 38);
    setHovered(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const r = toRelative(e);
    if (!r) return;
    rawX.set(r.mx - 52);
    rawY.set(r.my - 38);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { setHovered(false); onML?.(); }}
      onMouseMove={handleMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      animate={{ y: hovered ? -6 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      style={{ position: "relative", ...style }}
    >
      {children}
      <AnimatePresence>
        {hovered && tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.86 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              x,
              y,
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.18)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.10)",
              color: "rgba(0,0,0,0.68)",
              ...MONO,
              fontSize: "clamp(0.65rem,0.9vw,0.74rem)",
              letterSpacing: "0.01em",
              padding: "0.35rem 1.05rem",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 200,
            }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Floating Cards ────────────────────────────────────────────────────────────

type CardPositions = {
  orange: { top: number; left: number };
  peach:  { top: number; left: number };
  at:     { top: number; left: number };
  green:  { top: number; left: number };
};

function OrangeCard({ revealed, editMode, onToggle }: { revealed: boolean; editMode: boolean; onToggle?: () => void }) {
  return (
    <motion.div
      layoutId="card-orange"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.06 }}
      onClick={!editMode ? onToggle : undefined}
      style={{ cursor: editMode ? undefined : "pointer" }}
    >
      <CardWithTooltip
        tooltip={editMode ? undefined : "Click Me"}
        style={{ ...glassMixin, width: "min(300px, 78vw)", padding: "1.25rem 1.4rem", pointerEvents: editMode ? "none" : undefined }}
      >
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: "0.45rem", height: "0.45rem", background: "rgba(0,0,0,0.4)", display: "block" }} />
          ))}
        </div>
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.15)", margin: "0.6rem 0" }} />
        <p style={{ fontSize: "clamp(0.65rem,0.9vw,0.74rem)", lineHeight: 1.6, margin: 0, color: "rgba(0,0,0,0.68)", letterSpacing: "0.01em" }}>
          Ariun is a software engineer passionate about hands-on development, software craft, and scalable architecture.
        </p>
      </CardWithTooltip>
    </motion.div>
  );
}

function PeachCard({ revealed, editMode, onToggle }: { revealed: boolean; editMode: boolean; onToggle?: () => void }) {
  return (
    <motion.div
      layoutId="card-peach"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.12 }}
      onClick={!editMode ? onToggle : undefined}
      style={{ cursor: editMode ? undefined : "pointer" }}
    >
      <CardWithTooltip
        tooltip={editMode ? undefined : "Click Me"}
        style={{ ...glassMixin, width: "min(300px, 78vw)", padding: "1.25rem 1.4rem", pointerEvents: editMode ? "none" : undefined }}
      >
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: "0.45rem", height: "0.45rem", background: "rgba(0,0,0,0.4)", display: "block" }} />
          ))}
        </div>
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.15)", margin: "0.6rem 0" }} />
        <p style={{ fontSize: "clamp(0.65rem,0.9vw,0.74rem)", lineHeight: 1.6, margin: 0, color: "rgba(0,0,0,0.68)", letterSpacing: "0.01em" }}>
          She is a 3rd year Computer Science student at the Georgia Institute of Technology, where she is developing end-to-end software solutions and experimenting with emerging technologies.
        </p>
      </CardWithTooltip>
    </motion.div>
  );
}

function AtCard({ revealed, editMode }: { revealed: boolean; editMode: boolean }) {
  const [held, setHeld] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0.22 }}
    >
      <CardWithTooltip
        tooltip={editMode ? undefined : "Hold Me"}
        onMouseDown={editMode ? undefined : () => setHeld(true)}
        onMouseUp={editMode ? undefined : () => setHeld(false)}
        onMouseLeave={editMode ? undefined : () => setHeld(false)}
        style={{
          ...glassMixin,
          width: "clamp(4rem,5.5vw,5.5rem)",
          height: "clamp(4rem,5.5vw,5.5rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "clamp(0.65rem,0.9vw,0.74rem)",
          fontWeight: 400,
          color: "rgba(0,0,0,0.68)",
          letterSpacing: "0.01em",
          cursor: editMode ? "inherit" : "default",
          pointerEvents: editMode ? "none" : undefined,
        }}
      >
        @
      </CardWithTooltip>
      <AnimatePresence>
        {!editMode && held && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: "absolute", bottom: "calc(100% + 16px)", left: "50%", transform: "translateX(-50%) rotate(5deg)", width: "min(380px, 88vw)", ...glassMixin, padding: "1.6rem 1.8rem", zIndex: 200, pointerEvents: "none" }}
          >
            <p style={{ fontSize: "clamp(0.65rem,0.9vw,0.74rem)", lineHeight: 1.8, margin: 0, color: "rgba(0,0,0,0.68)", letterSpacing: "0.01em" }}>
              Hello! Welcome to my software engineering portfolio! Thank you for taking the time to explore my page and I hope you stick around!
            </p>
            <span style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #fff" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GreenCard({ revealed, onAbout, editMode }: { revealed: boolean; onAbout: () => void; editMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1], delay: 0 }}
    >
      <CardWithTooltip
        tooltip={editMode ? undefined : "Click Me"}
        onClick={editMode ? undefined : onAbout}
        style={{ ...glassMixin, padding: "0.5rem 0.875rem", fontSize: "clamp(0.65rem,0.9vw,0.74rem)", color: "rgba(0,0,0,0.68)", letterSpacing: "0.01em", whiteSpace: "nowrap", cursor: editMode ? "inherit" : "default", pointerEvents: editMode ? "none" : undefined }}
      >
        About ↗
      </CardWithTooltip>
    </motion.div>
  );
}

// ─── Gallery Item ──────────────────────────────────────────────────────────────

function Lightbox({ imgs, startIdx, onClose }: { imgs: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((i) => (i + 1) % imgs.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 99998, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "1rem", overflow: "hidden", width: "min(900px, 92vw)", boxShadow: "0 32px 80px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 1.25rem", borderBottom: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, background: i === idx ? "#000" : "rgba(0,0,0,0.2)", transition: "background 0.2s" }} />
            ))}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", ...MONO, fontSize: "1rem", color: "#888", padding: "0.15rem 0.4rem", lineHeight: 1 }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#000")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#888")}>✕</button>
        </div>

        {/* Image area */}
        <div style={{ position: "relative", background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={idx}
              src={imgs[idx]}
              alt={`Screenshot ${idx + 1}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain", display: "block" }}
            />
          </AnimatePresence>
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "2.2rem", height: "2.2rem", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>‹</button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "2.2rem", height: "2.2rem", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>›</button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function GalleryItem({ project }: { project: (typeof PROJECTS)[0] }) {
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const imgs = "imgs" in project && project.imgs ? project.imgs as string[] : [project.img];
  const [imgIdx, setImgIdx] = useState(0);
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + imgs.length) % imgs.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % imgs.length); };

  return (
    <>
      <AnimatePresence>
        {lightbox && <Lightbox imgs={imgs} startIdx={imgIdx} onClose={() => setLightbox(false)} />}
      </AnimatePresence>
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ textAlign: "left", border: `1px solid ${hovered ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.1)"}`, borderRadius: "0.75rem", overflow: "hidden", padding: "0.75rem", transition: "border-color 0.25s ease, box-shadow 0.25s ease", boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div onClick={() => setLightbox(true)} style={{ overflow: "hidden", background: project.color, marginBottom: "clamp(0.875rem,1.8vw,1.5rem)", aspectRatio: "4 / 3.4", position: "relative", borderRadius: "0.4rem", cursor: "zoom-in" }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={imgs[imgIdx]}
            alt={`${project.title} screenshot ${imgIdx + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", transition: "transform 0.7s cubic-bezier(0.25,1,0.5,1)", transform: hovered ? "scale(1.04)" : "scale(1)", position: "absolute", inset: 0 }}
          />
        </AnimatePresence>
        {imgs.length > 1 && (
          <>
            <button onClick={prev} style={{ position: "absolute", left: "0.5rem", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "1.8rem", height: "1.8rem", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>‹</button>
            <button onClick={next} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "1.8rem", height: "1.8rem", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>›</button>
            <div style={{ position: "absolute", bottom: "0.6rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.3rem", zIndex: 10 }}>
              {imgs.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i); }} style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", border: "none", cursor: "pointer", padding: 0, background: i === imgIdx ? "#000" : "rgba(0,0,0,0.3)", transition: "background 0.2s" }} />
              ))}
            </div>
          </>
        )}
      </div>
      <div style={{ ...MONO, fontSize: "clamp(0.8rem,1.1vw,0.95rem)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000", marginBottom: "0.35rem", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "transform 0.35s ease" }}>
        {project.title}
      </div>
      <div style={{ ...SANS, fontSize: "clamp(0.6rem,1vw,0.68rem)", textTransform: "uppercase", letterSpacing: "0.12em", color: "#888", marginBottom: "0.55rem" }}>
        {project.category} · {project.year}
      </div>
      <p style={{ ...SANS, fontSize: "clamp(0.78rem,1.1vw,0.88rem)", lineHeight: 1.65, color: "#777", margin: "0 0 0.65rem 0", maxWidth: "92%" }}>
        {project.desc}
      </p>
      {"tags" in project && project.tags && (
        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
          {(project.tags as string[]).map((t) => (
            <span key={t} style={{ ...MONO, fontSize: "0.57rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", border: "1px solid rgba(0,0,0,0.13)", borderRadius: "0.25rem", padding: "0.15rem 0.45rem" }}>{t}</span>
          ))}
        </div>
      )}
    </div>
    </>
  );
}

// ─── Resume Modal ─────────────────────────────────────────────────────────────

function ResumeModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: "1rem", overflow: "hidden", width: "min(860px, 92vw)", height: "min(90vh, 1100px)", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }}>
          <div style={{ ...MONO, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666" }}>Ariun Bayasgalan · Resume</div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={() => {
                const byteChars = atob(RESUME_B64);
                const bytes = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
                const blob = new Blob([bytes], { type: "application/pdf" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "Ariun_Bayasgalan_Gatech28.pdf";
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 10000);
              }}
              style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#000", background: "none", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "0.35rem", padding: "0.35rem 0.8rem", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#000"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
            >
              ↓ Download
            </button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", ...MONO, fontSize: "1.1rem", color: "#888", padding: "0.2rem 0.4rem", lineHeight: 1, borderRadius: "0.25rem" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#000"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#888"; }}
            >
              ✕
            </button>
          </div>
        </div>
        {/* PDF iframe */}
        <iframe
          src={resumeUrl}
          style={{ flex: 1, border: "none", width: "100%" }}
          title="Ariun Bayasgalan Resume"
        />
      </motion.div>
    </motion.div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage({ onHome, onProjects }: { onHome: () => void; onProjects: () => void }) {
  const featured = PROJECTS[0];
  const [showResume, setShowResume] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      style={{ minHeight: "100vh", background: "#fff", paddingTop: "6rem" }}
    >
      <AnimatePresence>
        {showResume && <ResumeModal onClose={() => setShowResume(false)} />}
      </AnimatePresence>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(0.5rem,2vw,0.9rem) clamp(1rem,4vw,1.5rem)", ...MONO, fontSize: "clamp(0.6rem,1.4vw,0.72rem)", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid #000", color: "#000" }}>
        <button onClick={onHome} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer" }}>
          Ariun Bayasgalan
        </button>
        <div style={{ display: "flex", gap: "clamp(1rem,3vw,1.5rem)", alignItems: "center" }}>
          <button onClick={onProjects} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>Projects</button>
          <span style={{ opacity: 1 }}>About</span>
          <button onClick={() => setShowResume(true)} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>Resume</button>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 clamp(1.5rem,6vw,4rem)" }}>

        {/* Header with headshot */}
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "2.5rem", marginBottom: "3rem", display: "flex", alignItems: "center", gap: "2rem" }}>
          <img
            src={headshotSrc}
            alt="Ariun Bayasgalan"
            style={{ width: "clamp(80px,12vw,120px)", height: "clamp(80px,12vw,120px)", borderRadius: "50%", objectFit: "cover", objectPosition: "center top", flexShrink: 0, border: "2px solid rgba(0,0,0,0.08)" }}
          />
          <div>
            <p style={{ ...MONO, fontSize: "clamp(0.6rem,1.1vw,0.7rem)", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#aaa", margin: "0 0 0.75rem 0" }}>About</p>
            <h1 style={{ ...MONO, fontSize: "clamp(1.5rem,3.5vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "#000", margin: "0 0 0.5rem 0" }}>Ariun Bayasgalan</h1>
            <p style={{ ...MONO, fontSize: "clamp(0.7rem,1.2vw,0.82rem)", color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>Georgia Institute of Technology · CS '28</p>
          </div>
        </div>

        {/* Bio */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginBottom: "4rem" }}>
          <div>
            <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#bbb", margin: "0 0 1rem 0" }}>Background</p>
            <p style={{ ...SANS, fontSize: "clamp(0.82rem,1.2vw,0.95rem)", lineHeight: 1.8, color: "#333", margin: 0 }}>
              Ariun is a third-year CS student at Georgia Tech concentrating in Systems & Architecture and Information Internetworks. She cares about building software you can still reason about six months later that is fast, well-structured, and maintainable. Her experience in computer science spans academics, internships, research, and several hackathons.
            </p>
          </div>
          <div>
            <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#bbb", margin: "0 0 1rem 0" }}>Reach Out</p>
            <a href="https://www.linkedin.com/in/ariun-bayasgalan/" target="_blank" rel="noopener noreferrer" style={{ ...SANS, fontSize: "clamp(0.88rem,1.3vw,1rem)", color: "#333", textDecoration: "none", display: "block", marginBottom: "0.5rem" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#000")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#333")}>LinkedIn ↗</a>
            <a href="https://github.com/AriunBayasgalan" target="_blank" rel="noopener noreferrer" style={{ ...SANS, fontSize: "clamp(0.88rem,1.3vw,1rem)", color: "#333", textDecoration: "none", display: "block", marginBottom: "0.5rem" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#000")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#333")}>GitHub ↗</a>
            <a href="mailto:ariunbayasgalan0@gmail.com" style={{ ...SANS, fontSize: "clamp(0.88rem,1.3vw,1rem)", color: "#333", textDecoration: "none", display: "block" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#000")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#333")}>ariunbayasgalan0@gmail.com</a>
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "4.5rem" }}>
          <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#bbb", margin: "0 0 1.5rem 0" }}>Skills</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "2rem" }}>
            {SKILLS.map((s) => (
              <div key={s.group}>
                <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1rem", color: "#000", margin: "0 0 0.75rem 0", fontWeight: 600 }}>{s.group}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {s.items.map((item) => (
                    <li key={item} style={{ ...SANS, fontSize: "0.82rem", lineHeight: 2, color: "#666" }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: "4.5rem" }}>
          <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#bbb", margin: "0 0 1.5rem 0" }}>Experience</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* CACI */}
            <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", paddingLeft: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.2rem" }}>
                <p style={{ ...MONO, fontSize: "0.72rem", fontWeight: 600, color: "#000", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>CACI International, Inc.</p>
                <p style={{ ...MONO, fontSize: "0.62rem", color: "#aaa", margin: 0 }}>May 2026 – Present</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.75rem" }}>
                <p style={{ ...SANS, fontSize: "0.78rem", color: "#666", margin: 0, fontStyle: "italic" }}>Software Engineering, AI/ML Intern</p>
                <p style={{ ...MONO, fontSize: "0.62rem", color: "#bbb", margin: 0 }}>Denver, Colorado</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[
                  "Founded and led CACI's GraphRAG/Agentic prototyping team; designed 2+ end-to-end delivery frameworks for AI agents and MCP servers.",
                  "Architected GraphRAG MCPs and knowledge graphs using LangChain, Memgraph, Python, and H3 geospatial indexing for improved AI output quality.",
                  "Engineered 6+ data pipelines enabling AI systems to process large, previously unsearchable unstructured datasets.",
                ].map((b, i) => (
                  <li key={i} style={{ ...SANS, fontSize: "0.8rem", lineHeight: 1.65, color: "#555", paddingLeft: "0.85rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: "0.52em", width: "0.3rem", height: "0.3rem", background: "rgba(0,0,0,0.25)", borderRadius: "50%", display: "inline-block" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <p style={{ ...MONO, fontSize: "0.58rem", color: "#aaa", margin: "0.75rem 0 0 0", letterSpacing: "0.03em" }}>Python · PyTorch · LangChain · Memgraph · FastAPI · Docker · Azure · AWS</p>
            </div>

            {/* FIRST / MURF */}
            <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", paddingLeft: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.2rem" }}>
                <p style={{ ...MONO, fontSize: "0.72rem", fontWeight: 600, color: "#000", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>FIRST &amp; MURF Fellowship</p>
                <p style={{ ...MONO, fontSize: "0.62rem", color: "#aaa", margin: 0 }}>Aug 2024 – Dec 2025</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.75rem" }}>
                <p style={{ ...SANS, fontSize: "0.78rem", color: "#666", margin: 0, fontStyle: "italic" }}>Honors Undergraduate Researcher</p>
                <p style={{ ...MONO, fontSize: "0.62rem", color: "#bbb", margin: 0 }}>Golden, Colorado</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[
                  "Selected as 1 of ~60 freshmen for a $1,000 FIRST Fellowship and 1 of ~200 sophomores for a $1,500 MURF Fellowship.",
                  "Researched dimensional reduction's effect on 3rd-order topological complexity in Small Language Model full weight matrices post-training.",
                  "Investigated 5+ non-von Neumann quantum models for non-classical architectures under Dr. Lincoln Carr.",
                ].map((b, i) => (
                  <li key={i} style={{ ...SANS, fontSize: "0.8rem", lineHeight: 1.65, color: "#555", paddingLeft: "0.85rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: "0.52em", width: "0.3rem", height: "0.3rem", background: "rgba(0,0,0,0.25)", borderRadius: "50%", display: "inline-block" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <p style={{ ...MONO, fontSize: "0.58rem", color: "#aaa", margin: "0.75rem 0 0 0", letterSpacing: "0.03em" }}>Python · Topological Data Analysis · R · IBM Quisket · NumPy · PyTorch · Pandas</p>
            </div>

            {/* Cloud303 */}
            <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", paddingLeft: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.2rem" }}>
                <p style={{ ...MONO, fontSize: "0.72rem", fontWeight: 600, color: "#000", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cloud303, Inc.</p>
                <p style={{ ...MONO, fontSize: "0.62rem", color: "#aaa", margin: 0 }}>Dec 2024 – Nov 2025</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.75rem" }}>
                <p style={{ ...SANS, fontSize: "0.78rem", color: "#666", margin: 0, fontStyle: "italic" }}>Software Engineering Intern</p>
                <p style={{ ...MONO, fontSize: "0.62rem", color: "#bbb", margin: 0 }}>Denver, Colorado</p>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[
                  "Led implementation of a secure developer workspace by integrating Coder and AWS EC2, fulfilling a direct CEO initiative.",
                  "Deployed a compliant AWS environment for a European client's US market entry, reducing breach risk by 50%+ via data residency compliance.",
                  "Engineered an EV range predictive ML model via AWS SageMaker and Glue ETL for a trucking company's zero-emission goals.",
                  "Designed a secure AWS training and inference pipeline using PyTorch for auscultation sound classification.",
                ].map((b, i) => (
                  <li key={i} style={{ ...SANS, fontSize: "0.8rem", lineHeight: 1.65, color: "#555", paddingLeft: "0.85rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, top: "0.52em", width: "0.3rem", height: "0.3rem", background: "rgba(0,0,0,0.25)", borderRadius: "50%", display: "inline-block" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <p style={{ ...MONO, fontSize: "0.58rem", color: "#aaa", margin: "0.75rem 0 0 0", letterSpacing: "0.03em" }}>Python · TensorFlow · PyTorch · Terraform · CloudFormation · OpenTofu · Docker · AWS · AWS SDK (Boto3)</p>
              <p style={{ ...MONO, fontSize: "0.58rem", color: "#aaa", margin: "0.35rem 0 0 0", letterSpacing: "0.03em" }}>Cloud compute and Containers (EC2, ECS, Lambda, Batch) · Data and ML (SageMaker, Glue ETL, DynamoDB, S3, RDS) · DevOps and Security (CodePipeline, CodeBuild, API Gateway, EventBridge, GuardDuty, CloudTrail, VPC)</p>
            </div>

          </div>
        </div>

        {/* Quote */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "3rem 0", marginBottom: "4.5rem", textAlign: "center" }}>
          <p style={{ ...SERIF, fontSize: "clamp(1.2rem,2.5vw,1.75rem)", lineHeight: 1.5, color: "#1a1a1a", fontWeight: 300, fontStyle: "italic", margin: 0, maxWidth: 680, marginLeft: "auto", marginRight: "auto" }}>
            "I care about writing software that holds together under pressure - clean abstractions, thoughtful APIs, and systems you can reason about at 2am."
          </p>
        </div>

        {/* Most Recent Project */}
        <div style={{ marginBottom: "5rem" }}>
          <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#bbb", margin: "0 0 1.5rem 0" }}>Most Recent Project</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "start", background: featured.color, borderRadius: "1rem", overflow: "hidden" }}>
            <img src={featured.img} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 240 }} />
            <div style={{ padding: "2rem 2rem 2rem 0" }}>
              <p style={{ ...MONO, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#888", margin: "0 0 0.5rem 0" }}>{featured.category} · {featured.year}</p>
              <h2 style={{ ...MONO, fontSize: "clamp(1rem,2vw,1.4rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "#000", margin: "0 0 1rem 0" }}>{featured.title}</h2>
              <p style={{ ...SANS, fontSize: "0.88rem", lineHeight: 1.7, color: "#555", margin: "0 0 1.25rem 0" }}>{featured.desc}</p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {featured.tags?.map((t) => (
                  <span key={t} style={{ ...MONO, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#777", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "0.25rem", padding: "0.15rem 0.4rem" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resume card */}
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ ...MONO, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#bbb", margin: "0 0 1.25rem 0" }}>Resume</p>
          <div
            onClick={() => setShowResume(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "1rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "0.75rem", padding: "1rem 1.5rem", color: "#000", background: "#fff", cursor: "pointer", transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="27" height="35" rx="3.5" fill="white" stroke="#ddd"/>
              <rect x="4" y="4" width="14" height="2" rx="1" fill="#ccc"/>
              <rect x="4" y="9" width="20" height="2" rx="1" fill="#ccc"/>
              <rect x="4" y="14" width="20" height="2" rx="1" fill="#ccc"/>
              <rect x="4" y="19" width="14" height="2" rx="1" fill="#ccc"/>
              <rect x="16" y="24" width="8" height="8" rx="2" fill="#111"/>
              <text x="20" y="30.5" textAnchor="middle" fill="white" fontSize="5" fontFamily="monospace" fontWeight="700">PDF</text>
            </svg>
            <div>
              <div style={{ ...MONO, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Ariun Bayasgalan</div>
              <div style={{ ...MONO, fontSize: "0.58rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>Resume · Georgia Tech CS '28</div>
            </div>
            <span style={{ marginLeft: "auto", ...MONO, fontSize: "0.9rem", color: "#888" }}>↗</span>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", paddingBottom: "5rem" }}>
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "3rem" }}>
            <button
              onClick={onHome}
              style={{ ...MONO, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1rem", color: "#000", background: "none", border: "1px solid rgba(0,0,0,0.25)", borderRadius: "0.4rem", padding: "0.65rem 1.5rem", cursor: "pointer", transition: "border-color 0.2s, background 0.2s, color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#000"; (e.currentTarget as HTMLElement).style.background = "#000"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.25)"; (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Cursive Intro ────────────────────────────────────────────────────────────

function CursiveIntro({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(9rem, 22vw, 18rem)",
              fontWeight: 700,
              color: "#111",
              lineHeight: 1,
              animation: "cursive-write 1.4s cubic-bezier(0.4,0,0.2,1) forwards",
              clipPath: "inset(0 100% 0 0)",
            }}
          >
            Ariun
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ onAbout, onProjects }: { onAbout: () => void; onProjects: () => void }) {
  const [phase, setPhase] = useState<"loading" | "name" | "full">("loading");
  const [showIntro, setShowIntro] = useState(true);
  const [bioVisible, setBioVisible] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [tick, setTick] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [orangeDocked, setOrangeDocked] = useState(false);
  const [peachDocked, setPeachDocked] = useState(false);
  const DEFAULT_POSITIONS: CardPositions = {
    orange: { top: 27.85, left: 26.35 },
    peach:  { top: 46.0, left: 56.65 },
    at:     { top: 63.25, left: 21.95 },
    green:  { top: 29.4, left: 73.05 },
  };
  const [positions, setPositions] = useState<CardPositions>(DEFAULT_POSITIONS);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.key !== "E") return;
      if (editMode) {
        localStorage.setItem("card-positions", JSON.stringify(positions));
        setEditMode(false);
        return;
      }
      const pw = window.prompt("Password:");
      if (pw === "ariun2028") setEditMode(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editMode, positions]);

  const makeDragHandler = (id: keyof CardPositions) => (e: React.PointerEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...positions[id] };
    const hero = heroRef.current;
    if (!hero) return;
    const { width, height } = hero.getBoundingClientRect();

    const onMove = (me: PointerEvent) => {
      const dx = ((me.clientX - startX) / width) * 100;
      const dy = ((me.clientY - startY) / height) * 100;
      setPositions(prev => ({
        ...prev,
        [id]: {
          top:  Math.max(0, Math.min(90, startPos.top  + dy)),
          left: Math.max(0, Math.min(88, startPos.left + dx)),
        },
      }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setPositions(prev => ({
        ...prev,
        [id]: {
          top:  Math.round(prev[id].top  * 10) / 10,
          left: Math.round(prev[id].left * 10) / 10,
        },
      }));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const BIO = "CS student & builder at Georgia Tech exploring systems, full-stack development, and the tools that make software feel inevitable. Seeking software engineering internships for Summer 2025.";

  const restartAnimation = () => {
    window.scrollTo(0, 0);
    setShowIntro(true);
    setPhase("loading");
    setBioVisible(false);
    setBioText("");
    setTick((t) => t + 1);
  };

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const ti = setTimeout(() => setShowIntro(false), 1800);
    const t1 = setTimeout(() => setPhase("name"), 2200);
    const t2 = setTimeout(() => setPhase("full"), 3400);
    const t3 = setTimeout(() => setBioVisible(true), 4500);
    return () => { clearTimeout(ti); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [tick]);

  useEffect(() => {
    if (!bioVisible) return;
    let i = 0;
    setBioText("");
    const iv = setInterval(() => { i++; setBioText(BIO.slice(0, i)); if (i >= BIO.length) clearInterval(iv); }, 36);
    return () => clearInterval(iv);
  }, [bioVisible]);

  const revealed = phase === "full";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {showResume && <ResumeModal onClose={() => setShowResume(false)} />}
      </AnimatePresence>

      {/* Docked card overlays — fixed under nav */}
      <AnimatePresence>
        {orangeDocked && (
          <motion.div key="orange-docked" style={{ position: "absolute", top: "clamp(42px,7vw,52px)", left: "clamp(1rem,2vw,1.5rem)", zIndex: 9990 }}>
            <OrangeCard revealed={true} editMode={false} onToggle={() => setOrangeDocked(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {peachDocked && (
          <motion.div key="peach-docked" style={{ position: "absolute", top: "clamp(42px,7vw,52px)", right: "clamp(1rem,2vw,1.5rem)", zIndex: 9990 }}>
            <PeachCard revealed={true} editMode={false} onToggle={() => setPeachDocked(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <CursiveIntro show={showIntro} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(0.5rem,2vw,0.9rem) clamp(1rem,4vw,1.5rem)", ...MONO, fontSize: "clamp(0.6rem,1.4vw,0.72rem)", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", borderBottom: "1px solid #000", color: "#000", opacity: revealed ? 1 : 0, transition: "opacity 1s ease" }}>
        <button onClick={restartAnimation} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer" }}>Ariun Bayasgalan</button>
        <div style={{ display: "flex", gap: "clamp(1rem,3vw,1.5rem)" }}>
          <button onClick={onProjects} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>Projects</button>
          <button onClick={onAbout} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>About</button>
          <button onClick={() => setShowResume(true)} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>Resume</button>
        </div>
      </nav>

      {/* Edit mode position readout */}
      {editMode && (
        <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 99999, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)", borderRadius: "0.75rem", padding: "1rem 1.4rem", ...MONO, fontSize: "0.62rem", color: "#fff", display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 260 }}>
          <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: "0.3rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Drag cards to reposition</div>
          {(Object.entries(positions) as [keyof CardPositions, {top:number;left:number}][]).map(([id, pos]) => (
            <div key={id} style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem" }}>
              <span style={{ color: "rgba(59,130,246,0.9)", textTransform: "uppercase" }}>{id}</span>
              <span style={{ color: "rgba(255,255,255,0.75)" }}>top: {pos.top.toFixed(1)}% · left: {pos.left.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Hero ── */}
      <section id="hero" ref={heroRef as React.RefObject<HTMLElement>} style={{ position: "relative", width: "100%", height: "clamp(30rem, 58vh, 52rem)", overflow: "hidden", background: "#fff" }}>

        {/* Cursive name — persists behind cards after intro */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: "'Dancing Script', cursive", fontSize: "clamp(9rem, 22vw, 18rem)", fontWeight: 700, color: "#ebebeb", pointerEvents: "none", zIndex: 2, userSelect: "none", whiteSpace: "nowrap", opacity: showIntro ? 0 : 1, transition: "opacity 0.7s ease 0.2s" }}>
          Ariun
        </div>

        {/* Hero name */}
        <div style={{ position: "absolute", top: "calc(50% - 16px)", left: "50%", transform: "translate(-50%,-50%)", zIndex: 6, width: "min(43vw,620px)", textAlign: "right", pointerEvents: "none" }}>
          <div style={{ ...MONO, fontSize: "clamp(0.72rem,1.1vw,1rem)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.07em", color: "#000", marginTop: "clamp(-8rem,-12vw,-9rem)", marginRight: "clamp(1.5rem,4vw,4.5rem)", opacity: phase !== "loading" ? 0.82 : 0, transition: "opacity 1s ease" }}>
            Ariun Bayasgalan
          </div>
        </div>

        {/* Cards */}
        {!isMobile && (
          <>
            {(["orange","peach","at","green"] as (keyof CardPositions)[]).map((id) => {
              const pos = positions[id];
              const isActive = editMode;
              return (
                <div
                  key={id}
                  onPointerDown={makeDragHandler(id)}
                  style={{
                    position: "absolute",
                    top: `${pos.top}%`,
                    left: `${pos.left}%`,
                    zIndex: isActive ? 500 : 10,
                    cursor: isActive ? "grab" : undefined,
                    userSelect: "none",
                    touchAction: "none",
                  }}
                >
                  {editMode && (
                    <div style={{ position: "absolute", inset: -4, border: "2px dashed rgba(59,130,246,0.55)", borderRadius: "1.4rem", pointerEvents: "none", zIndex: 1 }}>
                      <span style={{ position: "absolute", top: -18, left: 4, fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(59,130,246,0.8)", whiteSpace: "nowrap" }}>
                        {id} · {pos.top.toFixed(1)}% {pos.left.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {id === "orange" && !orangeDocked && <OrangeCard revealed={revealed} editMode={editMode} onToggle={() => setOrangeDocked(true)} />}
                  {id === "peach"  && !peachDocked  && <PeachCard  revealed={revealed} editMode={editMode} onToggle={() => setPeachDocked(true)} />}
                  {id === "at"     && <AtCard     revealed={revealed} editMode={editMode} />}
                  {id === "green"  && <GreenCard  revealed={revealed} onAbout={onAbout} editMode={editMode} />}
                </div>
              );
            })}
          </>
        )}

        {isMobile && revealed && (
          <div style={{ position: "absolute", bottom: "4rem", left: "1rem", right: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ ...glassMixin, padding: "0.875rem 1rem", fontSize: "0.78rem", lineHeight: 1.4 }}>Seeking SWE internships — Summer 2025</div>
            <div style={{ ...glassMixin, padding: "0.875rem 1rem", fontSize: "0.78rem", lineHeight: 1.4 }}>CS @ Georgia Tech</div>
          </div>
        )}

        {revealed && (
          <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", ...MONO, fontSize: "1.1rem", color: "#000", zIndex: 20, opacity: 0.35, animation: "bounce-arrow 2s infinite" }}>↓</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "#000", opacity: revealed ? 0.1 : 0, transition: "opacity 1s ease" }} />
      </section>

      {/* ── Projects ── */}
      <section id="projects" style={{ padding: "clamp(3.5rem,9vw,7rem) 5%", background: "#fff", minHeight: "100vh", opacity: revealed ? 1 : 0, filter: revealed ? "blur(0)" : "blur(12px)", transition: "opacity 1.2s ease, filter 1.2s ease" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(1.5rem,4vw,4rem)", alignItems: "flex-start" }}>

          {/* Sidebar */}
          <aside style={{ width: "min(200px,100%)", position: "sticky", top: "clamp(4rem,10vw,6rem)", flexShrink: 0 }}>
            <h1 style={{ ...MONO, fontSize: "clamp(0.78rem,1.4vw,0.95rem)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06rem", color: "#000", margin: "0 0 0.75rem 0", lineHeight: 1.3 }}>
              Ariun Bayasgalan
            </h1>
            <p style={{ ...SANS, fontSize: "clamp(0.6rem,1vw,0.68rem)", lineHeight: 1.65, color: "#888", margin: "0 0 clamp(1.5rem,5vw,2.5rem) 0" }}>
              Georgia Institute of Technology<br />
              Computer Science '28<br />
              <br />
              <span style={{ color: "#bbb" }}>Concentrations:</span><br />
              Systems &amp; Architecture<br />
              Information Internetworks
            </p>

            {SKILLS.map((s) => (
              <div key={s.group} style={{ marginBottom: "1.25rem" }}>
                <h4 style={{ ...MONO, fontSize: "clamp(0.55rem,1vw,0.62rem)", textTransform: "uppercase", letterSpacing: "0.09rem", color: "#000", margin: "0 0 0.5rem 0", fontWeight: 500 }}>{s.group}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {s.items.map((item) => (
                    <li key={item} style={{ ...SANS, fontSize: "clamp(0.55rem,0.9vw,0.62rem)", lineHeight: 1.9, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.03rem" }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          <div style={{ width: 1, background: "rgba(0,0,0,0.12)", alignSelf: "stretch", minHeight: "2rem", flexShrink: 0, display: isMobile ? "none" : "block" }} />

          {/* Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(2rem,5vw,4.5rem)" }}>
              {PROJECTS.map((p) => <GalleryItem key={p.id} project={p} />)}
            </div>
            <div style={{ marginTop: "clamp(3rem,6vw,5rem)", paddingTop: "2.5rem", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "center" }}>
              <button
                onClick={onProjects}
                style={{ ...MONO, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#000", background: "none", border: "1px solid rgba(0,0,0,0.25)", borderRadius: "0.4rem", padding: "0.75rem 2rem", cursor: "pointer", transition: "border-color 0.2s, background 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#000"; (e.currentTarget as HTMLElement).style.background = "#000"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.25)"; (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
              >
                More Projects ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.1)", padding: "clamp(4rem,10vw,8rem) 10% clamp(2.5rem,6vw,4.5rem)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", ...MONO, fontSize: "clamp(0.6rem,1.1vw,0.7rem)", letterSpacing: "0.06rem", textTransform: "uppercase" }}>
          <div>
            <p style={{ margin: "0 0 0.4rem 0", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>© 2026 ARIUN BAYASGALAN. ALL RIGHTS RESERVED.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p style={{ ...MONO, fontSize: "clamp(0.78rem,1.1vw,0.88rem)", color: "#888", margin: "0 0 0.75rem 0" }}>Connect</p>
            {[
              { label: "Email", href: "mailto:ariunbayasgalan0@gmail.com" },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/ariun-bayasgalan/" },
              { label: "GitHub", href: "https://github.com/AriunBayasgalan" },
            ].map(({ label, href }) => (
              <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#888", textDecoration: "none", fontSize: "clamp(0.78rem,1.1vw,0.88rem)", transition: "color 0.25s ease" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#000")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#888")}
            >{label}</a>
            ))}
            <button onClick={() => setShowResume(true)} style={{ background: "none", border: "none", padding: 0, color: "#888", fontSize: "clamp(0.78rem,1.1vw,0.88rem)", fontFamily: "inherit", letterSpacing: "inherit", textTransform: "inherit", transition: "color 0.25s ease", cursor: "pointer", textAlign: "left" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#000")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#888")}>Resume</button>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

// ─── Projects Page ─────────────────────────────────────────────────────────────

function ProjectsPage({ onHome, onAbout }: { onHome: () => void; onAbout: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      style={{ minHeight: "100vh", background: "#fff", paddingTop: "6rem" }}
    >
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "clamp(0.5rem,2vw,0.9rem) clamp(1rem,4vw,1.5rem)", ...MONO, fontSize: "clamp(0.6rem,1.4vw,0.72rem)", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid #000", color: "#000" }}>
        <button onClick={onHome} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer" }}>
          Ariun Bayasgalan
        </button>
        <div style={{ display: "flex", gap: "clamp(1rem,3vw,1.5rem)" }}>
          <span style={{ opacity: 1 }}>Projects</span>
          <button onClick={onAbout} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>About</button>
          <button onClick={() => window.open(resumeUrl, "_blank")} style={{ background: "none", border: "none", padding: 0, ...MONO, fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "#000", cursor: "pointer", opacity: 0.65, transition: "opacity 0.2s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.65")}>Resume</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(1.5rem,6vw,4rem)" }}>

        {/* Header */}
        <div style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", paddingBottom: "2.5rem", marginBottom: "4rem" }}>
          <p style={{ ...MONO, fontSize: "clamp(0.6rem,1.1vw,0.7rem)", textTransform: "uppercase", letterSpacing: "0.12rem", color: "#aaa", margin: "0 0 0.75rem 0" }}>All Projects</p>
          <h1 style={{ ...MONO, fontSize: "clamp(1.5rem,3.5vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "#000", margin: 0 }}>Projects</h1>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(2rem,5vw,4.5rem)", marginBottom: "6rem" }}>
          {PROJECTS.map((p) => <GalleryItem key={p.id} project={p} />)}
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", paddingBottom: "5rem", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "3rem" }}>
          <button
            onClick={onHome}
            style={{ ...MONO, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1rem", color: "#000", background: "none", border: "1px solid rgba(0,0,0,0.25)", borderRadius: "0.4rem", padding: "0.65rem 1.5rem", cursor: "pointer", transition: "border-color 0.2s, background 0.2s, color 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#000"; (e.currentTarget as HTMLElement).style.background = "#000"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.25)"; (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#000"; }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<"home" | "about" | "projects">("home");

  const goHome = () => { setPage("home"); window.scrollTo(0, 0); };
  const goAbout = () => { setPage("about"); window.scrollTo(0, 0); };
  const goProjects = () => { setPage("projects"); window.scrollTo(0, 0); };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: #fff; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes bounce-arrow {
          0%,20%,50%,80%,100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-9px); }
          60% { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes cursive-write {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {page === "home" ? (
          <HomePage key="home" onAbout={goAbout} onProjects={goProjects} />
        ) : page === "about" ? (
          <AboutPage key="about" onHome={goHome} onProjects={goProjects} />
        ) : (
          <ProjectsPage key="projects" onHome={goHome} onAbout={goAbout} />
        )}
      </AnimatePresence>
    </>
  );
}
