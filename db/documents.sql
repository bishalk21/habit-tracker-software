create table documents (
    id bigserial primary key,
    content text, -- corresponds to the text chunk that was embedded
    embedding vector (1536) -- corresponds to the embedding of the text chunk or 1546 works for OpenAI's text-embedding-ada-002 model
)

create
or
replace
    function match_documents (
        query_embedding vector (1536), -- corresponds to the embedding of the query
        match_threshold float, -- corresponds to the minimum similarity score for a match
        match_count int -- corresponds to the maximum number of matches to return  
    )
returns table (
    id bigint,
    content text,
    similarity float
)
language sql stable 
as $$ 
  select 
    documents.id,
    documents.content, 
    1 - (documents.embedding <=> query_embedding) as similarity
    from documents
    where 1 - (documents.embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_Count;
$$;