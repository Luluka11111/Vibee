// src/components/MoodJournal.jsx
import React, { useState, useEffect } from 'react';

// Имитация данных (в реальном проекте придут с Back-end)
const MOCK_DATA = [
  { id: 1, date: '2026-05-01', mood: 'happy', note: 'Отличный день для кода!' },
  { id: 2, date: '2026-05-02', mood: 'sad', note: 'Немного устала от тестов.' }
];

const MoodJournal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEntry, setNewEntry] = useState({ mood: 'neutral', note: '' });

  // 1. Получение данных (Критерий: Взаимодействие с данными)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Здесь будет твой fetch('http://localhost:5000/api/moods')
        setTimeout(() => {
          setEntries(MOCK_DATA);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Ошибка при загрузке данных с сервера');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Обработка отправки формы (Критерий: Валидация и Интеракт)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newEntry.note.trim()) {
      alert("Пожалуйста, напишите пару слов о своем состоянии.");
      return;
    }
    
    const entry = { ...newEntry, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    setEntries([entry, ...entries]); // Динамическое обновление DOM
    setNewEntry({ mood: 'neutral', note: '' });
  };

  if (loading) return <div className="loader">Загрузка эстетики...</div>;
  if (error) return <div className="error-msg">{error}</div>;

  return (
    <main className="app-container">
      <header>
        <nav>
          <h1>SoulMate // Дневник</h1>
          <button className="btn-logout">Выйти</button>
        </nav>
      </header>

      <section className="form-section">
        <form onSubmit={handleSubmit} className="mood-form">
          <h2>Как ты сегодня, Алуа?</h2>
          <div className="mood-selector">
            {['happy', 'neutral', 'sad', 'tired'].map((m) => (
              <button 
                key={m}
                type="button"
                className={newEntry.mood === m ? 'active' : ''}
                onClick={() => setNewEntry({...newEntry, mood: m})}
              >
                {/* Пустышки для твоих картинок */}
                <img src={`/assets/icons/${m}.svg`} alt={m} />
              </button>
            ))}
          </div>
          <textarea 
            value={newEntry.note}
            onChange={(e) => setNewEntry({...newEntry, note: e.target.value})}
            placeholder="Опиши свои мысли здесь..."
          />
          <button type="submit" className="btn-save">Сохранить момент</button>
        </form>
      </section>

      <section className="history-section">
        <div className="grid">
          {entries.map(item => (
            <article key={item.id} className={`card ${item.mood}`}>
              <span className="date">{item.date}</span>
              <img src={`/assets/moods/${item.mood}-bg.png`} alt="Mood BG" className="card-bg" />
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>&copy; 2026 SoulMate App. Проектирование ПМ04.</p>
      </footer>
    </main>
  );
};

export default MoodJournal;