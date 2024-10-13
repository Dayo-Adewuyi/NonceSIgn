"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  Suspense,
} from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { PDFDocument } from "pdf-lib";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { Document, Page } from "react-pdf";
import { useRouter } from "next/navigation";
import QueryParams from "../components/QueryParams";
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
import { ToastType } from "../components/Toast";

interface SignaturePosition {
  x: number;
  y: number;
}

interface QueryParamsType {
  id: string | null;
  fileHash: string | null;
  title: string | null;
  description: string | null;
}

const usePdfModification = (
  pdfBytes: ArrayBuffer | null,
  pdfViewport: any,
  showToast: (message: string, type: ToastType) => void
) => {
  const modifyPdf = useCallback(
    async (
      signatureImage: string,
      signaturePosition: { x: number; y: number },
      pageNumber: number
    ) => {
      if (!pdfBytes || !pdfViewport) {
        showToast("PDF or viewport not ready", "error");
        return null;
      }

      try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const currentPage = pages[pageNumber - 1];

        const { width, height } = currentPage.getSize();
        const scale = width / pdfViewport.width;

        const signatureImageBytes = await fetch(signatureImage).then((res) =>
          res.arrayBuffer()
        );
        const signatureImagePdf = await pdfDoc.embedPng(signatureImageBytes);

        const signatureWidth = 200 * scale;
        const signatureHeight = 100 * scale;

        const xPosition = signaturePosition.x * scale;
        const yPosition =
          height - signaturePosition.y * scale - signatureHeight;

        currentPage.drawImage(signatureImagePdf, {
          x: xPosition,
          y: yPosition,
          width: signatureWidth,
          height: signatureHeight,
        });

        return await pdfDoc.save();
      } catch (error) {
        console.error("Error modifying PDF:", error);
        showToast("Error modifying PDF", "error");
        return null;
      }
    },
    [pdfBytes, pdfViewport, showToast]
  );

  return { modifyPdf };
};

