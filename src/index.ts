import * as React from "react";

export const setStateCallback = <T extends any>(
  initial: T,
  callback: (state: T) => void
): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>] => {
  const hasRun = React.useRef(false);
  const [state, setState] = React.useState<T>(initial);

  React.useEffect(() => {
    if (hasRun.current) {
      callback(state);
    } else {
      hasRun.current = true;
    }
  }, [state]);

  return [state, setState];
};
