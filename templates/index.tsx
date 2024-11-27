/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";
import type { Article } from "../blog.ts";
import { Articles } from "./components/articles.tsx";
import SearchIcon from "./components/search.tsx";

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
  noPosts?: boolean;
  bodyScript?: string;
  headScript?: string;
  favicon: boolean;
  faviconLink?: string;
  customPages?: { name: string; path: string; external: boolean }[];
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
    noPosts,
    favicon = false,
    faviconLink,
    customPages = [],
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
      faviconLink={faviconLink}
      customPages={customPages}
    >
      <header class={"index-header"}>
        {indexTitle && <h1 class={"index-title"}>{indexTitle}</h1>}
        {indexSubtitle && <h2 class={"index-subtitle"}>{indexSubtitle}</h2>}
      </header>
      <form action="/?page=1" method="get" class="search-container">
        <SearchIcon className="search-icon" />
        <input
          class="search-field"
          id="search-field"
          type="search"
          name="search"
          placeholder="Titles, tags or content"
          hx-get="/?page=1"
          hx-trigger="input changed delay:500ms, search"
          hx-target=".articles-list"
          value={props.search}
        />
        <button
          type="reset"
          class="delete-button"
          aria-label="Clear search"
          hx-get="/?page=1"
          hx-trigger="click"
          hx-target=".articles-list"
          hx-on--after-request="this.form.reset()"
        >
          &times;
        </button>
      </form>
      {!noPosts && (
        <Articles
          posts={posts}
          search={props.search}
          page={props.page}
          itemsPerPage={props.itemsPerPage}
        />
      )}
      {noPosts && (
        <div
          class="no-articles"
          dangerouslySetInnerHTML={{ __html: noArticlesMessage || "" }}
        />
      )}
    </Layout>
  );
};
