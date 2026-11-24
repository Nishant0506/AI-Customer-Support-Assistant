# Customer Support AI Backend

FastAPI backend for customer-support simulation, analysis, knowledge retrieval, document ingestion, reports, and analytics.

## Windows quick start

Run these commands in PowerShell from the project root:

```powershell
cd C:\Users\KIIT0001\Desktop\AI-Customer-Support\backend
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If Python 3.14 is unavailable, create the environment with an installed Python version supported by the pinned packages:

```powershell
py -m venv .venv
```

Keep the terminal running. Verify:

- API root: http://127.0.0.1:8000/
- Health: http://127.0.0.1:8000/health
- Swagger: http://127.0.0.1:8000/docs

`HF_TOKEN` is optional for server startup. With no token, sentiment analysis and post-interaction reporting use their local fallback logic; Simulator uses its fallback generator. The RAG chat endpoint requires the token for a generated answer and returns its existing service-unavailable fallback message without one. Add a valid Hugging Face token to `backend/.env` to enable LLM-generated responses. Never commit `.env`.

The embedding model is downloaded from Hugging Face on first use of upload or knowledge-recommendation endpoints. That first request requires network access and can take longer than subsequent requests.

## Index sample knowledge documents

With the backend environment installed, run once from `backend/`:

```powershell
.\.venv\Scripts\python.exe ingest_knowledge_corpus.py
```

This indexes the supported sample PDF, Markdown, and text files under `data/sample_documents/` into the local ChromaDB store.

## Run tests

```powershell
.\.venv\Scripts\python.exe -m pytest tests -v
```

Some simulator/evaluation tests invoke the Hugging Face inference service when `HF_TOKEN` is configured. Without a token they use the local simulator/analyzer fallbacks where available.

## Optional Streamlit demo

Start the API in one terminal, then from the repository root in another:

```powershell
cd C:\Users\KIIT0001\Desktop\AI-Customer-Support
.\backend\.venv\Scripts\python.exe -m streamlit run demo\streamlit_app.py --server.address 127.0.0.1 --server.port 8501
```

Open http://127.0.0.1:8501/.
