import { FirewallRule } from './types';

export const INITIAL_RULES: FirewallRule[] = [
  {
    id: 'rule-1',
    contractAddress: '0x71C...9A21',
    action: 'BLOCK',
    condition: 'Port == 23 (Telnet)',
    gasCost: 0.002,
    active: true,
  },
  {
    id: 'rule-2',
    contractAddress: '0x3A2...B1C4',
    action: 'BLOCK',
    condition: 'SourceIP in BlacklistContract',
    gasCost: 0.005,
    active: true,
  },
  {
    id: 'rule-3',
    contractAddress: '0x99D...F2E1',
    action: 'ALLOW',
    condition: 'Signature valid && Whitelist',
    gasCost: 0.001,
    active: true,
  },
];

export const MOCK_IPS = [
  '192.168.1.105',
  '10.0.0.55',
  '172.16.0.23',
  '45.22.19.112', // External
  '89.102.44.11', // External
  '203.0.113.5',  // Suspicious
];
