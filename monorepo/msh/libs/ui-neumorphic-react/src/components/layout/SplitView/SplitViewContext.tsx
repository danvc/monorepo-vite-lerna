import React, { createContext, FC, useEffect, useState } from 'react';

export type SplitViewContextState = {
  minimized: boolean;
  updateMinimized: (min: boolean) => void;
};

const contextDefaultValues: SplitViewContextState = {
  minimized: false,
  updateMinimized: () => {},
};

export const SplitViewContext = createContext<SplitViewContextState>(contextDefaultValues);

interface ProviderProps {
  minimized?: boolean;
  children: React.ReactNode | React.ReactNode[];
}

const SplitViewContextProvider: FC<ProviderProps> = ({ children, minimized }) => {
  const [minimize, setMinimized] = useState<boolean>(minimized || false);
  const [minimizeProp, setMinimizeProp] = useState<boolean>(minimized || false);
  const updateMinimized = (min: boolean): void => setMinimized(min);

  useEffect(() => {
    if (minimizeProp !== minimized) {
      setMinimized(minimized || false);
      setMinimizeProp(minimized || false);
    }
  }, [minimizeProp, minimized]);

  return (
    <SplitViewContext.Provider
      value={{
        minimized: minimize,
        updateMinimized,
      }}
    >
      {children}
    </SplitViewContext.Provider>
  );
};

export default SplitViewContextProvider;
