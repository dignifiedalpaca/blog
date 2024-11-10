/** @jsxImportSource hono/jsx */
import type { SmallblogParams } from "./types.ts";
import { createServer } from "./server.tsx";
import { createCli } from "./cli.ts";


export class Smallblog {
  private server
  private cli

  constructor(options: Partial<SmallblogParams> = {}) {
    const {
      postsFolder = "posts/",
      draftsFolder = "drafts/",
      pagesFolder = "pages/",
      favicon,
      siteTitle = "Smallblog",
      siteDescription = `The blog: ${siteTitle}`,
      cacheEnabled = true,
      indexTitle,
      indexSubtitle,
      defaultAuthors = [],
      locale,
      customHeaderScript,
      customBodyScript,
    } = options;

    this.server = createServer({
      postsFolder,
      draftsFolder,
      pagesFolder,
      favicon,
      siteTitle,
      siteDescription,
      cacheEnabled,
      indexSubtitle,
      indexTitle,
      defaultAuthors,
      locale,
      customBodyScript,
      customHeaderScript
    })
    this.cli = createCli(postsFolder, draftsFolder);
  }

  fetch = (req: Request): Response | Promise<Response> => {
    return this.server.fetch(req);
  }

  run = (args: string[]): void => {
    return this.cli(args);
  }
}
