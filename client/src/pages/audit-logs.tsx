import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Eye,
  Edit,
  Trash2,
  Shield,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  blockchainHash?: string;
  timestamp: string;
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterResource, setFilterResource] = useState<string>("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("24h");

  const { data: auditLogs, isLoading, refetch } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Filter and search logs
  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesResource = filterResource === "all" || log.resource === filterResource;
    
    // Time range filtering
    const logTime = new Date(log.timestamp);
    const now = new Date();
    let timeFilter = true;
    
    switch (selectedTimeRange) {
      case "1h":
        timeFilter = (now.getTime() - logTime.getTime()) <= 60 * 60 * 1000;
        break;
      case "24h":
        timeFilter = (now.getTime() - logTime.getTime()) <= 24 * 60 * 60 * 1000;
        break;
      case "7d":
        timeFilter = (now.getTime() - logTime.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        timeFilter = (now.getTime() - logTime.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesSearch && matchesAction && matchesResource && timeFilter;
  }) || [];

  // Get unique actions and resources for filters
  const uniqueActions = Array.from(new Set(auditLogs?.map(log => log.action) || []));
  const uniqueResources = Array.from(new Set(auditLogs?.map(log => log.resource) || []));

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "view":
      case "read":
        return <Eye className="w-4 h-4" />;
      case "create":
      case "insert":
        return <CheckCircle2 className="w-4 h-4" />;
      case "update":
      case "edit":
        return <Edit className="w-4 h-4" />;
      case "delete":
        return <Trash2 className="w-4 h-4" />;
      case "login":
      case "logout":
        return <User className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "view":
      case "read":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "create":
      case "insert":
        return "bg-green-50 text-green-700 border-green-200";
      case "update":
      case "edit":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "delete":
        return "bg-red-50 text-red-700 border-red-200";
      case "login":
      case "logout":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleExport = () => {
    // In production, this would trigger a CSV/PDF export
    const csvContent = filteredLogs.map(log => 
      `${log.timestamp},${log.userId},${log.action},${log.resource},${log.resourceId || ''},${log.blockchainHash || ''}`
    ).join('\n');
    
    const csvHeader = 'Timestamp,User ID,Action,Resource,Resource ID,Blockchain Hash\n';
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLogStats = () => {
    const total = filteredLogs.length;
    const withBlockchain = filteredLogs.filter(log => log.blockchainHash).length;
    const recentHour = filteredLogs.filter(log => 
      (new Date().getTime() - new Date(log.timestamp).getTime()) <= 60 * 60 * 1000
    ).length;
    
    return { total, withBlockchain, recentHour };
  };

  const stats = getLogStats();

  return (
    <div className="p-6" data-testid="audit-logs-page">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-clinical-gray-900">Audit Logs</h1>
            <p className="text-clinical-gray-600 mt-1">Monitor system access and data operations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="refresh-logs-button"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
              data-testid="export-logs-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-clinical-gray-200" data-testid="total-logs-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-blue-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">In selected time range</p>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="blockchain-logs-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Blockchain Recorded</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">{stats.withBlockchain}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="text-purple-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">
              {stats.total > 0 ? Math.round((stats.withBlockchain / stats.total) * 100) : 0}% immutable
            </p>
          </CardContent>
        </Card>

        <Card className="border-clinical-gray-200" data-testid="recent-activity-stat">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-clinical-gray-600 text-sm font-medium">Last Hour</p>
                <p className="text-2xl font-bold text-clinical-gray-900 mt-1">{stats.recentHour}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="text-green-600 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-clinical-gray-500 mt-2">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 border-clinical-gray-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clinical-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-logs"
                />
              </div>
            </div>

            {/* Filters */}
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger data-testid="filter-action">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger data-testid="filter-resource">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {uniqueResources.map(resource => (
                  <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger data-testid="filter-time-range">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-clinical-gray-200">
        <CardHeader className="border-b border-clinical-gray-200">
          <CardTitle className="flex items-center justify-between">
            <span>Audit Events</span>
            <Badge variant="secondary" className="text-sm">
              {filteredLogs.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3">
                  <div className="w-8 h-8 bg-clinical-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-clinical-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-clinical-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                  <div className="w-16 h-6 bg-clinical-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12" data-testid="no-audit-logs">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-clinical-gray-300" />
              <h3 className="text-lg font-medium text-clinical-gray-900 mb-2">No Audit Logs Found</h3>
              <p className="text-clinical-gray-500">
                {searchTerm || filterAction !== "all" || filterResource !== "all"
                  ? "No logs match your current filters. Try adjusting your search criteria."
                  : "No audit events have been recorded yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-clinical-gray-200">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-clinical-gray-50" data-testid={`audit-log-${log.id}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-clinical-gray-900">
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)} {log.resource}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {log.resource}
                        </Badge>
                        {log.blockchainHash && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Shield className="w-3 h-3 mr-1" />
                            Blockchain
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-clinical-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>User: {log.userId}</span>
                          {log.resourceId && <span>Resource ID: {log.resourceId}</span>}
                        </div>
                        
                        {log.details && (
                          <div className="text-xs bg-clinical-gray-50 rounded p-2 mt-2 font-mono">
                            {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                        
                        {log.blockchainHash && (
                          <div className="text-xs text-clinical-gray-500 mt-1">
                            Blockchain Hash: <span className="font-mono">{log.blockchainHash}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-clinical-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </div>
                      <div className="text-xs text-clinical-gray-400 mt-1">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
