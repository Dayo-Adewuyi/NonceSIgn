import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="bg-layeredDarkBlue text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h2 className="text-3xl font-extrabold text-layeredTeal tracking-wide mb-6 md:mb-0">
              NonceSign
            </h2>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            className="flex space-x-8 mb-6 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <a
              href="https://www.linkedin.com/in/hamid-adewuyi"
              className="text-gray-300 hover:text-layeredTeal transition-colors duration-300"
              aria-label="LinkedIn"
            >
            </a>
          </motion.div>

          {/* Copyright */}
          <motion.div
            className="text-sm text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>&copy; {currentYear} NonceSign. All rights reserved.</p>
          </motion.div>
        </div>

        {/* Footer Links */}
        <motion.div
          className="mt-8 pt-8 border-t border-gray-700 text-sm text-center text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a
            href="#"
            className="hover:text-layeredTeal transition-colors duration-300 mx-4"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-layeredTeal transition-colors duration-300 mx-4"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="hover:text-layeredTeal transition-colors duration-300 mx-4"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;