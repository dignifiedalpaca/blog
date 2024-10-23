/** @jsxImportSource hono/jsx */
import * as path from "@std/path";
import { type Context, Hono } from "hono";
import { Index } from "./pages/index.tsx";
import {
  filterArticlesFTS,
  getArticle,
  getArticles,
  getRSS,
  getSitemap,
} from "./blog.ts";
import { getMimeType } from "./utils.ts";
import { ArticlePage } from "./pages/article.tsx";
import { Articles } from "./pages/components/articles.tsx";
import type { App } from "@smallweb/types"

type BlogAppOptions = {
  postsFolder?: string;
  draftsFolder?: string;
  staticFolder?: string;
  faviconPath?: string;
  siteTitle: string;
  siteDescription?: string;
  indexTitle: string;
  indexSubtitle: string;
  locale?: string;
  customHeaderScript?: string;
  customBodyScript?: string;
};

function getBaseUrl(c: Context): string {
  return (new URL(c.req.url)).origin;
}

function getRequestedUrl(c: Context): string {
  return c.req.url;
}

export function createBlogApp(options: BlogAppOptions): App {
  const {
    postsFolder = "posts/",
    draftsFolder = "drafts/",
    staticFolder = "static/",
    faviconPath = "favicon.ico",
    siteTitle,
    siteDescription = `The blog: ${siteTitle}`,
    indexTitle,
    indexSubtitle,
    locale,
    customHeaderScript,
    customBodyScript,
  } = options;

  const app = new Hono();

  app.get("/", (c) => {
    const page = c.req.query("page") || 1;
    const search = c.req.query("search") || "";
    const itemsPerPage = 5;
    const posts = getArticles(postsFolder);

    const filteredPosts = filterArticlesFTS(posts, search);

    const hxRequest = c.req.header("hx-request");
    const hxBoosted = c.req.header("hx-boosted");

    if (hxRequest && !hxBoosted) {
      return c.html(
        <Articles
          posts={filteredPosts}
          search={search}
          page={Number(page)}
          itemsPerPage={itemsPerPage}
        />,
        200,
        {
          "HX-Push-Url": search ? "/?page=1&search=" + search : "/?page=1",
        },
      );
    }

    return c.html(
      `<!DOCTYPE html>` +
      (
        <Index
          posts={filteredPosts}
          page={Number(page)}
          itemsPerPage={itemsPerPage}
          search={search}
          siteTitle={siteTitle}
          indexTitle={indexTitle}
          indexSubtitle={indexSubtitle}
          faviconPath={faviconPath}
          url={c.req.url}
          locale={locale}
          description={siteDescription}
          bodyScript={customBodyScript}
          headScript={customHeaderScript}
        />
      ),
    );
  });

  app.get("/rss.xml", (c) => {
    const baseUrl = getBaseUrl(c);
    const articles = getArticles(postsFolder);
    const xml = getRSS(baseUrl, articles);
    return new Response(xml, {
      headers: {
        "content-type": "application/xml",
      },
    });
  });

  app.get("/sitemap.xml", async (c) => {
    const baseUrl = getBaseUrl(c);
    const articles = getArticles(postsFolder);
    const xml = await getSitemap(baseUrl, articles);
    if (xml) {
      return new Response(xml, {
        headers: {
          "content-type": "application/xml",
        },
      });
    }
  });

  app.get("/robots.txt", (c) => {
    const baseUrl = getBaseUrl(c);
    const robotTxt = `
      User-agent: *
      Disallow: /drafts
      Sitemap: ${path.join(baseUrl, "/sitemap.xml")}
      `.replace(/  +/g, "").trim();
    return new Response(robotTxt, {
      headers: {
        "content-type": "text/plain",
      },
    });
  });

  app.get("/article/:name", (c) => {
    const name = c.req.param("name");

    const article = getArticle(name, postsFolder);
    const renderedArticle = article.html;

    if (!renderedArticle) {
      return new Response("Page not found", { status: 404 });
    }

    return c.html(
      `<!DOCTYPE html>` + (
        <ArticlePage
          article={article}
          siteTitle={siteTitle}
          faviconPath={faviconPath}
          url={c.req.url}
          locale={locale}
          bodyScript={customBodyScript}
          headScript={customHeaderScript}
        />
      ),
    );
  });

  app.get("/drafts/:name", (c) => {
    const name = c.req.param("name");

    const article = getArticle(name, draftsFolder);
    const renderedArticle = article.html;

    if (!renderedArticle) {
      return new Response("Page not found", { status: 404 });
    }

    return c.html(
      `<!DOCTYPE html>` + (
        <ArticlePage
          article={article}
          siteTitle={siteTitle}
          faviconPath={faviconPath}
          url={c.req.url}
          locale={locale}
          bodyScript={customBodyScript}
          headScript={customHeaderScript}
        />
      ),
    );
  });

  app.get("*", (c) => {
    const reqPath = c.req.path;
    try {
      const file = Deno.readFileSync(path.join(staticFolder, reqPath));
      return new Response(file, {
        headers: { "content-type": getMimeType(reqPath) },
      });
    } catch (e) {
      console.log("error while loading file:", e);
      return new Response("Not found", { status: 404 });
    }
  });

  return app;
}
