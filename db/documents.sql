create table documents (
    id bigserial primary key,
    content text, -- corresponds to the text chunk that was embedded
    embedding vector (1536) -- corresponds to the embedding of the text chunk or 1546 works for OpenAI's text-embedding-ada-002 model
)

-- match_documents function is used to find the most similar documents to a given query embedding
create
or
replace
    function match_documents (
        query_embedding vector (1536), -- corresponds to the embedding of the query
        match_threshold float, -- corresponds to the minimum similarity score for a match
        match_count int -- corresponds to the maximum number of matches to return  
    ) returns
table (
    id bigint,
    content text,
    similarity float
) language sql stable as $$
select documents.id, documents.content, 1 - (
        documents.embedding <=> query_embedding
    ) as similarity
from documents
where
    1 - (
        documents.embedding <=> query_embedding
    ) > match_threshold
order by similarity desc
limit match_Count;

$$;

-- table for movies
-- Oppenheimer: 2023 | R | 3h | 8.6 rating
-- 'Oppenheimer' is an epic biographical drama film about the story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb. In World War II, Lt. Gen. Leslie Groves Jr. appoints physicist J. Robert Oppenheimer to lead the top-secret Manhattan Project. Oppenheimer and his team of scientists spend years into developing and designing the atomic bomb. Their efforts culminated on July 16, 1945, when they witness the first nuclear explosion ever, which forever altered the course of history. Christopher Nolan directed Oppenheimer, and stars Cillian Murphy, Emily Blunt, Robert Downey Jr. and Matt Damon.
create table movies (
    id bigserial primary key,
    content text, -- corresponds to the text chunk that was embedded
    embedding vector (1536), -- corresponds to the embedding of the text chunk or 1546 works for OpenAI's text-embedding-ada-002 model)
)

create
or
replace
    function match_movies (
        query_embedding vector (1536), -- corresponds to the embedding of the query
        match_threshold float, -- corresponds to the minimum similarity score for a match
        match_count int -- corresponds to the maximum number of matches to return
    ) returns
table (
    id bigint,
    content text,
    similarity float
) language sql stable as $$
select movies.id, movies.content, 1 - (
        movies.embedding <=> query_embedding
    ) as similarity
from movies
where
    1 - (
        movies.embedding <=> query_embedding
    ) > match_threshold
order by similarity desc
limit match_Count;
$$;