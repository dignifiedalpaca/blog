import * as path from "@std/path";

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
    `.replace(/  +/g, "").trim();
}

export function storeArticle(
    folder: string,
    title: string = "My first article",
    filename: string = "first-article.md",
    content: string = "This is my first article",
    published: boolean = true,
    tags: string[] = ["markdown", "test"],
    authors: string[] = ["Default author"],
    date: string = new Date().toISOString().split("T")[0],
    section: string = "tech",
) {
    const article = generateArticle(
        title,
        content,
        published,
        tags,
        authors,
        date,
        section,
    );
    Deno.writeTextFile(path.join(folder, filename), article);
}
