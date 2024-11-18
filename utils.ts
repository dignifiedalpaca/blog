import { expandGlob } from "@std/fs";

export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  for await (const _ of expandGlob(`${dirPath}/*`)) {
    return false;
  }
  return true;
}

export function isUrl(input: string): boolean {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

export function isFile(input: string): boolean {
  try {
    const stats = Deno.statSync(input);
    return stats.isFile;
  } catch {
    return false;
  }
}
