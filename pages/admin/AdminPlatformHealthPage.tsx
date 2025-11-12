import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import { AuditLog } from '../../types';
import { SearchIcon } from '../../components/Icons';

const StatusIndicator: React.FC<{ isUp: boolean; text: string; }> = ({ isUp, text }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="font-semibold text-gray-700">{text}</span>
        <span className={`font-bold ${isUp ? 'text-green-600' : 'text-red-600'}`}>{isUp ? 'Operational' : 'Down'}</span>
    </div>
);

const AdminPlatformHealthPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.getAuditLogs()
            .then(setLogs)
            .finally(() => setIsLoading(false));
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Platform Health & Audit</h1>
            <p className="text-lg text-gray-600 mb-8">Monitor system status and review important platform activities.</p>

            {/* System Status */}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
                 <div className="flex flex-col sm:flex-row gap-x-8 gap-y-4">
                     <StatusIndicator isUp={true} text="API Services" />
                     <StatusIndicator isUp={true} text="Database Connection" />
                     <StatusIndicator isUp={true} text="AI Assistant API" />
                 </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Audit Log</h2>
                 <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search logs by user, action, or target..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                    />
                </div>
                {isLoading ? <p>Loading logs...</p> : (
                     <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="p-3">Timestamp</th>
                                    <th className="p-3">Actor</th>
                                    <th className="p-3">Action</th>
                                    <th className="p-3">Target</th>
                                    <th className="p-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td className="p-3 text-gray-600">{formatTime(log.timestamp)}</td>
                                        <td className="p-3 font-medium text-gray-800">{log.actor.name}</td>
                                        <td className="p-3">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-semibold">{log.action}</span>
                                        </td>
                                        <td className="p-3">{log.target ? `${log.target.type}: ${log.target.name}` : 'N/A'}</td>
                                        <td className="p-3 text-gray-500">{log.details || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPlatformHealthPage;