"use client";
import { useState, useEffect } from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilIcon } from "@heroicons/react/24/outline";
import PDFSignModal from "../components/PDFSignModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface Document {
  id: string;
  title: string;
  description: string;
  creator: string;
  fileHash: string;
}

export default function Pending() {
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null); 
  const router = useRouter();

 
  const handleSave = async (documentId: string, modifiedPdfBytes: Uint8Array) => {
    try {
      console.log("Saving document:", documentId);

      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });

      const file = new File([blob], "modified.pdf", {
        type: "application/pdf",
        lastModified: new Date().getTime(),
      });

      const fileList: File[] = [file]; 
      console.log("Uploading file:", file.name, "Size:", file.size, "bytes");

  
    //   const response = await uploadFile(fileList);
    //   console.log("Upload response:", response);

    //   toast.info("Signing document");

  
    //   await signDocument(documentId, response.data.Hash);

      toast.success("Document signed successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving modified PDF:", error);
      toast.error("Failed to sign document. Please try again.");
    }
  };


  const getPendingDocs = async (): Promise<Document[]> => {
    try {
    //   const docs = await getDocumentsAssignedToUser();
    //   console.log("Fetched documents:", docs);
    //   return docs;
    return [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedDocs = await getPendingDocs();
      if (fetchedDocs.length > 0) {
        setPendingDocs(fetchedDocs);
      }
      setLoading(false);
    };

    fetchData();
  }, []);


  const handleSignClick = (doc: Document) => {
    setSelectedDoc(doc);
    router.push(
      `/sign?id=${doc.id}&fileHash=${doc.fileHash}&title=${doc.title}&description=${doc.description}&creator=${doc.creator}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          Pending Signatures
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
              ${
                selected
                  ? "bg-white shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              }`
              }
            >
              Pending Signatures
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
                    Loading pending documents...
                  </motion.div>
                ) : pendingDocs.length > 0 ? (
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
                        <button
                          className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors duration-300"
                          onClick={() => handleSignClick(doc)}
                        >
                          Sign Document
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    No pending documents found.
                  </motion.div>
                )}
              </AnimatePresence>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {isModalOpen && selectedDoc && (
          <PDFSignModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            document={selectedDoc}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
