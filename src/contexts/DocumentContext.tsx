import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, Signature } from '@/types';

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
  addSignature: (documentId: string, signature: Omit<Signature, 'id' | 'createdAt'>) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

const generateMockDocuments = (): Document[] => [
  {
    _id: '1',
    originalName: 'Employment Contract - John Smith.pdf',
    name: 'Employment Contract - John Smith.pdf',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    size: 2456789,
    type: 'application/pdf',
    owner: 'HR Department',
    signers: [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        status: 'pending',
        order: 1
      }
    ],
    signatures: [],
    auditTrail: [
      {
        id: '1',
        action: 'Document created',
        user: 'HR Department',
        timestamp: '2024-01-15T10:30:00Z',
        ipAddress: '192.168.1.1',
        details: 'Document uploaded and prepared for signing'
      }
    ],
    publicLink: 'https://app.docusign.com/sign/abc123'
  },

];

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(generateMockDocuments());

  const addDocument = useCallback((documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>) => {
    const newDocument: Document = {
      ...documentData,
      _id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTrail: [
        {
          id: Math.random().toString(36).substr(2, 9),
          action: 'Document created',
          user: documentData.owner,
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
          details: 'Document uploaded and prepared for signing'
        }
      ]
    };

    setDocuments(prev => [newDocument, ...prev]);
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => 
      // @ts-ignore
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
        : doc
    ));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    // @ts-ignore
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const getDocument = useCallback((id: string) => {
    // @ts-ignore
    return documents.find(doc => doc.id === id);
  }, [documents]);

  const addSignature = useCallback((documentId: string, signatureData: Omit<Signature, 'id' | 'createdAt'>) => {
    const newSignature: Signature = {
      ...signatureData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    setDocuments(prev => prev.map(doc => {
      // @ts-ignore
      if (doc.id === documentId) {
        const updatedSignatures = [...doc.signatures, newSignature];
        const updatedSigners = doc.signers.map(signer => 
          signer.id === signatureData.signerId 
            ? { ...signer, status: 'signed' as const, signedAt: new Date().toISOString() }
            : signer
        );
        
        // Check if all signers have signed
        const allSigned = updatedSigners.every(signer => signer.status === 'signed');
        const newStatus = allSigned ? 'completed' : 'signed';

        return {
          ...doc,
          signatures: updatedSignatures,
          signers: updatedSigners,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          auditTrail: [
            ...doc.auditTrail,
            {
              id: Math.random().toString(36).substr(2, 9),
              action: allSigned ? 'Document completed' : 'Document signed',
              user: updatedSigners.find(s => s.id === signatureData.signerId)?.name || 'Unknown',
              timestamp: new Date().toISOString(),
              ipAddress: '192.168.1.100',
              details: allSigned ? 'All signatures collected' : 'Signature added'
            }
          ]
        };
      }
      return doc;
    }));
  }, []);

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      getDocument,
      addSignature
    }}>
      {children}
    </DocumentContext.Provider>
  );
};