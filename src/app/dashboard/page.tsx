"use client";
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Plus, FileText, ChevronRight, Activity, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const controls = useAnimation();
  const router = useRouter();
 

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }));
  }, [controls]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 text-gray-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-grow container mx-auto px-4 py-12 mt-16">
        {" "}
      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Welcome to Your Dashboard
          </h2>
          <p className="text-xl text-gray-600">
            Let's make document signing effortless.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Document Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">
              Create a New Document
            </h3>
            <p className="text-gray-600 mb-6">
              Start your document signing process with just a few clicks.
            </p>
            <motion.button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-full font-semibold flex items-center space-x-2 hover:from-indigo-700 hover:to-purple-700 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                router.push("/create");
              }}
            >
              <Plus size={18} />
              <span>Create Document</span>
            </motion.button>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">
              Recent Activity
            </h3>
            <ul className="space-y-4">
              {[
                "Document A signed",
                "Document B pending signature",
                "New document created",
              ].map((activity, index) => (
                <motion.li
                  key={index}
                  className="flex items-center space-x-3 bg-indigo-50 p-3 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={controls}
                  custom={index}
                >
                  <FileText
                    size={18}
                    className="text-indigo-600 flex-shrink-0"
                  />
                  <span className="flex-grow text-gray-800 font-medium">
                    {activity}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
        {/* Statistics Section */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[
            { icon: FileText, title: "Documents Signed", value: "128" },
            { icon: Users, title: "Active Users", value: "56" },
            { icon: Activity, title: "Completion Rate", value: "94%" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-indigo-100 p-3 rounded-full">
                <stat.icon size={24} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-700">
                  {stat.title}
                </h4>
                <p className="text-2xl font-bold text-indigo-600">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {/* Quick Actions */}
        <motion.div
          className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "View All Documents",
              "Invite Team Member",
              "Generate Report",
            ].map((action, index) => (
              <motion.button
                key={index}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-300 py-3 px-4 rounded-lg flex items-center justify-between"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{action}</span>
                <ChevronRight size={18} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
