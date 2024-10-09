import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Transition } from "@headlessui/react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { ArrowDownIcon, FileTextIcon, LockIcon, UsersIcon } from "lucide-react";
import { BlackCreateWalletButton } from "./components/BlackCreateWallet";
import { Engine } from "@tsparticles/engine";

const LandingPage: React.FC = () => {
  const [init, setInit] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    console.log(container);
  }, []);

  const features = [
    {
      icon: <FileTextIcon size={48} />,
      title: "Create Documents",
      description: "Easily upload and manage your documents",
    },
    {
      icon: <UsersIcon size={48} />,
      title: "Invite Signers",
      description: "Add multiple signers to your documents",
    },
    {
      icon: <LockIcon size={48} />,
      title: "Secure Signatures",
      description: "Sign documents with blockchain security",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white overflow-hidden">
      {init && (
        <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: true, mode: "push" },
                onHover: { enable: true, mode: "repulse" },
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 200, duration: 0.4 },
              },
            },
            particles: {
              color: { value: "#ffffff" },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: { enable: true, speed: 2 },
              number: { density: { enable: true }, value: 80 },
              opacity: { value: 0.5 },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 5 } },
            },
            detectRetina: true,
          }}
          className="absolute inset-0 z-0"
        />
      )}

      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold bg-clip-text bg-gradient-to-r from-layeredTeal to-layeredDarkBlue">
              NonceSign
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-4 md:w-auto w-full">
              <BlackCreateWalletButton />
            </div>
          </motion.div>
        </nav>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl font-extrabold bg-clip-text bg-gradient-to-r from-layeredTeal to-layeredDarkBlue mb-6">
            Secure Document Signing on the Blockchain
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience the future of digital signatures with NonceSign
          </p>
          <div>
            <BlackCreateWalletButton />
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 100 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white bg-opacity-30 p-6 rounded-lg text-center shadow-lg hover:shadow-xl transition-transform"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2 * index,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-white text-xl font-semibold mt-4 mb-2">
                {feature.title}
              </h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Learn More */}
        <div className="text-center mb-16">
          <motion.button
            onClick={() => setShowMore(!showMore)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-blue-900 px-6 py-3 rounded-full font-semibold inline-flex items-center shadow-lg hover:shadow-xl"
          >
            {showMore ? "Show Less" : "Learn More"}
            <ArrowDownIcon
              className={`ml-2 transition-transform duration-300 ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </motion.button>
        </div>

        <Transition
          show={showMore}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-white bg-opacity-5 p-8 rounded-lg shadow-xl text-center">
            <p className="text-gray-200 text-lg">
              NonceSign is the most secure way to sign documents with blockchain
              technology. Our platform ensures that your documents remain
              tamper-proof and easily verifiable. Start using NonceSign today and
              never worry about document security again.
            </p>
          </div>
        </Transition>
      </main>
    </div>
  );
};

export default LandingPage;