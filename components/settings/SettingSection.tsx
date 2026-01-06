
import React, { ReactNode } from 'react';

interface SettingSectionProps {
  title?: string;
  children: ReactNode;
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      {title && (
        <h2 className="px-1 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h2>
      )}
      <div className="bg-surface rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden divide-y divide-[var(--color-border)]">
        {children}
      </div>
    </div>
  );
};
