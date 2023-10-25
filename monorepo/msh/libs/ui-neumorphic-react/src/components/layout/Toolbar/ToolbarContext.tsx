import React, { createContext, FC, useEffect, useState } from 'react';

type TOOLBARS_MAP = {
  [key: string]: React.ReactNode;
};

interface IToolbarContext {
  toolbars: TOOLBARS_MAP;
  showToolbar: (toolbarName: string, toolbar: React.ReactNode) => void;
  clearToolbar: (toolbarName: string) => void;
}

const contextDefaultValues: IToolbarContext = {
  toolbars: {},
  showToolbar: () => {},
  clearToolbar: () => {},
};

export const ToolbarContext = createContext<IToolbarContext>(contextDefaultValues);

interface ProviderProps {
  children: React.ReactNode | React.ReactNode[];
}

const ToolbarContextProvider: FC<ProviderProps> = ({ children }) => {
  const [toolbars, updateToolbars] = useState<TOOLBARS_MAP>({});

  const showToolbar = (toolbarName: string, toolbar: React.ReactNode) => {
    const updatedToolbars: TOOLBARS_MAP = {};
    Object.keys(toolbars).forEach((key) => {
      if (key !== toolbarName) {
        updatedToolbars[key] = toolbars[key];
      }
    });
    updatedToolbars[toolbarName] = toolbar;

    updateToolbars(updatedToolbars);
  };

  const clearToolbar = (toolbarName: string) => {
    const updatedToolbars: TOOLBARS_MAP = {};
    Object.keys(toolbars).forEach((key) => {
      if (key !== toolbarName) {
        updatedToolbars[key] = toolbars[key];
      }
    });

    updateToolbars(updatedToolbars);
  };

  return (
    <ToolbarContext.Provider
      value={{
        toolbars: toolbars,
        showToolbar: showToolbar,
        clearToolbar: clearToolbar,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};

function useToolbarContext() {
  const context = React.useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('useToolbarContext must be used within a ToolbarContextProvider');
  }
  return context;
}

function useToolbar(toolbarName: string): React.ReactNode | undefined {
  const context = React.useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('useToolbar must be used within a ToolbarContextProvider');
  }

  return context.toolbars[toolbarName];
}

export { ToolbarContextProvider, useToolbar, useToolbarContext };
