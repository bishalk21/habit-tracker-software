create table documents (
    id bigserial primary key,
    content text, -- corresponds to the text chunk that was embedded
    embedding vector (1536) -- corresponds to the embedding of the text chunk or 1546 works for OpenAI's text-embedding-ada-002 model
)