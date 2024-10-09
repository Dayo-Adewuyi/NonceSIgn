"use client";
import { useState, useEffect } from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";


interface Document {
  id: string;
  title: string;
  description: string;
  signers: string[];
  completed: boolean;
  fileHash: string;
  creator?: string; 
}

export default function DocumentManagement() {
  const [createdDocs, setCreatedDocs] = useState<Document[]>([]);
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleGetUserCreatedDocuments = async (): Promise<void> => {
    // const docs = await getUserCreatedDocuments();
    // setCreatedDocs(docs);
  };

  const handleGetUserSignedDocuments = async (): Promise<void> => {
    // const docs = await getUserSignedDocuments();
    // setPendingDocs(docs);
  };

  useEffect(() => {
    const fetchDocuments = async (): Promise<void> => {
      setLoading(true);
      await handleGetUserCreatedDocuments();
      await handleGetUserSignedDocuments();
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
          >
            Back
          </button>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          Document Management
        </h1>

        <TabGroup>
          <TabList className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl mb-8">
            <Tab
              as={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg
                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
                ${selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white"}`
              }
            >
              Created Documents
            </Tab>
            <Tab
              as={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg
                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
                ${selected ? "bg-white shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white"}`
              }
            >
              Signed Documents
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <AnimatePresence>
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    Loading created documents...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {createdDocs.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <DocumentIcon className="h-8 w-8 text-blue-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {doc.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{doc.description}</p>
                        <div className="text-sm text-gray-500 mb-2">
                          Signers: {doc.signers.length}
                        </div>
                        <div
                          className={`text-sm ${
                            doc.completed ? "text-green-500" : "text-yellow-500"
                          }`}
                        >
                          Status: {doc.completed ? "Completed" : "Pending"}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          <a
                            href={`https://gateway.lighthouse.storage/ipfs/${doc.fileHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabPanel>
            <TabPanel>
              <AnimatePresence>
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    Loading pending documents...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {pendingDocs.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                      >
                        <PencilIcon className="h-8 w-8 text-yellow-500 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {doc.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{doc.description}</p>
                        <div className="text-sm text-gray-500 mb-4">
                          Creator: {doc.creator}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          <a
                            href={`https://gateway.lighthouse.storage/ipfs/${doc.fileHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
