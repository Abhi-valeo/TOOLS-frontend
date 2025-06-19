import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HakeemChat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { type: 'user', text: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // This would call the Hakeem API
      const response = await fetch('http://ec2-34-227-108-46.compute-1.amazonaws.com:9090/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          email: 'user@example.com'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { 
          type: 'bot', 
          text: data.response || 'Thank you for your message. I am Hakeem, your AI health assistant.', 
          timestamp: new Date() 
        };
        setChatHistory(prev => [...prev, botMessage]);
      } else {
        const botMessage = { 
          type: 'bot', 
          text: 'I apologize, but I am currently experiencing technical difficulties. Please try again later.', 
          timestamp: new Date() 
        };
        setChatHistory(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const botMessage = { 
        type: 'bot', 
        text: 'I apologize, but I am currently experiencing technical difficulties. Please try again later.', 
        timestamp: new Date() 
      };
      setChatHistory(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="container fade-in">
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              marginRight: '1rem',
              color: 'var(--primary-color)'
            }}
          >
            ←
          </button>
          <h1 className="page-title">Hakeem AI Health Assistant</h1>
        </div>

        <div style={{ 
          height: '400px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '1rem',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9'
        }}>
          {chatHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
              <p>Welcome to Hakeem! I'm your AI health assistant.</p>
              <p>Ask me anything about your health and wellness.</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem',
                textAlign: chat.type === 'user' ? 'right' : 'left'
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  borderRadius: '15px',
                  maxWidth: '70%',
                  backgroundColor: chat.type === 'user' ? 'var(--primary-color)' : '#fff',
                  color: chat.type === 'user' ? '#fff' : '#333',
                  border: chat.type === 'bot' ? '1px solid #ddd' : 'none'
                }}>
                  {chat.text}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  marginTop: '0.25rem',
                  textAlign: chat.type === 'user' ? 'right' : 'left'
                }}>
                  {chat.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '15px',
                backgroundColor: '#fff',
                border: '1px solid #ddd'
              }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Hakeem is typing...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Hakeem about your health..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default HakeemChat; 