// Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4 mt-10 text-center text-sm text-gray-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div>
          <p className="text-gray-700 font-medium">
            © {new Date().getFullYear()} TalentTrack Inc. All rights reserved.
          </p>
        </div>
        <div className="flex space-x-4 text-gray-500">
          <a
            href="#"
            className="hover:text-gray-800 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <span>|</span>
          <a
            href="#"
            className="hover:text-gray-800 transition-colors duration-200"
          >
            Terms of Service
          </a>
          <span>|</span>
          <a
            href="#"
            className="hover:text-gray-800 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
