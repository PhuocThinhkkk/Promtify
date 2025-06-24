// AlertContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert, TitleBar } from '@react95/core';

type AlertType = 'error' | 'info' | 'question' | 'warning';

type AlertConfig = {
  type: AlertType;
  title: string;
  message: string;
  hasSound?: boolean;
  buttons?: { value: string; onClick: () => void }[];
};

type AlertContextType = {
  showAlert: (config: AlertConfig) => void;
  closeAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {   //eslint-disable-line
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
  return ctx;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = (newConfig: AlertConfig) => {
    setConfig(newConfig);
    setVisible(true);
  };

  const closeAlert = () => {
    setVisible(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {visible && config && (

      <Alert
        className="w-80 "
        type={config.type}
        title={config.title}
        message={config.message}
        hasSound={config.hasSound}
        titleBarOptions={<TitleBar.Close onClick={closeAlert} />}
        buttons={config.buttons || [
          { value: 'OK', onClick: closeAlert },
        ]}
      />
      )}
    </AlertContext.Provider>
  );
};
