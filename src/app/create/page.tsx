"use client";
import React, { useState, useEffect, KeyboardEvent, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FileText, User, Upload, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAddress } from "@coinbase/onchainkit/identity";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import lighthouse from "@lighthouse-web3/sdk";
import { useToast } from "../AppContext";
import type { ContractFunctionParameters } from "viem";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import TransactionWrapper from "../components/TransactionWrapper";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";

interface FormData {
  title: string;
  description: string;
  signerAddresses: string[];
  emails: string[];
  files: File[];
}

const CreateSignature: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    signerAddresses: [],
    emails: [],
    files: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [fileHash, setFileHash] = useState<string>("");
  const [transactionArgs, setTransactionArgs] = useState<any[]>([]);
  const [currentInput, setCurrentInput] = useState({ address: "", email: "" });
  const [isTransactionReady, setIsTransactionReady] = useState(false);
  const { showToast } = useToast();

  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({ ...prev, files: acceptedFiles }));
    },
  });

  const steps = [
    { title: "Document Details", icon: FileText },
    { title: "Upload Files", icon: Upload },
    { title: "Signer Information", icon: User },
  ];

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 },
  };
  const prepareTransaction = useCallback(async () => {
    if (!formData.signerAddresses.length || formData.files.length === 0) {
      return;
    }
    try {
      const file = await lighthouse.upload(
        formData.files,
        "9ffdacd7.96af6c3f7fec4decad3b337dcc108804"
      );
      setFileHash(file.data.Hash);
      setTransactionArgs([
        formData.title,
        formData.description,
        file.data.Hash,
        formData.signerAddresses,
      ]);
      setIsTransactionReady(true);
    } catch (error) {
      console.error("Failed to prepare signature request:", error);
      showToast(
        "Failed to prepare signature request. Please try again.",
        "error"
      );
    }
  }, [formData, showToast]);

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      prepareTransaction();
    } else {
      setIsTransactionReady(false);
    }
  }, [currentStep, prepareTransaction]);

  const handleAddInput = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "address" | "email"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentInput[type]) {
        setFormData((prev) => ({
          ...prev,
          [type === "address" ? "signerAddresses" : "emails"]: [
            ...prev[type === "address" ? "signerAddresses" : "emails"],
            currentInput[type],
          ],
        }));
        setCurrentInput({ ...currentInput, [type]: "" });
      }
    }
  };

  const removeInput = (index: number, type: "address" | "email") => {
    setFormData((prev) => ({
      ...prev,
      [type === "address" ? "signerAddresses" : "emails"]: prev[
        type === "address" ? "signerAddresses" : "emails"
      ].filter((_, i) => i !== index),
    }));
  };

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    showToast(status.statusName, "info");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Back
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl"
      >
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Create a Signature Request
        </h1>
        <div className="flex justify-between mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <motion.div
                className={`rounded-full p-3 ${
                  index <= currentStep ? "bg-blue-100" : "bg-gray-100"
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <step.icon size={24} />
              </motion.div>
              <p className="mt-2 text-sm text-black">{step.title}</p>
            </motion.div>
          ))}
        </div>
        <form className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <motion.input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="block w-full border rounded-lg p-3 text-lg text-black"
                  whileFocus="focus"
                  variants={inputVariants}
                />
                <motion.textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="block w-full border rounded-lg p-3 mt-4 text-lg text-black h-32"
                  whileFocus="focus"
                  variants={inputVariants}
                />
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  {...getRootProps()}
                  className={`border-3 border-dashed rounded-lg p-12 transition-colors ${
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    className="text-center"
                    animate={{ scale: isDragActive ? 1.1 : 1 }}
                  >
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-lg">
                      {isDragActive
                        ? "Drop files here..."
                        : "Drag & drop files here, or click to select files"}
                    </p>
                    {formData.files.length > 0 && (
                      <p className="mt-4 text-blue-600 font-semibold">
                        {formData.files.length} file
                        {formData.files.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <motion.input
                  type="text"
                  placeholder="Add Signer Address"
                  value={currentInput.address}
                  onChange={(e) =>
                    setCurrentInput({
                      ...currentInput,
                      address: e.target.value,
                    })
                  }
                  onKeyDown={(e) => handleAddInput(e, "address")}
                  className="block w-full border rounded-lg p-3 text-lg text-black"
                  whileFocus="focus"
                  variants={inputVariants}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.signerAddresses.map((address, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-white px-3 py-1 rounded-full flex items-center"
                    >
                      <span className="mr-2 text-black">{address}</span>
                      <button
                        type="button"
                        onClick={() => removeInput(index, "address")}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <motion.input
                  type="email"
                  placeholder="Add Signer Email"
                  value={currentInput.email}
                  onChange={(e) =>
                    setCurrentInput({ ...currentInput, email: e.target.value })
                  }
                  onKeyDown={(e) => handleAddInput(e, "email")}
                  className="block w-full border rounded-lg p-3 text-lg text-black mt-4"
                  whileFocus="focus"
                  variants={inputVariants}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.emails.map((email, index) => (
                    <div
                      key={index}
                      className="bg-red-100 text-black px-3 py-1 rounded-full flex items-center"
                    >
                      <span className="mr-2 text-black">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeInput(index, "email")}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div className="flex justify-between mt-6">
            <motion.button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="px-6 py-3 rounded-md bg-gray-400 text-white"
              disabled={currentStep === 0}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Back
            </motion.button>
            {currentStep < steps.length - 1 ? (
              <motion.button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-6 py-3 rounded-md bg-blue-500 text-white"
                disabled={
                  (currentStep === 0 &&
                    (!formData.title || !formData.description)) ||
                  (currentStep === 1 && formData.files.length === 0)
                }
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Next
              </motion.button>
            ) : (
              <TransactionWrapper
                contracts={
                  isTransactionReady
                    ? ([
                        {
                          address: CONTRACT_ADDRESS,
                          abi: CONTRACT_ABI,
                          functionName: "createDocument",
                          args: transactionArgs,
                        },
                      ] as unknown as ContractFunctionParameters[])
                    : []
                }
                chainId={84532}
                onStatus={handleOnStatus}
              >
                <TransactionButton
                  className="w-50 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg  ml-auto"
                  text="Create Signature"
                  disabled={!isTransactionReady}
                />
                <TransactionStatus>
                  <TransactionStatusAction />
                  <TransactionStatusLabel />
                </TransactionStatus>
              </TransactionWrapper>
            )}
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSignature;
