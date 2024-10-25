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
import type { App } from "@smallweb/types";

/**
 * The options to create your blog
 * @param postsFolder The folder where your posts are located (default: `posts/`)
 * @param draftsFolder The folder where your drafts are located (default: `drafts/`)
 * @param faviconPath The path to your favicon (default: `favicon.ico`)
 * @param siteTitle The title of your blog (default: `Smallblog`)
 * @param siteDescription The description of your blog (default: `The blog: ${siteTitle}`)
 * @param indexTitle The title of the index page (ex: `A blog about nothing`, no default)
 * @param indexSubtitle The subtitle of the index page (ex: `A nice demo of smallblog`, no default)
 * @param noArticlesMessage The message to display when there are no articles
 *    (ex: `Coming soon!`, default is a message to help you)
 * @param locale The locale of your blog
 * @param customHeaderScript The script to add to the header of your blog
 * @param customBodyScript The script to add to the body of your blog
 */
export type BlogAppOptions = {
  postsFolder?: string;
  draftsFolder?: string;
  faviconPath?: string;
  siteTitle?: string;
  siteDescription?: string;
  indexTitle?: string;
  indexSubtitle?: string;
  noArticlesMessage?: string;
  locale?: string;
  customHeaderScript?: string;
  customBodyScript?: string;
};

function getBaseUrl(c: Context): string {
  return (new URL(c.req.url)).origin;
}

function serveArticle(
  c: Context,
  name: string,
  folder: string,
  opts: BlogAppOptions,
) {
  const {
    siteTitle = "Smallblog",
    locale,
    customHeaderScript,
    customBodyScript,
  } = opts;

  const article = getArticle(name, folder);
  const renderedArticle = article.html;

  if (!renderedArticle) {
    return new Response("Page not found", { status: 404 });
  }

  return c.html(
    `<!DOCTYPE html>` + (
      <ArticlePage
        article={article}
        siteTitle={siteTitle}
        url={c.req.url}
        locale={locale}
        bodyScript={customBodyScript}
        headScript={customHeaderScript}
      />
    ),
  );
}

function serveStaticFile(name: string, folder?: string) {
  try {
    let file;
    if (folder) {
      file = Deno.readFileSync(path.join(folder, name));
    } else {
      file = Deno.readFileSync(name);
    }
    return new Response(file, {
      headers: { "content-type": getMimeType(name) },
    });
  } catch (e) {
    console.log("error while loading file:", e);
    return new Response("Not found", { status: 404 });
  }
}

/**
 * The function to create your blog, you configure your blog with the options
 * and then you just have to write your files
 *
 * @param options The parameters to create the blog.
 * @returns A smallweb/hono app with a fetch method
 */
export function createBlogApp(options: BlogAppOptions): App {
  const {
    postsFolder = "posts/",
    draftsFolder = "drafts/",
    faviconPath = "favicon.ico",
    siteTitle = "Smallblog",
    siteDescription = `The blog: ${siteTitle}`,
    indexTitle,
    indexSubtitle,
    noArticlesMessage,
    locale,
    customHeaderScript,
    customBodyScript,
  } = options;

  const defaultNoArticlesMessage =
    `<p>You have no articles yet, you can add them by creating a folder <code>${postsFolder}</code> and adding markdown files in it. Don't forget to also add a <code>${draftsFolder}</code> folder for your drafts.</p><p>Read the README for more informations.</p>`;

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
            url={c.req.url}
            locale={locale}
            description={siteDescription}
            noArticlesMessage={noArticlesMessage || defaultNoArticlesMessage}
            bodyScript={customBodyScript}
            headScript={customHeaderScript}
          />
        ),
    );
  });

  app.get("/article/:filename{.+$}", (c) => {
    const filename = c.req.param("filename");
    console.log("filename:", filename);

    if (!filename) { // if the route is /article/
      return new Response("Not found", { status: 404 });
    }
    if (path.extname(filename)) { // if the name contains an ext this is not an article
      return serveStaticFile(filename, postsFolder);
    }
    return serveArticle(c, filename, postsFolder, options);
  });

  app.get("/drafts/:filename{.+$}", (c) => {
    const filename = c.req.param("filename");
    console.log("filename:", filename);

    if (!filename) { // if the route is /article/
      return new Response("Not found", { status: 404 });
    }
    if (path.extname(filename)) { // if the name contains an ext this is not an article
      return serveStaticFile(filename, draftsFolder);
    }
    return serveArticle(c, filename, draftsFolder, options);
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

  app.get("/favicon", () => {
    return serveStaticFile(faviconPath);
  });

  return app;
}
