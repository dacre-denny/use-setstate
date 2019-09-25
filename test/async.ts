import { ReactWrapper } from "enzyme";

export const tick = async (delay = 1): Promise<void> => await new Promise((r): unknown => setTimeout(r, delay));

export const tickUpdate = async (wrapper: ReactWrapper, delay = 1): Promise<void> => {
  wrapper.update();
  await tick(delay);
};
