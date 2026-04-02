import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const T = {
  bg: "#060b18", surface: "rgba(13,21,38,0.97)", border: "rgba(56,189,248,0.15)",
  accent: "#38bdf8", accent2: "#818cf8", text: "#e2e8f0", muted: "#64748b",
  danger: "#f87171", accent3: "#34d399",
};

export default function Login() {
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch("https://cloudcatalog.onrender.com/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running on port 5000.");
    }
    setLoading(false);
  };

  // Demo: bypass backend entirely
  const handleDemo = () => {
    const fakeToken = "demo_token_" + Date.now();
    const fakeUser  = { id:0, name:"Demo User", email:"demo@cloudcatalog.ai", role:"user" };
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user",  JSON.stringify(fakeUser));
    navigate("/dashboard");
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px", borderRadius:12,
    border:`1px solid ${T.border}`, background:"rgba(255,255,255,0.04)",
    color:T.text, fontSize:14, outline:"none", fontFamily:"DM Sans,sans-serif",
    transition:"border 0.2s, box-shadow 0.2s",
  };
  const focusIn  = e => { e.target.style.borderColor="rgba(56,189,248,0.5)"; e.target.style.boxShadow="0 0 0 3px rgba(56,189,248,0.08)"; };
  const focusOut = e => { e.target.style.borderColor=T.border;               e.target.style.boxShadow="none"; };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(ellipse 80% 70% at 50% -20%, rgba(56,189,248,0.13), transparent), ${T.bg}`,
      padding:20, position:"relative", overflow:"hidden" }}>

      {/* Decorative orbs */}
      {[
        {w:500,h:500,top:-120,left:-120,color:"56,189,248"},
        {w:350,h:350,bottom:-80,right:-80,color:"129,140,248"},
      ].map((o,i) => (
        <div key={i} style={{ position:"absolute", width:o.w, height:o.h, borderRadius:"50%",
          background:`radial-gradient(circle, rgba(${o.color},0.07) 0%, transparent 70%)`,
          top:o.top, left:o.left, bottom:o.bottom, right:o.right, pointerEvents:"none" }} />
      ))}

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:24,
        padding:"48px 40px", width:"100%", maxWidth:430,
        boxShadow:"0 24px 80px rgba(0,0,0,0.7)", backdropFilter:"blur(20px)", position:"relative", zIndex:1 }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:40, height:40, borderRadius:11,
            background:"linear-gradient(135deg,#38bdf8,#818cf8)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>☁️</div>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:17,
              background:"linear-gradient(135deg,#38bdf8,#818cf8)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CloudCatalog</div>
            <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>Intelligent Cloud Platform</div>
          </div>
        </div>

        <h1 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:26, color:T.text, marginBottom:6 }}>Welcome back</h1>
        <p  style={{ color:T.muted, fontSize:14, marginBottom:30 }}>Sign in to your cloud dashboard</p>

        {/* DB status badge */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:22, padding:"8px 12px",
          background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:8, fontSize:12, color:"#34d399" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", display:"inline-block" }} />
          Connected to AWS EC2 backend + RDS MySQL
        </div>

        {error && (
          <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)",
            color:T.danger, borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:18 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#94a3b8",
            marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase" }}>Email Address</label>
          <input style={inputStyle} type="email" placeholder="you@example.com"
            value={form.email} onChange={set("email")}
            onFocus={focusIn} onBlur={focusOut}
            onKeyDown={e => e.key==="Enter" && handleLogin()} />
        </div>

        {/* Password */}
        <div style={{ marginBottom:24 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#94a3b8",
            marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase" }}>Password</label>
          <div style={{ position:"relative" }}>
            <input style={inputStyle} type={showPw?"text":"password"} placeholder="••••••••"
              value={form.password} onChange={set("password")}
              onFocus={focusIn} onBlur={focusOut}
              onKeyDown={e => e.key==="Enter" && handleLogin()} />
            <button onClick={() => setShowPw(p=>!p)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:16, padding:0 }}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Sign In */}
        <button onClick={handleLogin} disabled={loading}
          style={{ width:"100%", padding:14, borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#38bdf8,#818cf8)",
            color:"white", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer",
            opacity:loading?0.7:1, fontFamily:"Syne,sans-serif", letterSpacing:"0.02em",
            transition:"all 0.2s" }}
          onMouseEnter={e=>{if(!loading){e.target.style.opacity="0.9";e.target.style.transform="translateY(-1px)";}}}
          onMouseLeave={e=>{e.target.style.opacity="1";e.target.style.transform="none";}}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
          <div style={{ flex:1, height:1, background:"rgba(99,179,237,0.1)" }} />
          <span style={{ color:T.muted, fontSize:12 }}>or</span>
          <div style={{ flex:1, height:1, background:"rgba(99,179,237,0.1)" }} />
        </div>

        {/* Demo */}
        <button onClick={handleDemo}
          style={{ width:"100%", padding:12, borderRadius:12,
            border:`1px solid ${T.border}`, background:"transparent",
            color:T.muted, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor="rgba(56,189,248,0.35)";e.target.style.color=T.accent;}}
          onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}>
          🚀 Continue with Demo Account (no server needed)
        </button>

        <div style={{ textAlign:"center", marginTop:24, fontSize:14, color:T.muted }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color:T.accent, textDecoration:"none", fontWeight:600 }}>Create one free</Link>
        </div>
      </div>
    </div>
  );
}
