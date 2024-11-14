import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { type ZodIssue, fromZodError } from "zod-validation-error";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function errorParser(response: ZodIssue[]) {
 try {
  const { message } = fromZodError(ZodError.create(response), {
   prefix: "Error",
   issueSeparator: "\n",
   includePath: false,
  });
  return message;
 } catch (_error) {
  return "Unknown error! Please try again later.";
 }
}
