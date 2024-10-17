import type { FC } from "hono/jsx";
import { Metadata } from "../../blog.ts";

interface MetadataProps {
    metadata?: Metadata;
}

export const MetadataComponent: FC = (props: MetadataProps) => {
    const metadata = props.metadata;
    if (!metadata) {
        return null;
    }
    return (
        <div class={"metadata"}>
            {metadata.authors &&
                (
                    <span class={"non-tag-metadata"}>
                        Authored by {metadata.authors?.join(", ")}
                    </span>
                )}
            {metadata.date &&
                (
                    <span class={"non-tag-metadata"}>
                        {metadata.date?.toDateString()}
                    </span>
                )}
            {metadata.tags && (
                <span class={"tags"}>
                    {metadata.tags.map((tag) => (
                        <span class={"tag"}>#{tag}</span>
                    ))}
                </span>
            )}
        </div>
    );
};
