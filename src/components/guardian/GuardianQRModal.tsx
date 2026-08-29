import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/shared/Modal';
import { QRDisplay } from '@/components/guardian/QRDisplay';
import { Button } from '@/components/shared/Button';
import { useRegenerateQRToken } from '@/hooks/useOwners';
import { AlertCircle, QrCode } from 'lucide-react';
import { logger } from '@/lib/logger';

interface GuardianQRModalProps {
  ownerId?: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  initialToken?: string | null;
}

export function GuardianQRModal({ ownerId, trigger, isOpen: controlledIsOpen, onClose: controlledOnClose, initialToken }: GuardianQRModalProps) {
  const t = useTranslations('owner');
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalQrToken, setInternalQrToken] = useState<string | null>(null);
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const qrToken = initialToken || internalQrToken;
  
  const regenerateMutation = useRegenerateQRToken(ownerId || '');

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleConfirmRegenerate = async () => {
    if (!ownerId) return;
    try {
      const data = await regenerateMutation.mutateAsync();
      if (data.qrToken) {
        setInternalQrToken(data.qrToken);
      }
    } catch (error) {
      logger.error('Failed to regenerate QR', error);
    }
  };

  const handleOpen = () => {
    if (!controlledIsOpen) {
      setInternalIsOpen(true);
      setInternalQrToken(null);
    }
  };

  return (
    <>
      {!controlledIsOpen && (
        <div onClick={handleOpen} className="inline-block">
          {trigger || (
            <Button 
              variant="secondary" 
              className="px-4 py-2 text-sm flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {t('regenerateQR') || 'Regenerate QR'}
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} title={t('guardianQR') || 'Guardian QR Code'}>
        <div className="flex flex-col items-center">
          {!qrToken ? (
            <div className="p-4 text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
              <h4 className="text-lg font-bold mb-2">Generate New Access Code?</h4>
              <p className="text-sm text-on-surface-variant mb-6">
                This will create a new QR code for the guardian. <strong>Important:</strong> Any previous QR codes will immediately stop working.
              </p>
              <div className="flex gap-4 w-full">
                <Button variant="secondary" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmRegenerate} 
                  disabled={regenerateMutation.isPending}
                  className="flex-1"
                >
                  {regenerateMutation.isPending ? 'Generating...' : 'Confirm'}
                </Button>
              </div>
            </div>
          ) : (
            <QRDisplay token={qrToken} />
          )}
        </div>
      </Modal>
    </>
  );
}
