import * as React from "react";
import { isFunction } from "./helpers";

export const useSetState = <T extends any>(
  initial?: T | (() => T),
  callback?: (state: T) => void
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] => {
  const [state, setState] = React.useState<T>(initial);

  if (callback !== undefined) {
    const hasRun = React.useRef(false);
    if (isFunction(callback)) {
      React.useEffect(() => {
        if (hasRun.current) {
          callback(state);
        } else {
          hasRun.current = true;
        }
      }, [state]);
    } else {
      if (hasRun.current === false) {
        console.warn(`useSetState: function type for callback argument expected. Found callback of type "${typeof callback}"`);
        hasRun.current = true;
      }
    }
  }

  return [state, setState];
};
