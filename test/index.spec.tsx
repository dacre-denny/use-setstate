import { expect } from "chai";
import { isFunction } from "../src/helpers";
import { useSetState } from "../src/index";
import useSetStateDefault from "../src/index";

describe("useSetState API", (): void => {
  it("exports useSetState as default", async (): Promise<void> => {
    expect(useSetStateDefault).is.not.undefined;
    expect(isFunction(useSetStateDefault)).is.true;
  });

  it("exports useSetState as function", async (): Promise<void> => {
    expect(useSetState).is.not.undefined;
    expect(isFunction(useSetState)).is.true;
  });
});
