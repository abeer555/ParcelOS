import React from 'react';

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-neo-white border-4 border-neo-black shadow-neo-lg w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b-4 border-neo-black bg-neo-yellow">
          <h2 className="text-xl font-bold font-mono">{title}</h2>
          <button onClick={onClose} className="font-mono font-bold text-xl hover:text-neo-red">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
