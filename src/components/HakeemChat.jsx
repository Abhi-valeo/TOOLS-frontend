import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HakeemChat = () => {
  const [email, setEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [bot, setBot] = useState('');
  const [showKareemForm, setShowKareemForm] = useState(false);
  const [kareemCountry, setKareemCountry] = useState('');
  const [kareemName, setKareemName] = useState('');
  const [kareemCity, setKareemCity] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (emailInput.trim() === '' || !emailInput.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setEmail(emailInput.trim());
    setError('');
  };

  const handleBotSelect = (selectedBot) => {
    setBot(selectedBot);
    setShowChat(true);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { type: 'user', text: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setLoading(true);
    setError('');

    try {
      let apiUrl = '';
      if (bot === 'CS_BOT') {
        apiUrl = `http://ec2-34-227-108-46.compute-1.amazonaws.com:9090/api/chat/CS_BOT?prompt=${encodeURIComponent(message)}&email=${encodeURIComponent(email)}`;
      } else if (bot === 'KAREEM') {
        apiUrl = `http://ec2-34-227-108-46.compute-1.amazonaws.com:9090/api/chat/kareem_session?prompt=${encodeURIComponent(message)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(kareemName)}&city=${encodeURIComponent(kareemCity)}&country=${encodeURIComponent(kareemCountry)}`;
      } else {
        apiUrl = `http://ec2-34-227-108-46.compute-1.amazonaws.com:9090/chat?prompt=${encodeURIComponent(message)}&email=${encodeURIComponent(email)}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { 
          type: 'bot', 
          text: (data.responses && data.responses[1]) || data.response || 'Thank you for your message. I am Hakeem, your AI health assistant.', 
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

  const handleStreamingResponse = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const userMessage = { type: 'user', text: message, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError('');
    setIsStreaming(true);
    setStreamingResponse('');

    let finalResponse = '';

    try {
      const eventSource = new EventSource(`http://ec2-34-227-108-46.compute-1.amazonaws.com:9090/stream?prompt=${encodeURIComponent(message)}&email=${encodeURIComponent(email || 'user@example.com')}`);
      
      eventSource.onmessage = (event) => {
        finalResponse += event.data;
        setStreamingResponse(finalResponse);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        if (finalResponse) {
          setChatHistory(prev => [
            ...prev,
            { type: 'bot', text: finalResponse, timestamp: new Date() }
          ]);
        }
        setError('Connection closed.');
        setLoading(false);
        setIsStreaming(false);
        setStreamingResponse('');
      };

      eventSource.addEventListener('complete', () => {
        setChatHistory(prev => [
          ...prev,
          { type: 'bot', text: finalResponse, timestamp: new Date() }
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
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`;
    });
  };

  useEffect(() => {
    if (showKareemForm && kareemCountry) {
      setCityLoading(true);
      setKareemCity('');
      fetch(`http://ec2-34-227-108-46.compute-1.amazonaws.com:9090/getCity?country=${encodeURIComponent(kareemCountry)}`)
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

  // Email input screen
  if (!email && !showChat) {
    return (
      <div className="min-h-screen p-4 font-opensans">
        <div className="max-w-4xl mx-auto animate-fade-in content-wrapper">
          <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-playfair font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 tracking-wider animate-pulse hover:animate-none transition-all duration-500 hover:scale-105 cursor-default">
                Valeos AI Initiatives
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full animate-pulse"></div>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto space-y-6">
              <div className="relative group">
                <input
                  type="email"
                  placeholder="Enter your email to start"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  required
                  className="w-full p-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:border-blue-300 transition-all duration-300 text-lg font-opensans group-hover:border-blue-400/50 group-hover:bg-white/30"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-roboto font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Start Chat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              {error && (
                <div className="bg-red-100/50 backdrop-blur-sm rounded-xl p-4 border border-red-200/50 animate-bounce">
                  <p className="text-red-700 text-center font-opensans">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Bot selection screen
  if (email && !bot && !showChat && !showKareemForm) {
    return (
      <div className="min-h-screen p-4 font-opensans">
        <div className="max-w-6xl mx-auto animate-fade-in content-wrapper">
          <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-playfair font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4 tracking-wider animate-pulse hover:animate-none transition-all duration-500 hover:scale-105 cursor-default">
                Let the Bots Do the Boring Stuff!
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-blue-600 mx-auto rounded-full animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="group">
                <button
                  className="w-full h-80 glass-effect rounded-2xl p-8 flex flex-col items-center justify-center border border-white/30 hover:border-yellow-300/50 hover:bg-yellow-100/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                  onClick={() => handleBotSelect('HEALTHBOT')}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl group-hover:shadow-2xl">
                    <svg className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-roboto font-bold text-gray-800 mb-4 drop-shadow-lg group-hover:text-green-700 transition-colors duration-300">Hakeem</h3>
                  <p className="text-base font-opensans text-gray-600 text-center leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    Your comprehensive AI health assistant with advanced medical insights and personalized wellness guidance
                  </p>
                  <div className="text-yellow-600 text-lg font-roboto font-semibold group-hover:text-yellow-700 transition-colors duration-300 flex items-center gap-2">
                    Start Health Journey 
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </div>
                </button>
              </div>

              <div className="group">
                <button
                  className="w-full h-80 glass-effect rounded-2xl p-8 flex flex-col items-center justify-center border border-white/30 hover:border-blue-300/50 hover:bg-blue-100/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
                  onClick={() => setShowKareemForm(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl group-hover:shadow-2xl">
                    <svg className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-roboto font-bold text-gray-800 mb-4 drop-shadow-lg group-hover:text-blue-700 transition-colors duration-300">Testing</h3>
                  <p className="text-base font-opensans text-gray-600 text-center leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    Personalized session-based conversations with contextual awareness and location-specific insights
                  </p>
                  <div className="text-blue-600 text-lg font-roboto font-semibold group-hover:text-blue-700 transition-colors duration-300 flex items-center gap-2">
                    Begin Testing Session 
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kareem form screen
  if (showKareemForm) {
    return (
      <div className="min-h-screen p-4 font-opensans">
        <div className="max-w-4xl mx-auto animate-fade-in content-wrapper">
          <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-playfair font-normal text-amber-50 mb-4 tracking-wider text-border">
                Valeo Wellbeing
              </h1>
              <h2 className="text-3xl md:text-4xl font-roboto font-bold text-gray-800 mb-4 text-shadow">
                Testing Session Setup
              </h2>
              <p className="text-lg font-opensans font-medium text-gray-600 text-shadow">
                Personalize your experience with contextual information
              </p>
            </div>
            
            <form onSubmit={e => {
              e.preventDefault();
              setBot('KAREEM');
              setShowKareemForm(false);
              setShowChat(true);
            }} className="max-w-md mx-auto space-y-6">
              <div className="relative">
                <select
                  value={kareemCountry}
                  onChange={e => setKareemCountry(e.target.value)}
                  required
                  className="w-full p-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:border-blue-300 transition-all duration-300 text-lg font-opensans appearance-none"
                >
                  <option value="" disabled className="text-gray-500">Select Country</option>
                  <option value="UAE" className="text-gray-800">UAE</option>
                  <option value="KSA" className="text-gray-800">KSA</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={kareemName}
                  onChange={e => setKareemName(e.target.value)}
                  required
                  className="w-full p-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:border-blue-300 transition-all duration-300 text-lg font-opensans"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={kareemCity}
                  onChange={e => setKareemCity(e.target.value)}
                  required
                  disabled={!kareemCountry || cityLoading || cityOptions.length === 0}
                  className="w-full p-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:border-blue-300 transition-all duration-300 text-lg font-opensans appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled className="text-gray-500">
                    {cityLoading ? 'Loading cities...' : 'Select City'}
                  </option>
                  {cityOptions.map(city => (
                    <option key={city} value={city} className="text-gray-800">{city}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-roboto font-bold rounded-2xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Continue to Chat
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="min-h-screen p-4 font-opensans">
      <div className="max-w-6xl mx-auto animate-fade-in content-wrapper">
        <div className="glass-effect rounded-3xl p-8 md:p-12 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/30">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/')}
                className="p-3 glass-effect rounded-2xl hover:bg-white/30 transition-all duration-300 text-gray-600 hover:text-gray-800 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-roboto font-bold text-gray-800 text-shadow">
                  {bot === 'CS_BOT' ? 'Mustashar' : bot === 'KAREEM' ? 'Kareem' : 'Hakeem AI'}
                </h1>
                <p className="text-base font-opensans font-medium text-gray-600 text-shadow">
                  Your AI Health Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass-effect rounded-2xl px-4 py-3 border border-white/30">
                <p className="text-gray-800 font-roboto font-semibold">{email}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="glass-effect rounded-2xl border border-white/20 h-[calc(100vh-300px)] flex flex-col">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-600 mt-16">
                  <div className="w-24 h-24 glass-effect rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-roboto font-bold text-gray-800 mb-4 text-shadow">
                    Welcome to {bot === 'CS_BOT' ? 'Mustashar' : bot === 'KAREEM' ? 'Kareem' : 'Hakeem'}!
                  </h2>
                  <p className="text-base font-opensans text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    I'm your AI health assistant, ready to help with your wellness journey. Ask me anything about health, nutrition, fitness, or medical advice.
                  </p>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl p-4 rounded-2xl shadow-lg ${
                      chat.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'glass-effect text-gray-800 border border-white/30'
                    }`}>
                      <div className="text-base font-opensans leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                        {chat.type === 'bot' ? (
                          <span dangerouslySetInnerHTML={{ __html: linkify(chat.text) }} />
                        ) : (
                          chat.text
                        )}
                      </div>
                      <div className={`text-xs mt-2 ${chat.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {chat.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-2xl p-4 rounded-2xl glass-effect text-gray-800 border border-white/30 shadow-lg">
                    <div className="text-base font-opensans leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                      <span dangerouslySetInnerHTML={{ __html: linkify(streamingResponse) }} />
                    </div>
                    <div className="text-xs mt-2 text-gray-500">
                      {getCurrentTime()}
                    </div>
                  </div>
                </div>
              )}
              
              {loading && !isStreaming && (
                <div className="flex justify-start">
                  <div className="max-w-2xl p-4 rounded-2xl glass-effect text-gray-800 border border-white/30 shadow-lg">
                    <div className="flex items-center gap-3 text-base">
                      <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="font-opensans">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-white/30">
              <form onSubmit={bot === 'STREAMING' ? handleStreamingResponse : handleSendMessage} className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full p-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300/50 focus:border-blue-300 transition-all duration-300 text-base font-opensans"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-roboto font-bold rounded-2xl text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
                >
                  Send
                </button>
              </form>
              
              {error && (
                <div className="mt-4 bg-red-100/50 backdrop-blur-sm rounded-xl p-4 border border-red-200/50">
                  <p className="text-red-700 text-center font-opensans">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HakeemChat; 