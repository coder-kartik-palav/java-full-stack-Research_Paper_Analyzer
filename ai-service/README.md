# Research AI Microservice (Local NLP)

This is the Python-based AI microservice for the Research Platform. It runs locally using FastAPI and lightweight NLP libraries (`sumy`, `yake`, `textstat`, `nltk`) to parse papers, generate summaries, extract topics, measure reading complexity, and power a local document Q&A/flashcard generation experience.

---

## 🚀 How to Run the AI Service (Command Prompt / CMD)

Follow these steps to run the service manually using the standard Windows Command Prompt (`cmd.exe`):

### Step 1: Navigate to the `ai-service` Directory
Open your Command Prompt and navigate to the project directory:
```cmd
cd ai-service
```

### Step 2: Activate the Python Virtual Environment
Activate the pre-configured virtual environment:
```cmd
venv\Scripts\activate.bat
```

### Step 3: Start the Server
Run the application using Python:
```cmd
python main.py
```
Alternatively, you can run it directly with `uvicorn`:
```cmd
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Once started, you will see output like this:
```text
INFO:     Started server process [22416]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 🔍 How to Verify the Service is Running

You can verify that the service is running and healthy using any of the following methods:

### 1. Interactive Swagger API Documentation
Open your browser and navigate to:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

This is an interactive OpenAPI / Swagger UI where you can view all available API endpoints and test them directly from the browser!

### 2. Check Service Health via Command Prompt (CMD)
Run this command to test the endpoint:
```cmd
curl http://localhost:8000/docs
```
If the service is up, it will return the HTML documentation page content successfully in the terminal.

---

## 🛠️ Main API Endpoints

The AI service exposes the following main endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/parse` | `POST` | Parses a uploaded PDF, cleans the text, extracts key topics, and returns summaries. |
| `/api/chat` | `POST` | Processes user questions about a specific PDF and returns contextual answers. |
| `/api/flashcards/{paper_id}` | `GET` | Generates interactive learning flashcards based on key terms from the paper. |
| `/api/compare` | `POST` | Provides a comparison structure between two papers. |

---

## 💡 Troubleshooting

> [!TIP]
> **Missing Dependencies?**  
> If Python complains about missing packages, ensure you are inside the activated virtual environment, then install them:
> ```cmd
> pip install fastapi uvicorn pydantic PyPDF2 sumy yake textstat nltk
> ```

> [!IMPORTANT]
> **NLTK Tokenizer Error**  
> The LexRank summarizer and sentence tokenizers rely on NLTK data. If you see an NLTK error at runtime, activate your venv and run:
> ```cmd
> python -c "import nltk; nltk.download('punkt')"
> ```
