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
import { toast } from "react-toastify";
import QueryParams from "../components/QueryParams";

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
  const signatureRef = useRef<HTMLDivElement | null>(null);
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
        `https://gateway.pinata.cloud/ipfs/${fileHash}`
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

  const handleSave = async () => {
    if (signatureImage && pdfBytes && pdfViewport) {
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

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });

        toast.info("Signing document...");
        const file = new File([blob], "signed_document.pdf", {
          type: "application/pdf",
          lastModified: new Date().getTime(),
        });

        const fileList = [file];
        // const signedDocument = await uploadFile(fileList);
        // const signedDocumentHash = signedDocument.data.Hash;

        // await signDocument(id as string, signedDocumentHash);
        toast.success("Document signed successfully");
      } catch (error) {
        console.error("Error modifying PDF:", error);
        toast.error("Error signing document");
      }
    }
  };

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
              <button
                onClick={handleSave}
                disabled={!hasSignature || !pdfBytes}
                className="w-full px-4 py-2 text-sm font-medium text-green-900 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
              >
                Sign and Save
              </button>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
