# AI Customer Support Coaching & Knowledge System

A full-stack enterprise-grade AI customer support coaching platform featuring multi-agent customer simulation, real-time sentiment analysis, RAG knowledge retrieval, and post-interaction evaluation.

---

## 🏛️ Project Architecture

```text
Customer-Support-System/
├── backend/                 # FastAPI REST API, AI Agents, RAG Pipeline, ChromaDB
│   ├── app/                 # Clean modular backend application
│   ├── data/                # ChromaDB vector store, SQLite DB, sample docs, uploads
│   ├── tests/               # Pytest & Unittest suites
│   ├── Dockerfile           # Backend container build
│   ├── requirements.txt     # Python dependencies
│   ├── ingest_knowledge_corpus.py # Knowledge base indexing script
│   └── evaluate_agents.py   # Benchmark & evaluation suite
│
├── frontend/                # Modern React 18 SPA (Vite + Tailwind CSS + Lucide)
│   ├── src/                 # React components (Console, RAG Chat, Evaluation, Analytics, Ingestion)
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
│
├── demo/                    # Legacy Streamlit demonstration interface
├── docker-compose.yml       # Multi-container orchestration
└── README.md                # Project overview and setup guide
```

---

## 🚀 Getting Started

### 1. Backend Setup & Run

Navigate to the `backend/` directory:
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Re-index sample documents into vectorstore
python ingest_knowledge_corpus.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup & Run

In a separate terminal, navigate to the `frontend/` directory:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
- Modern React App: `http://localhost:5173`

---

## 🌟 Key Capabilities

1. **Live Coaching Console**:
   - **🤖 Simulator Mode**: LLM persona generation with dynamic impatience & emotional drift.
   - **✍️ Manual Mode**: Dual-speaker live testing with real-time intent/sentiment and knowledge cards.
   - **⏪ Replay Mode**: Step-by-step turn replay for QA auditing with transcript uploads.
   - **Configurable Escalation Sensitivity**: Banner warnings for medium/high/critical escalation risk.

2. **RAG Knowledge Base & Chat**:
   - Page-by-page document extraction (PDF, Markdown, TXT) with PyMuPDF.
   - Overlapping semantic chunking, normalized embeddings with Sentence Transformers.
   - Vector persistence in ChromaDB with confidence scores and source citations.

3. **Post-Interaction QA Reports**:
   - Resolution scorecards, customer satisfaction metrics, tone & empathy ratings, and action item extraction.

4. **Performance Analytics Dashboard**:
   - Average handling time (AHT), first-contact resolution (FCR), escalation rates, sentiment trends.

---

## 🧪 Testing

```bash
cd backend
python tests/test_intent_sentiment.py
python tests/test_simulator.py
pytest tests/ -v
```
