import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";
import type { Article } from "../blog.ts";
import { Articles } from "./components/articles.tsx";

export const Index: FC<
  {
    posts: Article[];
    page: number;
    itemsPerPage: number;
    search: string;
    siteTitle: string;
    indexTitle: string;
    indexSubtitle: string;
    faviconPath: string;
    bodyScript?: string;
    headScript?: string;
  }
> = (props: {
  posts: Article[];
  page: number;
  itemsPerPage: number;
  search: string;
  siteTitle: string;
  indexTitle: string;
  indexSubtitle: string;
  faviconPath: string;
  bodyScript?: string;
  headScript?: string;
}) => {
  const {
    posts,
    siteTitle,
    indexTitle,
    indexSubtitle,
    faviconPath,
    bodyScript,
    headScript,
  } = props;

  return (
    <Layout
      pageTitle={siteTitle}
      siteTitle={siteTitle}
      faviconPath={faviconPath}
      bodyScript={bodyScript}
      headScript={headScript}
    >
      <header class={"index-header"}>
        <h1 class={"index-title"}>
          {indexTitle}
        </h1>
        <h2 class={"index-subtitle"}>
          {indexSubtitle}
        </h2>
      </header>
      <form action="/?page=1" method="get">
        <input
          class="search-field"
          id="search-field"
          type="search"
          name="search"
          placeholder="Search for specific articles..."
          hx-get="/?page=1"
          hx-trigger="input changed delay:500ms, search"
          hx-target=".articles-list"
          value={props.search}
        />
      </form>
      <Articles
        posts={posts}
        search={props.search}
        page={props.page}
        itemsPerPage={props.itemsPerPage}
      />
      <script src="/loading_script.js"></script>
    </Layout>
  );
};
