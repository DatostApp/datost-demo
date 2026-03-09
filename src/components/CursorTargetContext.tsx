import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";
import { useVideoConfig } from "remotion";

interface Position {
  x: number;
  y: number;
}

interface CursorTargetContextValue {
  register: (id: string, el: HTMLElement | null) => void;
  getPosition: (id: string) => Position | null;
}

const CursorTargetContext = createContext<CursorTargetContextValue>({
  register: () => {},
  getPosition: () => null,
});

export const CursorTargetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { width: compWidth, height: compHeight } = useVideoConfig();
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<Record<string, HTMLElement>>({});
  const [positions, setPositions] = useState<Record<string, Position>>({});
  // Keep last known positions so targets that unmount don't cause jumps
  const lastKnownRef = useRef<Record<string, Position>>({});

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      elementsRef.current[id] = el;
    } else {
      delete elementsRef.current[id];
    }
  }, []);

  // Measure all registered elements every frame, accounting for preview scale
  useEffect(() => {
    let rafId: number;

    const measure = () => {
      if (!rootRef.current) return;
      const rootRect = rootRef.current.getBoundingClientRect();

      // The root renders at compWidth x compHeight in composition space,
      // but the browser may scale it down for preview.
      // Scale factor = composition size / actual rendered size
      const scaleX = compWidth / rootRect.width;
      const scaleY = compHeight / rootRect.height;

      // Update positions for elements still in the DOM
      for (const [id, el] of Object.entries(elementsRef.current)) {
        const rect = el.getBoundingClientRect();
        const pos = {
          x: (rect.x - rootRect.x + rect.width / 2) * scaleX,
          y: (rect.y - rootRect.y + rect.height / 2) * scaleY,
        };
        lastKnownRef.current[id] = pos;
      }

      // Spread all last known positions (includes unmounted targets)
      setPositions({ ...lastKnownRef.current });
    };

    const loop = () => {
      measure();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [compWidth, compHeight]);

  const getPosition = useCallback(
    (id: string): Position | null => positions[id] ?? null,
    [positions]
  );

  return (
    <CursorTargetContext.Provider value={{ register, getPosition }}>
      <div ref={rootRef} style={{ width: "100%", height: "100%", position: "relative" }}>
        {children}
      </div>
    </CursorTargetContext.Provider>
  );
};

export const useCursorTarget = (id: string) => {
  const { register } = useContext(CursorTargetContext);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      register(id, el);
    },
    [id, register]
  );

  return ref;
};

export const useCursorPositions = () => {
  const { getPosition } = useContext(CursorTargetContext);
  return getPosition;
};
