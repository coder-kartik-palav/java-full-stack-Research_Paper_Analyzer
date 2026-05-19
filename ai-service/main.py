import io
import re
import random
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2

# NLP Libraries
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
import yake
import textstat
import nltk

app = FastAPI(title="Research AI Microservice (Local NLP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCUMENT_CACHE = {}

def clean_text(text: str) -> str:
    # Remove excessive newlines and weird spacing
    text = re.sub(r'\n+', '\n', text)
    
    # Remove obvious journal citations like "A , 2018, 6, 7168."
    text = re.sub(r'\b[a-zA-Z\s]*,\s*\d{4}\s*,\s*\d+\s*,\s*\d+\.', '', text)
    
    # Filter out very short noisy lines
    lines = text.split('\n')
    clean_lines = []
    for line in lines:
        if len(line.strip()) < 15 and not re.match(r'^[A-Z]', line.strip()):
            continue
        clean_lines.append(line)
        
    text = " ".join(clean_lines)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def get_document_data(file_path: str):
    if file_path in DOCUMENT_CACHE:
        return DOCUMENT_CACHE[file_path]
    
    try:
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            full_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
        
        full_text = clean_text(full_text)
        sentences = nltk.sent_tokenize(full_text)
        
        # Extract topics
        kw_extractor = yake.KeywordExtractor(lan="en", n=2, dedupLim=0.9, top=15, features=None)
        keywords = kw_extractor.extract_keywords(full_text[:10000])
        bad_words = ["fig", "article", "access", "download", "published", "table", "et al", "http", "online", "license", "copyright"]
        topics = []
        for kw in keywords:
            topic = kw[0].title()
            if not any(bw in topic.lower() for bw in bad_words):
                topics.append(topic)
                if len(topics) >= 4:
                    break
        if not topics:
            topics = ["Research", "Analysis"]
            
        DOCUMENT_CACHE[file_path] = {
            "text": full_text,
            "sentences": sentences,
            "topics": topics
        }
        return DOCUMENT_CACHE[file_path]
    except Exception as e:
        print(f"Failed to read file {file_path}: {e}")
        return None

@app.post("/api/parse")
async def parse_paper(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # 1. Read PDF
    try:
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        full_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
        
        full_text = clean_text(full_text)
        if not full_text:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
            
        sentences = nltk.sent_tokenize(full_text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF reading failed: {str(e)}")

    # 2. Extract Topics using YAKE
    try:
        # Use first 10000 characters to avoid picking up footer noise across all pages
        summary_text = full_text[:10000]
        kw_extractor = yake.KeywordExtractor(lan="en", n=2, dedupLim=0.9, top=15, features=None)
        keywords = kw_extractor.extract_keywords(summary_text)
        
        bad_words = ["fig", "article", "access", "download", "published", "table", "et al", "http", "online", "license", "copyright"]
        topics = []
        for kw in keywords:
            topic = kw[0].title()
            if not any(bw in topic.lower() for bw in bad_words):
                topics.append(topic)
                if len(topics) >= 4:
                    break
        if not topics:
            topics = ["Research", "Analysis"]
    except Exception:
        topics = ["Research", "Analysis", "Science"]

    # 3. Summarization using Sumy (LexRank)
    try:
        # Summarize only the first 8000 characters to skip the heavily-cited sections/references
        parser = PlaintextParser.from_string(full_text[:8000], Tokenizer("english"))
        summarizer = LexRankSummarizer()
        
        # Short Summary (2 sentences)
        short_summary_sentences = summarizer(parser.document, 2)
        short_summary = " ".join([str(s) for s in short_summary_sentences])
        
        # Detailed Summary (5 sentences)
        detailed_summary_sentences = summarizer(parser.document, 5)
        detailed_summary = " ".join([str(s) for s in detailed_summary_sentences])
    except Exception:
        short_summary = "Summary generation failed."
        detailed_summary = "Detailed summary generation failed."

    # 4. Complexity using Textstat
    try:
        reading_level = textstat.text_standard(full_text[:5000], float_output=True)
        # Convert reading level to a 1-10 score (roughly mapping high school to college)
        complexity_score = min(10, max(1, int((reading_level - 5) / 1.5)))
        
        if reading_level > 14:
            reading_difficulty = "Advanced"
        elif reading_level > 10:
            reading_difficulty = "Intermediate"
        else:
            reading_difficulty = "Beginner"
    except Exception:
        complexity_score = 5
        reading_difficulty = "Unknown"

    # 5. Heuristics for Title/Abstract
    title = file.filename.replace('.pdf', '')
    
    # Very basic attempt to find abstract
    abstract_match = re.search(r'(?i)abstract[\s\n:-]+(.*?)(?:\n\n|\n[A-Z]|1\.\s+Introduction)', full_text, re.DOTALL)
    if abstract_match and len(abstract_match.group(1)) > 50:
        abstract = abstract_match.group(1).strip()[:1000] + "..."
    else:
        # Fallback to first few sentences
        abstract = " ".join(sentences[:4])

    return {
        "title": title,
        "authors": ["Extracted from Text"], # Hard to extract accurately without complex models
        "publicationYear": 2024,
        "abstract": abstract,
        "shortSummary": short_summary,
        "detailedSummary": detailed_summary,
        "topics": topics,
        "complexityScore": complexity_score,
        "readingDifficulty": reading_difficulty
    }

class ChatRequest(BaseModel):
    message: str
    paperId: int
    filePath: str = None

@app.post("/api/chat")
async def chat_with_paper(request: ChatRequest):
    if not request.filePath:
        return {"reply": "Error: Document path not provided."}
        
    doc_data = get_document_data(request.filePath)
    if not doc_data:
        return {"reply": "Could not read the document."}
        
    sentences = doc_data["sentences"]
    
    # Filter stopwords from query so "what paper says" doesn't match the word "paper"
    stop_words = {"what", "is", "the", "paper", "saying", "about", "does", "say", "can", "you", "tell", "me", "how"}
    query_words = [w.lower() for w in request.message.split() if w.lower() not in stop_words and len(w) > 2]
    
    if not query_words:
        return {"reply": "Can you be more specific about what you're looking for? E.g., 'What is the methodology?'"}
        
    best_sentences = []
    for sentence in sentences:
        # Calculate how many query words are in the sentence
        score = sum(1 for word in query_words if word in sentence.lower())
        if score > 0:
            best_sentences.append((score, sentence))
            
    best_sentences.sort(key=lambda x: x[0], reverse=True)
    
    if best_sentences:
        answer = best_sentences[0][1]
        responses = [
            f"Based on the text: {answer}",
            f"The paper mentions: {answer}",
            f"Here is what I found: {answer}"
        ]
        return {"reply": random.choice(responses)}
    else:
        return {"reply": "I couldn't find a direct answer to that in the text."}

@app.get("/api/flashcards/{paper_id}")
async def generate_flashcards(paper_id: int, filePath: str = None):
    if not filePath:
        return [{"front": "Error", "back": "Document path not provided."}]
        
    doc_data = get_document_data(filePath)
    if not doc_data:
        return [{"front": "Error", "back": "Could not read the document."}]
        
    sentences = doc_data["sentences"]
    topics = doc_data["topics"]
        
    flashcards = []
    for topic in topics[:3]:
        # Find a sentence containing the topic to use as the back of the flashcard
        for sentence in sentences:
            if topic.lower() in sentence.lower():
                flashcards.append({
                    "front": f"What does the paper say about '{topic}'?",
                    "back": sentence
                })
                break
                
    if not flashcards:
        flashcards = [
            {"front": "Key point", "back": sentences[0] if sentences else "No data."}
        ]
        
    return flashcards

class CompareRequest(BaseModel):
    paper1_title: str
    paper2_title: str

@app.post("/api/compare")
async def compare_papers(request: CompareRequest):
    return {
        "similarityScore": 50,
        "methodologyDifferences": f"Comparison between '{request.paper1_title}' and '{request.paper2_title}' requires full text analysis.",
        "resultsComparison": "N/A",
        "conclusion": "To compare accurately, both texts need to be evaluated simultaneously."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
