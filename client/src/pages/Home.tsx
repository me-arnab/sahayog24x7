import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import img1 from "../assets/1.png";
import img2 from "../assets/2.png";
import img3 from "../assets/3.png";
import img4 from "../assets/4.png";
import img5 from "../assets/5.png";
import img6 from "../assets/6.png";
import img7 from "../assets/7.png";
import img8 from "../assets/8.png";
import img9 from "../assets/9.png";
import img10 from "../assets/10.png";


const services = [
  { name: "Power Outage", img: img1 },
  { name: "Low Voltage", img: img2 },
  { name: "Sparking Hazard", img: img3 },
  { name: "Meter Fault", img: img4 },
  { name: "Transformer Issue", img: img5 },
  { name: "Billing Issue", img: img6 },
  { name: "Street Light", img: img7 },
  { name: "Line Maintenance", img: img8 },
  { name: "Emergency", img: img9 },
  { name: "Other", img: img10 },  
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Electric background animation styles */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0); }
          33% { transform: translate(20px, -15px); }
          66% { transform: translate(-15px, 10px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes current-flow {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 100% { opacity: 1; }
          20%, 22% { opacity: 0.4; }
        }
        @keyframes spark-rise {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-120px) scale(1.1); opacity: 0; }
        }
        @keyframes bolt-glow {
          0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
          50% { filter: drop-shadow(0 0 8px currentColor); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        .animate-pulse-glow-slow {
          animation: pulse-glow 6s ease-in-out infinite;
        }
        .animate-drift {
          animation: drift 8s ease-in-out infinite;
        }
        .animate-drift-slow {
          animation: drift 12s ease-in-out infinite;
        }
        .electric-line {
          stroke-dasharray: 12 8;
          animation: current-flow 2.5s linear infinite, flicker 5s linear infinite;
        }
        .electric-line-slow {
          stroke-dasharray: 10 14;
          animation: current-flow 4s linear infinite, flicker 7s linear infinite;
        }
        .spark-particle {
          animation: spark-rise linear infinite;
        }
        .bolt-icon {
          animation: bolt-glow 2s ease-in-out infinite;
        }
      `}</style>

      <Navbar />

    {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-navy" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/15 blur-[100px] animate-pulse-glow-slow" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-primary-light/10 blur-[80px] animate-drift" />

        {/* Animated electric current lines with moving current dots */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <path
            id="wire-1"
            className="electric-line text-accent-cyan-light"
            d="M -50 150 L 250 150 L 300 220 L 550 220 L 600 120 L 900 120 L 950 260 L 1250 260"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            id="wire-2"
            className="electric-line-slow text-primary-light"
            d="M -50 550 L 200 550 L 260 460 L 500 460 L 560 600 L 850 600 L 900 500 L 1250 500"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          <path
            id="wire-3"
            className="electric-line text-accent-cyan"
            d="M -50 680 L 180 680 L 230 630 L 420 630 L 470 700 L 700 700"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />

          {/* Moving current orbs traveling along the wires */}
          <circle r="5" fill="#67e8f9" opacity="0.9">
            <animateMotion dur="4s" repeatCount="indefinite">
              <mpath href="#wire-1" />
            </animateMotion>
          </circle>
          <circle r="4" fill="#93c5fd" opacity="0.8">
            <animateMotion dur="4s" begin="1.5s" repeatCount="indefinite">
              <mpath href="#wire-1" />
            </animateMotion>
          </circle>

          <circle r="5" fill="#a5b4fc" opacity="0.85">
            <animateMotion dur="5.5s" repeatCount="indefinite">
              <mpath href="#wire-2" />
            </animateMotion>
          </circle>
          <circle r="3.5" fill="#67e8f9" opacity="0.7">
            <animateMotion dur="5.5s" begin="2.2s" repeatCount="indefinite">
              <mpath href="#wire-2" />
            </animateMotion>
          </circle>

          <circle r="4" fill="#22d3ee" opacity="0.8">
            <animateMotion dur="3.2s" repeatCount="indefinite">
              <mpath href="#wire-3" />
            </animateMotion>
          </circle>
        </svg>

        <div className="relative z-10 w-full max-w-[900px]">
          {/* Mini tiles */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {["⚡ 24×7 Support", "🏙 Govt Connected", "⏱ Fast Resolution"].map(
              (tile) => (
                <div
                  key={tile}
                  className="flex items-center gap-2 px-4 py-2 rounded-full
                    bg-white/10 backdrop-blur-md border border-white/10
                    text-sm font-medium text-accent-cyan-light transition-all
                    hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <span className={tile.startsWith("⚡") ? "bolt-icon inline-block" : ""}>
                    {tile}
                  </span>
                </div>
              )
            )}
          </div>

          <h1 className="text-[64px] leading-[1.08] font-extrabold tracking-tight text-white max-md:text-4xl max-sm:text-3xl">
            Report issues.{" "}
            <span className="bg-gradient-to-r from-accent-cyan-light via-primary-light to-accent-cyan bg-clip-text text-transparent">
              Track progress.
            </span>{" "}
            Get Resolved.
          </h1>
          <p className="mt-6 text-slate-300 text-lg max-w-[650px] mx-auto leading-relaxed">
            Sahayog is a unified complaint management platform where citizens can
            easily submit electricity related issues. Authorities can track,
            respond, and resolve quickly.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-primary to-accent-cyan text-white
              px-10 py-4 rounded-2xl no-underline font-semibold text-lg
              shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40"
          >
            REGISTER NOW <i className="fas fa-arrow-right text-sm"></i>
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-sm flex flex-col items-center gap-1 animate-pulse">
          <span>Scroll to explore</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 text-center bg-bg">
        <div className="max-w-6xl mx-auto">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Process</span>
          <h2 className="text-4xl font-bold text-navy mt-2 mb-3">How It Works</h2>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Simple and efficient process to resolve citizen issues quickly
          </p>

          <div className="mt-14 grid grid-cols-3 gap-6 max-md:grid-cols-1">
            {[
              {
                icon: "📝",
                title: "Submit Complaint",
                desc: "Fill out a simple form with issue details, location, and photos if available.",
              },
              {
                icon: "🤖",
                title: "Auto-Routing",
                desc: "AI categorizes and routes your complaint to the right department automatically.",
              },
              {
                icon: "✅",
                title: "Quick Resolution",
                desc: "Track progress in real-time and receive updates until resolution.",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="group p-8 rounded-2xl bg-card border border-border shadow-sm
                  text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 hover:border-primary/20"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent-cyan/10 flex items-center justify-center text-2xl mb-5 group-hover:from-primary/20 group-hover:to-accent-cyan/20 transition-all">
                  {step.icon}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">Step {i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section id="service" className="py-24 text-center bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Services</span>
          <h2 className="text-4xl font-bold text-navy mt-2 mb-10">We deal with</h2>
          <div className="flex flex-wrap justify-center gap-5">
            {services.map((svc) => (
              <div
                key={svc.name}
                className="group w-[110px] h-[110px] bg-bg rounded-2xl border border-border
                  flex flex-col items-center justify-center gap-2 transition-all
                  hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 hover:border-primary/30 cursor-pointer"
              >
                <img src={svc.img} alt={svc.name} className="h-10 w-10" />
                <span className="text-[11px] font-medium text-text-secondary group-hover:text-primary transition-colors">
                  {svc.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-24 bg-bg">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12 max-md:grid-cols-1">
          <div>
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Contact</span>
            <h2 className="text-4xl font-bold text-navy mt-2 mb-4">
              Get in{" "}
              <span className="bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              If you have any questions, issues or suggestions, feel free to reach
              out. Our team will respond within 24 hours.
            </p>
            <div className="flex flex-col gap-4 text-text-secondary text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <i className="fas fa-phone"></i>
                </div>
                <span>+91 1234567890</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                  <i className="fas fa-envelope"></i>
                </div>
                <span>info@sahayog.gov.in</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <span>Mankundu, Hooghly, West Bengal, 712302</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-navy mb-6">Send us a Message</h3>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full p-3.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                required
              />
              <textarea
                placeholder="Write your message or feedback..."
                rows={5}
                className="w-full p-3.5 border border-border rounded-xl bg-bg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-vertical"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent-cyan text-white
                  py-4 rounded-xl font-semibold text-sm cursor-pointer
                  transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}