"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Plus, FileText, ChevronRight, Activity } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useRouter } from "next/navigation";
import { useReadContract, useWatchContractEvent, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [documentCount, setDocumentCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const controls = useAnimation();
  const router = useRouter();
  const { address } = useAccount();

  const { data: documentsAssigned } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getDocumentsAssignedToUser",
    args: [address],
  });

  useEffect(() => {
    if (documentsAssigned) {
      if (
        Array.isArray(documentsAssigned) ||
        (typeof documentsAssigned === "object" && "length" in documentsAssigned)
      ) {
        setDocumentCount((documentsAssigned as any[]).length);
      } else if (typeof documentsAssigned === "bigint") {
        setDocumentCount(1);
      } else {
        console.error(
          "Unexpected type for documentsAssigned:",
          documentsAssigned
        );
        setDocumentCount(0);
      }
      console.log(documentsAssigned);
    }
  }, [documentsAssigned]);

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }));
  }, [controls]);

  // const addNotification = useCallback((newNotification: string) => {
  //   setNotifications((prevNotifications) => [
  //     ...prevNotifications,
  //     newNotification,
  //   ]);
  // }, []);

  // useWatchContractEvent({
  //   address: CONTRACT_ADDRESS,
  //   abi: CONTRACT_ABI,
  //   eventName: "DocumentCreated",
  //   fromBlock: BigInt(0),
  //   onLogs: (logs) => {
  //     logs.forEach((log: any) => {
  //       const [documentId, title, signers, creator] = log.args as [
  //         bigint,
  //         string,
  //         `0x${string}`[],
  //         `0x${string}`,
  //       ];
  //       console.log("Document Created:", {
  //         documentId,
  //         title,
  //         signers,
  //         creator,
  //       });
  //       if (signers.includes(address ?? "0x")) {
  //         const notification = `A new document "${title}" was created by ${creator.slice(0, 6)}...${creator.slice(-4)}. You have been assigned as a signer.`;
  //         addNotification(notification);
  //       }
  //     });
  //   },
  // });

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

        </div>
        {/* Statistics Section */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[
            {
              icon: FileText,
              title: "Assigned Documents",
              value: documentCount || 0,
            },
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
