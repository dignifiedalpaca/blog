import { Command } from "commander";
import * as fs from "@std/fs";
import * as path from "@std/path";
import { storeArticle } from "./article_generator.ts";
import manifest from "./deno.json" with { type: "json" };

type CLI = (args: string[]) => void;

export function createCli(postsFolder: string): CLI {
  const program = new Command();

  program
    .name(path.basename(Deno.cwd()))
    .version(manifest.version)
    .description("Smallblog CLI, handle your articles from the terminal.");

  program
    .command("create")
    .alias("c")
    .description("Create a new blog post as draft")
    .argument("<name>", "The id of the post (no space allowed)")
    .option("-P, --published", "Create a published post")
    .option("-t, --title <title>", "The title of the post")
    .option("-p", "--preview <preview>", "The preview of the post")
    .option("-d", "--description <description>", "The description of the post")
    .option("-a, --authors <authors...>", "The author of the post")
    .option(
      "-D, --date <date>",
      "The date of the post (YYYY-MM-DD, default: current date)",
    )
    .option("--tags <tags...>", "The tags of the post")
    .option("-s, --section <section>", "The section of the post")
    .option("-c, --content <content>", "The content of the post")
    .action((fileId, options) => {
      console.log("Creating post...");
      try {
        const underscoreToAdd = options.published
          ? false
          : !fileId.startsWith("_");
        const filename = (underscoreToAdd ? "_" : "") + fileId + ".md";
        const folder = postsFolder;
        const params = {
          title: options.title as string,
          content: options.content as string,
          description: options.description as string,
          preview: options.preview as string,
          tags: (options.tags as string[]) || undefined,
          authors: (options.authors as string[]) || undefined,
          date: options.date as string,
          section: options.section as string,
        };
        storeArticle(folder, filename, params);
        console.log("Post created.");
      } catch (e) {
        console.error("Error while creating post:", e);
        Deno.exit(1);
      }
    });

  program
    .command("publish")
    .alias("p")
    .description("Publish a draft post")
    .argument("<name>", "The id of the post (no space allowed)")
    .action((fileId) => {
      console.log("Publishing post...");
      try {
        fs.moveSync(
          path.join(
            postsFolder,
            (!fileId.startsWith("_") ? "_" + fileId : fileId) + ".md",
          ),
          path.join(
            postsFolder,
            (!fileId.startsWith("_") ? fileId : fileId.substring(1)) + ".md",
          ),
        );
        console.log("Post published.");
      } catch (e) {
        console.error("Error while publishing post:", e);
        Deno.exit(1);
      }
    });

  program
    .command("list")
    .alias("ls")
    .description("List all blog posts")
    .option("-D, --drafts", "List only draft posts")
    .option("-P", "--published", "List only published posts")
    .option("-a, --all", "List all posts (default)")
    .action((options) => {
      console.log("Posts:");
      if (options.all || options.published || !options.drafts) {
        console.log("");
        console.log("Published:");
        for (
          const file of fs.expandGlobSync(path.join(postsFolder, "[!_]*.md"))
        ) {
          console.log("    - ", file.name.replace(".md", ""));
        }
      }
      if (options.all || options.drafts || !options.published) {
        console.log("");
        console.log("Drafts:");
        for (const file of fs.expandGlobSync(path.join(postsFolder, "_*.md"))) {
          console.log("    - ", file.name.replace(".md", "").replace("_", ""));
        }
      }
      console.log("");
    });

  program
    .command("archive")
    .alias("a")
    .description("Archive a blog post as a draft")
    .argument("<name>", "The id of the post (no space allowed)")
    .action((fileId) => {
      console.log("Archiving post...");
      try {
        fs.moveSync(
          path.join(postsFolder, fileId + ".md"),
          path.join(
            postsFolder,
            (fileId.startsWith("_") ? fileId : "_" + fileId) + ".md",
          ),
        );
        console.log("Post archived.");
      } catch (e) {
        console.error("Error while archiving post:", e);
        Deno.exit(1);
      }
    });

  program
    .command("remove")
    .alias("rm")
    .description(
      "Remove a blog post. You can only delete a draft post. If you want to delete a published post, use `smallblog archive` first. This does NOT delete the images or videos of the post, You should delete them manually.",
    )
    .argument("<name>", "The id of the post (no space allowed)")
    .action((fileId) => {
      console.log("Removing post...");
      try {
        Deno.removeSync(
          path.join(
            postsFolder,
            (!fileId.startsWith("_") ? "_" + fileId : fileId) + ".md",
          ),
        );
        console.log("Post removed.");
      } catch {
        console.log("Post not found.");
        Deno.exit(1);
      }
    });

  function run(args: string[]) {
    program.parse(args, { from: "user" });
  }

  return run;
}
