import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";
import { Article } from "../blog.ts";
import { MetadataComponent } from "./components/metadata.tsx";
import type { HtmlEscapedString } from "hono/utils";

export const ArticlePage: FC<
  {
    article: Article;
    siteTitle: string;
    faviconPath: string;
    bodyScript?: HtmlEscapedString;
    headScript?: HtmlEscapedString;
  }
> = (
  props: {
    article: Article;
    siteTitle: string;
    faviconPath: string;
    bodyScript?: HtmlEscapedString;
    headScript?: HtmlEscapedString;
  },
) => {
  const { article, siteTitle, faviconPath, bodyScript, headScript } = props;

  return (
    <Layout
      pageTitle={article.title}
      siteTitle={siteTitle}
      faviconPath={faviconPath}
      bodyScript={bodyScript}
      headScript={headScript}
    >
      <header class={"article-header"}>
        <h1 class={"title"}>{article.title}</h1>
        <MetadataComponent metadata={article.metadata} />
      </header>
      <article
        dangerouslySetInnerHTML={{ __html: article.html }}
        class="markdown-body"
      />
    </Layout>
  );
};
