"use client";
import React, { useState, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { FileText, User, Upload, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  description: string;
  signerAddresses: string[];
  emails: string[];
  files: File[] | string;  
}

const CreateSignature: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    signerAddresses: [],
    emails: [],
    files: "",
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive }: 
  { getRootProps: (props?: DropzoneRootProps | undefined) => DropzoneRootProps; 
    getInputProps: (props?: DropzoneInputProps | undefined) => DropzoneInputProps; 
    isDragActive: boolean; 
  } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFormData((prev) => ({ ...prev, files: acceptedFiles }));
    },
  });


  const handleSubmit = async (): Promise<void> => {
    if (formData.signerAddresses.length === 0) {
      toast.error("Please add at least one signer address, press space after entering each address");
      return;
    }
    if (formData.emails.length === 0) {
      toast.error("Please add at least one email");
      return;
    }

    try {
    //   const file = await uploadFile(formData.files as File[]);
    //   setIsSubmitting(true);
    //   setIsLoading(true);

    //   await createDocument(
    //     formData.title,
    //     formData.description,
    //     file.data.Hash,
    //     formData.signerAddresses,
    //     formData.emails
    //   );

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Signature request created successfully!");

    } catch (error) {
      setIsSubmitting(false);
      setIsLoading(false);
      toast.error("Failed to create signature request");
    }
  };

  const steps = [
    { title: "Document Details", icon: FileText },
    { title: "Upload Files", icon: Upload },
    { title: "Signer Information", icon: User },
  ];

  useEffect(() => {
    if (isSuccess) {
      setCurrentStep(steps.length);
    }
  }, [isSuccess]);

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)" },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 },
  };

  const handleAddAddress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === " ") {
      e.preventDefault();
      if (currentAddress) {
        setFormData((prev) => ({
          ...prev,
          signerAddresses: [...prev.signerAddresses, currentAddress],
        }));
        setCurrentAddress("");
      }
    }
  };

  const handleAddEmail = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === " ") {
      e.preventDefault();
      if (currentEmail) {
        setFormData((prev) => ({
          ...prev,
          emails: [...prev.emails, currentEmail],
        }));
        setCurrentEmail("");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-8">
      {/* Back Button */}
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                        ? "Drop files here"
                        : "Drag 'n' drop files here, or click to select"}
                    </p>
                  </motion.div>
                </div>
                {formData.files.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center text-green-600"
                  >
                    {formData.files.length} file(s) selected
                  </motion.p>
                )}
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
                <div>
                  <motion.input
                    type="text"
                    placeholder="Signer Address / ENS name / Base Name"
                    value={currentAddress}
                    onChange={(e) => setCurrentAddress(e.target.value)}
                    onKeyDown={handleAddAddress}
                    className="block w-full border rounded-lg p-3 text-lg mb-4 text-black"
                    whileFocus="focus"
                    variants={inputVariants}
                  />
                  <div className="flex flex-wrap">
                    {formData.signerAddresses.map((address, index) => (
                      <div
                        key={index}
                        className="bg-blue-200 text-black p-2 rounded-lg shadow-md mr-2 mb-2 flex items-center"
                      >
                        <span className="text-black">{address}</span>
                        <button
                          className="ml-2 text-black-500 hover:text-black-700 font-bold"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              signerAddresses: prev.signerAddresses.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <motion.input
                    type="email"
                    placeholder="Email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyDown={handleAddEmail}
                    className="block w-full border rounded-lg p-3 text-lg mb-4 text-black"
                    whileFocus="focus"
                    variants={inputVariants}
                  />
                  <div className="flex flex-wrap">
                    {formData.emails.map((email, index) => (
                      <div
                        key={index}
                        className="bg-blue-200 text-black p-2 rounded-lg shadow-md mr-2 mb-2 flex items-center"
                      >
                        <span className="text-black">{email}</span>
                        <button
                          className="ml-2 text-black-500 hover:text-black-700 font-bold"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              emails: prev.emails.filter((_, i) => i !== index),
                            }));
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <motion.button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg text-lg"
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
              >
                Back
              </motion.button>
            )}
            <motion.button
              type="button" // Keep type as "button" to prevent premature form submission
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep((prev) => prev + 1); // Move to the next step
                } else {
                  handleSubmit(); // Submit the form when the last step is reached
                }
              }}
              className={`bg-blue-600 text-white py-3 px-6 rounded-lg text-lg ${
                isSubmitting || isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting || isLoading}
              whileHover="hover"
              whileTap="tap"
              variants={buttonVariants}
            >
              {currentStep === steps.length - 1
                ? isSubmitting || isLoading
                  ? "Creating..."
                  : "Create Signature Request"
                : "Next"}
            </motion.button>
          </div>
        </form>

        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="mt-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle size={48} className="text-green-500 mx-auto" />
              </motion.div>
              <p className="text-xl text-green-600 mt-4">
                Signature request created successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CreateSignature;
