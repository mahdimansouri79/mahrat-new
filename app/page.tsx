"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  UserPlus,
  Search,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  /* ================= AI NETWORK CANVAS ================= */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let particles: any[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#6366f1";
        ctx.fill();
      }

      for (let a of particles) {
        for (let b of particles) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(99,102,241,0.15)";
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ================= CURSOR GLOW ================= */

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!glowRef.current) return;

      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* ================= SCROLL PROGRESS ================= */

  useEffect(() => {
    const scroll = () => {
      const h =
        document.documentElement.scrollHeight - window.innerHeight;

      const p = window.scrollY / h;

      if (progressRef.current) {
        progressRef.current.style.height = p * 100 + "%";
      }
    };

    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, []);

  /* ================= SCROLL REVEAL ================= */

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".reveal");

    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("show");
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((c) => observer.observe(c));
  }, []);

  /* ================= TILT ================= */

  const tilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();

    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const rx = ((y - r.height / 2) / r.height) * 10;
    const ry = ((x - r.width / 2) / r.width) * -10;

    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05)`;
  };

  const resetTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  };

  const features = [
    {
      title: "ثبت‌نام دوره",
      desc: "شروع مسیر مهارت‌آموزی",
      icon: <UserPlus size={26} />,
      link: "/register",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "پیگیری وضعیت",
      desc: "مشاهده وضعیت درخواست",
      icon: <Search size={26} />,
      link: "/track",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "راهنمای شغلی AI",
      desc: "پیشنهاد شغلی با هوش مصنوعی",
      icon: <BrainCircuit size={26} />,
      link: "/ai-career",
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "پنل مدیریت",
      desc: "مدیریت کاربران",
      icon: <ShieldCheck size={26} />,
      link: "/admin-login",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50" dir="rtl">

      <canvas ref={canvasRef} className="network-canvas" />

      <div className="mesh-bg" />

      <div ref={glowRef} className="cursor-glow" />

      <div className="timeline">
        <div ref={progressRef} className="timeline-progress" />
      </div>

      
    <main className="relative z-10 max-w-5xl mx-auto px-6 py-32">
         <div className="system-title">
          سامانه جامع مهارت‌آموزی
        </div>

        <header className="text-center mb-12 reveal">
          <h1 className="hero-title">
            مسیر یادگیری
            <span className="gradient"> و آینده شغلی</span>
          </h1>

          <p className="text-slate-500 mt-5">
            سامانه هوشمند مهارت‌آموزی و هدایت شغلی
          </p>
        </header>

        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {features.map((f, i) => (
            <Link key={i} href={f.link}>
              <div
                className="glass-card reveal"
                onMouseMove={tilt}
                onMouseLeave={resetTilt}
              >
                <div className={`icon bg-gradient-to-tr ${f.color}`}>
                  {f.icon}
                </div>

                <div>
                  <h3 className="font-bold text-xl">{f.title}</h3>
                  <p className="text-slate-500 mt-2">{f.desc}</p>

                  <span className="enter">
                    ورود <ArrowRight size={16} />
                  </span>
                </div>

                <div className="node" />
              </div>
            </Link>
          ))}

        </div>

      </main>

      <style jsx>{`

        .network-canvas{
          position:absolute;
          inset:0;
          z-index:0;
        }

        .mesh-bg{
          position:absolute;
          inset:0;
          background:
          radial-gradient(circle at 20% 30%,#6366f133,transparent),
          radial-gradient(circle at 80% 70%,#3b82f633,transparent);
          filter:blur(120px);
        }

        .cursor-glow{
          position:fixed;
          width:300px;
          height:300px;
          background:radial-gradient(circle,#6366f144,transparent);
          transform:translate(-50%,-50%);
          pointer-events:none;
        }

        .hero-title{
        
          font-size:48px;
          font-weight:900;
          
        }

        .gradient{
          background:linear-gradient(90deg,#3b82f6,#8b5cf6,#06b6d4);
          -webkit-background-clip:text;
          color:transparent;
        }

        .timeline{
          position:absolute;
          left:50%;
          transform:translateX(-50%);
          width:4px;
          height:100%;
          background:#e2e8f0;
        }

        .timeline-progress{
          width:100%;
          height:0%;
          background:linear-gradient(#3b82f6,#8b5cf6);
        }

        .glass-card{
        font-family: "Nazanin", sans-serif;
        font-size:20px;
          display:flex;
          gap:30px;
          align-items:center;
          padding:20px;
          border-radius:24px;

          background:rgba(255,255,255,.65);
          backdrop-filter:blur(18px);

          border:1px solid rgba(255,255,255,.7);
          transition:.4s;
        }

        .glass-card:hover{
          box-shadow:0 30px 70px rgba(0,0,0,.12);
        }

        .icon{
          padding:16px;
          border-radius:16px;
          color:white;
        }

        .node{
          position:absolute;
          left:-38px;
          width:18px;
          height:18px;
          background:#6366f1;
          border-radius:50%;
          box-shadow:0 0 18px #6366f1;
        }

        .enter{
          margin-top:6px;
          display:flex;
          gap:6px;
          font-size:14px;
          color:#2563eb;
          font-weight:600;
        }

        .reveal{
          opacity:0;
          transform:translateY(60px);
          transition:.8s;
        }
          .system-title{
          font-family: "Titr", sans-serif;

  display:block;
  width:fit-content;

  margin:0 auto 10px auto;
  padding:18px 48px;

  font-size:35px;
  font-weight:800;
  text-align:center;

  border-radius:20px;

  background:rgba(255,255,255,0.7);
  backdrop-filter:blur(18px);

  border:1px solid rgba(255,255,255,0.8);

  box-shadow:
  0 12px 35px rgba(0,0,0,0.1),
  inset 0 1px 0 rgba(255,255,255,0.9);

  color:#0f172a;

  position:relative;
}

.system-title::before{
  content:"";
  position:absolute;
  inset:-3px;
  border-radius:22px;

  background:linear-gradient(
    90deg,
    #3b82f6,
    #8b5cf6,
    #06b6d4
  );

  z-index:-1;
  filter:blur(14px);
  opacity:0.7;
}
        @font-face {
  font-family: "Titr";
  src: url("/fonts/titr.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}
   @font-face {
  font-family: "Nazanin";
  src: url("/fonts/Nazanin.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

        .reveal.show{
          opacity:1;
          transform:none;
        }

      `}</style>
    </div>
  );
}
