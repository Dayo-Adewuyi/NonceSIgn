import React, { useState, MouseEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Folder, Menu, X, Bell, LucideIcon } from "lucide-react";
import { Avatar, Identity, Name, Badge, getName } from "@coinbase/onchainkit/identity";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";


interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems: NavItem[] = [
  { id: "create", label: "Create Document", icon: Plus, href: "/create" },
  { id: "pending", label: "Pending Signatures", icon: Clock, href: "/pending" },
  { id: "all", label: "All Documents", icon: Folder, href: "/all-documents" },
];

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  console.log(address);
  const toggleNotifications = (
    e: MouseEvent<HTMLDivElement | HTMLButtonElement>
  ): void => {
    e.preventDefault();
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleMobileMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };




  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-white text-3xl font-italic tracking-wide">
            NonceSign
          </h1>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => (
            <Link href={item.href} key={item.id} passHref>
              <motion.div
                className={`flex items-center space-x-3 text-indigo-200 hover:text-layeredTeal transition-colors duration-300 ${
                  activeTab === item.id ? "text-layeredTeal font-semibold" : ""
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={20} />
                <span className="text-lg">{item.label}</span>
              </motion.div>
            </Link>
          ))}

          {/* Identity Component */}
          <motion.div
            className="flex items-center space-x-2 text-indigo-200 hover:text-layeredTeal transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Identity
              address={address as `0x${string}`}
              schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
            >
              <Avatar className="w-6 h-6 rounded-full" />
              <Name className="text-sm font-medium" />
              <Badge className="text-xs bg-transparent" />
            </Identity>
          </motion.div>

          <motion.button
            className="text-gray-200 hover:text-layeredTeal transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => disconnect()}
          >
            Disconnect
          </motion.button>
        </div>
        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden text-gray-200 hover:text-layeredTeal transition-colors duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMobileMenu}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-layeredDarkBlue shadow-md py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {navItems.map((item) => (
              <Link href={item.href} key={item.id} passHref>
                <motion.div
                  className={`block px-8 py-3 text-lg text-gray-200 hover:text-layeredTeal transition-colors duration-300 ${
                    activeTab === item.id
                      ? "text-layeredTeal font-semibold"
                      : ""
                  }`}
                  whileHover={{ x: 8 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                </motion.div>
              </Link>
            ))}

            <motion.div
              className="block px-8 py-3 text-lg text-gray-200 hover:text-layeredTeal transition-colors duration-300"
              whileHover={{ x: 8 }}
              onClick={toggleNotifications}
            >
              <div className="flex items-center space-x-2">
                <Bell size={20} />
                <span>Notifications</span>
              </div>
            </motion.div>

            {/* Mobile Notification Dropdown */}
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white py-1"
                >
                  {/* Render notifications here if needed */}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
