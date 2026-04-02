import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const T = {
  bg:"#060b18", surface:"rgba(13,21,38,0.97)", border:"rgba(129,140,248,0.15)",
  accent:"#818cf8", accent2:"#34d399", text:"#e2e8f0", muted:"#64748b", danger:"#f87171",
};

function pwStrength(pw) {
  let s=0;
  if(pw.length>=6)  s++;
  if(pw.length>=10) s++;
  if(/[A-Z]/.test(pw)) s++;
  if(/[0-9]/.test(pw)) s++;
  if(/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s,4);
}
const SL = ["","Weak","Fair","Good","Strong"];
const SC = ["","#f87171","#fbbf24","#38bdf8","#34d399"];

export default function Register() {
  const [form,    setForm]    = useState({ name:"", email:"", password:"" });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const navigate = useNavigate();
  const strength = pwStrength(form.password);

  const set = k => e => setForm(f => ({...f,[k]:e.target.value}));

  const handleRegister = async () => {
    setError(""); setSuccess(""); setLoading(true);
    if (!form.name||!form.email||!form.password) { setError("All fields are required"); setLoading(false); return; }
    if (form.password.length<6)                  { setError("Password must be at least 6 characters"); setLoading(false); return; }
    try {
      const res = await fetch("https://cloudcatalog.onrender.com/register", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
        setSuccess("Account created! Redirecting to dashboard…");
        setTimeout(() => navigate("/dashboard"), 1400);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running on port 5000.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px", borderRadius:12,
    border:`1px solid ${T.border}`, background:"rgba(255,255,255,0.04)",
    color:T.text, fontSize:14, outline:"none", fontFamily:"DM Sans,sans-serif",
    transition:"border 0.2s, box-shadow 0.2s",
  };
  const fi = e => { e.target.style.borderColor="rgba(129,140,248,0.5)"; e.target.style.boxShadow="0 0 0 3px rgba(129,140,248,0.08)"; };
  const fb = e => { e.target.style.borderColor=T.border; e.target.style.boxShadow="none"; };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`radial-gradient(ellipse 80% 70% at 50% -20%, rgba(129,140,248,0.13), transparent), ${T.bg}`,
      padding:20, position:"relative", overflow:"hidden" }}>

      {[{w:420,h:420,top:-100,right:-80,color:"129,140,248"},{w:300,h:300,bottom:-60,left:-60,color:"52,211,153"}].map((o,i)=>(
        <div key={i} style={{ position:"absolute", width:o.w, height:o.h, borderRadius:"50%",
          background:`radial-gradient(circle,rgba(${o.color},0.08) 0%,transparent 70%)`,
          top:o.top,right:o.right,bottom:o.bottom,left:o.left,pointerEvents:"none" }} />
      ))}

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:24,
        padding:"44px 40px", width:"100%", maxWidth:430,
        boxShadow:"0 24px 80px rgba(0,0,0,0.7)", backdropFilter:"blur(20px)", position:"relative", zIndex:1 }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28 }}>
          <div style={{ width:40, height:40, borderRadius:11,
            background:"linear-gradient(135deg,#818cf8,#34d399)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>☁️</div>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:17,
              background:"linear-gradient(135deg,#818cf8,#34d399)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CloudCatalog</div>
            <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>Intelligent Cloud Platform</div>
          </div>
        </div>

        <h1 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:26, color:T.text, marginBottom:6 }}>Create account</h1>
        <p  style={{ color:T.muted, fontSize:14, marginBottom:22 }}>Start exploring cloud services for free</p>

        {/* Feature pills */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
          {["✅ 12+ AWS Services","🤖 Chintu AI","📊 Live Dashboard","🔐 JWT Secured"].map(p=>(
            <div key={p} style={{ padding:"7px 10px", background:"rgba(255,255,255,0.025)",
              border:`1px solid rgba(129,140,248,0.1)`, borderRadius:8, fontSize:12, color:T.muted }}>{p}</div>
          ))}
        </div>

        {error   && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", color:T.danger,    borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16 }}>⚠️ {error}</div>}
        {success && <div style={{ background:"rgba(52,211,153,0.08)",  border:"1px solid rgba(52,211,153,0.25)",  color:"#34d399", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16 }}>✅ {success}</div>}

        {/* Name */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#94a3b8", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase" }}>Full Name</label>
          <input style={inputStyle} type="text" placeholder="John Doe"
            value={form.name} onChange={set("name")} onFocus={fi} onBlur={fb}
            onKeyDown={e=>e.key==="Enter"&&handleRegister()} />
        </div>

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#94a3b8", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase" }}>Email Address</label>
          <input style={inputStyle} type="email" placeholder="you@example.com"
            value={form.email} onChange={set("email")} onFocus={fi} onBlur={fb}
            onKeyDown={e=>e.key==="Enter"&&handleRegister()} />
        </div>

        {/* Password */}
        <div style={{ marginBottom:24 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#94a3b8", marginBottom:7, letterSpacing:"0.06em", textTransform:"uppercase" }}>Password</label>
          <div style={{ position:"relative" }}>
            <input style={inputStyle} type={showPw?"text":"password"} placeholder="Min. 6 characters"
              value={form.password} onChange={set("password")} onFocus={fi} onBlur={fb}
              onKeyDown={e=>e.key==="Enter"&&handleRegister()} />
            <button onClick={()=>setShowPw(p=>!p)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:16, padding:0 }}>
              {showPw?"🙈":"👁️"}
            </button>
          </div>
          {form.password && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:"flex", gap:4 }}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{ flex:1, height:3, borderRadius:2, transition:"background 0.3s",
                    background: i<=strength ? SC[strength] : "rgba(255,255,255,0.07)" }} />
                ))}
              </div>
              <div style={{ fontSize:11, color:SC[strength], marginTop:4 }}>{SL[strength]} password</div>
            </div>
          )}
        </div>

        <button onClick={handleRegister} disabled={loading}
          style={{ width:"100%", padding:14, borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#818cf8,#34d399)",
            color:"white", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer",
            opacity:loading?0.7:1, fontFamily:"Syne,sans-serif", transition:"all 0.2s" }}
          onMouseEnter={e=>{if(!loading){e.target.style.opacity="0.9";e.target.style.transform="translateY(-1px)";}}}
          onMouseLeave={e=>{e.target.style.opacity="1";e.target.style.transform="none";}}>
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <div style={{ textAlign:"center", marginTop:22, fontSize:14, color:T.muted }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:T.accent, textDecoration:"none", fontWeight:600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
