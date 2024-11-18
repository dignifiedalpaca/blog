/**
 * The options to create your blog.
 */
export type SmallblogConfig = {
  /** The folder where your posts are located (default: `posts/`). The name of the folder will be
   * used for the routes (ex: of you named your folder `abcd`, the route to a post will be
   * `/abcd/my_post`). */
  postsFolder: string;
  /** The folder where your drafts are located (default: `drafts/`). The name of the folder will be
   * used for the routes (ex: of you named your folder `abcd`, the route to a post will be
   * `/abcd/my_post`). */
  draftsFolder: string;
  /** The folder where your custom pages are located (default: `pages/`). These pages are displayed
   * inside the navbar and their route starts with `/`, following by the name of the file without
   * extension. */
  pagesFolder: string;
  /** The path or URL to your favicon (default: empty). */
  favicon?: string;
  /** The title of your blog (default: `Smallblog`). */
  siteTitle: string;
  /** The description of your blog (default: `The blog: ${siteTitle}`). */
  siteDescription: string;
  /** The title of the index page (ex: `A blog about nothing`, no default). */
  indexTitle?: string;
  /** The subtitle of the index page (ex: `A nice demo of smallblog`, no default). */
  indexSubtitle?: string;
  /** The authors of the index page (ex: `["Tayzen"]`, empty list by default). */
  defaultAuthors?: string[];
  /** The message to display when there are no articles (ex: `Coming soon!`, default is a message
   * to help you starting). */
  noArticlesMessage?: string;
  /** The locale of your blog. */
  locale?: string;
  /** The script to add to the header of your blog. */
  customHeaderScript?: string;
  /** The script to add to the body of your blog. */
  customBodyScript?: string;
};
