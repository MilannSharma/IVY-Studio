import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colors: Record<string, string> = {
        'in-progress': 'bg-[#f59e0b] text-white', // Yellow
        'initialized': 'bg-white text-gray-900 border border-gray-300', // White with border
        'completed': 'bg-[#10b981] text-white', // Green
        'on-hold': 'bg-gray-400 text-white',
        'cancelled': 'bg-red-500 text-white',
        'pending': 'bg-gray-100 text-gray-700',
    };

    const labelMap: Record<string, string> = {
        'in-progress': 'In Process',
        'initialized': 'Initialized',
        'completed': 'Completed',
        'on-hold': 'On Hold',
        'cancelled': 'Cancelled',
        'pending': 'Draft',
    };

    return (
        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md shadow-sm ${colors[status] || 'bg-gray-100'}`}>
            {labelMap[status] || status}
        </span>
    );
};

export default StatusBadge;
