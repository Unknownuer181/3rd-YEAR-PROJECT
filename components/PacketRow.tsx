import React from 'react';
import { Packet, TrafficStatus } from '../types';
import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

interface PacketRowProps {
  packet: Packet;
  onAnalyze: (packet: Packet) => void;
}

const PacketRow: React.FC<PacketRowProps> = ({ packet, onAnalyze }) => {
  const getIcon = () => {
    switch (packet.status) {
      case TrafficStatus.ALLOWED:
        return <ShieldCheck className="w-4 h-4 text-neon-green" />;
      case TrafficStatus.BLOCKED:
        return <ShieldAlert className="w-4 h-4 text-neon-red" />;
      case TrafficStatus.SUSPICIOUS:
        return <ShieldQuestion className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (packet.status) {
      case TrafficStatus.ALLOWED: return 'text-neon-green border-neon-green/30 bg-neon-green/10';
      case TrafficStatus.BLOCKED: return 'text-neon-red border-neon-red/30 bg-neon-red/10';
      case TrafficStatus.SUSPICIOUS: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-800 hover:bg-gray-900/50 transition-colors text-xs font-mono group">
      <div className="flex items-center space-x-3 w-1/4">
        {getIcon()}
        <span className="text-gray-400">{new Date(packet.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <div className="w-1/4 text-gray-300">
        <span className="text-gray-500 mr-2">SRC:</span>{packet.sourceIP}
      </div>
      
      <div className="w-1/4 text-gray-300">
        <span className="text-gray-500 mr-2">DST:</span>{packet.destIP}:{packet.port}
      </div>

      <div className="w-1/6 flex justify-end items-center space-x-2">
        <span className={`px-2 py-0.5 rounded border ${getStatusColor()} text-[10px] uppercase`}>
          {packet.status}
        </span>
      </div>

      <div className="w-24 flex justify-end">
        {packet.status === TrafficStatus.SUSPICIOUS || packet.status === TrafficStatus.BLOCKED ? (
          <button
            onClick={() => onAnalyze(packet)}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/40 px-2 py-1 rounded text-[10px] border border-neon-blue/50"
          >
            AI AUDIT
          </button>
        ) : (
          <span className="text-gray-600 text-[10px]">VERIFIED</span>
        )}
      </div>
    </div>
  );
};

export default PacketRow;
