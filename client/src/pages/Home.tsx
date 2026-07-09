import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const services = [
  { name: "Power Outage", img: "client/src/assets/1.png" },
  { name: "Low Voltage", img: "client/src/assets/2.png" },
  { name: "Sparking Hazard", img: "client/src/assets/3.png" },
  { name: "Meter Fault", img: "client/src/assets/4.png" },
  { name: "Transformer Issue", img: "client/src/assets/5.png" },
  { name: "Billing Issue", img: "client/src/assets/6.png" },
  { name: "Street Light", img: "client/src/assets/7.png" },
  { name: "Line Maintenance", img: "client/src/assets/8.png" },
  { name: "Emergency", img: "client/src/assets/9.png" },
  { name: "Other", img: "client/src/assets/10.png" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-navy" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-cyan/15 blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-primary-light/10 blur-[80px]" />

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
                  {tile}
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
