import React from 'react';
import { Document as DocumentType } from '@/types';  // Your full Document interface
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Share2, 
  Download, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface DocumentCardProps {
  document: DocumentType;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

const getStatusIcon = (status: DocumentType['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'signed':
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status: DocumentType['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'signed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onDelete, 
  onShare 
}) => {
  const pendingSigners = document.signers?.filter(s => s.status === 'pending').length || 0;
  const completedSigners = document.signers?.filter(s => s.status === 'signed').length || 0;

  return (
    <Card className="w-full max-w-full group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors" title={document.originalName}>
                {document.originalName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground truncate">
                  by {document.owner}
                </p>
                <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                  {getStatusIcon(document.status)}
                  <span className="ml-1 capitalize">{document.status}</span>
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 self-start sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={`/document/${document._id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View & Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(document._id)}>
                <Share2 className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(document._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-between items-center text-sm gap-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-muted-foreground">{formatFileSize(document.size)}</span>
            <span className="text-muted-foreground">{document.signers?.length || 0} signers</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {document.signers && document.signers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Signature Progress</span>
              <span className="text-muted-foreground">
                {completedSigners}/{document.signers.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSigners / document.signers.length) * 100}%` }}
              />
            </div>
            {pendingSigners > 0 && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <Clock className="h-3 w-3" />
                <span>{pendingSigners} pending</span>
              </div>
            )}
          </div>
        )}

        {document.signers?.slice(0, 3).map((signer) => (
          <div key={signer.id} className="flex flex-wrap justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {signer.name.charAt(0)}
              </div>
              <span className="text-muted-foreground">{signer.name}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${getStatusColor(signer.status)}`}
            >
              {signer.status}
            </Badge>
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
          <Link to={`/document/${document._id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Open Document
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
