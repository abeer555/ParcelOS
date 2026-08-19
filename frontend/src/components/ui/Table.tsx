import React from 'react';

export const Table = ({ headers, children }: { headers: string[], children: React.ReactNode }) => {
  return (
    <div className="overflow-x-auto border-4 border-neo-black shadow-neo bg-neo-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neo-yellow border-b-4 border-neo-black font-mono uppercase">
            {headers.map((h, i) => (
              <th key={i} className="p-4 border-r-4 border-neo-black last:border-r-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="font-sans">
          {children}
        </tbody>
      </table>
    </div>
  );
};
