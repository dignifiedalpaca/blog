import * as path from "@std/path";
import { Hono } from "hono";
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

type BlogAppOptions = {
  baseUrl: string;
  postsFolder?: string;
  draftsFolder?: string;
  staticFolder?: string;
  faviconPath?: string;
  siteTitle: string;
  indexTitle: string;
  indexSubtitle: string;
  customHeaderScript?: string;
  customBodyScript?: string;
};

export function createBlogApp(options: BlogAppOptions): Hono {
  const {
    baseUrl,
    postsFolder = "posts/",
    draftsFolder = "drafts/",
    staticFolder = "static/",
    faviconPath = "favicon.ico",
    siteTitle,
    indexTitle,
    indexSubtitle,
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
            bodyScript={customBodyScript}
            headScript={customHeaderScript}
          />
        ),
    );
  });

  app.get("/rss.xml", () => {
    const articles = getArticles(postsFolder);
    const xml = getRSS(baseUrl, articles);
    return new Response(xml, {
      headers: {
        "content-type": "application/xml",
      },
    });
  });

  app.get("/sitemap.xml", async () => {
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

  app.get("/robots.txt", () => {
    const robotTxt = `
      User-agent: *
      Disallow:
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
