import { ko } from "./ko.js";
import { en } from "./en.js";

export const IS_EN = import.meta.env.VITE_LANG === "en";
export const L = IS_EN ? en : ko;
