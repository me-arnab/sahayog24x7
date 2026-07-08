export function Footer() {
  return (
    <footer
      className="px-[60px] py-10 max-md:px-7"
      style={{
        background:
          "linear-gradient(to top, rgba(8, 240, 93, 0.75) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <div className="grid grid-cols-4 gap-10 mb-[18px] max-md:grid-cols-2 max-md:gap-5 max-sm:grid-cols-1">
        <ul className="list-none m-0 p-0">
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              FAQ
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Helpdesk (Contact Us)
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              About Us
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Feedback
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Accessibility Statement
            </a>
          </li>
        </ul>

        <ul className="list-none m-0 p-0">
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Linking Policy
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Copyright Policy
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Privacy Policy
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Refund / Cancellation Policy
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Terms of Use
            </a>
          </li>
        </ul>

        <ul className="list-none m-0 p-0">
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Help
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Find Your BSK ↗
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Duare Sarkar ↗
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              CCTNS Citizen Service ↗
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Government of India Portal ↗
            </a>
          </li>
        </ul>

        <ul className="list-none m-0 p-0">
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              West Bengal Police ↗
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Kolkata Police ↗
            </a>
          </li>
          <li className="mb-2.5">
            <a href="#" className="no-underline text-[#575757] text-[15px] hover:text-[#333] hover:underline">
              Egiye Bangla ↗
            </a>
          </li>
        </ul>
      </div>

      <p className="text-center text-[#333] text-[14px] mt-2.5 leading-relaxed">
        P & AR Department, Government of West Bengal. All rights reserved. | Designed & Maintained by
        Sahayog Team.<br />
        Version ID: 1.0 | Best viewed on modern browsers in 16:9 aspect ratio.<br />
        Last reviewed and updated on 05 Dec, 2025
      </p>
    </footer>
  );
}
