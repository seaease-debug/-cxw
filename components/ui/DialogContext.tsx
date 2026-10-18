import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmDialog, ConfirmDialogProps } from './ConfirmDialog';
import { PromptDialog, PromptDialogProps } from './PromptDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface PromptOptions {
  title: string;
  message: string;
  defaultValue?: string;
  inputType?: 'text' | 'number' | 'password' | 'email';
  placeholder?: string;
}

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = (): DialogContextValue => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'> & {
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [promptState, setPromptState] = useState<Omit<PromptDialogProps, 'onConfirm' | 'onCancel'> & {
    onConfirm: (val: string) => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        type: options.type || 'info',
        onConfirm: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setPromptState({
        isOpen: true,
        title: options.title,
        message: options.message,
        defaultValue: options.defaultValue || '',
        inputType: options.inputType || 'text',
        placeholder: options.placeholder,
        onConfirm: (val: string) => {
          setPromptState((prev) => ({ ...prev, isOpen: false }));
          resolve(val);
        },
        onCancel: () => {
          setPromptState((prev) => ({ ...prev, isOpen: false }));
          resolve(null);
        },
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
      <PromptDialog
        isOpen={promptState.isOpen}
        title={promptState.title}
        message={promptState.message}
        defaultValue={promptState.defaultValue}
        inputType={promptState.inputType}
        placeholder={promptState.placeholder}
        onConfirm={promptState.onConfirm}
        onCancel={promptState.onCancel}
      />
    </DialogContext.Provider>
  );
};
