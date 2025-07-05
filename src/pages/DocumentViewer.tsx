import  { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  Share2,
  Users,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import PDFViewer from './pdf/PDFViewer';
import SignatureModal from '@/components/signature/SignatureModal';

// Types
interface Signer {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface DocumentData {
  _id: string;
  originalName: string;
  size: number;
  createdAt: string;
  path: string;
  status: string;
  owner: string;
  signers: Signer[];
  publicLink?: string;
}

interface SignatureField {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  assignedTo: string;
  signatureText: string;
  signatureImage?: string;
  signatureType?: 'typed' | 'drawn' | 'uploaded';
  signed?: boolean;
}

interface SignatureData {
  imageData?: string;
  type: 'typed' | 'drawn' | 'uploaded';
  value?: string;
}

const DocumentViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement>(null);

  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<SignatureField | null>(null);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);

  useEffect(() => {
    if (id) fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const res = await axios.get(`https://signature-app-server-1-i8c4.onrender.com/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      setDocData(res.data);
    } catch (error) {
      toast.error('Document not found');
    } finally {
      setLoading(false);
    }
  };

  const saveSignatureFieldsToServer = async (fields: SignatureField[]) => {
    try {
      await axios.put(
        `https://signature-app-server-1-i8c4.onrender.com/api/documents/${id}/fields`,
        { signatureFields: fields },
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
      );
    } catch (error) {
      toast.error('Failed to save signature fields');
    }
  };

  const handleAddSignatureField = (x: number, y: number, page: number) => {
    if (docData?.status === 'completed' || docData?.status === 'rejected') {
      toast.warning('Cannot add fields to a completed/rejected document');
      return;
    }

    const newField: SignatureField = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'signature' as const,
      x,
      y,
      width: 200,
      height: 60,
      page,
      required: true,
      assignedTo: docData?.signers[0]?.id || '',
      signatureText: '',
    };

    setSignatureFields((prev) => [...prev, newField]);
    setSelectedField(newField);
    setSignatureModalOpen(true);
  };

  const handleFieldClick = (field: SignatureField) => {
    setSelectedField(field);
    setSignatureModalOpen(true);
  };

  const handleSignatureComplete = (signatureData: SignatureData) => {
    if (!selectedField) return;

    const updatedFields = signatureFields.map((field) =>
      field.id === selectedField.id
        ? {
            ...field,
            signatureImage: signatureData.imageData || '',
            signatureType: signatureData.type,
            signatureText: signatureData.value || '',
            signed: true,
          }
        : field
    );

    setSignatureFields(updatedFields);
    setSignatureModalOpen(false);
    setSelectedField(null);
    toast.success('Signature added!');
    saveSignatureFieldsToServer(updatedFields);
  };

  const handleShare = () => {
    if (docData?.publicLink) {
      navigator.clipboard.writeText(docData.publicLink);
      toast.success('Public link copied to clipboard');
    }
  };

  const handleDownload = async () => {
    if (!docData) return;

    const viewer = viewerRef.current;
    if (!viewer) return;

    try {
      const canvas = await html2canvas(viewer);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(docData.originalName || 'signed_document.pdf');

      await axios.put(
        `https://signature-app-server-1-i8c4.onrender.com/api/documents/${id}/status`,
        { status: 'completed' },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        }
      );

      toast.success('Document marked as completed');
      fetchDocument();
    } catch (error) {
      toast.error('Failed to download or update status');
    }
  };

  const handleDeleteSignature = (fieldId: string) => {
    setSignatureFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              signed: false,
              signatureText: '',
              signatureImage: '',
              signatureType: undefined,
            }
          : field
      )
    );
  };

  const handleUpdateSignatureFieldPosition = (fieldId: string, newX: number, newY: number) => {
    setSignatureFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, x: newX, y: newY } : field
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p className="text-center p-10">Loading document...</p>;

  if (!docData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document not found</h3>
          <p className="text-gray-600 mb-4">The document you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const pdfUrl = `https://signature-app-server-1-i8c4.onrender.com/${docData.path.replace(/\\/g, '/')}`;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 truncate">{docData.originalName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(docData.status)}>
                  {docData.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  {docData.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                  <span className="capitalize">{docData.status}</span>
                </Badge>
                <span className="text-sm text-gray-500">by {docData.owner}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        </div>
      </div>

      {/* Viewer and Info */}
      <div className="flex-1 flex">
        <div className="w-80 bg-white border-r overflow-y-auto p-6 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Document Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Size:</span><span>{Math.round(docData.size / 1024)} KB</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Created:</span><span>{new Date(docData.createdAt).toLocaleDateString()}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Signers ({docData.signers.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {docData.signers.map((signer) => (
                <div key={signer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {signer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{signer.name}</p>
                      <p className="text-xs text-gray-500">{signer.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(signer.status)}`}>{signer.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 bg-gray-100" ref={viewerRef}>
          <PDFViewer
            pdfUrl={pdfUrl}
            // @ts-ignore
            signatureFields={signatureFields}
            onAddSignatureField={handleAddSignatureField}
            // @ts-ignore
            onFieldClick={handleFieldClick}
            // @ts-ignore
            signers={docData.signers}
            onDeleteSignature={handleDeleteSignature}
            onUpdateSignatureFieldPosition={handleUpdateSignatureFieldPosition}
          />
        </div>
      </div>

      <SignatureModal
        open={signatureModalOpen}
        onOpenChange={setSignatureModalOpen}
        // @ts-ignore
        onComplete={handleSignatureComplete}
        // @ts-ignore
        field={selectedField}
        signers={docData.signers}
      />
    </div>
  );
};

export default DocumentViewer;