export default function PDFSignPage() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition>(
    { x: 0, y: 0 }
  );
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [pdfViewport, setPdfViewport] = useState<any | null>(null);

  const [id, setId] = useState<string | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [transactionArgs, setTransactionArgs] = useState<any[]>([]);
  const [isTransactionReady, setIsTransactionReady] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);
  const signatureRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();
  const { modifyPdf } = usePdfModification(
    pdfBytes,
    pdfViewport,
    (message: string, type: ToastType) => showToast(message, type)
  );

  const router = useRouter();

  const handleParamsChange = ({
    id,
    fileHash,
    title,
    description,
  }: QueryParamsType) => {
    setId(id);
    setFileHash(fileHash);
    setTitle(title);
    setDescription(description);
  };

  const loadPDF = useCallback(async () => {
    if (!fileHash) return;
    try {
      const response = await fetch(
        `https://gateway.lighthouse.storage/ipfs/${fileHash}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      setPdfBytes(arrayBuffer);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  }, [fileHash]);

  useEffect(() => {
    loadPDF();
  }, [loadPDF]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const onPageLoadSuccess = useCallback((page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPdfViewport(viewport);
    setPdfDimensions({ width: viewport.width, height: viewport.height });
    console.log("PDF viewport set:", viewport);
  }, []);

  const handleSave = useCallback(async () => {
    if (signatureImage && pdfBytes && pdfViewport) {
      const modifiedPdfBytes = await modifyPdf(
        signatureImage,
        signaturePosition,
        pageNumber
      );

      if (!modifiedPdfBytes) {
        showToast("Failed to modify PDF", "error");
        return;
      }

      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const file = new File([blob], "signed_document.pdf", {
        type: "application/pdf",
        lastModified: new Date().getTime(),
      });

      try {
        const doc = await lighthouse.upload(
          [file],
          "d7a10514.250b77d6f7264344a7ca5de7d6d8b9c3"
        );
        console.log(id);
        setTransactionArgs([id, doc.data.Hash]);
        setIsTransactionReady(true);
        showToast("Signing document...", "info");
      } catch (error) {
        console.error("Error uploading to Lighthouse:", error);
        showToast("Error uploading signed document", "error");
      }
    }
  }, [
    signatureImage,
    pdfBytes,
    pdfViewport,
    id,
    signaturePosition,
    pageNumber,
    modifyPdf,
    showToast,
  ]);

  useEffect(() => {
    if (shouldSave) {
      handleSave();
      setShouldSave(false);
    }
  }, [shouldSave, handleSave]);

  const handleSignatureComplete = async () => {
    if (canvasRef.current) {
      try {
        const signatureDataUrl = await canvasRef.current.exportImage("png");
        setSignatureImage(signatureDataUrl);
        setHasSignature(true);
        const newPosition = {
          x: pdfDimensions.width / 2 - 50,
          y: pdfDimensions.height / 2 - 50,
        };
        setSignaturePosition(newPosition);
        setShouldSave(true);
      } catch (error) {
        console.error("Error generating signature:", error);
      }
    }
  };

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    const newPosition = { x: data.x, y: data.y };
    setSignaturePosition(newPosition);
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    const newPosition = { x: data.x, y: data.y };
    setSignaturePosition(newPosition);
  };

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    showToast(status.statusName, "info");
  }, []);

  return (
    <div className="container bg-white mx-auto p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <QueryParams onParamsChange={handleParamsChange} />
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow">
            <div
              className="relative border border-gray-300 rounded"
              style={{
                width: pdfDimensions.width,
                height: pdfDimensions.height,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {pdfBytes && (
                <Document file={pdfBytes} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page
                    key={`page_${pageNumber}`}
                    pageNumber={pageNumber}
                    onLoadSuccess={onPageLoadSuccess}
                    width={pdfDimensions.width}
                  />
                </Document>
              )}

              {signatureImage && pdfViewport && (
                <Draggable
                  nodeRef={signatureRef}
                  onStop={handleDragStop}
                  onDrag={handleDrag}
                  bounds="parent"
                  position={signaturePosition}
                  defaultPosition={{ x: 0, y: 0 }}
                >
                  <div
                    ref={signatureRef}
                    style={{
                      position: "absolute",
                      cursor: "move",
                      zIndex: 9999,
                      border: "5px solid red",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      width: "200px",
                      height: "100px",
                      left: 0,
                      top: 0,
                    }}
                  >
                    <img
                      src={signatureImage}
                      alt="Signature"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </Draggable>
              )}
            </div>

            <div className="mt-4 flex justify-between items-center">
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
                disabled={pageNumber >= (numPages || 0)}
                onClick={() => setPageNumber((prev) => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            {!hasSignature ? (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Sign here:
                </h4>
                <ReactSketchCanvas
                  ref={canvasRef}
                  width="50%"
                  height="100px"
                  strokeWidth={2}
                  strokeColor="black"
                  canvasColor="white"
                />
                <button
                  onClick={handleSignatureComplete}
                  className="mt-4 w-full px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Complete Signature
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-green-600 mb-4">Signature completed!</p>
                <button
                  onClick={() => {
                    setHasSignature(false);
                    setSignatureImage(null);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md hover:bg-blue-200"
                >
                  Clear Signature
                </button>
              </div>
            )}

            <div className="mt-8">
              <button
                className="w-full px-4 py-2 mb-4 text-sm font-medium text-red-900 bg-red-100 rounded-md hover:bg-red-200"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <TransactionWrapper
                contracts={
                  isTransactionReady
                    ? ([
                        {
                          address: CONTRACT_ADDRESS,
                          abi: CONTRACT_ABI,
                          functionName: "signDocument",
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
                  disabled={!isTransactionReady || !hasSignature || !pdfBytes}
                />
                <TransactionStatus>
                  <TransactionStatusAction />
                  <TransactionStatusLabel />
                </TransactionStatus>
              </TransactionWrapper>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
