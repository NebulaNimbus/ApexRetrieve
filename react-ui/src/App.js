import React, { useState } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  // const [streamedAnswer, setStreamedAnswer] = useState('');
  const [streamedAnswer, setStreamedAnswer] = useState([]); // Initialize as an empty array
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]); // Store conversation history

  const getAnswer = async () => {
    console.log("getAnswer called");
    setIsLoading(true);
    setStreamedAnswer([]); // Reset the streamed answer
  
    const apiUrl = process.env.REACT_APP_RAG_API_URL || 'http://localhost:6050/query'; // Use the /query endpoint
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question, history: conversation }), // Send the question and conversation history
      });
  
      if (!response.ok) {
        console.error('Failed to submit question:', response.statusText);
        setIsLoading(false);
        return;
      }
  
      const data = await response.json(); // Parse the JSON response
      if (data.error) {
        console.error('Error from server:', data.error);
        setStreamedAnswer([`Error: ${data.error}`]); // Display the error message
      } else {
        console.log('Answer received:', data.answer);
        setStreamedAnswer([data.answer]); // Set the answer in the state
  
        // Update the conversation history
        setConversation((prevConversation) => [
          ...prevConversation,
          { question: question, answer: data.answer },
        ]);
        // setConversation((prevConversation) => [
        //   { question: question, answer: data.answer },
        //   ...prevConversation,
        // ]);
      }
    } catch (error) {
      console.error('Error in getAnswer:', error);
      setStreamedAnswer([`Error: ${error.message}`]); // Display the error message
    } finally {
      setIsLoading(false); // Stop the loading indicator
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the page reload
      getAnswer();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundImage: 'url("/background.jpeg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'blur(5px)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      ></div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          boxSizing: 'border-box',
          minHeight: '100vh',
          width: '100vw',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#392313',
            fontFamily: 'Papyrus, fantasy',
            fontSize: '2.5em',
          }}
        >
          Apex Retrieve
        </h1>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question"
            style={{
              width: '80%',
              maxWidth: '800px',
              marginBottom: '10px',
              fontFamily: 'Arial Unicode MS, sans-serif',
              backgroundColor: '#5A5B5B',
              color: '#FBF9F9',
              padding: '12px 10px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1em',
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            style={{
              width: '80%',
              maxWidth: '130px',
              marginBottom: '10px',
              fontFamily: 'Arial Unicode MS, sans-serif',
              backgroundColor: '#3B3638',
              color: '#F9F7F7',
              padding: '5px 5px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1em',
            }}
            onClick={getAnswer}
          >
            Get Answer
          </button>
        </div>
        {isLoading && <div className="loading-bar"></div>}
        <div
          style={{
            color: '#3B3B46',
            whiteSpace: 'pre-wrap',
            width: '80%',
            maxWidth: '1200px',
            marginTop: '20px',
            fontFamily: 'American Typewriter, monospace',
            fontSize: '1.2em',
            lineHeight: '1.5',
          }}
        >
          {conversation.map((entry, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <p><strong>Q:</strong> {entry.question}</p>
              <p><strong>A:</strong> {entry.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// {streamedAnswer.map((line, index) => (
//   <p key={index}>{line}</p>
// ))}

export default App;