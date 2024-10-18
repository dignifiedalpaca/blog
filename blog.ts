import * as path from "@std/path";
import { render } from "@deno/gfm";
import { parse } from "@std/yaml";
import RSS from "rss";
import { Sitemap } from "https://deno.land/x/deno_sitemap/mod.ts";
import MiniSearch from "minisearch";
import loadLanguages from "npm:prismjs@1.29.0/components/index.js";

loadLanguages(); // should load all language highlightings

function getMarkdown(fileName: string, postsFolder: string) {
    const postPath = path.join(postsFolder, fileName);
    let content: string;
    try {
        content = Deno.readTextFileSync(postPath);
    } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
            throw error;
        }
        return "";
    }
    return content;
}

export function getArticles(postsFolder: string): Article[] {
    let postsNames: string[] = [];
    for (const entry of Deno.readDirSync(postsFolder)) {
        if (entry.isFile && entry.name.endsWith("md")) {
            postsNames = postsNames.concat(entry.name);
        }
    }

    const articles: Article[] = postsNames.map((name) => {
        return new Article(name.slice(0, -3), getMarkdown(name, postsFolder));
    }).filter((article) => article.metadata.published).filter((article) =>
        article.content !== ""
    );
    return articles.sort((a, b) => {
        if (a?.metadata?.date && b?.metadata?.date) {
            return b?.metadata?.date?.getDate() - a?.metadata?.date?.getDate();
        }
        return -1;
    });
}

export function filterArticlesFTS(
    articles: Article[],
    query: string,
): Article[] {
    if (!query) {
        return articles;
    }

    const miniSearch = new MiniSearch({
        fields: ["title", "content", "tags"], // fields to index for full-text search
        storeFields: [], // fields to return with search results
        idField: "url",
    });

    const transformedArticles = articles.map((article) => {
        return {
            ...article,
            tags: article.metadata.tags?.join(" "),
        };
    });

    miniSearch.addAll(transformedArticles);
    const searchResult = miniSearch.search(query, { prefix: true });

    const result = searchResult.flatMap((articleResult) => {
        return articles.find(
            (article) => article.url === articleResult.id,
        ) || [];
    });

    return result || [];
}

export function getRSS(baseUrl: string, articles: Article[]) {
    const feed = new RSS({
        title: "Tayzen's blog",
        description: "A blog about nerdy stuffs.",
        site_url: baseUrl,
        feed_url: path.join(baseUrl, "rss.xml"),
        language: "en",
        categories: ["Technology", "Programming", "Self-hosting"],
    });
    for (const article of articles) {
        feed.item({
            title: article.title,
            description: article.html,
            url: path.join(baseUrl, article.url),
            date: article.metadata.date,
            categories: article.metadata.tags,
            author: article.metadata.authors?.join(", "),
        });
    }
    return feed.xml();
}

export function getSitemap(baseUrl: string, articles: Article[]) {
    const sitemap: Sitemap = new Sitemap(baseUrl);

    for (const article of articles) {
        sitemap.add(article.url, {
            changefreq: "weekly",
            priority: 1,
        });
    }
    sitemap.add("/", { changefreq: "daily", priority: 0.8 });

    return sitemap.sitemap;
}

export function getArticle(name: string, postsFolder: string): Article {
    const article = new Article(name, getMarkdown(name + ".md", postsFolder));
    return article;
}

function getMetadataFromMD(markdown: string) {
    const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---/;
    const metadataMatched = markdown.match(charactersBetweenGroupedHyphens);
    if (!metadataMatched) return new Metadata({});
    const metadata = parse(metadataMatched[1]) as Metadata;
    return metadata;
}

function removeMetadataFromMD(markdown: string) {
    const startOfMetadataIndex = markdown.indexOf("---");
    if (
        (!startOfMetadataIndex && startOfMetadataIndex !== 0) ||
        startOfMetadataIndex === -1
    ) return markdown;
    const endOfMetadataIndex = markdown.indexOf(
        "---",
        startOfMetadataIndex + 1,
    );
    if (!endOfMetadataIndex || endOfMetadataIndex === -1) return markdown;
    return markdown.substring(endOfMetadataIndex + 3);
}

export class Metadata {
    title?: string;
    description?: string;
    authors?: string[];
    tags?: string[];
    published?: boolean;
    date?: Date;

    constructor(
        { title, description, authors, tags, published, date }: {
            title?: string;
            description?: string;
            authors?: string | string[];
            tags?: string | string[];
            published?: boolean;
            date?: Date;
        },
    ) {
        this.title = title;
        this.description = description;
        if (typeof authors === "string") {
            authors = [authors];
        } else {
            this.authors = authors;
        }
        if (typeof tags === "string") {
            tags = [tags];
        } else {
            this.tags = tags;
        }
        this.published = published;
        this.date = date;
    }
}

function convertNameToLabel(name: string) {
    const nameWithSpace = name
        .split("_")
        .join(" ");
    return nameWithSpace.charAt(0).toUpperCase() + nameWithSpace.slice(1);
}

function removingTitleFromMD(markdown: string) {
    const titleRegex = /^# +\S+[\S ]*/m;
    const titleMatched = markdown.match(titleRegex);
    if (!titleMatched) {
        return markdown;
    }
    const titlePosition = markdown.indexOf(titleMatched[0]);
    if (!titlePosition || titlePosition === -1) {
        return markdown;
    }
    return markdown.substring(titlePosition + titleMatched[0].length);
}

export class Article {
    name: string;
    title: string;
    content: string;
    preview: string;
    html: string;
    metadata: Metadata;
    url: string;

    constructor(
        name: string,
        content: string,
        title?: string,
        html?: string,
        metadata?: Metadata,
    ) {
        const cleanedContent = removingTitleFromMD(
            removeMetadataFromMD(content),
        ).trim();

        this.metadata = metadata || getMetadataFromMD(content);
        this.name = name;
        this.content = content;
        this.title = title || this.metadata.title || convertNameToLabel(name);
        this.preview = render(cleanedContent.slice(0, 300) + "...");
        this.html = html || render(cleanedContent);
        this.url = `/article/${this.name}`;
    }
}
