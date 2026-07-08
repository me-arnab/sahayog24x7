import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const services = [
  { name: "Power Outage", img: "/frontend/assets/1.png" },
  { name: "Low Voltage", img: "/frontend/assets/2.png" },
  { name: "Sparking Hazard", img: "/frontend/assets/3.png" },
  { name: "Meter Fault", img: "/frontend/assets/4.png" },
  { name: "Transformer Issue", img: "/frontend/assets/5.png" },
  { name: "Billing Issue", img: "/frontend/assets/6.png" },
  { name: "Street Light", img: "/frontend/assets/7.png" },
  { name: "Line Maintenance", img: "/frontend/assets/8.png" },
  { name: "Emergency", img: "/frontend/assets/9.png" },
  { name: "Other", img: "/frontend/assets/10.png" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-[350px] max-lg:px-[30px] py-10">
        <div className="flex justify-center gap-4 mb-6 flex-wrap">
          {["⚡ 24×7 Support", "🏙 Govt Connected", "⏱ Fast Resolution"].map(
            (tile) => (
              <div
                key={tile}
                className="flex items-center gap-2 px-[18px] py-2.5 rounded-full
                  bg-white/20 backdrop-blur-md shadow-[0_0_12px_rgba(0,255,150,0.35)]
                  text-sm font-medium text-[#0f3d2e] transition-transform hover:-translate-y-1
                  hover:shadow-[0_0_20px_rgba(0,255,150,0.6)]"
              >
                {tile}
              </div>
            )
          )}
        </div>

        <div className="w-[120px] h-[3px] mx-auto mb-7 rounded-full bg-gradient-to-r from-[#00c853] via-[#ff9800] to-[#00c853] bg-[length:200%_100%] animate-[glowMove_3s_linear_infinite]" />

        <div className="relative z-10 w-full max-w-[1200px]">
          <h1 className="text-[70px] leading-[1.1] font-extrabold tracking-wide max-md:text-4xl">
            Report issues.{" "}
            <span className="bg-gradient-to-r from-[#006c18] to-[#00b4a6] bg-clip-text text-transparent">
              Track progress.
            </span>{" "}
            Get Resolved.
          </h1>
          <p className="mt-[18px] text-[#555] text-lg max-w-[700px] mx-auto">
            Sahayog is a unified complaint management platform where citizens can
            easily submit electricity related issues. Authorities can track,
            respond, and resolve quickly.
          </p>
          <Link
            to="/register"
            className="inline-block mt-5 bg-black text-white px-[35px] py-[15px]
              rounded-tl-[36px] rounded-br-[36px] no-underline font-bold text-lg
              transition-transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
          >
            REGISTER NOW
          </Link>
        </div>

        {/* Blur decorations */}
        <div className="absolute w-[260px] h-[260px] rounded-full blur-[80px] opacity-35 bg-[#00c853] top-[20%] left-[10%] -z-0" />
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-35 bg-[#ff9800] bottom-[15%] right-[10%] -z-0" />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-60 animate-bounce">
          Scroll to explore ↓
        </div>
      </section>

      {/* How It Works */}
      <section className="px-[60px] py-20 text-center max-md:px-7">
        <h2 className="text-4xl font-bold text-[#1f2933]">How It Works ?</h2>
        <p className="mt-2.5 text-[#555] text-lg">
          Simple and efficient process to resolve citizen issues quickly
        </p>

        <div className="mt-[50px] grid grid-cols-3 gap-[30px] max-md:grid-cols-1">
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
          ].map((step) => (
            <div
              key={step.title}
              className="p-[30px] rounded-2xl bg-white/20 backdrop-blur-md border border-white/30
                text-left transition-transform hover:-translate-y-1.5 hover:shadow-[0_0_20px_rgba(8,240,93,0.5)]"
            >
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-xl mb-2.5 text-[#006c18]">{step.title}</h3>
              <p className="text-sm text-[#333] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Services */}
      <section id="service" className="py-20 text-center">
        <h2 className="text-4xl mb-10">We deal with</h2>
        <div className="flex flex-wrap justify-center gap-4 px-[60px] max-md:px-7">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="w-[100px] h-[100px] bg-[#f3ffef] rounded-full border-[3px] border-[#7ddf9a]
                flex items-center justify-center transition-transform hover:-translate-y-1.5
                hover:shadow-[0_0_20px_rgba(247,127,28,0.77)]"
            >
              <img src={svc.img} alt={svc.name} className="h-[65px] w-[65px]" />
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="px-[60px] py-20 grid grid-cols-2 gap-10 max-w-[1200px] mx-auto w-full max-md:grid-cols-1 max-md:px-7"
      >
        <div>
          <h2 className="text-4xl font-bold mb-2">
            Contact{" "}
            <span className="bg-gradient-to-r from-[#006c18] to-[#00b4a6] bg-clip-text text-transparent">
              Us
            </span>
          </h2>
          <p className="text-[#555] mb-5">
            If you have any questions, issues or suggestions, feel free to reach
            out. Our team will respond within 24 hours.
          </p>
          <div className="flex flex-col gap-2 text-[#666] text-[15px]">
            <p>📞 +91 1234567890</p>
            <p>📧 info@sahayog.gov.in</p>
            <p>📍 Mankundu, Hooghly, West Bengal, 712302</p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-5">Send us a Message</h3>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white/40 focus:outline-none focus:border-[#4ecdc4]"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white/40 focus:outline-none focus:border-[#4ecdc4]"
              required
            />
            <input
              type="text"
              placeholder="Subject"
              className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white/40 focus:outline-none focus:border-[#4ecdc4]"
              required
            />
            <textarea
              placeholder="Write your message or feedback..."
              rows={6}
              className="w-full p-[15px] border-2 border-[#e2e8f0] rounded-xl bg-white/40 focus:outline-none focus:border-[#4ecdc4] resize-vertical"
              required
            ></textarea>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#006c18] to-[#00b4a6] text-white
                py-[15px] rounded-xl font-bold text-lg cursor-pointer
                transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(255,107,107,0.4)]"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
