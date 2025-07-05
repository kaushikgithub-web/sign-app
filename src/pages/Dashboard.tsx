import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentCard from '@/components/documents/DocumentCard';
import {
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

// Import your global Document interface here
import { Document as DocumentType } from '@/types/index'; // <-- adjust path if needed

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch documents for logged-in user
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://signature-app-server-1-i8c4.onrender.com/api/documents/mydocs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      setDocuments(res.data);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
  (doc.originalName?.toLowerCase().includes(searchLower) ?? false) ||
  (typeof doc.owner === 'string' && doc.owner.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.status === 'pending').length;
    const signed = documents.filter((d) => d.status === 'signed').length;
    const completed = documents.filter((d) => d.status === 'completed').length;

    return { total, pending, signed, completed };
  }, [documents]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`https://signature-app-server-1-i8c4.onrender.com/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      toast.success('Document deleted successfully');
      await fetchDocuments(); // Refresh list after deletion
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleShare = (id: string) => {
    const document = documents.find((d) => d._id === id);
    if (document?.publicLink) {
      navigator.clipboard.writeText(document.publicLink);
      toast.success('Public link copied to clipboard');
    } else {
      toast.error('No public link available for this document');
    }
  };

  const statusFilters = [
    { value: 'all', label: 'All Documents', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'signed', label: 'Signed', count: stats.signed },
    { value: 'completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your documents and track signatures</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/upload">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusFilters.map(({ value, label, count }) => {
          const iconMap: Record<string, JSX.Element> = {
            all: <FileText className="h-4 w-4 text-muted-foreground" />,
            pending: <Clock className="h-4 w-4 text-yellow-500" />,
            signed: <CheckCircle className="h-4 w-4 text-blue-500" />,
            completed: <TrendingUp className="h-4 w-4 text-green-500" />,
          };
          return (
            <Card key={value}>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                {iconMap[value]}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {value === 'all'
                    ? 'All uploaded documents'
                    : value === 'pending'
                    ? 'Awaiting signatures'
                    : value === 'signed'
                    ? 'Partially signed'
                    : 'Fully executed'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(({ value, label }) => (
            <Button
              key={value}
              variant={statusFilter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(value)}
              className="flex items-center gap-2"
              disabled={loading}
            >
              {label}
              <Badge variant="secondary" className="ml-1">
                {stats[value as keyof typeof stats] || 0}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <p className="text-center py-8">Loading documents...</p>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard
  key={document._id}
  document={{
    ...document,
    signers: document.signers || []
  }}
  onDelete={() => handleDelete(document._id)}
  onShare={() => handleShare(document._id)}
/>
          ))}
        </div>
      ) : (
        <Card className="p-8">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started with digital signatures'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button asChild>
                <Link to="/upload">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Your First Document
                </Link>
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
