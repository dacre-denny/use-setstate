import * as React from "react";
import * as ReactDOM from "react-dom";

import { useSetState } from "use-setstate";

const Sample = () => {
  const [value, setValue] = useSetState<number>(0, (currentValue: number) => (document.title = `${currentValue}`));

  React.useEffect(() => {
    const i = setInterval(() => setValue((oldValue: number): number => oldValue + 1), 500);

    return () => clearInterval(i);
  }, [value]);

  return (
    <>
      <h1>useSetState Usage Examples (Typescript)</h1>
      <p>Interval based timer updater function: {value}</p>
      <p>State change callback updates document title</p>
    </>
  );
};

ReactDOM.render(<Sample />, document.getElementById("sample"));
