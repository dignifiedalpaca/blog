import type { FC } from "hono/jsx";
import { CSS } from "jsr:@deno/gfm";
import { Navbar } from "./navbar.tsx";

export const Layout: FC = (
    props,
) => {
    const {
        children,
        pageTitle,
        siteTitle,
        faviconPath,
        bodyScript,
        headScript,
    } = props;

    return (
        <html lang="en">
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta charset="UTF-8" />
                <style>{CSS}</style>
                <link rel="preload stylesheet" as="style" href="/style.css" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
                    rel="preload stylesheet"
                    as="style"
                >
                </link>
                <noscript>
                    <style>{".js-only { display: none }"}</style>
                </noscript>
                <script src="https://unpkg.com/htmx.org@2.0.3" />
                <title>{pageTitle}</title>
                <link rel="icon" type="image/x-icon" href={faviconPath} />
                {headScript}
            </head>
            <body
                data-color-mode="dark"
                data-light-theme="light"
                data-dark-theme="dark"
                hx-boost="true"
                style="background-color: #27293C; color: #BFC7D5;"
            >
                {bodyScript}
                <Navbar title={siteTitle} />
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
};
