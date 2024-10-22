import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";
import type { Article } from "../blog.ts";
import { MetadataComponent } from "./components/metadata.tsx";

export const ArticlePage: FC<
  {
    article: Article;
    siteTitle: string;
    faviconPath: string;
    bodyScript?: string;
    headScript?: string;
  }
> = (
  props: {
    article: Article;
    siteTitle: string;
    faviconPath: string;
    bodyScript?: string;
    headScript?: string;
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
        <MetadataComponent article={article} />
      </header>
      <article
        dangerouslySetInnerHTML={{ __html: article.html }}
        class="markdown-body"
      />
    </Layout>
  );
};
