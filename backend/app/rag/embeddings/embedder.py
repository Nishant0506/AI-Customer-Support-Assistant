from functools import lru_cache
from sentence_transformers import SentenceTransformer
from app.core.config import settings


@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_texts(texts):
    model = get_model()
    return model.encode(texts, normalize_embeddings=True).tolist()


def embed_query(query: str):
    return embed_texts([query])[0]
