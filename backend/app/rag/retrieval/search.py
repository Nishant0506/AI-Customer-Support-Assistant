from app.rag.embeddings.embedder import embed_query
from app.rag.vectorstore.chroma_store import search as vector_search


def semantic_search(query: str, top_k: int = 5):
    embedding = embed_query(query)
    return vector_search(embedding, top_k)
