import React from 'react';
import { buttonStyle } from '../styles/common';

// --- Props Interface ---
// Defines the expected types for the component's props.
interface MessagePopupProps {
  message: string;
  onClose: () => void;
  showConfirm?: boolean; // Optional prop, defaults to false
  onConfirm?: (() => void) | null; // Optional prop, can be a function or null
}

const MessagePopup: React.FC<MessagePopupProps> = ({
  message,
  onClose,
  showConfirm = false,
  onConfirm = null,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          {showConfirm ? (
            <>
              <button
                // Safely call onConfirm only if it's a function
                onClick={() => onConfirm && onConfirm()}
                style={{ ...buttonStyle, background: '#dc3545' }}
              >
                Yes
              </button>
              <button
                onClick={onClose}
                style={{ ...buttonStyle, background: '#6c757d' }}
              >
                No
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              style={buttonStyle}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePopup;