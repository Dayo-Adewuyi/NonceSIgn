import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Fragment } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { PDFDocument } from "pdf-lib";
import Draggable, { DraggableEventHandler } from "react-draggable";
import { Document, Page } from "react-pdf";

interface PDFSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    description: string;
    fileHash: string;
  };
  onSave: (id: string, pdfBytes: Uint8Array) => void;
}

interface PDFDimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

export default function PDFSignModal({
  isOpen,
  onClose,
  document,
  onSave,
}: PDFSignModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState<PDFDimensions>({
    width: 0,
    height: 0,
  });
  const canvasRef = useRef<ReactSketchCanvasRef | null>(null);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [signaturePosition, setSignaturePosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const signatureRef = useRef<HTMLDivElement>(null);


  const loadPDF = useCallback(async () => {
    try {
      const response = await fetch(
        `https://gateway.lighthouse.storage/ipfs/${document.fileHash}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      setPdfBytes(arrayBuffer);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  }, [document.fileHash]);

  useEffect(() => {
    if (isOpen) {
      loadPDF();
      setHasSignature(false);
      setSignatureImage(null);
      setSignaturePosition({ x: 0, y: 0 });
    }
  }, [isOpen, loadPDF]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: any) => {
    setNumPages(numPages);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPdfDimensions({ width, height });
  }, []);

  const handleSave = async () => {
    if (signatureImage && pdfBytes) {
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const currentPage = pages[pageNumber - 1];

        const { width, height } = currentPage.getSize();
        const scale = width / pdfDimensions.width;

        const signatureImageBytes = await fetch(signatureImage)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to load signature image");
            return res.arrayBuffer();
          })
          .catch((error) => {
            console.error(error);
            return null;
          });

        if (!signatureImageBytes) return;

        const signatureImagePdf = await pdfDoc.embedPng(signatureImageBytes);
        const signatureHeight = 100 * scale;
        currentPage.drawImage(signatureImagePdf, {
          x: signaturePosition.x * scale,
          y: height - (signaturePosition.y + signatureHeight) * scale,
          width: 200 * scale,
          height: signatureHeight,
        });

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
        onSave(document.id, modifiedPdfBytes);
        onClose();
      } catch (error) {
        console.error("Error modifying PDF:", error);
      }
    }
  };

  const handleSignatureComplete = async () => {
    if (canvasRef.current) {
      try {
        const signatureDataUrl = await canvasRef.current.exportImage("png");
        console.log(
          "Signature data URL generated:",
          signatureDataUrl.slice(0, 100) + "..."
        ); // Debugging
        setSignatureImage(signatureDataUrl);
        setHasSignature(true);
      } catch (error) {
        console.error("Error generating signature:", error);
      }
    }
  };

  const handleDragStop: DraggableEventHandler = (_e, data) => {
    setSignaturePosition({ x: data.x, y: data.y });
  };

  useEffect(() => {
    if (isOpen) {
      canvasRef.current?.clearCanvas();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("Signature state updated:", {
      hasSignature,
      signatureImage: signatureImage ? "exists" : "null",
    });
  }, [hasSignature, signatureImage]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-3xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {document.title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    {document.description}
                  </p>

                  <div
                    className="relative"
                    style={{
                      width: pdfDimensions.width,
                      height: pdfDimensions.height,
                    }}
                  >
                    {pdfBytes && (
                      <Document
                        file={pdfBytes}
                        onLoadSuccess={onDocumentLoadSuccess}
                      >
                        <Page
                          key={`page_${pageNumber}`}
                          pageNumber={pageNumber}
                          onLoadSuccess={onPageLoadSuccess}
                          width={pdfDimensions.width}
                        />
                      </Document>
                    )}

                    {signatureImage && (
                      <Draggable
                        nodeRef={signatureRef}
                        onStop={handleDragStop}
                        bounds={{
                          left: 0,
                          top: 0,
                          right: pdfDimensions.width - 200,
                          bottom: pdfDimensions.height - 100,
                        }}
                        position={signaturePosition}
                      >
                        <div
                          ref={signatureRef}
                          style={{
                            position: "absolute",
                            cursor: "move",
                            zIndex: 10,
                            border: "1px solid red",
                          }}
                        >
                          <img
                            src={signatureImage}
                            alt="Signature"
                            style={{
                              width: "200px",
                              height: "100px",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      </Draggable>
                    )}
                  </div>

                  {/* Signature Canvas */}
                  {!hasSignature && (
                    <div className="mt-4 flex justify-end">
                      <div className="w-1/2">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Sign here:
                        </h4>
                        <ReactSketchCanvas
                          ref={canvasRef}
                          width="100%"
                          height="150px"
                          strokeWidth={2}
                          strokeColor="black"
                          canvasColor="white"
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={handleSignatureComplete}
                            className="px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Complete Signature
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    {hasSignature ? "Completed" : "Not Completed"}
                    {signatureImage && <p>Signature Image URL available</p>}
                    Signature State:{" "}
                  </div>
                  {/* Pagination Controls */}
                  <div className="mt-4 flex justify-between">
                    <button
                      disabled={pageNumber <= 1}
                      onClick={() => setPageNumber((prev) => prev - 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <p>
                      Page {pageNumber} of {numPages}
                    </p>
                    <button
                      disabled={pageNumber >= (numPages ?? 0)}
                      onClick={() => setPageNumber((prev) => prev + 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-red-900 bg-red-100 rounded-md hover:bg-red-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-green-900 bg-green-100 rounded-md hover:bg-green-200"
                    onClick={handleSave}
                    disabled={!hasSignature}
                  >
                    Sign
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}