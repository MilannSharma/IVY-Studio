import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const colors: Record<string, string> = {
        'Active': 'bg-[#e2f5ec] text-[#1b7e4f]',
        'Draft': 'bg-gray-100 text-gray-700',
        'Completed': 'bg-blue-50 text-blue-700',
        'Print Ready': 'bg-purple-50 text-purple-700',
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
