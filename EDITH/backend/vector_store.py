import os
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any

try:
    from sentence_transformers import CrossEncoder
except Exception:
    CrossEncoder = None

# Use persistent client
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DATA_PATH = os.path.join(PROJECT_ROOT, "data", "chroma_db")

# Best-in-class embedding model for code
# Options: "BAAI/bge-base-en-v1.5" (general), "thenlper/gte-base" (fast), 
#          "jinaai/jina-embeddings-v2-base-code" (code-specific)
EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5"

# Cross-encoder reranker for precision
# This model scores query-document pairs for relevance
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

_reranker = None

def get_reranker():
    """Lazy-load the reranker model; return None if unavailable."""
    global _reranker
    if CrossEncoder is None:
        return None
    if _reranker is None:
        print("Loading reranker model...", flush=True)
        _reranker = CrossEncoder(RERANKER_MODEL, max_length=512)
    return _reranker

def get_db_client():
    return chromadb.PersistentClient(path=CHROMA_DATA_PATH)

def get_collection():
    client = get_db_client()

    # Prefer a lightweight default embedding function to avoid heavy torch deps in deployment.
    emb_fn = embedding_functions.DefaultEmbeddingFunction()
        
    return client.get_or_create_collection(
        name="edith_premium_v2",  # New collection for better embeddings
        embedding_function=emb_fn
    )

def add_documents(documents: List[Dict[str, Any]]):
    """
    Adds a list of document chunks to the ChromaDB collection.
    """
    if not documents:
        return
        
    collection = get_collection()
    
    ids = [d["id"] for d in documents]
    documents_content = [d["content"] for d in documents]
    metadatas = [d["metadata"] for d in documents]
    
    # Process in batches
    batch_size = 100  # Smaller batches for better model
    total_added = 0
    
    for i in range(0, len(ids), batch_size):
        end_idx = min(i + batch_size, len(ids))
        collection.upsert(
            ids=ids[i:end_idx],
            documents=documents_content[i:end_idx],
            metadatas=metadatas[i:end_idx]
        )
        total_added += (end_idx - i)
        print(f"Embedded batch {i//batch_size + 1}: {total_added}/{len(ids)} chunks", flush=True)

def query_documents(query_text: str, n_results: int = 5) -> Dict[str, Any]:
    """
    Queries the collection with semantic search + reranking.
    
    1. Retrieve more candidates (3x requested)
    2. Rerank with cross-encoder
    3. Return top n_results
    """
    collection = get_collection()
    
    # Step 1: Over-retrieve candidates
    candidates = collection.query(
        query_texts=[query_text],
        n_results=min(n_results * 3, 20)  # Get 3x candidates, max 20
    )
    
    if not candidates['documents'] or not candidates['documents'][0]:
        return {'documents': [[]], 'metadatas': [[]], 'ids': [[]]}
    
    docs = candidates['documents'][0]
    metas = candidates['metadatas'][0]
    ids = candidates['ids'][0]
    
    # Step 2: Rerank with cross-encoder (if available)
    reranker = get_reranker()

    if reranker is None:
        # Fallback: return top retrieval results without reranking.
        reranked_docs = docs[:n_results]
        reranked_metas = metas[:n_results]
        reranked_ids = ids[:n_results]
    else:
        # Create query-document pairs for scoring
        pairs = [(query_text, doc) for doc in docs]
        scores = reranker.predict(pairs)

        # Step 3: Sort by reranker score using indices (avoids comparing dicts)
        indexed_scores = list(enumerate(scores))
        indexed_scores.sort(key=lambda x: x[1], reverse=True)
        top_indices = [idx for idx, _ in indexed_scores[:n_results]]

        # Unpack results using sorted indices
        reranked_docs = [docs[i] for i in top_indices]
        reranked_metas = [metas[i] for i in top_indices]
        reranked_ids = [ids[i] for i in top_indices]

        print(f"Reranked {len(docs)} candidates -> top {len(reranked_docs)}", flush=True)
    
    return {
        'documents': [reranked_docs],
        'metadatas': [reranked_metas],
        'ids': [reranked_ids]
    }
