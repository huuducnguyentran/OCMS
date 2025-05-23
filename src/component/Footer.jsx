// Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-cyan-200 py-6 px-4  text-center text-sm text-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div>
          <p className="text-gray-800 font-medium">
            © {new Date().getFullYear()} TalentTrack Inc. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-4 text-gray-800">
          <a
            href="#"
            className="!text-gray-700 hover:!text-gray-500 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <span className="text-gray-700">|</span>
          <a
            href="#"
            className="!text-gray-700 hover:!text-gray-500 transition-colors duration-200"
          >
            Terms of Service
          </a>
          <span className="text-gray-700">|</span>
          <a
            href="#"
            className="!text-gray-700 hover:!text-gray-500 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
