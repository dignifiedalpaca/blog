import * as path from "@std/path";
import * as fs from "@std/fs";

function generateArticle(
  title: string = "My first article",
  content: string = "This is my first article",
  published: boolean = true,
  tags: string[] = ["markdown", "test"],
  authors: string[] = ["Default author"],
  date: string = new Date().toISOString().split("T")[0],
  section: string = "tech",
): string {
  return `---
    title: ${title}
    description: A post to test a small content
    authors:
        - ${authors.join("\n    - ")}
    tags:
        - ${tags.join("\n    - ")}
    published: ${published}
    date: ${date}
    section: ${section}
    ---

    ${content}
    `
    .replace(/  +/g, "")
    .trim();
}

export function storeArticle(
  folder: string,
  filename: string = "first-article.md",
  params: {
    title?: string;
    content?: string;
    preview?: string;
    description?: string;
    published?: boolean;
    tags?: string[];
    authors?: string[];
    date?: string;
    section?: string;
  } = {
    title: "My first article",
    content:
      "This is my first article. This is an image:\n\n![RSS](first-article/exampleImage.svg)",
    preview: "This is the first article of this blog.",
    description: "A post which contains the first article of this blog.",
    published: true,
    tags: ["markdown", "test"],
    authors: ["Default author"],
    date: new Date().toISOString().split("T")[0],
    section: "tech",
  },
  withCompanion: boolean = true,
) {
  const article = generateArticle(
    params.title,
    params.content,
    params.published,
    params.tags,
    params.authors,
    params.date,
    params.section,
  );
  Deno.writeTextFile(path.join(folder, filename), article);
  if (withCompanion) {
    createCompanionFolder(folder, filename);
  }
}

const svgExample = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rss"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`;

function createCompanionFolder(folder: string, filename: string) {
  const ext = path.extname(filename);
  const companionFolderName = filename.substring(
    0,
    filename.length - ext.length,
  );
  const fullPath = path.join(folder, companionFolderName);
  fs.ensureDirSync(fullPath);
  Deno.writeTextFileSync(path.join(fullPath, "exampleImage.svg"), svgExample);
}
