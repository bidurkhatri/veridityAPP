import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Wifi, 
  WifiOff, 
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationRequest {
  id: string;
  proofType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  timestamp: string;
  estimatedTime?: number;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function VerificationStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState({
    connectedClients: 0,
    queueLength: 0,
    processingTime: 0
  });
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/verify`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        toast({
          title: "Real-time verification connected",
          description: "You'll receive live updates on verification status",
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection_established':
        console.log('WebSocket connection established:', message);
        break;

      case 'verification_queued':
        setRequests(prev => [...prev, {
          id: message.requestId,
          proofType: message.proofType || 'Unknown',
          status: 'queued',
          progress: 0,
          timestamp: new Date().toISOString(),
          estimatedTime: message.estimatedTime
        }]);
        break;

      case 'verification_processing':
        setRequests(prev => prev.map(req => 
          req.id === message.requestId 
            ? { ...req, status: 'processing', progress: 25 }
            : req
        ));
        break;

      case 'verification_result':
        setRequests(prev => prev.map(req => 
          req.id === message.id 
            ? { 
                ...req, 
                status: message.isValid ? 'completed' : 'failed',
                progress: 100
              }
            : req
        ));
        
        toast({
          title: message.isValid ? "Verification completed" : "Verification failed",
          description: `Proof verification ${message.isValid ? 'successful' : 'failed'} in ${message.verificationTime}ms`,
          variant: message.isValid ? "default" : "destructive",
        });
        break;

      case 'status_response':
        setStats({
          connectedClients: message.connectedClients,
          queueLength: message.queueLength,
          processingTime: message.averageProcessingTime || 0
        });
        break;

      default:
        console.log('Unknown WebSocket message:', message);
    }
  };

  const sendTestVerification = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection error",
        description: "WebSocket connection not available",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get user's latest proof for real verification test
      const response = await fetch('/api/proofs/latest');
      if (!response.ok) {
        throw new Error('No proofs available for testing');
      }
      
      const latestProof = await response.json();
      
      const verificationRequest = {
        type: 'verify_proof',
        id: `verification_${Date.now()}`,
        proofId: latestProof.id,
        proofType: latestProof.proofType,
        proof: latestProof.proof,
        publicSignals: latestProof.publicSignals
      };

      wsRef.current.send(JSON.stringify(verificationRequest));
      
      toast({
        title: "Test verification sent",
        description: `Testing verification for ${latestProof.proofType} proof`,
      });
    } catch (error: any) {
      toast({
        title: "Test failed",
        description: error.message || "No proofs available for testing",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Real-time Verification Status
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.connectedClients}
              </div>
              <div className="text-sm text-gray-500">Connected Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.queueLength}
              </div>
              <div className="text-sm text-gray-500">Queue Length</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.processingTime}ms
              </div>
              <div className="text-sm text-gray-500">Avg Process Time</div>
            </div>
          </div>
          
          <Button 
            onClick={sendTestVerification}
            disabled={!isConnected}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Send Test Verification
          </Button>
        </CardContent>
      </Card>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Live Verification Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active verification requests
            </div>
          ) : (
            <div className="space-y-4">
              {requests.slice(-5).reverse().map((request) => (
                <div 
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <div className="font-medium">{request.proofType}</div>
                        <div className="text-sm text-gray-500">
                          {request.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  {request.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={request.progress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </span>
                    {request.estimatedTime && (
                      <span>~{Math.round(request.estimatedTime / 1000)}s</span>
                    )}
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