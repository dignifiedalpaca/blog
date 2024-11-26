/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import type { Article } from "../../blog.ts";
import { MetadataComponent } from "./metadata.tsx";

export const Articles: FC<{
  posts: Article[];
  search: string;
  page: number;
  itemsPerPage: number;
}> = (props: {
  posts: Article[];
  search: string;
  page: number;
  itemsPerPage: number;
}) => {
  const posts = props.posts;
  const page = props.page;
  const itemsPerPage = props.itemsPerPage;

  const nb_posts = posts.length;
  const lowerBound = (page - 1) * itemsPerPage;
  const upperBound = page * itemsPerPage;

  const selectedArticles = posts.slice(lowerBound, upperBound);

  return (
    <div class={"articles-list"}>
      {selectedArticles.map((post, i) => {
        return (
          <div class={"article-element fade-in"}>
            <a href={post.url} class={"animated-article"}>
              <div>
                <h2 class={"article-title"}>{post.title}</h2>
                <MetadataComponent article={post} />
                <div
                  class={"article-preview"}
                  dangerouslySetInnerHTML={{ __html: post.preview }}
                />
              </div>
            </a>
            {post.metadata.tags && (
              <span class={"tags"}>
                <span class={"tags-label"}>Tags:</span>
                {post.metadata.tags.map((tag) => {
                  return (
                    <a href={`/?search=tag::${tag}`} class={"animated-anchor"}>
                      <span class={"tag"}>{tag}</span>
                    </a>
                  );
                })}
              </span>
            )}
            {i < itemsPerPage - 1 && i !== posts.length - lowerBound - 1 && (
              <hr />
            )}
          </div>
        );
      })}
      {nb_posts === 0 && props.search && (
        <div class="no-articles">
          No results
        </div>
      )}

      {nb_posts > itemsPerPage && (
        <nav class="pagination">
          {page > 1 && (
            <a
              href={`/?page=${page - 1}&search=${props.search}`}
              class="pagination-previous animated-anchor"
            >
              Previous
            </a>
          )}
          {upperBound < nb_posts && (
            <a
              href={`/?page=${page + 1}&search=${props.search}`}
              class="pagination-next animated-anchor"
            >
              Next
            </a>
          )}
        </nav>
      )}
    </div>
  );
};
