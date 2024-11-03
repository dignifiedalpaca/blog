import { expandGlob } from "@std/fs";

export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  for await (const _ of expandGlob(`${dirPath}/*`)) {
    return false;
  }
  return true;
}

export async function getMtime(path: string): Promise<number> {
  const pathStats = Deno.statSync(path);
  let mtime: number = pathStats.mtime?.getTime() || 0;
  if (pathStats.isDirectory) {
    for await (const file of expandGlob(`${path}/*`)) {
      const curMtime = await getMtime(file.path);
      if (curMtime > mtime) {
        mtime = curMtime;
      }
    }
  }
  return mtime;
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
