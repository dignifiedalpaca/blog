import { html } from "hono/html";
import { createSmallblog } from "./mod.tsx";

const customBodyScript = await html`<script
  defer
  data-domain="smallblog-demo.tayzen.dev"
  src="https://plausible.io/js/script.js"
></script>`;

export default createSmallblog({
  favicon: "favicon.ico",
  siteDescription:
    "A blog to demonstrate the capabilities of smallblog, the blog engine build for smallweb",
  siteTitle: "Smallblog demo",
  indexTitle: "A blog about nothing",
  indexSubtitle: "A nice demo of smallblog",
  customBodyScript,
  cacheEnabled: false,
  defaultAuthors: ["Tayzen"],
});
