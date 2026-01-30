import React, { useState } from 'react';
import * as walletService from '../services/walletService';
import PageLayout from '../components/layout/PageLayout';
import { useToast } from '../contexts/ToastContext';

interface DiagnosticsPageProps {
  onBack: () => void;
}

const DiagnosticsPage: React.FC<DiagnosticsPageProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const [isRescanningOnchain, setIsRescanningOnchain] = useState(false);

  const handleRescanOnchainSwaps = async () => {
    setIsRescanningOnchain(true);
    try {
      await walletService.rescanOnchainSwaps();
      showToast('success', 'Onchain swaps rescanned successfully');
    } catch (error) {
      console.error('Failed to rescan onchain swaps:', error);
      showToast('error', 'Failed to rescan onchain swaps');
    } finally {
      setIsRescanningOnchain(false);
    }
  };

  const handleDownloadLogs = () => {
    try {
      const logs = walletService.getSdkLogs();

      if (!logs || logs.trim().length === 0) {
        showToast('info', 'No logs available to download');
        return;
      }

      // Create blob with logs
      const blob = new Blob([logs], { type: 'text/plain' });

      // Generate timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `breez-sdk-logs-${timestamp}.txt`;

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', 'Logs downloaded successfully');
    } catch (error) {
      console.error('Failed to download logs:', error);
      showToast('error', 'Failed to download logs');
    }
  };

  return (
    <PageLayout
      title="Diagnostics"
      onBack={onBack}
      footer={null}
    >
      <div className="p-4 space-y-6 w-full">
        {/* Rescan Swaps Section */}
        <div className="bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-2xl p-4">
          <p className="text-sm text-[rgb(var(--text-white))] opacity-70 mb-4">
            Rescan onchain swaps to check for refundables or update swap statuses.
          </p>
          <button
            onClick={handleRescanOnchainSwaps}
            disabled={isRescanningOnchain}
            className="flex items-center px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:bg-[var(--secondary-blue)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRescanningOnchain ? (
              <>
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rescanning...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rescan Swaps
              </>
            )}
          </button>
        </div>

        {/* Logs Section */}
        <div className="bg-[rgba(255,255,255,0.05)] border border-[var(--card-border)] rounded-2xl p-4">
          <p className="text-sm text-[rgb(var(--text-white))] opacity-70 mb-4">
            Download SDK logs for troubleshooting and support.
          </p>
          <button
            onClick={handleDownloadLogs}
            className="flex items-center px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:bg-[var(--secondary-blue)] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Logs
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default DiagnosticsPage;
