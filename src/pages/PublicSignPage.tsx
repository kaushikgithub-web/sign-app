import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  PenTool, 
  CheckCircle, 
  XCircle, 
  FileText,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import PDFViewer from './pdf/PDFViewer';
import SignatureModal from '@/components/signature/SignatureModal';
import { Document, SignatureField } from '@/types';

const PublicSignPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<SignatureField | null>(null);
  const [signatureFields, setSignatureFields] = useState<SignatureField[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'pending' | 'signed' | 'rejected'>('pending');

  // Mock document for demonstration
  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDoc: Document = {
          _id: '1',
          originalName:"Service Agreement - Q1 2024.pdf",
          name: 'Service Agreement - Q1 2024.pdf',
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          size: 2456789,
          type: 'application/pdf',
          owner: 'TechCorp Legal Team',
          signers: [
            {
              id: '1',
              name: 'John Smith',
              email: 'john@example.com',
              status: 'pending',
              order: 1
            }
          ],
          signatures: [],
          auditTrail: []
        };
        setSignatureFields([
          {
            id: '1',
            type: 'signature',
            x: 20,
            y: 70,
            width: 200,
            height: 60,
            page: 1,
            required: true,
            assignedTo: '1',
            signed: false
          },
          {
            id: '2',
            type: 'date',
            x: 60,
            y: 70,
            width: 120,
            height: 40,
            page: 1,
            required: true,
            assignedTo: '1',
            signed: false
          }
        ]);

        setDocument(mockDoc);
      } catch (error) {
        toast.error('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [token]);

  const handleFieldClick = (field: SignatureField) => {
    setSelectedField(field);
    setSignatureModalOpen(true);
  };

  const handleSignatureComplete = (signatureData: any) => {
    if (selectedField) {
      // Update the field as signed
      setSignatureFields(fields =>
        fields.map(field =>
          field.id === selectedField.id
            ? { ...field, signed: true, signatureData }
            : field
        )
      );

      toast.success('Signature added successfully!');
      setSignatureModalOpen(false);
      setSelectedField(null);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('signed');
      toast.success('Document signed successfully!');
    } catch (error) {
      toast.error('Failed to sign document');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    setSigning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('rejected');
      toast.success('Document rejected');
    } catch (error) {
      toast.error('Failed to reject document');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Not Found</h3>
            <p className="text-gray-600">
              The document you're trying to access doesn't exist or the link has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'signed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Signed!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for signing the document. A copy has been sent to your email.
            </p>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Rejected</h3>
            <p className="text-gray-600 mb-4">
              You have declined to sign this document. The sender has been notified.
            </p>
            <Badge className="bg-red-100 text-red-800">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allFieldsSigned = signatureFields.every(field => field.signed || !field.required);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-lg">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sign Document</h1>
                <p className="text-gray-600">Please review and sign the document below</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Secure & Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Document:</Label>
                  <p className="text-sm text-gray-600 mt-1">{document.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">From:</Label>
                  <p className="text-sm text-gray-600 mt-1">{document.owner}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status:</Label>
                  <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Signature
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Signer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Signer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {document.signers[0]?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{document.signers[0]?.name}</p>
                    <p className="text-sm text-gray-600">{document.signers[0]?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signature Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Signature Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signatureFields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between">
                      <span className="text-sm">{field.type === 'signature' ? 'Signature' : 'Date'} {index + 1}</span>
                      <Badge variant={field.signed ? 'default' : 'outline'}>
                        {field.signed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleSign}
                disabled={!allFieldsSigned || signing}
                className="w-full"
              >
                {signing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Sign Document
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleReject}
                disabled={signing}
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline to Sign
              </Button>
            </div>

            {/* Optional Message */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Add Message (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add a message for the sender..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <Card className="h-[800px]">
              <PDFViewer
              // @ts-ignore
                documentId={document._id} 
                signatureFields={signatureFields}
                onAddSignatureField={() => {}} // Disabled for public signing
                onFieldClick={handleFieldClick}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        open={signatureModalOpen}
        onOpenChange={setSignatureModalOpen}
        onComplete={handleSignatureComplete}
        field={selectedField}
      />
    </div>
  );
};

export default PublicSignPage;