/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";
import type { Article } from "../blog.ts";
import { Articles } from "./components/articles.tsx";
import { scriptFixHtmxBoosting } from "./scripts.ts";

type IndexProps = {
  posts: Article[];
  page: number;
  itemsPerPage: number;
  search: string;
  siteTitle: string;
  indexTitle?: string;
  indexSubtitle?: string;
  url: string;
  locale?: string;
  description?: string;
  noArticlesMessage?: string;
  bodyScript?: string;
  headScript?: string;
  favicon: boolean;
};

export const Index: FC<IndexProps> = (props: IndexProps) => {
  const {
    posts,
    siteTitle,
    indexTitle,
    indexSubtitle,
    bodyScript,
    headScript,
    url,
    locale,
    description,
    noArticlesMessage,
    favicon = false,
  } = props;

  return (
    <Layout
      pageTitle={siteTitle}
      siteTitle={siteTitle}
      bodyScript={bodyScript}
      headScript={headScript}
      url={url}
      locale={locale}
      description={description}
      favicon={favicon}
    >
      <header class={"index-header"}>
        {indexTitle && <h1 class={"index-title"}>{indexTitle}</h1>}
        {indexSubtitle && <h2 class={"index-subtitle"}>{indexSubtitle}</h2>}
      </header>
      <form action="/?page=1" method="get">
        <input
          class="search-field"
          id="search-field"
          type="search"
          name="search"
          placeholder="Look up titles, tags or text"
          hx-get="/?page=1"
          hx-trigger="input changed delay:500ms, search"
          hx-target=".articles-list"
          value={props.search}
        />
      </form>
      {posts && posts.length > 0 && (
        <Articles
          posts={posts}
          search={props.search}
          page={props.page}
          itemsPerPage={props.itemsPerPage}
        />
      )}
      {(!posts || posts.length === 0) && (
        <div
          class="no-articles"
          dangerouslySetInnerHTML={{ __html: noArticlesMessage || "" }}
        />
      )}
      {scriptFixHtmxBoosting}
    </Layout>
  );
};
