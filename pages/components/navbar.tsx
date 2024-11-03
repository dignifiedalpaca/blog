/** @jsxImportSource hono/jsx */

import type { FC } from "hono/jsx";
import RssIcon from "./rss.tsx";

export const Navbar: FC<{ title: string }> = (props: { title: string }) => {
  const customPages = [
    // {
    //   name: "About",
    //   path: "/about",
    // },
    // {
    //   name: "Contact",
    //   path: "/contact",
    // },
  ];

  return (
    <navbar
      hx-preserve="true"
      class={customPages.length > 0 ? "navbar-with-pages" : ""}
    >
      <a href="/" class="navbar-home" hx-boost="false">
        {props.title}
      </a>

      <input type="checkbox" id="menu-toggle" className="menu-toggle" />
      <label htmlFor="menu-toggle" className="hamburger">
        &#9776;
      </label>

      <ul class={"navbar-links"}>
        <li>
          <a href="/rss.xml" hx-boost="false">
            <RssIcon /> RSS
          </a>
        </li>
      </ul>
    </navbar>
  );
};
