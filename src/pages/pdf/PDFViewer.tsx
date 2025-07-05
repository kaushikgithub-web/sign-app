import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { SignatureField, Signer } from '@/types';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  signatureFields: SignatureField[];
  onAddSignatureField: (x: number, y: number, page: number) => void;
  onFieldClick: (field: SignatureField) => void;
  onDeleteSignature: (fieldId: string) => void;
  onUpdateSignatureFieldPosition: (fieldId: string, x: number, y: number) => void;
  // @ts-ignore
  signers: Signer[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  signatureFields,
  onAddSignatureField,
  onDeleteSignature,
  onFieldClick,
  onUpdateSignatureFieldPosition,
  signers,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);

  const draggingFieldId = useRef<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; fieldX: number; fieldY: number } | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    page: number
  ) => {
    const container = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - container.left;
    const y = event.clientY - container.top;
    onAddSignatureField(x, y, page);
  };

  const onDragStart = (e: React.MouseEvent, field: SignatureField) => {
    e.stopPropagation();
    draggingFieldId.current = field.id;

    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      fieldX: field.x,
      fieldY: field.y,
    };

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };

  const onDragMove = (e: MouseEvent) => {
    if (!draggingFieldId.current || !dragStartPos.current) return;

    const deltaX = e.clientX - dragStartPos.current.mouseX;
    const deltaY = e.clientY - dragStartPos.current.mouseY;

    const newX = dragStartPos.current.fieldX + deltaX;
    const newY = dragStartPos.current.fieldY + deltaY;

    onUpdateSignatureFieldPosition(draggingFieldId.current, newX, newY);
  };

  const onDragEnd = () => {
    draggingFieldId.current = null;
    dragStartPos.current = null;

    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: 16 }}>
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <div
              key={`page_${pageNumber}`}
              style={{ position: 'relative', marginBottom: 24 }}
              onClick={(e) => handlePageClick(e, pageNumber)}
            >
              <Page pageNumber={pageNumber} width={800} />

              {signatureFields
                .filter((field) => field.page === pageNumber)
                .map((field) => {
                  const signer = signers.find((s) => s.id === field.assignedTo);
                  const isSigned = field.signed;

                  return (
                    <div
                      key={field.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSigned) {
                          onFieldClick(field);
                        }
                      }}
                      onMouseEnter={() => setHoveredFieldId(field.id)}
                      onMouseLeave={() => setHoveredFieldId(null)}
                      onMouseDown={(e) => onDragStart(e, field)}
                      style={{
                        position: 'absolute',
                        left: field.x,
                        top: field.y,
                        width: field.width,
                        height: field.height,
                        border: isSigned ? 'none' : '2px solid #fff',
                        backgroundColor: isSigned ? 'transparent' : '#fff',
                        borderRadius: 4,
                        cursor: isSigned ? 'default' : 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 500,
                        userSelect: 'none',
                        textAlign: 'center',
                        color: isSigned ? '#000' : '#1e40af',
                        overflow: 'visible',
                        zIndex: 10,
                      }}
                      title={signer?.email}
                    >
                      {isSigned && (
                        <>
                          {hoveredFieldId === field.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSignature(field.id);
                              }}
                              style={{
                                position: 'absolute',
                                top: -20,
                                right: 0,
                                background: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                zIndex: 20,
                              }}
                            >
                              ×
                            </button>
                          )}

                          {field.signatureType === 'type' && field.signatureText && (
                            <span
                              style={{
                                fontFamily: 'cursive',
                                fontSize: '18px',
                                color: '#000',
                                textAlign: 'center',
                                width: '100%',
                                cursor: 'pointer',
                              }}
                            >
                              {field.signatureText}
                            </span>
                          )}

                          {field.signatureType === 'draw' && field.signatureImage && (
                            <img
                              src={field.signatureImage}
                              alt="drawn signature"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default PDFViewer;
