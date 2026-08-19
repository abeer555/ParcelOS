'use client';
import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { apiService } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AgentsList() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await apiService.agents.getAgents();
      setAgents(res.data);
    } catch (err) {
      toast.error('Failed to load agents');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl bg-neo-yellow inline-block px-4 py-2 border-4 border-neo-black shadow-neo w-fit">AGENTS</h1>
      <Table headers={['Name', 'Email', 'Zone', 'Available', 'Lat/Lng']}>
        {agents.length === 0 ? (
          <tr><td colSpan={5} className="p-4 text-center font-mono">No agents found</td></tr>
        ) : (
          agents.map((agent: any) => (
            <tr key={agent.id} className="border-b-4 border-neo-black hover:bg-neo-gray bg-neo-white">
              <td className="p-4 font-bold">{agent.user?.name}</td>
              <td className="p-4 font-mono text-sm">{agent.user?.email}</td>
              <td className="p-4 font-mono">{agent.zone?.name || 'N/A'}</td>
              <td className="p-4 font-bold text-lg">{agent.isAvailable ? '✅' : '❌'}</td>
              <td className="p-4 font-mono text-xs">{agent.currentLat}, {agent.currentLng}</td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
