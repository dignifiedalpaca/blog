/** @jsxImportSource hono/jsx */

import * as path from "@std/path";
import * as fs from "@std/fs";
import { contentType } from "@std/media-types";
import { compress } from "hono/compress";
import { type Context, Hono } from "hono";
import { Index } from "./templates/index.tsx";
import {
  filterArticlesFTS,
  getArticle,
  getArticles,
  getRSS,
  getSitemap,
} from "./blog.ts";
import { isDirectoryEmpty, getMtime, isUrl } from "./utils.ts";
import { ArticlePage } from "./templates/article.tsx";
import { Articles } from "./templates/components/articles.tsx";
import { storeArticle } from "./article_generator.ts";
import { CustomPage } from "./templates/customPage.tsx";
import type { SmallblogParams } from "./options.ts";

export function createServer(params: SmallblogParams) {
  const server = new Hono();

  const postsRoute = path.join("/", params.postsFolder);
  const draftsRoute = path.join("/", params.draftsFolder);
  const faviconIsUrl = isUrl(params.favicon || "");

  const customPages = getArticles(params.pagesFolder, "/")
    .map((article) => ({
      name: article.title,
      path: article.metadata?.redirect || article.url,
      external: !!article.metadata?.redirect,
      order: article.metadata?.order || Infinity,
    }))
    .sort((a, b) => {
      if (a?.order && b?.order) {
        return a?.order - b?.order;
      }
      return -1;
    });

  server.use(compress());

  server.use("*", async (c, next) => {
    if (!params.cacheEnabled) {
      await next();
      return;
    }

    let filePath: string | undefined = undefined;
    const urlPath = new URL(c.req.url).pathname;

    if (urlPath === "/favicon" && !faviconIsUrl) {
      filePath = params.favicon;
    }
    if (urlPath.startsWith(postsRoute)) {
      filePath = path.join(
        ".",
        urlPath + (path.extname(c.req.url) ? "" : ".md"),
      );
    }
    if (urlPath.startsWith(draftsRoute)) {
      filePath = path.join(
        ".",
        urlPath + (path.extname(c.req.url) ? "" : ".md"),
      );
    }
    if (urlPath === "/") {
      filePath = params.postsFolder;
    }
    if (urlPath.startsWith("/")) {
      const filename = c.req.path.slice(1);
      const tmpPath = path.join(
        params.pagesFolder,
        filename + (path.extname(filename) ? "" : ".md"),
      );
      if (filename && fs.existsSync(tmpPath)) {
        filePath = tmpPath;
      }
    }
    if (!filePath || !fs.existsSync(filePath)) {
      await next();
      return;
    }

    const cache = await caches.open("smallblog");
    const cachedResponse = await cache.match(c.req.url);

    const lastUpdateTime = new Date(
      (await getMtime(filePath, params.pagesFolder)) * 1000,
    );

    if (cachedResponse) {
      const cacheLastUpdate = new Date(
        cachedResponse.headers.get("X-Last-Update") || 0,
      );

      if (cacheLastUpdate >= lastUpdateTime) {
        return cachedResponse;
      } else {
        await cache.delete(c.req.url);
      }
    }

    await next();

    const response = c.res.clone();
    response.headers.set("X-Last-Update", lastUpdateTime.toISOString());
    await cache.put(c.req.url, response);
  });

  server.get("/", async (c) => {
    const page = c.req.query("page") || 1;
    const search = c.req.query("search") || "";
    const itemsPerPage = 5;
    const posts = getArticles(params.postsFolder, undefined, params.defaultAuthors);

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
          siteTitle={params.siteTitle}
          indexTitle={params.indexTitle}
          indexSubtitle={params.indexSubtitle}
          url={c.req.url}
          locale={params.locale}
          description={params.siteDescription}
          noArticlesMessage={await getNoArticlesMessage(params)}
          bodyScript={params.customBodyScript}
          headScript={params.customHeaderScript}
          favicon={!!params.favicon}
          faviconLink={faviconIsUrl ? params.favicon : undefined}
          customPages={customPages}
        />
      ),
    );
  });

  server.get(path.join(postsRoute, ":filename{.+$}"), (c) => {
    const filename = c.req.param("filename");

    if (!filename) {
      // if the route is /posts/
      return new Response("Not found", { status: 404 });
    }
    if (path.extname(filename)) {
      // if the name contains an ext this is not an article
      return serveStaticFile(filename, params.postsFolder);
    }
    return servePage(
      c,
      filename,
      params.postsFolder,
      faviconIsUrl,
      customPages,
      params
    );
  });

  server.get(path.join(draftsRoute, ":filename{.+$}"), (c) => {
    const filename = c.req.param("filename");

    if (!filename) {
      // if the route is /article/
      return new Response("Not found", { status: 404 });
    }
    if (path.extname(filename)) {
      // if the name contains an ext this is not an article
      return serveStaticFile(filename, params.draftsFolder);
    }
    return servePage(
      c,
      filename,
      params.draftsFolder,
      faviconIsUrl,
      customPages,
      params
    );
  });

  server.get("/rss.xml", (c) => {
    const baseUrl = getBaseUrl(c);
    const articles = getArticles(params.postsFolder, undefined, params.defaultAuthors);
    const xml = getRSS(baseUrl, articles);
    return new Response(xml, {
      headers: {
        "content-type": "application/xml",
      },
    });
  });

  server.get("/sitemap.xml", (c) => {
    const baseUrl = getBaseUrl(c);
    const articles = getArticles(params.postsFolder, undefined, params.defaultAuthors);
    const customPages = getArticles(params.pagesFolder, "/").filter(
      (page) => !!page?.metadata?.redirect !== true,
    );
    const xml = getSitemap(baseUrl, articles.concat(customPages));
    if (xml) {
      return new Response(xml, {
        headers: {
          "content-type": "application/xml",
        },
      });
    }
    return new Response("Not found", { status: 404 });
  });

  server.get("/robots.txt", (c) => {
    const baseUrl = getBaseUrl(c);
    const robotTxt = `
      User-agent: *
      Disallow: /drafts
      Sitemap: ${new URL("/sitemap.xml", baseUrl).href}
      `
      .replace(/  +/g, "")
      .trim();
    return new Response(robotTxt, {
      headers: {
        "content-type": "text/plain",
      },
    });
  });

  server.on("GET", ["/favicon", "/favicon.ico"], () => {
    return serveStaticFile(params.favicon);
  });

  server.get("/init", async (c) => {
    fs.ensureDirSync(params.draftsFolder);
    fs.ensureDirSync(params.postsFolder);
    fs.ensureDirSync(params.pagesFolder);
    if (await isDirectoryEmpty(params.postsFolder)) {
      storeArticle(params.postsFolder, "first-article.md", {
        title: "My first article",
        content:
          "This is my first article. This is an image:\n\n![RSS](first-article/exampleImage.svg)",
      });
    }

    return c.redirect("/");
  });

  server.get("/:filename{.+$}", (c) => {
    const filename = c.req.param("filename");

    if (!filename) {
      // if the route is /
      return new Response("Not found", { status: 404 });
    }
    if (path.extname(filename)) {
      // if the name contains an ext this is not an article
      return serveStaticFile(filename, params.pagesFolder);
    }
    return servePage(
      c,
      filename,
      params.pagesFolder,
      faviconIsUrl,
      customPages,
      params,
      false,
    );
  });

  return server
}

