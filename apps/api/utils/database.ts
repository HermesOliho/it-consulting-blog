export const isValidId = (id: string | string[]) =>
    !Array.isArray(id) && /^\d+$/.test(id) && Number(id) > 0;
