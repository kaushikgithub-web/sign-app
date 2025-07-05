export interface Document {
  _id: string;
  originalName: string | undefined;
  name: string;
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  size: number;
  type: string;
  owner: string;
  signers: Signer[];
  signatures: Signature[];
  auditTrail: AuditEntry[];
  publicLink?: string;
}


export interface Signer {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'rejected';
  signedAt?: string;
  // @ts-ignore
  order: number;
}

export interface Signature {
  id: string;
  signerId: string;
  documentId: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'signature' | 'initial' | 'date' | 'text';
  value?: string;
  imageData?: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
}
export interface SignatureField {
  id: string;
  type: 'signature' | 'date';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  assignedTo: string;
  signatureImage?:string;
  signed?: boolean;
  signatureType?: 'type' | 'draw';
  signatureText?: string;
  signatureData?: {
    type: 'type' | 'draw';
    value: string;
  };
}


