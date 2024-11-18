import { html } from "hono/html";
import { Smallblog } from "./mod.ts";

const customBodyScript = await html`<script
  defer
  data-domain="smallblog-demo.tayzen.dev"
  src="https://plausible.io/js/script.js"
></script>`;

export default new Smallblog({
  favicon: "favicon.ico",
  siteDescription:
    "A blog to demonstrate the capabilities of smallblog, the blog engine build for smallweb",
  siteTitle: "Smallblog demo",
  indexTitle: "A blog about nothing",
  indexSubtitle: "A nice demo of smallblog",
  customBodyScript,
  defaultAuthors: ["Tayzen"],
});
