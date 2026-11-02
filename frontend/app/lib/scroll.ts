import type { Location } from "react-router";

export const scrollKey = ({ key, pathname, hash }: Pick<Location, "key" | "pathname" | "hash">) =>
  key === "default" ? pathname + hash : key;
