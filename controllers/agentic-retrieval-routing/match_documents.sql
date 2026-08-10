create or replace function match_documents(
        query_embedding vector(1536), -- embedding of the query
        match_threshold float,        -- minimum similarity score for a match
        filter jsonb DEFAULT '{}'::jsonb, -- optional metadata filter (documents.metadata @> filter)
        match_count int               -- maximum number of matches to return
)
returns table (
        id bigint,
        content text,
        metadata jsonb,
        similarity float
)
language sql stable
as $$
    select
        d.id,
        d.content,
        d.metadata,
        1 - (d.embedding <=> query_embedding) as similarity
    from documents d
    where 1 - (d.embedding <=> query_embedding) >= match_threshold
        and (filter = '{}'::jsonb or (d.metadata is not null and d.metadata @> filter))
    order by similarity desc
    limit coalesce(match_count, 10);
$$;