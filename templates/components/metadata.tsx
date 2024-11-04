/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import type { Article } from "../../blog.ts";

interface MetadataProps {
  article?: Article;
  withAnchors?: boolean;
}

export const MetadataComponent: FC = (props: MetadataProps) => {
  const { article, withAnchors = false } = props;
  if (!article) return null;
  const { metadata } = article;

  return (
    <div class={"metadata"}>
      {metadata.authors && (
        <span class={"non-tag-metadata"}>
          Authored by {metadata.authors?.join(", ")}
        </span>
      )}
      {metadata.date && (
        <span class={"non-tag-metadata"}>{metadata.date?.toDateString()}</span>
      )}
      {article.timeToReadMinutes && (
        <span class={"non-tag-metadata"}>
          {article.timeToReadMinutes} min read
        </span>
      )}
      {metadata.tags && (
        <span class={"tags"}>
          {metadata.tags.map((tag) => {
            return (
              (!withAnchors && <span class={"tag"}>{tag}</span>) || (
                <a href={`/?search=tag::${tag}`} class={"animated-anchor"}>
                  <span class={"tag"}>{tag}</span>
                </a>
              )
            );
          })}
        </span>
      )}
    </div>
  );
};
