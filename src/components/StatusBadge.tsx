import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colors: Record<string, string> = {
        'in-progress': 'bg-[#e2f5ec] text-[#1b7e4f]',
        'pending': 'bg-gray-100 text-gray-700',
        'completed': 'bg-blue-50 text-blue-700',
        'cancelled': 'bg-red-50 text-red-700',
    };

    const labelMap: Record<string, string> = {
        'in-progress': 'Active',
        'pending': 'Draft',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${colors[status] || 'bg-gray-100'}`}>
            {labelMap[status] || status}
        </span>
    );
};

export default StatusBadge;
