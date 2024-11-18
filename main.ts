import { Smallblog } from "./mod.ts";

export default new Smallblog({
  favicon: "favicon.ico",
  siteDescription:
    "A blog to demonstrate the capabilities of smallblog, the blog engine build for smallweb",
  siteTitle: "Smallblog demo",
  indexTitle: "A blog about nothing",
  indexSubtitle: "A nice demo of smallblog",
  defaultAuthors: ["Tayzen"],
});
