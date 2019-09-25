export const tick = async (delay = 1): Promise<void> => await new Promise((r): unknown => setTimeout(r, delay));
