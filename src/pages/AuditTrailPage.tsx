import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocuments } from '@/contexts/DocumentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Search, 
  Shield, 
  Clock, 
  User, 
  FileText, 
  CheckCircle,
  XCircle,
  Globe,
  Download,
  Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';


const AuditTrailPage: React.FC = () => {
  const { documentId } = useParams();
  const { documents } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');

  // Get all audit entries
  const allAuditEntries = useMemo(() => {
    if (documentId) {
      // @ts-ignore
      const document = documents.find(d => d.id === documentId);
      return document?.auditTrail || [];
    }
    
    // Return all audit entries from all documents
    return documents.flatMap(doc => 
      doc.auditTrail.map(entry => ({
        ...entry,
        documentName: doc.name,
        // @ts-ignore
        documentId: doc.id
      }))
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [documents, documentId]);

  // Filter audit entries based on search
  const filteredEntries = useMemo(() => {
    return allAuditEntries.filter(entry =>
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // @ts-ignore
      (entry.documentName && entry.documentName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allAuditEntries, searchTerm]);

  const getActionIcon = (action: string) => {
    if (action.includes('signed') || action.includes('completed')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (action.includes('rejected')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (action.includes('created') || action.includes('uploaded')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (action.includes('viewed') || action.includes('accessed')) {
      return <Globe className="h-4 w-4 text-gray-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('signed') || action.includes('completed')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (action.includes('rejected')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (action.includes('created') || action.includes('uploaded')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  // @ts-ignore

  const document = documentId ? documents.find(d => d.id === documentId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {documentId && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/document/${documentId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Document
              </Link>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Audit Trail
            </h1>
            <p className="text-gray-600 mt-1">
              {documentId 
                ? `Complete audit history for ${document?.name || 'document'}`
                : 'Complete audit history for all documents'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signatures</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.filter(e => e.action.includes('signed')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.filter(e => e.action.includes('created')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredEntries.map(e => e.user)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Log
            <Badge variant="outline" className="ml-auto">
              {filteredEntries.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${getActionColor(entry.action)}`}>
                            {entry.action}
                          </Badge>
                          {/*  @ts-ignore */}
                          {entry.documentName && !documentId && (
                            <Badge variant="outline" className="text-xs">
                              {/*  @ts-ignore */}
                              {entry.documentName}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {entry.user}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {entry.details}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{entry.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit events found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'No audit events have been recorded yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Security & Compliance</h3>
              <p className="text-sm text-blue-700">
                All activities are automatically logged and encrypted. This audit trail provides a 
                tamper-proof record of all document interactions and meets industry compliance standards 
                including SOX, HIPAA, and eIDAS regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditTrailPage;