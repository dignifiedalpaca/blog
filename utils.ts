import { expandGlob } from "@std/fs";

export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  for await (const _ of expandGlob(`${dirPath}/*`)) {
    return false;
  }
  return true;
}

export async function getMtime(
  filePath: string,
  pagesPath?: string,
): Promise<number> {
  if (pagesPath) {
    return Math.max(
      await _getMtime(filePath),
      Deno.statSync(pagesPath).mtime?.getTime() || 0,
    );
  }
  return _getMtime(filePath);
}

async function _getMtime(fileOrFolderPath: string): Promise<number> {
  const pathStats = Deno.statSync(fileOrFolderPath);
  let mtime: number = pathStats.mtime?.getTime() || 0;
  if (pathStats.isDirectory) {
    for await (const file of expandGlob(`${fileOrFolderPath}/*`)) {
      const curMtime = await _getMtime(file.path);
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
