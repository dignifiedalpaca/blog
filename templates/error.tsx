/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import { Layout } from "./components/layout.tsx";

type ErrorProps = {
  errorNumber: number;
  errorMessage: string;
  siteTitle: string;
  url: string;
  locale?: string;
  bodyScript?: string;
  headScript?: string;
  favicon: boolean;
  faviconLink?: string;
  customPages?: { name: string; path: string; external: boolean }[];
};

export const ErrorPage: FC<ErrorProps> = (props: ErrorProps) => {
  const {
    errorNumber,
    errorMessage,
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
      pageTitle={`Error ${errorNumber}`}
      siteTitle={siteTitle}
      bodyScript={bodyScript}
      headScript={headScript}
      url={url}
      locale={locale}
      description="An error occured"
      favicon={favicon}
      faviconLink={faviconLink}
      customPages={customPages}
    >
      <header className="article-header">
        <h1 class="title">Error {errorNumber}</h1>
      </header>
      <article className="markdown-body">
        <h3>{errorMessage}</h3>
      </article>
    </Layout>
  );
};
