'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, TreePine, Plus, Pencil, Trash2, Check, X, Menu, Cloud, CloudRain, CloudSnow, Wind, Thermometer, Sunrise, Sunset, Settings } from 'lucide-react';

export default function FollowTheSun() {
  const [entries, setEntries] = useState([]);
  const [ouraData, setOuraData] = useState(null);
  const [ouraToken, setOuraToken] = useState('');
  const [ouraTokenInput, setOuraTokenInput] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Username login
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [needsUsername, setNeedsUsername] = useState(false);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOuraSettings, setShowOuraSettings] = useState(false);

  // Weather & Sun data
  const [weather, setWeather] = useState(null);
  const [sunTimes, setSunTimes] = useState(null);
  const [location, setLocation] = useState(null);

  // New entry form
  const [duration, setDuration] = useState('');
  const [activity, setActivity] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [entryDate, setEntryDate] = useState('');

  // Edit form
  const [editDuration, setEditDuration] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editCustomDuration, setEditCustomDuration] = useState('');
  const [editDate, setEditDate] = useState('');

  const categories = ['Walking', 'Soccer', 'Vibing', 'Playground'];
  const quickTimes = [15, 30, 45, 60];

  // Set default date to today when opening form
  useEffect(() => {
    if (showAddEntry && !entryDate) {
      setEntryDate(new Date().toISOString().split('T')[0]);
    }
  }, [showAddEntry]);

  // Initialize user
  useEffect(() => {
    const storedUsername = localStorage.getItem('fts_username');
    if (storedUsername) {
      setUsername(storedUsername);
      const oderId = 'fts_' + storedUsername.toLowerCase().trim();
      setUserId(oderId);
      loadData(oderId);
    } else {
      setNeedsUsername(true);
      setLoading(false);
    }

    // Charlotte, NC (28206)
    setLocation({ lat: 35.2271, lon: -80.8431 });
  }, []);

  // Fetch weather when location is available
  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lon);
    }
  }, [location]);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1&temperature_unit=fahrenheit`
      );
      const data = await res.json();
      setWeather({
        temp: Math.round(data.current.temperature_2m),
        code: data.current.weather_code,
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0])
      });
      setSunTimes({
        sunrise: new Date(data.daily.sunrise[0]),
        sunset: new Date(data.daily.sunset[0])
      });
    } catch (error) {
      console.error('Weather fetch error:', error);
    }
  };

  const getWeatherIcon = (code) => {
    if (code <= 3) return <Sun size={24} color="#fbbf24" />;
    if (code <= 48) return <Cloud size={24} color="#94a3b8" />;
    if (code <= 67) return <CloudRain size={24} color="#60a5fa" />;
    if (code <= 77) return <CloudSnow size={24} color="#e2e8f0" />;
    return <Wind size={24} color="#94a3b8" />;
  };

  const getMoonPhase = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const c = Math.floor(365.25 * year);
    const e = Math.floor(30.6 * month);
    const jd = c + e + day - 694039.09;
    const phase = jd / 29.53058867;
    const phaseValue = phase - Math.floor(phase);

    const phases = [
      { name: 'New Moon', icon: '🌑', range: [0, 0.0625] },
      { name: 'Waxing Crescent', icon: '🌒', range: [0.0625, 0.1875] },
      { name: 'First Quarter', icon: '🌓', range: [0.1875, 0.3125] },
      { name: 'Waxing Gibbous', icon: '🌔', range: [0.3125, 0.4375] },
      { name: 'Full Moon', icon: '🌕', range: [0.4375, 0.5625] },
      { name: 'Waning Gibbous', icon: '🌖', range: [0.5625, 0.6875] },
      { name: 'Last Quarter', icon: '🌗', range: [0.6875, 0.8125] },
      { name: 'Waning Crescent', icon: '🌘', range: [0.8125, 1] }
    ];

    for (const p of phases) {
      if (phaseValue >= p.range[0] && phaseValue < p.range[1]) {
        return { ...p, value: phaseValue };
      }
    }
    return phases[0];
  };

  const getNextMoonEvents = () => {
    const now = new Date();
    const lunationLength = 29.53058867;
    const knownNewMoon = new Date('2024-01-11');
    const daysSinceNew = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
    const currentPhase = (daysSinceNew % lunationLength) / lunationLength;

    const daysToNewMoon = Math.round((1 - currentPhase) * lunationLength);
    const daysToFullMoon = Math.round(((0.5 - currentPhase + 1) % 1) * lunationLength);

    const nextNew = new Date(now);
    nextNew.setDate(nextNew.getDate() + daysToNewMoon);
    const nextFull = new Date(now);
    nextFull.setDate(nextFull.getDate() + daysToFullMoon);

    return { nextNew, nextFull };
  };

  const getSunPosition = () => {
    if (!sunTimes) return { position: 50, isNight: false };

    const now = new Date();
    const sunrise = sunTimes.sunrise;
    const sunset = sunTimes.sunset;

    if (now < sunrise || now > sunset) {
      return { position: 0, isNight: true };
    }

    const totalDayMinutes = (sunset - sunrise) / (1000 * 60);
    const minutesSinceSunrise = (now - sunrise) / (1000 * 60);
    const position = (minutesSinceSunrise / totalDayMinutes) * 100;

    return { position: Math.min(100, Math.max(0, position)), isNight: false };
  };

  const handleUsernameSubmit = () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      alert('Please enter a username');
      return;
    }
    localStorage.setItem('fts_username', trimmed);
    setUsername(trimmed);
    const oderId = 'fts_' + trimmed.toLowerCase();
    setUserId(oderId);
    setNeedsUsername(false);
    setLoading(true);
    loadData(oderId);
  };

  const loadData = async (uid) => {
    try {
      const entriesRes = await fetch(`/api/entries?userId=${uid}`);
      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data.entries || []);
      }

      const settingsRes = await fetch(`/api/settings?userId=${uid}`);
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.ouraToken) {
          setOuraToken(settings.ouraToken);
          setOuraTokenInput(settings.ouraToken);
          setIsTokenSet(true);
          await fetchOuraData(settings.ouraToken);
        }
      }
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOuraToken = async () => {
    if (!ouraTokenInput.trim()) return;

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ouraToken: ouraTokenInput })
      });

      setOuraToken(ouraTokenInput);
      setIsTokenSet(true);
      setShowOuraSettings(false);
      await fetchOuraData(ouraTokenInput);
    } catch (error) {
      console.error('Error saving token:', error);
      alert('Failed to save token.');
    }
  };

  const fetchOuraData = async (token) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const startDate = twoWeeksAgo.toISOString().split('T')[0];

      const [readinessRes, sleepRes, activityRes] = await Promise.all([
        fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate}&end_date=${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${startDate}&end_date=${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${startDate}&end_date=${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!readinessRes.ok) throw new Error('Failed to fetch Oura data');

      const readinessData = await readinessRes.json();
      const sleepData = await sleepRes.json();
      const activityData = await activityRes.json();

      // Get today's data
      const todayReadiness = readinessData.data?.find(d => d.day === today);
      const todaySleep = sleepData.data?.find(d => d.day === today);
      const todayActivity = activityData.data?.find(d => d.day === today);

      setOuraData({
        readiness: readinessData.data || [],
        sleep: sleepData.data || [],
        activity: activityData.data || [],
        today: {
          readiness: todayReadiness?.score,
          sleep: todaySleep?.score,
          steps: todayActivity?.steps
        }
      });
    } catch (error) {
      console.error('Error fetching Oura data:', error);
    }
  };

  const addEntry = async () => {
    const finalDuration = duration || parseInt(customDuration);
    if (!finalDuration || !activity) {
      alert('Please select both a duration and activity');
      return;
    }

    const selectedDate = new Date(entryDate + 'T12:00:00');
    const newEntry = {
      id: Date.now(),
      date: selectedDate.toISOString(),
      duration: finalDuration,
      activity: activity
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    try {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, entries: updatedEntries })
      });
    } catch (error) {
      alert('Error saving entry.');
    }

    setDuration('');
    setActivity('');
    setCustomDuration('');
    setEntryDate('');
    setShowAddEntry(false);
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditDate(new Date(entry.date).toISOString().split('T')[0]);
    setEditActivity(entry.activity);
    if (quickTimes.includes(entry.duration)) {
      setEditDuration(entry.duration);
      setEditCustomDuration('');
    } else {
      setEditDuration('');
      setEditCustomDuration(entry.duration.toString());
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDuration('');
    setEditActivity('');
    setEditCustomDuration('');
    setEditDate('');
  };

  const saveEdit = async (entryId) => {
    const finalDuration = editDuration || parseInt(editCustomDuration);
    if (!finalDuration || !editActivity || !editDate) {
      alert('Please fill in all fields');
      return;
    }

    const selectedDate = new Date(editDate + 'T12:00:00');
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, date: selectedDate.toISOString(), duration: finalDuration, activity: editActivity };
      }
      return entry;
    });

    setEntries(updatedEntries);

    try {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, entries: updatedEntries })
      });
    } catch (error) {
      alert('Error saving changes.');
    }

    cancelEdit();
  };

  const deleteEntry = async (entryId) => {
    if (!confirm('Delete this entry?')) return;

    const updatedEntries = entries.filter(e => e.id !== entryId);
    setEntries(updatedEntries);

    try {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, entries: updatedEntries })
      });
    } catch (error) {
      alert('Error deleting entry.');
    }
  };

  // Stats calculations
  const getStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = entries.filter(e => new Date(e.date) > weekAgo);
    const totalMinutes = weekEntries.reduce((sum, e) => sum + e.duration, 0);
    const daysWithEntries = new Set(weekEntries.map(e => new Date(e.date).toDateString())).size;

    return {
      weekTotal: totalMinutes,
      weekHours: Math.floor(totalMinutes / 60),
      weekMins: totalMinutes % 60,
      avgPerDay: daysWithEntries > 0 ? Math.round(totalMinutes / 7) : 0
    };
  };

  const getYearStats = () => {
    const year2026 = entries.filter(e => new Date(e.date).getFullYear() === 2026);
    const totalMinutes = year2026.reduce((sum, e) => sum + e.duration, 0);
    const daysOutside = new Set(year2026.map(e => new Date(e.date).toDateString())).size;

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMins: totalMinutes % 60,
      daysOutside
    };
  };

  // Calendar heatmap data
  const getHeatmapData = () => {
    const data = {};
    entries.forEach(e => {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      data[dateStr] = (data[dateStr] || 0) + e.duration;
    });
    return data;
  };

  const getHeatmapColor = (minutes) => {
    if (!minutes) return 'rgba(196, 213, 184, 0.2)';
    if (minutes <= 30) return 'rgba(107, 142, 90, 0.4)';
    if (minutes <= 60) return 'rgba(107, 142, 90, 0.7)';
    return 'rgba(107, 142, 90, 1)';
  };

  const renderHeatmap = () => {
    const heatmapData = getHeatmapData();
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-12-31');
    const weeks = [];
    let currentWeek = [];

    // Pad start to align with week
    const startDay = startDate.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      currentWeek.push({ date: dateStr, minutes: heatmapData[dateStr] || 0 });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '2px', minWidth: 'max-content' }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={day ? `${day.date}: ${day.minutes}min` : ''}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: day ? getHeatmapColor(day.minutes) : 'transparent'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: '#7a8c6f' }}>
          {months.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>
    );
  };

  // Oura correlation chart
  const renderOuraChart = () => {
    if (!ouraData?.readiness?.length) return null;

    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date.startsWith(dateStr));
      const outdoorMins = dayEntries.reduce((sum, e) => sum + e.duration, 0);
      const readiness = ouraData.readiness.find(r => r.day === dateStr);
      last14Days.push({
        date: dateStr,
        outdoor: outdoorMins,
        readiness: readiness?.score || 0
      });
    }

    const maxOutdoor = Math.max(...last14Days.map(d => d.outdoor), 60);

    return (
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#7a8c6f', marginBottom: '0.5rem' }}>Outdoor Time vs Readiness (14 days)</div>
        <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '60px' }}>
          {last14Days.map((day, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div
                style={{
                  width: '100%',
                  height: `${(day.outdoor / maxOutdoor) * 40}px`,
                  background: 'rgba(107, 142, 90, 0.6)',
                  borderRadius: '2px 2px 0 0'
                }}
                title={`${day.outdoor}min outdoor`}
              />
              <div style={{ fontSize: '0.6rem', color: day.readiness > 70 ? '#6b8e5a' : '#7a8c6f' }}>
                {day.readiness || '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const stats = getStats();
  const yearStats = getYearStats();
  const sunPosition = getSunPosition();
  const moonPhase = getMoonPhase();
  const moonEvents = getNextMoonEvents();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f1e8 0%, #e8f4e0 100%)', fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', color: '#5a7a4d' }}>
          <Sun size={48} style={{ animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (needsUsername) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f1e8 0%, #e8f4e0 50%, #d4e7f7 100%)', fontFamily: '"Nunito", system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '2.5rem', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(90, 122, 77, 0.15)', textAlign: 'center' }}>
          <Sun size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#5a7a4d', margin: '0 0 0.5rem 0' }}>Follow the Sun</h1>
          <p style={{ color: '#7a8c6f', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Enter a username to sync across devices</p>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            placeholder="Your name (e.g., aaron)"
            style={{ width: '100%', padding: '1rem', border: '2px solid #c4d5b8', borderRadius: '12px', fontSize: '1rem', marginBottom: '1rem', fontFamily: 'inherit', boxSizing: 'border-box', textAlign: 'center' }}
            autoFocus
          />
          <button onClick={handleUsernameSubmit} style={{ background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(107, 142, 90, 0.3)' }}>
            Get Started
          </button>
          <p style={{ color: '#7a8c6f', fontSize: '0.8rem', marginTop: '1rem' }}>Use the same name on all your devices to sync data</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f1e8 0%, #e8f4e0 50%, #d4e7f7 100%)', fontFamily: '"Nunito", system-ui, sans-serif', position: 'relative' }}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: sidebarOpen ? 0 : '-320px',
        width: '300px',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        zIndex: 50,
        transition: 'right 0.3s ease',
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="#5a7a4d" />
        </button>

        {/* Weather Section */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(122, 140, 111, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#7a8c6f', marginBottom: '0.75rem', fontWeight: '600' }}>Weather</h3>
          {weather ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {getWeatherIcon(weather.code)}
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#5a7a4d' }}>{weather.temp}°</div>
                <div style={{ fontSize: '0.8rem', color: '#7a8c6f' }}>H: {weather.high}° L: {weather.low}°</div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#7a8c6f', fontSize: '0.85rem' }}>Loading weather...</div>
          )}
        </div>

        {/* Sun Position */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(122, 140, 111, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#7a8c6f', marginBottom: '0.75rem', fontWeight: '600' }}>Sun</h3>
          <div style={{ position: 'relative', height: '60px', marginBottom: '0.5rem' }}>
            <svg width="100%" height="60" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path d="M 10 50 Q 50% 10, calc(100% - 10) 50" fill="none" stroke={sunPosition.isNight ? '#4a5568' : '#93c5fd'} strokeWidth="2" strokeDasharray="4,4" opacity="0.4" />
            </svg>
            <div style={{ position: 'absolute', left: `calc(${sunPosition.position}% - 12px)`, top: `${-0.4 * Math.pow(sunPosition.position - 50, 2) / 50 + 10}px`, transition: 'all 0.5s ease' }}>
              {sunPosition.isNight ? <Moon size={24} color="#cbd5e1" fill="#cbd5e1" /> : <Sun size={24} color="#fbbf24" fill="#fbbf24" />}
            </div>
          </div>
          {sunTimes && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#7a8c6f' }}>
              <span><Sunrise size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{sunTimes.sunrise.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              <span><Sunset size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{sunTimes.sunset.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Moon Phase */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(122, 140, 111, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#7a8c6f', marginBottom: '0.75rem', fontWeight: '600' }}>Moon</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>{moonPhase.icon}</span>
            <span style={{ color: '#5a7a4d', fontWeight: '600' }}>{moonPhase.name}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#7a8c6f' }}>
            <div>Full moon: {moonEvents.nextFull.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div>New moon: {moonEvents.nextNew.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Oura Settings */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(122, 140, 111, 0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#7a8c6f', marginBottom: '0.75rem', fontWeight: '600' }}>Oura Ring</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#5a7a4d', fontSize: '0.9rem' }}>{isTokenSet ? 'Connected' : 'Not connected'}</span>
            <button onClick={() => setShowOuraSettings(!showOuraSettings)} style={{ background: 'rgba(107, 142, 90, 0.15)', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', color: '#5a7a4d' }}>
              {showOuraSettings ? 'Cancel' : (isTokenSet ? 'Edit' : 'Add')}
            </button>
          </div>
          {showOuraSettings && (
            <div style={{ marginTop: '0.75rem' }}>
              <input
                type="text"
                value={ouraTokenInput}
                onChange={(e) => setOuraTokenInput(e.target.value)}
                placeholder="Paste Oura token"
                style={{ width: '100%', padding: '0.6rem', border: '2px solid #c4d5b8', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.5rem', boxSizing: 'border-box' }}
              />
              <button onClick={saveOuraToken} style={{ width: '100%', background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Save Token
              </button>
            </div>
          )}

          {/* Today's Oura Stats */}
          {ouraData?.today && (ouraData.today.readiness || ouraData.today.sleep || ouraData.today.steps) && (
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(107, 142, 90, 0.1)', borderRadius: '8px', padding: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5a7a4d' }}>{ouraData.today.readiness || '--'}</div>
                <div style={{ fontSize: '0.7rem', color: '#7a8c6f' }}>Readiness</div>
              </div>
              <div style={{ background: 'rgba(107, 142, 90, 0.1)', borderRadius: '8px', padding: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5a7a4d' }}>{ouraData.today.sleep || '--'}</div>
                <div style={{ fontSize: '0.7rem', color: '#7a8c6f' }}>Sleep</div>
              </div>
              <div style={{ background: 'rgba(107, 142, 90, 0.1)', borderRadius: '8px', padding: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5a7a4d' }}>{ouraData.today.steps ? (ouraData.today.steps / 1000).toFixed(1) + 'k' : '--'}</div>
                <div style={{ fontSize: '0.7rem', color: '#7a8c6f' }}>Steps</div>
              </div>
            </div>
          )}

          {renderOuraChart()}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '1.5rem 1rem', maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(107, 142, 90, 0.15)', padding: '0.3rem 0.8rem', borderRadius: '16px', fontSize: '0.8rem', color: '#5a7a4d', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: '600' }}>{username}</span>
              <button onClick={() => { if (confirm('Switch user?')) { localStorage.removeItem('fts_username'); window.location.reload(); }}} style={{ background: 'none', border: 'none', color: '#7a8c6f', marginLeft: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>switch</button>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#5a7a4d', margin: 0 }}>Follow the Sun</h1>
          </div>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '12px', padding: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Menu size={24} color="#5a7a4d" />
          </button>
        </header>

        {/* Log Button */}
        {!showAddEntry && (
          <button onClick={() => setShowAddEntry(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)', color: 'white', border: 'none', padding: '1rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', boxShadow: '0 4px 16px rgba(107, 142, 90, 0.3)' }}>
            <Plus size={24} /> Log Outdoor Time
          </button>
        )}

        {/* Add Entry Form */}
        {showAddEntry && (
          <div style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 4px 16px rgba(90, 122, 77, 0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#5a7a4d', marginTop: 0, marginBottom: '1rem' }}>Add Outdoor Time</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7a8c6f', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Date</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.75rem', border: '2px solid #c4d5b8', borderRadius: '10px', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box', color: '#5a7a4d' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7a8c6f', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Activity</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActivity(cat)} style={{ background: activity === cat ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)' : 'rgba(196, 213, 184, 0.3)', color: activity === cat ? 'white' : '#5a7a4d', border: activity === cat ? 'none' : '2px solid #c4d5b8', padding: '0.75rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#7a8c6f', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Duration</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {quickTimes.map(time => (
                  <button key={time} onClick={() => { setDuration(time); setCustomDuration(''); }} style={{ background: duration === time ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)' : 'rgba(196, 213, 184, 0.3)', color: duration === time ? 'white' : '#5a7a4d', border: duration === time ? 'none' : '2px solid #c4d5b8', padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{time}m</button>
                ))}
              </div>
              <input type="number" value={customDuration} onChange={(e) => { setCustomDuration(e.target.value); setDuration(''); }} placeholder="Custom minutes" style={{ width: '100%', padding: '0.75rem', border: customDuration ? '2px solid #6b8e5a' : '2px solid #c4d5b8', borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={addEntry} style={{ flex: 1, background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>Save</button>
              <button onClick={() => { setShowAddEntry(false); setDuration(''); setActivity(''); setCustomDuration(''); setEntryDate(''); }} style={{ flex: 1, background: 'rgba(122, 140, 111, 0.2)', color: '#5a7a4d', border: 'none', padding: '0.85rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-around', boxShadow: '0 2px 8px rgba(90, 122, 77, 0.08)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5a7a4d' }}>{stats.weekHours}h {stats.weekMins}m</div>
            <div style={{ fontSize: '0.75rem', color: '#7a8c6f' }}>Last 7 days</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(122, 140, 111, 0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#5a7a4d' }}>{stats.avgPerDay}m</div>
            <div style={{ fontSize: '0.75rem', color: '#7a8c6f' }}>Daily avg</div>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(90, 122, 77, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#5a7a4d', margin: 0, fontWeight: '600' }}>2026</h3>
            <div style={{ fontSize: '0.8rem', color: '#7a8c6f' }}>{yearStats.totalHours}h {yearStats.totalMins}m · {yearStats.daysOutside} days</div>
          </div>
          {renderHeatmap()}
        </div>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', color: '#5a7a4d', marginBottom: '0.75rem', fontWeight: '600' }}>Recent Entries</h3>
            {entries.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((entry) => (
              <div key={entry.id} style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '1rem', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(90, 122, 77, 0.06)' }}>
                {editingId === entry.id ? (
                  <div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '0.6rem', border: '2px solid #c4d5b8', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', color: '#5a7a4d' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setEditActivity(cat)} style={{ background: editActivity === cat ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)' : 'rgba(196, 213, 184, 0.3)', color: editActivity === cat ? 'white' : '#5a7a4d', border: editActivity === cat ? 'none' : '2px solid #c4d5b8', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{cat}</button>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      {quickTimes.map(time => (
                        <button key={time} onClick={() => { setEditDuration(time); setEditCustomDuration(''); }} style={{ background: editDuration === time ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)' : 'rgba(196, 213, 184, 0.3)', color: editDuration === time ? 'white' : '#5a7a4d', border: editDuration === time ? 'none' : '2px solid #c4d5b8', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{time}m</button>
                      ))}
                    </div>
                    <input type="number" value={editCustomDuration} onChange={(e) => { setEditCustomDuration(e.target.value); setEditDuration(''); }} placeholder="Custom" style={{ width: '100%', padding: '0.5rem', border: '2px solid #c4d5b8', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => saveEdit(entry.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}><Check size={16} /> Save</button>
                      <button onClick={cancelEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', background: 'rgba(122, 140, 111, 0.2)', color: '#5a7a4d', border: 'none', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}><X size={16} /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#5a7a4d' }}>{Math.floor(entry.duration / 60) > 0 && `${Math.floor(entry.duration / 60)}h `}{entry.duration % 60}m</div>
                      <div style={{ fontSize: '0.85rem', color: '#7a8c6f' }}>{entry.activity}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#7a8c6f' }}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <button onClick={() => startEdit(entry)} style={{ background: 'rgba(107, 142, 90, 0.15)', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }}><Pencil size={14} color="#6b8e5a" /></button>
                      <button onClick={() => deleteEntry(entry.id)} style={{ background: 'rgba(220, 38, 38, 0.1)', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }}><Trash2 size={14} color="#dc2626" /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
