import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ──────────────────────────────────────────────────────────
   Aceternity-inspired animated grid background
   ────────────────────────────────────────────────────────── */
const AnimatedGridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const gridSize = 60;
      const cols = Math.ceil(w / gridSize) + 1;
      const rows = Math.ceil(h / gridSize) + 1;

      // Draw grid lines with subtle animation
      for (let i = 0; i < cols; i++) {
        const x = i * gridSize;
        const wave = Math.sin(time * 0.3 + i * 0.15) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.strokeStyle = `rgba(2, 96, 255, ${0.04 * wave})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let j = 0; j < rows; j++) {
        const y = j * gridSize;
        const wave = Math.sin(time * 0.3 + j * 0.15) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = `rgba(2, 96, 255, ${0.04 * wave})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Animated spotlight dots at intersections
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;
          const dist = Math.sqrt(
            Math.pow(x - w * (0.5 + Math.sin(time * 0.2) * 0.15), 2) +
            Math.pow(y - h * (0.5 + Math.cos(time * 0.25) * 0.15), 2)
          );
          const maxDist = Math.sqrt(w * w + h * h) * 0.4;
          const alpha = Math.max(0, 1 - dist / maxDist) * 0.5;

          if (alpha > 0.02) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(2, 96, 255, ${alpha})`;
            ctx.fill();
          }
        }
      }

      time += 0.016;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

/* ──────────────────────────────────────────────────────────
   Floating stat badge (Aceternity-style card)
   ────────────────────────────────────────────────────────── */
const FloatingBadge = ({ children, className = "", delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`absolute backdrop-blur-xl bg-white/80 border border-gray-200/60 shadow-xl rounded-2xl px-5 py-3 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   Animated text reveal (type-in effect)
   ────────────────────────────────────────────────────────── */
const TypewriterText = ({ words, className = "" }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className={`inline-block bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text ${className}`}
      style={{
        transition: "all 400ms ease-in-out",
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? "translateY(8px)" : "translateY(0)",
        filter: isAnimating ? "blur(4px)" : "blur(0)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      {words[currentWordIndex]}
    </span>
  );
};

/* ──────────────────────────────────────────────────────────
   Spotlight beam effect
   ────────────────────────────────────────────────────────── */
const SpotlightBeam = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
      style={{
        background:
          "radial-gradient(circle, rgba(2,96,255,0.3) 0%, rgba(6,182,212,0.15) 40%, transparent 70%)",
        animation: "spotlightPulse 6s ease-in-out infinite",
      }}
    />
    <div
      className="absolute -top-20 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
      style={{
        background:
          "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 60%)",
        animation: "spotlightDrift 8s ease-in-out infinite",
      }}
    />
  </div>
);

/* ──────────────────────────────────────────────────────────
   Moving border button (Aceternity UI staple)
   ────────────────────────────────────────────────────────── */
const MovingBorderButton = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`relative group inline-flex items-center justify-center px-8 py-3.5 font-semibold text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${className}`}
  >
    {/* Rotating gradient border */}
    <span
      className="absolute inset-0 rounded-full"
      style={{
        background: "linear-gradient(135deg, #0260FF, #06B6D4, #0260FF, #06B6D4)",
        backgroundSize: "300% 300%",
        animation: "movingBorder 3s linear infinite",
      }}
    />
    {/* Inner fill */}
    <span className="absolute inset-[2px] rounded-full bg-blue-600 group-hover:bg-blue-700 transition-colors duration-300" />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </button>
);

/* ──────────────────────────────────────────────────────────
   Main HeroLanding component
   ────────────────────────────────────────────────────────── */
const HeroLanding = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-cyan-50/30 to-gray-50"
    >
      {/* Animated background layers */}
      <AnimatedGridBackground />
      <SpotlightBeam />

      {/* Floating stat badges */}
      <FloatingBadge className="top-[18%] left-[8%] md:left-[12%] hidden md:flex items-center gap-3" delay={800}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">500+ Courses</p>
          <p className="text-xs text-gray-500">Expert-crafted content</p>
        </div>
      </FloatingBadge>

      <FloatingBadge className="top-[22%] right-[6%] md:right-[10%] hidden md:flex items-center gap-3" delay={1200}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">50K+ Learners</p>
          <p className="text-xs text-gray-500">Growing community</p>
        </div>
      </FloatingBadge>

      <FloatingBadge className="bottom-[18%] left-[6%] md:left-[14%] hidden lg:flex items-center gap-3" delay={1600}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Certified</p>
          <p className="text-xs text-gray-500">Industry-recognized</p>
        </div>
      </FloatingBadge>

      <FloatingBadge className="bottom-[22%] right-[6%] md:right-[12%] hidden lg:flex items-center gap-3" delay={2000}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">4.9 / 5 Rating</p>
          <p className="text-xs text-gray-500">From 12K+ reviews</p>
        </div>
      </FloatingBadge>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-200/50 backdrop-blur-sm mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-sm font-medium text-blue-700">New courses added every week</span>
        </div>

        {/* Headline with parallax effect */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6"
          style={{
            transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          Master skills that
          <br />
          <span className="relative inline-block">
            <span className="relative z-10">
              <TypewriterText
                words={["matter.", "scale.", "inspire.", "transform."]}
              />
            </span>
            {/* Animated underline */}
            <span
              className="absolute -bottom-2 left-0 w-full h-3 rounded-full opacity-20"
              style={{
                background: "linear-gradient(90deg, #0260FF, #06B6D4, #0260FF)",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s linear infinite",
              }}
            />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          learn.dev brings together world-class instructors, hands-on projects,
          and a thriving community to accelerate your career in tech.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <MovingBorderButton onClick={() => navigate("/course-list")}>
            Explore Courses
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </MovingBorderButton>

          <button
            onClick={() => {
              const courseSection = document.querySelector('[data-section="courses"]');
              if (courseSection) courseSection.scrollIntoView({ behavior: "smooth" });
              else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
            }}
            className="group flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-gray-600 bg-white/80 border border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-lg hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
          >
            <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch Demo
          </button>
        </div>

        {/* Trust strip */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden"
              >
                <img
                  src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? "women" : "men"}/${i + 20}.jpg`}
                  alt="learner"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">+50K</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Trusted by <span className="font-semibold text-gray-700">50,000+</span> developers worldwide
          </p>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes spotlightPulse {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, 0) scale(1.15); opacity: 0.3; }
        }
        @keyframes spotlightDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(80px); }
        }
        @keyframes movingBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
};

export default HeroLanding;
