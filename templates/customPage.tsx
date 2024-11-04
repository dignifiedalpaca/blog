/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";
import type { Article } from "../blog.ts";
import { scriptAddCodeCopyButton } from "./scripts.ts";

type CustomPageProps = {
  article: Article;
  siteTitle: string;
  url: string;
  locale?: string;
  bodyScript?: string;
  headScript?: string;
  favicon: boolean;
  faviconLink?: string;
  customPages?: { name: string; path: string; external: boolean }[];
};

export const CustomPage: FC<CustomPageProps> = (props: CustomPageProps) => {
  const {
    article,
    siteTitle,
    bodyScript,
    headScript,
    locale,
    url,
    favicon = false,
    faviconLink,
    customPages = [],
  } = props;

  return (
    <Layout
      pageTitle={article.title}
      siteTitle={siteTitle}
      bodyScript={bodyScript}
      headScript={headScript}
      url={url}
      locale={locale}
      description={article.metadata?.description}
      article={article}
      favicon={favicon}
      faviconLink={faviconLink}
      customPages={customPages}
    >
      {scriptAddCodeCopyButton}
      <header class={"article-header"}>
        <h1 class={"title"}>{article.title}</h1>
      </header>
      <article
        dangerouslySetInnerHTML={{ __html: article.html }}
        class="markdown-body"
      />
    </Layout>
  );
};
