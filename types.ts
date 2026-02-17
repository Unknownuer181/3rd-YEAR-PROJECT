export enum TrafficStatus {
  ALLOWED = 'ALLOWED',
  BLOCKED = 'BLOCKED',
  SUSPICIOUS = 'SUSPICIOUS',
}

export interface Packet {
  id: string;
  timestamp: number;
  sourceIP: string;
  destIP: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP';
  port: number;
  size: number;
  status: TrafficStatus;
  payloadHash: string; // Simulates IPFS hash of payload
  signature: string; // Simulates wallet signature
  blockNumber?: number; // Simulates inclusion in a block
}

export interface FirewallRule {
  id: string;
  contractAddress: string;
  action: 'ALLOW' | 'BLOCK';
  condition: string;
  gasCost: number;
  active: boolean;
}

export interface GeminiAnalysisResult {
  riskScore: number; // 0-100
  analysis: string;
  recommendation: string;
  threatType?: string;
}
