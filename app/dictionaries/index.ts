import en from "./en.json";

export type Dictionary = typeof en;

export const getDictionary = async (): Promise<Dictionary> => en;
