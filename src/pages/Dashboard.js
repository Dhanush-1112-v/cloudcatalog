import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#060b18", surface:"#0d1526", surface2:"#121e35",
  border:"rgba(99,179,237,0.12)", accent:"#38bdf8", accent2:"#818cf8",
  accent3:"#34d399", text:"#e2e8f0", muted:"#64748b",
  danger:"#f87171", warning:"#fbbf24",
};

const CATEGORIES = ["All","Compute","Storage","Database","Serverless","Networking","Containers","AI/ML","Messaging"];
const CAT_COLOR  = { Compute:"#38bdf8", Storage:"#818cf8", Database:"#34d399", Serverless:"#fbbf24",
  Networking:"#f87171", Containers:"#06b6d4", "AI/ML":"#a78bfa", Messaging:"#fb923c" };

const AI_CHIPS = [
  "Best service for storage?","How do I run serverless?","Which DB for high traffic?",
  "How does CloudFront work?","Cheapest compute option?","What is SageMaker?",
];

// ─── API HELPER ───────────────────────────────────────────────────────────────
function api(path, opts={}) {
  const token = localStorage.getItem("token");
  return fetch(`http://localhost:5000${path}`, {
    ...opts,
    headers: {
      "Content-Type":"application/json",
      ...(token ? { Authorization:`Bearer ${token}` } : {}),
      ...(opts.headers||{}),
    },
  }).then(r => r.json());
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab,      setTab]      = useState("catalog");
  const [services, setServices] = useState([]);
  const [stats,    setStats]    = useState({ totalServices:0, totalCategories:0, totalUsers:0 });
  const [health,   setHealth]   = useState(null);
  const [category, setCategory] = useState("All");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([
    { from:"bot", text:"👋 Hi! I'm **Chintu AI**, your intelligent cloud advisor running on AWS EC2. Ask me anything about cloud services!" }
  ]);
  const [aiInput,  setAiInput]  = useState("");
  const [aiLoading,setAiLoading]= useState(false);
  const [svcLoad,  setSvcLoad]  = useState(true);
  const chatRef  = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"User","email":""}');

  // Fetch health + stats once
  useEffect(() => {
    api("/health").then(setHealth).catch(()=>setHealth(null));
    api("/stats" ).then(setStats ).catch(()=>{});
  }, []);

  // Fetch services whenever filter changes
  const loadServices = useCallback(() => {
    setSvcLoad(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (search)             params.set("search",   search);
    api(`/services?${params}`)
      .then(data => { setServices(Array.isArray(data) ? data : []); setSvcLoad(false); })
      .catch(()  => { setSvcLoad(false); });
  }, [category, search]);

  useEffect(() => { loadServices(); }, [loadServices]);

  // Auto-scroll chat
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const askAI = async (q) => {
  const question = (q || aiInput).trim();
  if (!question || aiLoading) return;

  setMessages(m => [...m, { from:"user", text:question }]);
  setAiInput("");
  setAiLoading(true);

  try {
    const data = await api("/api/ai", {
      method:"POST",
      body: JSON.stringify({ message: question })
    });

    setMessages(m => [
      ...m,
      {
        from:"bot",
        text: data.reply || "No response",
        related: data.relatedServices || []
      }
    ]);
  } catch {
    setMessages(m => [
      ...m,
      {
        from:"bot",
        text:"⚠️ Could not reach AI. Make sure the backend is running."
      }
    ]);
  }

  setAiLoading(false);
};
  // Render **bold** markdown
  const md = t => ({ __html: (t||"").replace(/\*\*(.*?)\*\*/g,'<strong style="color:#38bdf8">$1</strong>') });

  // ── SIDEBAR NAV ────────────────────────────────────────────────────────────
  const navItems = [
    { id:"catalog", icon:"🗂️", label:"Service Catalog" },
    { id:"ai",      icon:"🤖", label:"Chintu AI" },
    { id:"stats",   icon:"📊", label:"Statistics" },
    { id:"infra",   icon:"☁️", label:"AWS Infrastructure" },
  ];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:"'DM Sans',sans-serif" }}>

      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside style={{ width:252, minHeight:"100vh", background:T.surface, borderRight:`1px solid ${T.border}`,
        padding:"22px 14px", display:"flex", flexDirection:"column", flexShrink:0,
        position:"sticky", top:0, height:"100vh", overflowY:"auto" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"0 6px 24px",
          borderBottom:`1px solid ${T.border}`, marginBottom:18 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#38bdf8,#818cf8)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>☁️</div>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15,
              background:"linear-gradient(135deg,#38bdf8,#818cf8)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CloudCatalog</div>
            <div style={{ fontSize:10, color:T.muted }}>AWS-Powered Platform</div>
          </div>
        </div>

        {/* Health badge */}
        {health && (
          <div style={{ margin:"0 2px 16px", padding:"7px 10px", borderRadius:8, fontSize:11,
            background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.15)",
            color:"#34d399", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#34d399",display:"inline-block",flexShrink:0 }} />
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{health.db}</span>
          </div>
        )}

        {/* Main nav */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 6px", marginBottom:8 }}>Navigation</div>
          {navItems.map(item => {
            const active = tab===item.id;
            return (
              <div key={item.id} onClick={()=>setTab(item.id)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:9,
                  cursor:"pointer", marginBottom:2, transition:"all 0.15s",
                  background:active?"rgba(56,189,248,0.1)":"transparent",
                  color:active?T.accent:T.text,
                  border:active?"1px solid rgba(56,189,248,0.2)":"1px solid transparent" }}>
                <span style={{ fontSize:15,width:20,textAlign:"center" }}>{item.icon}</span>
                <span style={{ fontSize:13, fontWeight:500 }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Category shortcuts */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 6px", marginBottom:8 }}>Categories</div>
          {CATEGORIES.filter(c=>c!=="All").map(cat => (
            <div key={cat} onClick={()=>{ setTab("catalog"); setCategory(cat); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8,
                cursor:"pointer", marginBottom:1, transition:"all 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:CAT_COLOR[cat]||T.accent,flexShrink:0 }} />
              <span style={{ fontSize:12, color:T.muted }}>{cat}</span>
              <span style={{ marginLeft:"auto", fontSize:11, color:T.muted }}>
                {services.filter(s=>s.category===cat).length||""}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom user + logout */}
        <div style={{ marginTop:"auto", borderTop:`1px solid ${T.border}`, paddingTop:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:9,
            background:"rgba(255,255,255,0.025)", borderRadius:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, borderRadius:"50%",
              background:"linear-gradient(135deg,#818cf8,#34d399)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:13, color:"white", flexShrink:0 }}>
              {user.name?.[0]?.toUpperCase()||"U"}
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontWeight:600, fontSize:13, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:11, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ display:"flex", alignItems:"center", gap:6, width:"100%", padding:"8px 10px",
              borderRadius:8, border:"none", background:"rgba(248,113,113,0.08)", color:T.danger,
              fontSize:13, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>e.target.style.background="rgba(248,113,113,0.15)"}
            onMouseLeave={e=>e.target.style.background="rgba(248,113,113,0.08)"}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN ──────────────────────────────────────────────────────────── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto" }}>

        {/* Topbar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 30px", background:T.surface, borderBottom:`1px solid ${T.border}`,
          position:"sticky", top:0, zIndex:10 }}>
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:20, color:T.text }}>
              {tab==="catalog"?"Service Catalog":tab==="ai"?"Chintu AI Assistant":tab==="stats"?"Statistics":"AWS Infrastructure"}
            </div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
              {tab==="catalog" ? `${services.length} services${category!=="All"?` in ${category}`:""}` :
               tab==="ai"     ? "Powered by AWS EC2 backend" :
               tab==="stats"  ? "Platform overview" : "Deployment architecture"}
            </div>
          </div>
          {tab==="catalog" && (
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, color:T.muted }}>🔍</span>
              <input
                style={{ padding:"10px 16px 10px 38px", borderRadius:10, width:260,
                  border:`1px solid ${T.border}`, background:"rgba(255,255,255,0.04)",
                  color:T.text, fontSize:14, outline:"none", transition:"all 0.2s" }}
                placeholder="Search services..." value={search}
                onChange={e=>setSearch(e.target.value)}
                onFocus={e=>{e.target.style.borderColor="rgba(56,189,248,0.4)";e.target.style.boxShadow="0 0 0 3px rgba(56,189,248,0.06)";}}
                onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}}
              />
            </div>
          )}
        </div>

        <div style={{ flex:1, padding:"26px 30px" }}>

          {/* ═══ CATALOG ═══════════════════════════════════════════════════ */}
          {tab==="catalog" && (
            <>
              {/* Stats row */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:26 }}>
                {[
                  { label:"Total Services",  value:stats.totalServices||services.length, icon:"☁️", color:T.accent,  sub:"in catalog" },
                  { label:"Categories",      value:stats.totalCategories||8,             icon:"📂", color:T.accent2, sub:"service types" },
                  { label:"Registered Users",value:stats.totalUsers||0,                 icon:"👥", color:T.accent3, sub:"on platform" },
                  { label:"AI Queries",      value:messages.filter(m=>m.from==="user").length, icon:"🤖", color:T.warning, sub:"this session" },
                ].map(s=>(
                  <div key={s.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.label}</span>
                      <span style={{ fontSize:18 }}>{s.icon}</span>
                    </div>
                    <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:28, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:4 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Category filter */}
              <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
                {CATEGORIES.map(cat=>{
                  const col  = CAT_COLOR[cat]||T.muted;
                  const act  = category===cat;
                  return (
                    <button key={cat} onClick={()=>setCategory(cat)}
                      style={{ padding:"6px 15px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600,
                        border:`1px solid ${act?col:T.border}`, background:act?`${col}18`:"transparent",
                        color:act?col:T.muted, transition:"all 0.15s" }}
                      onMouseEnter={e=>{if(!act){e.target.style.color=col;e.target.style.borderColor=col+"50";}}}
                      onMouseLeave={e=>{if(!act){e.target.style.color=T.muted;e.target.style.borderColor=T.border;}}}>
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Cards grid */}
              {svcLoad ? (
                <div style={{ textAlign:"center", padding:"60px 0", color:T.muted }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>Loading services…
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))", gap:14 }}>
                  {services.map(svc=>{
                    const col = CAT_COLOR[svc.category]||T.accent;
                    return (
                      <div key={svc.id}
                        style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14,
                          padding:20, cursor:"pointer", transition:"all 0.18s", position:"relative", overflow:"hidden" }}
                        onClick={()=>setSelected(svc)}
                        onMouseEnter={e=>{const c=e.currentTarget;c.style.borderColor=`${col}40`;c.style.transform="translateY(-2px)";c.style.boxShadow=`0 10px 30px rgba(0,0,0,0.3),0 0 0 1px ${col}20`;}}
                        onMouseLeave={e=>{const c=e.currentTarget;c.style.borderColor=T.border;c.style.transform="none";c.style.boxShadow="none";}}>
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${col},transparent)`, opacity:0.4 }} />
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                          <div style={{ width:42, height:42, borderRadius:10, background:`${col}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{svc.icon}</div>
                          <span style={{ padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700, background:`${col}18`, color:col, border:`1px solid ${col}30` }}>{svc.category}</span>
                        </div>
                        <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:16, color:T.text, marginBottom:5 }}>{svc.name}</div>
                        <div style={{ fontSize:12, color:T.muted, lineHeight:1.5, marginBottom:14, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                          {svc.description || svc.desc}
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:11, fontWeight:700, color:T.accent3 }}>💰 {svc.price}</span>
                          <span style={{ fontSize:11, color:T.warning }}>⭐ {svc.rating}</span>
                          <button style={{ padding:"5px 12px", borderRadius:7, border:"none", background:`rgba(56,189,248,0.1)`, color:T.accent, fontSize:11, fontWeight:700, cursor:"pointer" }}
                            onMouseEnter={e=>e.target.style.background="rgba(56,189,248,0.2)"}
                            onMouseLeave={e=>e.target.style.background="rgba(56,189,248,0.1)"}>
                            Details →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {!services.length && (
                    <div style={{ gridColumn:"1/-1", textAlign:"center", color:T.muted, padding:"60px 0" }}>
                      <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
                      <div style={{ fontSize:15, fontWeight:600 }}>No services found</div>
                      <div style={{ fontSize:12, marginTop:5 }}>Try a different search or category</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ═══ CHINTU AI ══════════════════════════════════════════════════ */}
          {tab==="ai" && (
            <div style={{ maxWidth:780, margin:"0 auto" }}>
              <div style={{ background:"linear-gradient(135deg,rgba(13,21,38,0.98),rgba(18,30,53,0.98))",
                border:"1px solid rgba(56,189,248,0.2)", borderRadius:20, padding:28,
                boxShadow:"0 0 50px rgba(56,189,248,0.05)" }}>

                {/* AI Header */}
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, paddingBottom:18, borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:"linear-gradient(135deg,#38bdf8,#818cf8)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
                    boxShadow:"0 0 24px rgba(56,189,248,0.3)", flexShrink:0 }}>🤖</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:18, color:T.text }}>Chintu AI</div>
                    <div style={{ fontSize:12, color:T.muted }}>Intelligent Cloud Services Advisor</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.accent3, background:"rgba(52,211,153,0.08)", padding:"5px 12px", borderRadius:20, border:"1px solid rgba(52,211,153,0.2)" }}>
                    <span style={{ width:6,height:6,borderRadius:"50%",background:T.accent3,display:"inline-block" }} />
                    Online
                  </div>
                </div>

                {/* Quick chips */}
                <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
                  {AI_CHIPS.map(c=>(
                    <button key={c} onClick={()=>askAI(c)}
                      style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${T.border}`,
                        background:"rgba(255,255,255,0.025)", color:T.muted, fontSize:12, cursor:"pointer", transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.target.style.borderColor=T.accent;e.target.style.color=T.accent;}}
                      onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}>
                      {c}
                    </button>
                  ))}
                </div>

                {/* Chat messages */}
                <div ref={chatRef} style={{ maxHeight:360, overflowY:"auto", marginBottom:16, display:"flex", flexDirection:"column", gap:10, paddingRight:4 }}>
                  {messages.map((msg,i)=>(
                    <div key={i} style={msg.from==="user"
                      ? { alignSelf:"flex-end", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", borderRadius:"14px 14px 4px 14px", padding:"10px 14px", maxWidth:"75%", fontSize:14, color:T.text }
                      : { alignSelf:"flex-start", background:"rgba(18,30,53,0.9)", border:`1px solid ${T.border}`, borderRadius:"14px 14px 14px 4px", padding:"12px 14px", maxWidth:"82%", fontSize:14, color:T.text }}>
                      {msg.from==="bot" && <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, fontSize:11, fontWeight:700, color:T.accent }}>🤖 Chintu AI</div>}
                      <div dangerouslySetInnerHTML={md(msg.text)} style={{ lineHeight:1.65 }} />
                      {msg.related?.length > 0 && (
                        <div style={{ marginTop:10, display:"flex", gap:7, flexWrap:"wrap" }}>
                          {msg.related.map(svc=>(
                            <button key={svc.id}
                              style={{ padding:"4px 11px", borderRadius:7, background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.2)", color:T.accent, fontSize:11, cursor:"pointer" }}
                              onClick={()=>{ setTab("catalog"); setSearch(svc.name); }}>
                              {svc.icon} {svc.name} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ alignSelf:"flex-start", background:"rgba(18,30,53,0.9)", border:`1px solid ${T.border}`, borderRadius:"14px 14px 14px 4px", padding:"12px 14px", fontSize:14 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:T.accent, marginBottom:6 }}>🤖 Chintu AI</div>
                      <span style={{ color:T.warning }}>⏳ Thinking…</span>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ display:"flex", gap:10 }}>
                  <input
                    style={{ flex:1, padding:"12px 16px", borderRadius:12, border:`1px solid ${T.border}`,
                      background:"rgba(255,255,255,0.04)", color:T.text, fontSize:14, outline:"none", transition:"all 0.2s" }}
                    placeholder="Ask me anything about cloud services…"
                    value={aiInput}
                    onChange={e=>setAiInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&askAI()}
                    onFocus={e=>{e.target.style.borderColor="rgba(56,189,248,0.4)";}}
                    onBlur={e=>{e.target.style.borderColor=T.border;}}
                  />
                  <button onClick={()=>askAI()} disabled={aiLoading}
                    style={{ padding:"12px 22px", borderRadius:12, border:"none",
                      background:"linear-gradient(135deg,#38bdf8,#818cf8)",
                      color:"white", fontWeight:700, fontSize:14, cursor:aiLoading?"not-allowed":"pointer",
                      opacity:aiLoading?0.6:1, transition:"all 0.15s" }}
                    onMouseEnter={e=>{if(!aiLoading)e.target.style.opacity="0.85";}}
                    onMouseLeave={e=>{e.target.style.opacity=aiLoading?"0.6":"1";}}>
                    Send ↑
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STATISTICS ═════════════════════════════════════════════════ */}
          {tab==="stats" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:16 }}>
              {CATEGORIES.filter(c=>c!=="All").map(cat=>{
                const col  = CAT_COLOR[cat]||T.accent;
                const all  = services.length || 1;
                const cnt  = services.filter(s=>s.category===cat).length;
                const pct  = Math.round(cnt/all*100);
                const best = services.filter(s=>s.category===cat).sort((a,b)=>b.rating-a.rating)[0];
                return (
                  <div key={cat} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"20px 22px" }}>
                    <div style={{ position:"relative", height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", marginBottom:16, overflow:"hidden" }}>
                      <div style={{ position:"absolute", left:0, top:0, height:"100%", borderRadius:2, background:col, width:`${pct}%`, transition:"width 0.6s" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:15, color:T.text }}>{cat}</span>
                      <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:26, color:col }}>{cnt}</span>
                    </div>
                    <div style={{ fontSize:12, color:T.muted, marginBottom:10 }}>{pct}% of catalog • {cnt} services</div>
                    {best && (
                      <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 10px", background:"rgba(255,255,255,0.025)", borderRadius:8 }}>
                        <span style={{ fontSize:16 }}>{best.icon}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{best.name}</div>
                          <div style={{ fontSize:10, color:T.warning }}>⭐ {best.rating} top rated</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ AWS INFRASTRUCTURE ═════════════════════════════════════════ */}
          {tab==="infra" && (
            <div style={{ maxWidth:800, margin:"0 auto" }}>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:28, marginBottom:20 }}>
                <h2 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:20, marginBottom:6, color:T.text }}>Deployment Architecture</h2>
                <p style={{ color:T.muted, fontSize:13, marginBottom:24 }}>Full-stack cloud-native setup on AWS</p>

                {/* Architecture diagram */}
                {[
                  { icon:"👤", label:"User Browser",      sub:"React.js SPA", color:"#64748b", arrow:true  },
                  { icon:"☁️", label:"Amazon CloudFront", sub:"CDN + HTTPS",   color:"#38bdf8", arrow:true  },
                  { icon:"🪣", label:"Amazon S3",         sub:"Static hosting",color:"#818cf8", arrow:true  },
                  { icon:"🖥️", label:"Amazon EC2",        sub:"Node.js + Express API (port 5000)", color:"#34d399", arrow:true },
                  { icon:"🗄️", label:"Amazon RDS MySQL",  sub:"cloudcatalog DB — users & services tables", color:"#fbbf24", arrow:false },
                ].map((layer,i)=>(
                  <div key={i}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                      background:"rgba(255,255,255,0.025)", border:`1px solid ${layer.color}25`,
                      borderRadius:12, borderLeft:`3px solid ${layer.color}` }}>
                      <span style={{ fontSize:24, flexShrink:0 }}>{layer.icon}</span>
                      <div>
                        <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:T.text }}>{layer.label}</div>
                        <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{layer.sub}</div>
                      </div>
                      <div style={{ marginLeft:"auto", padding:"3px 10px", borderRadius:20, fontSize:11,
                        background:`${layer.color}18`, color:layer.color, border:`1px solid ${layer.color}30` }}>
                        {i===0?"Client":i===1?"CDN":i===2?"Storage":i===3?"Compute":"Database"}
                      </div>
                    </div>
                    {layer.arrow && <div style={{ textAlign:"center", fontSize:18, color:T.muted, lineHeight:"24px" }}>↕</div>}
                  </div>
                ))}
              </div>

              {/* Tech stack */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { title:"Frontend", icon:"⚛️", color:"#38bdf8",
                    items:["React.js 18","React Router v6","JWT localStorage","Fetch API","Google Fonts (Syne, DM Sans)"] },
                  { title:"Backend", icon:"🟢", color:"#34d399",
                    items:["Node.js 18+ / Express 4","mysql2 (AWS RDS driver)","bcryptjs (password hashing)","jsonwebtoken (JWT auth)","dotenv (env config)"] },
                  { title:"AWS Services", icon:"☁️", color:"#fbbf24",
                    items:["EC2 – API server hosting","RDS MySQL – persistent DB","S3 – React static files","CloudFront – CDN / HTTPS","Route 53 – DNS (optional)"] },
                  { title:"Security", icon:"🔐", color:"#818cf8",
                    items:["JWT Bearer tokens (7d)","bcrypt password hashing","CORS origin whitelist","RDS Security Group rules","SSL/TLS via CloudFront"] },
                ].map(card=>(
                  <div key={card.title} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                      <span style={{ fontSize:18 }}>{card.icon}</span>
                      <span style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:14, color:card.color }}>{card.title}</span>
                    </div>
                    {card.items.map(item=>(
                      <div key={item} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7, fontSize:12, color:T.muted }}>
                        <span style={{ width:4,height:4,borderRadius:"50%",background:card.color,flexShrink:0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Health status */}
              {health && (
                <div style={{ marginTop:16, background:T.surface, border:"1px solid rgba(52,211,153,0.2)", borderRadius:14, padding:"18px 20px" }}>
                  <div style={{ fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:14, color:"#34d399", marginBottom:12 }}>🟢 Live Server Status</div>
                  {[
                    {k:"Status",   v:health.status},
                    {k:"Version",  v:health.server},
                    {k:"Database", v:health.db},
                    {k:"Uptime",   v:health.uptime},
                    {k:"Time",     v:health.time},
                  ].map(row=>(
                    <div key={row.k} style={{ display:"flex", gap:12, padding:"6px 0", borderBottom:`1px solid ${T.border}`, fontSize:12 }}>
                      <span style={{ color:T.muted, width:80, flexShrink:0 }}>{row.k}</span>
                      <span style={{ color:T.text }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ─── SERVICE DETAIL MODAL ────────────────────────────────────────── */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(5px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
          onClick={()=>setSelected(null)}>
          <div style={{ background:T.surface2, border:`1px solid ${T.border}`, borderRadius:20,
            padding:30, width:"100%", maxWidth:480, boxShadow:"0 24px 80px rgba(0,0,0,0.7)" }}
            onClick={e=>e.stopPropagation()}>
            {(() => {
              const svc = selected;
              const col = CAT_COLOR[svc.category]||T.accent;
              return (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <div style={{ width:52,height:52,borderRadius:14,background:`${col}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>{svc.icon}</div>
                      <div>
                        <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:T.text }}>{svc.name}</div>
                        <span style={{ padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:`${col}18`,color:col,border:`1px solid ${col}30` }}>{svc.category}</span>
                      </div>
                    </div>
                    <button onClick={()=>setSelected(null)}
                      style={{ background:"transparent",border:"none",color:T.muted,fontSize:20,cursor:"pointer",lineHeight:1 }}>✕</button>
                  </div>
                  <p style={{ color:T.muted, fontSize:13, lineHeight:1.7, marginBottom:20 }}>{svc.description||svc.desc}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                    {[{l:"Pricing",v:svc.price,i:"💰"},{l:"Rating",v:`${svc.rating}/5`,i:"⭐"},{l:"Category",v:svc.category,i:"📂"},{l:"Service ID",v:`#${String(svc.id).padStart(3,"0")}`,i:"🔖"}].map(r=>(
                      <div key={r.l} style={{ background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"11px 13px" }}>
                        <div style={{ fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4 }}>{r.i} {r.l}</div>
                        <div style={{ fontWeight:700,color:T.text,fontSize:14 }}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  {Array.isArray(svc.tags) && svc.tags.length > 0 && (
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:20 }}>
                      {svc.tags.map(t=>(
                        <span key={t} style={{ padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,color:T.muted,fontSize:11 }}>#{t}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex",gap:10 }}>
                    <button
                      style={{ flex:1,padding:"12px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${col},${T.accent2})`,color:"white",fontWeight:700,fontSize:13,cursor:"pointer" }}
                      onClick={()=>{ setSelected(null); setTab("ai"); setTimeout(()=>askAI(`Tell me about ${svc.name} and when to use it`),200); }}>
                      🤖 Ask Chintu AI
                    </button>
                    <button onClick={()=>setSelected(null)}
                      style={{ padding:"12px 20px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:13,cursor:"pointer" }}>
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
