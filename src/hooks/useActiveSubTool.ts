
import { useState, useEffect } from 'react';

export type SubTool = 'select' | 'draw' | 'eraser' | 'vector' | 'text';

// Simple singleton state store
const state: {
  subTool: SubTool;
  listeners: React.Dispatch<React.SetStateAction<SubTool>>[];
} = {
  subTool: 'select',
  listeners: [],
};

const setActiveSubTool = (tool: SubTool) => {
  state.subTool = tool;
  state.listeners.forEach(listener => listener(tool));
};

export const useActiveSubTool = () => {
  const [subTool, setSubToolState] = useState<SubTool>(state.subTool);

  useEffect(() => {
    const listener = setSubToolState;
    state.listeners.push(listener);
    return () => {
      state.listeners = state.listeners.filter(l => l !== listener);
    };
  }, []);

  return { subTool, setActiveSubTool };
};
