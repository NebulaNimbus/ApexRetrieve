import os
from langchain_community.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaLLM
from langchain.chains import RetrievalQA, ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

load_dotenv()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
LLM_MODEL = os.getenv("LLM_MODEL")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")

def load_and_chunk_documents(directory):
    loader = DirectoryLoader(directory)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    return chunks

def create_vector_store(chunks):
    embeddings = OllamaEmbeddings(base_url=OLLAMA_BASE_URL, model=EMBEDDING_MODEL)
    vector_store = Chroma.from_documents(chunks, embeddings)
    return vector_store

def create_rag_chain(vector_store):
    llm = OllamaLLM(base_url=OLLAMA_BASE_URL, model=LLM_MODEL)
    retriever = vector_store.as_retriever()
    qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)
    return qa_chain

def create_conversational_rag_chain(vector_store):
    llm = OllamaLLM(base_url=OLLAMA_BASE_URL, model=LLM_MODEL)
    retriever = vector_store.as_retriever()
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    qa_chain = ConversationalRetrievalChain.from_llm(llm, retriever, memory=memory)
    return qa_chain

app = Flask(__name__)
CORS(app)

# Global variables
rag_chain = None
conversational_rag_chain = None
current_question = None


@app.route('/query', methods=['POST'])
def handle_query():
    """Handles conversational queries."""
    global conversational_rag_chain  # Use the conversational chain
    data = request.get_json()
    question = data.get('question')
    history = data.get('history', [])  # Get the conversation history from the request

    if not question:
        return jsonify({"error": "Missing question"}), 400

    try:
        # Pass the question and history to the conversational RAG chain
        result = conversational_rag_chain.run({"question": question, "chat_history": history})
        return jsonify({"answer": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route('/stream_query', methods=['POST'])
# def post_question():
#     """Handles posting a question for streaming."""
#     global current_question
#     data = request.get_json()
#     current_question = data.get('question')
#     if not current_question:
#         return jsonify({"error": "Missing question"}), 400
#     return jsonify({"message": "Question received"}), 200

# @app.route('/stream_query', methods=['GET'])
# def stream_response():
#     """Streams the response for the current question."""
#     def generate():
#         global current_question
#         if not current_question:
#             yield 'data: ERROR: No question provided\n\n'
#         else:
#             try:
#                 answer = conversational_rag_chain.run({"question": current_question})
#                 if isinstance(answer, dict) and "answer" in answer:
#                     yield f'data: {answer["answer"]}\n\n'
#                 else:
#                     yield f'data: {answer}\n\n'
#                 yield 'data: DONE\n\n'
#             except Exception as e:
#                 yield f'data: ERROR: {str(e)}\n\n'
#     return Response(generate(), mimetype='text/event-stream')


if __name__ == '__main__':
    document_directory = "./documents"
    chunks = load_and_chunk_documents(document_directory)
    vector_store = create_vector_store(chunks)
    rag_chain = create_rag_chain(vector_store)
    conversational_rag_chain = create_conversational_rag_chain(vector_store)
    app.run(debug=True, host="0.0.0.0", port=6050)