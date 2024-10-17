import { FC } from "hono/jsx";
import RssIcon from "jsr:@bureaudouble/icons/lucide/RssIcon";

export const Navbar: FC<{ title: string }> = (props: { title: string }) => {
    return (
        <navbar>
            <a href="/" class="navbar-home" hx-boost="false">
                <strong>{props.title}</strong>
            </a>

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