function getBaseUrl(c: Context): string {
  return new URL(c.req.url).origin;
}

function servePage(
  c: Context,
  name: string,
  folder: string,
  faviconIsUrl: boolean,
  customPages: { name: string; path: string; external: boolean }[] = [],
  opts: SmallblogParams,
  article: boolean = true,
) {
  const {
    siteTitle = "Smallblog",
    locale,
    customHeaderScript,
    customBodyScript,
    favicon,
    defaultAuthors,
  } = opts;

  const page = getArticle(name, folder, undefined, defaultAuthors);
  const renderedPage = page.html;

  if (!renderedPage) {
    return new Response("Page not found", { status: 404 });
  }

  if (article) {
    return c.html(
      `<!DOCTYPE html>` +
      (
        <ArticlePage
          article={page}
          siteTitle={siteTitle}
          url={c.req.url}
          locale={locale}
          bodyScript={customBodyScript}
          headScript={customHeaderScript}
          favicon={!!favicon}
          faviconLink={faviconIsUrl ? favicon : undefined}
          customPages={customPages}
        />
      ),
    );
  }
  return c.html(
    `<!DOCTYPE html>` +
    (
      <CustomPage
        article={page}
        siteTitle={siteTitle}
        url={c.req.url}
        locale={locale}
        bodyScript={customBodyScript}
        headScript={customHeaderScript}
        favicon={!!favicon}
        faviconLink={faviconIsUrl ? favicon : undefined}
        customPages={customPages}
      />
    ),
  );
}

function serveStaticFile(name?: string, folder?: string) {
  if (!name) {
    return new Response("Not found", { status: 404 });
  }
  try {
    let file;
    if (folder) {
      file = Deno.readFileSync(path.join(folder, name));
    } else {
      file = Deno.readFileSync(name);
    }
    return new Response(file, {
      headers: {
        "content-type":
          contentType(name.substring(name.lastIndexOf("."))) ||
          "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

async function getNoArticlesMessage(opts: SmallblogParams) {
  const { noArticlesMessage, postsFolder, draftsFolder } = opts;

  if (noArticlesMessage) {
    return noArticlesMessage;
  }

  const baseMessage = `<p>You have no articles yet, you can add them by creating a folder <code>${postsFolder}</code> and adding markdown files in it. Don't forget to also add a <code>${draftsFolder}</code> folder for your drafts.</p><p>Read the README for more informations.</p>`;

  const writePermission = await Deno.permissions.query({
    name: "write",
    path: ".",
  });

  if (writePermission.state === "granted") {
    return (
      baseMessage +
      `<p><a class="button" href="/init">Let smallblog do it for you!</a></p>`
    );
  }

  return baseMessage;
}
