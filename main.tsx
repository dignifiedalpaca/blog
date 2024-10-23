/** @jsxImportSource hono/jsx */
import { html } from "hono/html"
import { createBlogApp } from "./mod.tsx";

const postsFolder = Deno.env.get("POSTS_FOLDER") || "posts/";
const staticFolder = "static/";
const faviconPath = "/favicon.ico";
const siteTitle = "Smallblog demo";
const indexTitle = "A blog about nothing";
const indexSubtitle = "A nice demo of smallblog";
const customBodyScript =
  await html`<script defer data-domain="smallblog-demo.tayzen.dev" src="https://plausible.io/js/script.js"></script>`;

export default createBlogApp({
  postsFolder,
  staticFolder,
  faviconPath,
  siteTitle,
  indexTitle,
  indexSubtitle,
  customBodyScript,
});
