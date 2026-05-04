import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { X, Heart, Power, ArrowRight, Folder, Music, Camera, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

const API = 'http://localhost:5000/api';

// --- КОМПОНЕНТ ДЛЯ ОШИБКИ 404 ---
const NotFound = () => (
  <div className="black-screen">
    <img src="/assets/moods/загрузка (1).gif" className="large-loading-gif" alt="error" />
    <h1 className="error-text">404 SYSTEM ERROR</h1>
    <p className="error-text" style={{fontSize: '8px'}}>THE REQUESTED MODULE IS DISCONNECTED.</p>
    <button className="win-btn" style={{marginTop: '15px'}} onClick={() => window.location.href = '/'}>
      REBOOT SYSTEM
    </button>
  </div>
);

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('username'));
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Состояния для календаря
  const [entries, setEntries] = useState([]);
  const [modal, setModal] = useState({ open: false, day: null });
  const [mood, setMood] = useState('1'); 
  const [note, setNote] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = eachDayOfInterval({ 
    start: startOfMonth(currentDate), 
    end: endOfMonth(currentDate) 
  });

  useEffect(() => { 
    if (token) {
      fetchEntries();
      if (location.pathname === '/' || location.pathname === '/auth') {
        navigate('/app');
      }
    } 
  }, [token]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/entries`, { 
        headers: { Authorization: token } 
      });
      setEntries(res.data);
    } catch (e) { 
      if(e.response?.status === 401) logout(); 
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const path = isLogin ? 'login' : 'register';
      const res = await axios.post(`${API}/auth/${path}`, form);
      
      setTimeout(() => {
        if (isLogin) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('username', res.data.username);
          setToken(res.data.token);
          setUser(res.data.username);
          navigate('/app');
        } else {
          alert("Account created! Please login.");
          setIsLogin(true);
          navigate('/auth');
        }
        setLoading(false);
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError("404 SYSTEM ERROR: DATA CORRUPTED");
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setEntries([]);
    navigate('/');
  };

  const openDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = entries.find(e => e.date === dateStr);
    setMood(existing ? existing.mood : '1');
    setNote(existing ? existing.note : '');
    setModal({ open: true, day: dateStr });
  };

  const save = async () => {
    try {
      await axios.post(`${API}/entries`, 
        { mood, note, date: modal.day }, 
        { headers: { Authorization: token } }
      );
      setModal({ open: false, day: null });
      fetchEntries();
    } catch (e) {
      alert("Error saving sticker");
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="retro-os-container">
      <div className="monitor-frame-container">
        <img src="/assets/moods/LCD-Computer-Monitor-PNG-File.png" className="monitor-png" alt="frame" />
        
        <div className="inner-screen-content">
          
          {loading && (
            <div className="black-screen">
              <img src="/assets/moods/загрузка (1).gif" className="large-loading-gif" alt="loading" />
            </div>
          )}

          {!loading && error && (
            <div className="black-screen" onClick={() => setError(null)} style={{cursor: 'pointer'}}>
              <img src="/assets/moods/загрузка (1).gif" className="large-loading-gif" alt="error" />
              <p className="error-text">{error}</p>
              <p className="error-text" style={{fontSize: '7px', marginTop: '10px'}}>[ CLICK TO REBOOT SYSTEM ]</p>
            </div>
          )}
          
          {!loading && !error && (
            <Routes>
              {/* --- WELCOME SCREEN --- */}
              <Route path="/" element={
                <div className="screen-welcome">
                  <div className="status-bar-top">
                    <marquee scrollamount="5">SYSTEM BOOT... WELCOME... STATUS: AESTHETIC VIBES ONLY...</marquee>
                  </div>
                  <div className="desktop-icons">
                    <div className="icon-item"><Folder size={24} /> <span>Files</span></div>
                    <div className="icon-item"><Music size={24} /> <span>Vibes</span></div>
                    <div className="icon-item"><Camera size={24} /> <span>Gallery</span></div>
                    <div className="icon-item"><FileText size={24} /> <span>Notes</span></div>
                  </div>
                  <div className="welcome-main">
                    <div className="gif-box">
                      <img src="/assets/moods/load.gif" alt="vibe" className="pixel-gif" />
                    </div>
                    <h1 className="logo-text">MOODS</h1>
                    <p className="sub-text">Digital Heart & Mood Diary</p>
                    <button className="win-btn big" onClick={() => token ? navigate('/app') : navigate('/auth')}>
                      ENTER <ArrowRight size={18} />
                    </button>
                  </div>
                  <div className="bottom-banners">
                    <div className="mini-banner pink">365 SURPRISES</div>
                    <div className="mini-banner yellow">STAY AESTHETIC</div>
                    <div className="mini-banner blue">PROJECT 2026</div>
                  </div>
                </div>
              } />

              {/* --- AUTH SCREEN --- */}
              <Route path="/auth" element={
                <div className="screen-auth-pigs">
                  <div className="win-window">
                    <div className="win-header">
                      <span>{isLogin ? 'c:/system/login.exe' : 'c:/system/signup.exe'}</span>
                      <button className="win-close" onClick={() => navigate('/')}><X size={12}/></button>
                    </div>
                    <form className="win-body" onSubmit={handleAuth}>
                      <p>Please identify yourself:</p>
                      <input type="text" placeholder="Username" required onChange={e => setForm({...form, username: e.target.value})} />
                      <input type="password" placeholder="Password" required onChange={e => setForm({...form, password: e.target.value})} />
                      <button type="submit" className="win-btn-action">{isLogin ? 'OK' : 'CREATE'}</button>
                      <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? '> Register new user' : '> Back to login'}
                      </span>
                    </form>
                  </div>
                </div>
              } />

              {/* --- APP SCREEN (PROTECTED) --- */}
              <Route path="/app" element={
                token ? (
                  <div className="screen-app">
                    <div className="taskbar-top">
                      <div className="emmo-month-display">
                        <button className="month-nav-btn" onClick={prevMonth}><ChevronLeft size={20}/></button>
                        <span>{format(currentDate, 'MMMM yyyy')}</span>
                        <button className="month-nav-btn" onClick={nextMonth}><ChevronRight size={20}/></button>
                      </div>
                      <div className="user-pill"><Heart size={14} fill="#ff8fa3" /> {user}</div>
                      <button className="off-btn" onClick={logout}><Power size={14} /></button>
                    </div>

                    <div className="calendar-scroll-container">
                      <div className="calendar-grid">
                        {days.map(day => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const entry = entries.find(e => e.date === dateStr);
                          const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                          return (
                            <div key={dateStr} className={`day-box ${isToday ? 'today' : ''}`} onClick={() => openDay(day)}>
                              <span className="day-num">{format(day, 'd')}</span>
                              {entry ? (
                                <img src={`/assets/moods/${entry.mood}.jpg`} className="sticker" alt="mood" />
                              ) : (
                                <Plus size={12} color="#ddd" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {modal.open && (
                      <div className="win-overlay">
                        <div className="win-window emmo-modal">
                          <div className="win-header">
                            <span>{format(new Date(modal.day.replace(/-/g, '/')), 'dd MMMM')}</span>
                            <button onClick={() => setModal({open: false, day: null})}><X size={12}/></button>
                          </div>
                          <div className="win-body">
                            <div className="mood-picker-grid">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <img 
                                  key={num} 
                                  src={`/assets/moods/${num}.jpg`} 
                                  className={mood === String(num) ? 'mood-icon active' : 'mood-icon'} 
                                  onClick={() => setMood(String(num))}
                                  alt="mood-choice"
                                />
                              ))}
                            </div>
                            <textarea 
                              className="win-input" 
                              placeholder="Write a note..." 
                              value={note} 
                              onChange={e => setNote(e.target.value)} 
                            />
                            <button className="win-btn-action" onClick={save}>PASTE STICKER</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : <Navigate to="/auth" />
              } />

              {/* --- 404 CATCH ALL --- */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}

        </div>
      </div>
    </div>
  );
}