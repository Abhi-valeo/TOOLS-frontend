import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [fade, setFade] = useState('');
  const [bot, setBot] = useState('');
  const [showKareemTooltip, setShowKareemTooltip] = useState(false);
  const [showKareemForm, setShowKareemForm] = useState(false);
  const [kareemCountry, setKareemCountry] = useState('');
  const [kareemName, setKareemName] = useState('');
  const [kareemCity, setKareemCity] = useState('');
  const [showHealthbotTooltip, setShowHealthbotTooltip] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim() === '' || !emailInput.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setFade('fade-out');
    setTimeout(() => {
      setEmail(emailInput.trim());
      setError('');
      setFade('fade-in');
      setTimeout(() => setFade(''), 600);
    }, 400);
  };

  const handleBotSelect = (selectedBot) => {
    setBot(selectedBot);
    setShowChat(true);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = { sender: 'user', text: chatInput, timestamp: getCurrentTime() };
    setChatHistory([...chatHistory, userMessage]);
    setChatInput('');
    setLoading(true);
    setError('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      let apiUrl = '';
      if (bot === 'CS_BOT') {
        apiUrl = `/api/chat/CS_BOT?prompt=${encodeURIComponent(chatInput)}&email=${encodeURIComponent(email)}`;
      } else if (bot === 'KAREEM') {
        apiUrl = `/api/chat/kareem_session?prompt=${encodeURIComponent(chatInput)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(kareemName)}&city=${encodeURIComponent(kareemCity)}&country=${encodeURIComponent(kareemCountry)}`;
      } else {
        apiUrl = `/api/chat?prompt=${encodeURIComponent(chatInput)}&email=${encodeURIComponent(email)}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', text: (data.responses && data.responses[1]) || 'No response', timestamp: getCurrentTime() }
      ]);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to get response.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStreamingResponse = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMessage = { sender: 'user', text: chatInput, timestamp: getCurrentTime() };
    setChatHistory([...chatHistory, userMessage]);
    setChatInput('');
    setLoading(true);
    setError('');
    setIsStreaming(true);
    setStreamingResponse('');

    let finalResponse = '';

    try {
      const eventSource = new EventSource(`http://localhost:9090/stream?prompt=${encodeURIComponent(chatInput)}&email=${encodeURIComponent(email)}`);
      
      eventSource.onmessage = (event) => {
        // Simply append the chunk as it comes - backend handles all formatting
        finalResponse += event.data;
        setStreamingResponse(finalResponse);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        if (finalResponse) {
          setChatHistory(prev => [
            ...prev,
            { sender: 'bot', text: finalResponse, timestamp: getCurrentTime() }
          ]);
        }
        setError('Connection closed.');
        setLoading(false);
        setIsStreaming(false);
        setStreamingResponse('');
      };

      // Handle normal completion
      eventSource.addEventListener('complete', () => {
        setChatHistory(prev => [
          ...prev,
          { sender: 'bot', text: finalResponse, timestamp: getCurrentTime() }
        ]);
        eventSource.close();
        setLoading(false);
        setIsStreaming(false);
        setStreamingResponse('');
      });

    } catch (err) {
      console.error('Streaming error:', err);
      setError('Failed to get streaming response.');
      setLoading(false);
      setIsStreaming(false);
      setStreamingResponse('');
    }
  };

  const linkify = (text) => {
    const urlRegex = /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
    return text.replace(urlRegex, (url) => {
      const href = url.startsWith('http') ? url : `https://${url}`;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  };

  useEffect(() => {
    if (showKareemForm && kareemCountry) {
      setCityLoading(true);
      setKareemCity('');
      fetch(`http://localhost:9090/getCity?country=${encodeURIComponent(kareemCountry)}`)
        .then(res => res.json())
        .then(data => {
          setCityOptions(Array.isArray(data) ? data : []);
          setCityLoading(false);
        })
        .catch(() => {
          setCityOptions([]);
          setCityLoading(false);
        });
    } else if (showKareemForm) {
      setCityOptions([]);
      setKareemCity('');
    }
  }, [kareemCountry, showKareemForm]);

  if (!email && !showChat) {
    return (
      <div className={`App ${fade}`} style={{ 
        background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff4500 100%)',
        minHeight: '100vh',
        fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div className="header" style={{ 
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>Valeo Wellbeing</div>
        <form className="email-form" onSubmit={handleEmailSubmit} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: '#333'
          }}>WELCOME TO VALEO CHATBOT</h2>
          <input
            type="email"
            placeholder="Enter your email to start"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            required
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '1rem'
            }}
          />
          <button type="submit" style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500
          }}>Start Chat</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    );
  }

  if (email && !bot && !showChat && !showKareemForm) {
    return (
      <div className={`App ${fade}`} style={{ 
        background: 'linear-gradient(135deg, #FFB347 0%, #FFCC33 50%, #FF9966 100%)',
        minHeight: '100vh',
        fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div className="header" style={{ 
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>Valeo Wellbeing</div>
        <div className="bot-select" style={{ 
          textAlign: 'center', 
          marginTop: '50px', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <h2 style={{ 
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: '#fff',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '2rem',
            marginBottom: '1rem'
          }}>Select a Bot</h2>
          <div style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              className="bot-btn hakeem-bot"
              onClick={() => handleBotSelect('HEALTHBOT')}
              style={{ 
                padding: '1.5rem 3rem',
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '200px',
                transform: 'translateY(0)',
                ':hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(76, 175, 80, 0.3)'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.3)';
                setShowHealthbotTooltip(true);
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 32px rgba(76, 175, 80, 0.2)';
                setShowHealthbotTooltip(false);
              }}
            >
              <span style={{ fontWeight: 600 }}>Hakeem</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>AI Health Assistant</span>
            </button>
            <button
              className="bot-btn testing-bot"
              onClick={() => setShowKareemForm(true)}
              style={{ 
                padding: '1.5rem 3rem',
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(33, 150, 243, 0.2)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '200px',
                transform: 'translateY(0)',
                ':hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.3)'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 12px 40px rgba(33, 150, 243, 0.3)';
                setShowKareemTooltip(true);
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 32px rgba(33, 150, 243, 0.2)';
                setShowKareemTooltip(false);
              }}
            >
              <span style={{ fontWeight: 600 }}>Testing</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>Session Context</span>
            </button>
          </div>
          {showKareemTooltip && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '1rem',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              marginTop: '1rem',
              maxWidth: '300px',
              textAlign: 'center',
              zIndex: 1000
            }}>
              <p style={{ margin: 0, color: '#333', fontSize: '0.9rem' }}>
                Chat with session context and personalized responses.
              </p>
            </div>
          )}
          {showHealthbotTooltip && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '1rem',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              marginTop: '1rem',
              maxWidth: '300px',
              textAlign: 'center',
              zIndex: 1000
            }}>
              <p style={{ margin: 0, color: '#333', fontSize: '0.9rem' }}>
                Hakeem is your AI health assistant, ready to help with your wellness journey.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showKareemForm) {
    return (
      <div className={`App ${fade}`} style={{ 
        background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff4500 100%)',
        minHeight: '100vh',
        fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div className="header" style={{ 
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>Testing Session</div>
        <form className="email-form" style={{ 
          maxWidth: 420, 
          margin: '40px auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }} onSubmit={e => {
          e.preventDefault();
          setBot('KAREEM');
          setShowKareemForm(false);
          setShowChat(true);
        }}>
          <h2 style={{ 
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: '#333'
          }}>Enter Your Details</h2>
          <select
            value={kareemCountry}
            onChange={e => setKareemCountry(e.target.value)}
            required
            style={{ 
              padding: '1rem 1.2rem', 
              border: '1px solid #ffe082', 
              borderRadius: '8px', 
              marginBottom: '1.2rem', 
              width: '100%', 
              fontSize: '1.1rem', 
              background: '#fffde7',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <option value="" disabled>Select Country</option>
            <option value="UAE">UAE</option>
            <option value="KSA">KSA</option>
          </select>
          <input
            type="text"
            placeholder="Name"
            value={kareemName}
            onChange={e => setKareemName(e.target.value)}
            required
            style={{
              fontFamily: "'Inter', sans-serif"
            }}
          />
          <select
            value={kareemCity}
            onChange={e => setKareemCity(e.target.value)}
            required
            disabled={!kareemCountry || cityLoading || cityOptions.length === 0}
            style={{ 
              padding: '1rem 1.2rem', 
              border: '1px solid #ffe082', 
              borderRadius: '8px', 
              marginBottom: '1.2rem', 
              width: '100%', 
              fontSize: '1.1rem', 
              background: '#fffde7',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <option value="" disabled>{cityLoading ? 'Loading cities...' : 'Select City'}</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <button type="submit" style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500
          }}>Continue</button>
        </form>
      </div>
    );
  }

  return (
    <div className={`App ${fade}`} style={{ 
      background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 50%, #ff4500 100%)',
      minHeight: '100vh',
      fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div className="header" style={{ 
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>{bot === 'CS_BOT' ? 'Mustashar' : bot === 'KAREEM' ? 'Kareem' : 'Hakeem AI'}</div>
      <div className="chat-container" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div className="chat-history">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-message-row ${msg.sender}`}>
              <div className={`chat-message ${msg.sender}`} style={{
                fontFamily: "'Inter', sans-serif"
              }}>
                <span className="chat-label">{msg.sender === 'user' ? '' : ''}</span>
                {msg.sender === 'bot' ? (
                  <span style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: linkify(msg.text) }} />
                ) : (
                  msg.text
                )}
              </div>
              <span className={`timestamp ${msg.sender}`} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem'
              }}>{msg.timestamp || ''}</span>
            </div>
          ))}
          {isStreaming && (
            <div className="chat-message-row bot">
              <div className="chat-message bot" style={{
                fontFamily: "'Inter', sans-serif"
              }}>
                <span className="chat-label"></span>
                <span style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: linkify(streamingResponse) }} />
              </div>
              <span className="timestamp bot" style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem'
              }}>{getCurrentTime()}</span>
            </div>
          )}
          {loading && !isStreaming && <div className="chat-message bot" style={{
            fontFamily: "'Inter', sans-serif"
          }}><span className="chat-label"></span>Thinking...</div>}
        </div>
        <form className="chat-input-form" onSubmit={bot === 'STREAMING' ? handleStreamingResponse : handleSend}>
          <input
            type="text"
            placeholder="Type your message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={loading || (bot === 'CS_BOT' && loading)}
            required
            style={{
              fontFamily: "'Inter', sans-serif"
            }}
          />
          <button type="submit" disabled={loading || (bot === 'CS_BOT' && loading)} style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500
          }}>Send</button>
        </form>
        {error && <div className="error" style={{
          fontFamily: "'Inter', sans-serif"
        }}>{error}</div>}
      </div>
    </div>
  );
}

export default App;
