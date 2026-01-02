'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, TreePine, Plus, Activity, Battery, Pencil, Trash2, Check, X } from 'lucide-react';

export default function FollowTheSun() {
  const [entries, setEntries] = useState([]);
  const [ouraData, setOuraData] = useState(null);
  const [ouraToken, setOuraToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Username login
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [needsUsername, setNeedsUsername] = useState(false);

  // New entry form
  const [duration, setDuration] = useState('');
  const [activity, setActivity] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [entryDate, setEntryDate] = useState('');

  // Edit form (separate state)
  const [editDuration, setEditDuration] = useState('');
  const [editActivity, setEditActivity] = useState('');
  const [editCustomDuration, setEditCustomDuration] = useState('');
  const [editDate, setEditDate] = useState('');

  // Predefined categories and times
  const categories = ['Walking', 'Soccer', 'Vibing', 'Playground'];
  const quickTimes = [15, 30, 45, 60];

  // Set default date to today when opening form
  useEffect(() => {
    if (showAddEntry && !entryDate) {
      const today = new Date().toISOString().split('T')[0];
      setEntryDate(today);
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
  }, []);

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
      // Load entries
      const entriesRes = await fetch(`/api/entries?userId=${uid}`);
      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data.entries || []);
      }

      // Load settings (Oura token) from server
      const settingsRes = await fetch(`/api/settings?userId=${uid}`);
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.ouraToken) {
          setOuraToken(settings.ouraToken);
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

  const saveToken = async () => {
    if (!ouraToken.trim()) return;

    try {
      // Save to server
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ouraToken })
      });

      setIsTokenSet(true);
      await fetchOuraData(ouraToken);
    } catch (error) {
      console.error('Error saving token:', error);
      alert('Failed to save token. Please try again.');
    }
  };

  const fetchOuraData = async (token) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [activityRes, sleepRes, readinessRes] = await Promise.all([
        fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${today}&end_date=${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${today}&end_date=${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${today}&end_date=${today}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!activityRes.ok) throw new Error('Failed to fetch Oura data');

      const activityData = await activityRes.json();
      const sleepData = await sleepRes.json();
      const readinessData = await readinessRes.json();

      setOuraData({
        activity: activityData.data[0] || null,
        sleep: sleepData.data[0] || null,
        readiness: readinessData.data[0] || null
      });
    } catch (error) {
      console.error('Error fetching Oura data:', error);
      alert('Could not fetch Oura data. Please check your token.');
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
      activity: activity,
      ouraSnapshot: ouraData
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
      alert('Error saving entry. Please try again.');
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
        return {
          ...entry,
          date: selectedDate.toISOString(),
          duration: finalDuration,
          activity: editActivity
        };
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
      alert('Error saving changes. Please try again.');
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
      alert('Error deleting entry. Please try again.');
    }
  };

  const getSunPosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const sunrise = 360;
    const sunset = 1200;

    if (totalMinutes < sunrise || totalMinutes > sunset) {
      return { position: 0, isNight: true };
    }

    const dayMinutes = sunset - sunrise;
    const minutesSinceSunrise = totalMinutes - sunrise;
    const position = (minutesSinceSunrise / dayMinutes) * 100;

    return { position, isNight: false };
  };

  const sunPosition = getSunPosition();

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekEntries = entries.filter(e => new Date(e.date) > weekAgo);
    const totalMinutes = weekEntries.reduce((sum, e) => sum + e.duration, 0);

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      days: weekEntries.length
    };
  };

  const weeklyStats = getWeeklyStats();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f1e8 0%, #e8f4e0 100%)',
        fontFamily: '"Nunito", system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#5a7a4d' }}>
          <Sun size={48} style={{ animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (needsUsername) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f1e8 0%, #e8f4e0 50%, #d4e7f7 100%)',
        fontFamily: '"Nunito", system-ui, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '2.5rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(90, 122, 77, 0.15)',
          textAlign: 'center'
        }}>
          <Sun size={48} color="#fbbf24" style={{ marginBottom: '1rem' }} />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#5a7a4d',
            margin: '0 0 0.5rem 0'
          }}>
            Follow the Sun
          </h1>
          <p style={{
            color: '#7a8c6f',
            marginBottom: '1.5rem',
            fontSize: '0.95rem'
          }}>
            Enter a username to sync across devices
          </p>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            placeholder="Your name (e.g., aaron)"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #c4d5b8',
              borderRadius: '12px',
              fontSize: '1rem',
              marginBottom: '1rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              textAlign: 'center'
            }}
            autoFocus
          />
          <button
            onClick={handleUsernameSubmit}
            style={{
              background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(107, 142, 90, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get Started
          </button>
          <p style={{
            color: '#7a8c6f',
            fontSize: '0.8rem',
            marginTop: '1rem'
          }}>
            Use the same name on all your devices to sync data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f1e8 0%, #e8f4e0 50%, #d4e7f7 100%)',
      fontFamily: '"Nunito", system-ui, sans-serif',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background trees */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '300px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <TreePine size={200} style={{ position: 'absolute', bottom: 0, left: '5%', color: '#3d5a2f' }} />
        <TreePine size={250} style={{ position: 'absolute', bottom: 0, left: '15%', color: '#4a6b3a' }} />
        <TreePine size={180} style={{ position: 'absolute', bottom: 0, right: '10%', color: '#3d5a2f' }} />
        <TreePine size={220} style={{ position: 'absolute', bottom: 0, right: '20%', color: '#4a6b3a' }} />
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '3rem',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(107, 142, 90, 0.15)',
            padding: '0.4rem 1rem',
            borderRadius: '20px',
            marginBottom: '0.75rem',
            fontSize: '0.85rem',
            color: '#5a7a4d'
          }}>
            <span style={{ fontWeight: '600' }}>{username}</span>
            <button
              onClick={() => {
                if (confirm('Switch user? This will log you out on this device.')) {
                  localStorage.removeItem('fts_username');
                  setUsername('');
                  setUserId('');
                  setEntries([]);
                  setOuraToken('');
                  setIsTokenSet(false);
                  setNeedsUsername(true);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#7a8c6f',
                marginLeft: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline'
              }}
            >
              switch
            </button>
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            color: '#5a7a4d',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.05)'
          }}>
            Follow the Sun
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#7a8c6f',
            margin: 0
          }}>
            Track your outdoor adventures in 2026
          </p>
        </header>

        {/* Sun Position Indicator */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(90, 122, 77, 0.1)',
          animation: 'slideUp 0.8s ease-out 0.2s backwards'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#7a8c6f', fontSize: '0.9rem', fontWeight: '600' }}>
              {sunPosition.isNight ? 'Nighttime' : 'Daytime'}
            </span>
          </div>

          <div style={{
            position: 'relative',
            height: '120px',
            marginBottom: '1rem'
          }}>
            <svg width="100%" height="120" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path
                d="M 20 110 Q 50% 20, calc(100% - 20) 110"
                fill="none"
                stroke={sunPosition.isNight ? '#4a5568' : '#93c5fd'}
                strokeWidth="3"
                strokeDasharray="5,5"
                opacity="0.4"
              />
            </svg>

            <div style={{
              position: 'absolute',
              left: `calc(${sunPosition.position}% - 20px)`,
              top: `${-0.3 * Math.pow(sunPosition.position - 50, 2) + 15}px`,
              transition: 'all 0.5s ease',
              filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3))'
            }}>
              {sunPosition.isNight ? (
                <Moon size={40} color="#cbd5e1" fill="#cbd5e1" />
              ) : (
                <Sun size={40} color="#fbbf24" fill="#fbbf24" />
              )}
            </div>

            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: 0,
              right: 0,
              height: '3px',
              background: '#8fac7e',
              borderRadius: '2px'
            }} />
          </div>
        </div>

        {/* Oura Setup */}
        {!isTokenSet ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(90, 122, 77, 0.1)',
            animation: 'slideUp 0.8s ease-out 0.3s backwards'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#5a7a4d',
              marginTop: 0,
              marginBottom: '1rem'
            }}>
              Connect Your Oura Ring
            </h2>
            <p style={{ color: '#7a8c6f', marginBottom: '1rem', lineHeight: '1.6' }}>
              Get your personal access token from <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" style={{ color: '#5a7a4d', textDecoration: 'underline' }}>cloud.ouraring.com</a>
            </p>
            <input
              type="text"
              value={ouraToken}
              onChange={(e) => setOuraToken(e.target.value)}
              placeholder="Paste your Oura token here"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #c4d5b8',
                borderRadius: '12px',
                fontSize: '1rem',
                marginBottom: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={saveToken}
              style={{
                background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(107, 142, 90, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Connect Oura
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
              animation: 'slideUp 0.8s ease-out 0.4s backwards'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(90, 122, 77, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sun size={20} color="#fbbf24" />
                  <span style={{ color: '#7a8c6f', fontSize: '0.9rem', fontWeight: '600' }}>This Week</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#5a7a4d' }}>
                  {weeklyStats.totalHours}h {weeklyStats.totalMinutes}m
                </div>
                <div style={{ color: '#7a8c6f', fontSize: '0.85rem' }}>
                  {weeklyStats.days} days outside
                </div>
              </div>

              {ouraData?.readiness && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 8px 32px rgba(90, 122, 77, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Battery size={20} color="#6b8e5a" />
                    <span style={{ color: '#7a8c6f', fontSize: '0.9rem', fontWeight: '600' }}>Readiness</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#5a7a4d' }}>
                    {ouraData.readiness.score || '--'}
                  </div>
                  <div style={{ color: '#7a8c6f', fontSize: '0.85rem' }}>
                    Today's score
                  </div>
                </div>
              )}

              {ouraData?.activity && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  boxShadow: '0 8px 32px rgba(90, 122, 77, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Activity size={20} color="#6b8e5a" />
                    <span style={{ color: '#7a8c6f', fontSize: '0.9rem', fontWeight: '600' }}>Steps</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#5a7a4d' }}>
                    {ouraData.activity.steps?.toLocaleString() || '--'}
                  </div>
                  <div style={{ color: '#7a8c6f', fontSize: '0.85rem' }}>
                    Today's activity
                  </div>
                </div>
              )}
            </div>

            {/* Add Entry Button */}
            {!showAddEntry && (
              <button
                onClick={() => setShowAddEntry(true)}
                style={{
                  background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '1.25rem 2rem',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s',
                  boxShadow: '0 6px 20px rgba(107, 142, 90, 0.3)',
                  animation: 'slideUp 0.8s ease-out 0.5s backwards'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Plus size={24} />
                Log Outdoor Time
              </button>
            )}

            {/* Add Entry Form */}
            {showAddEntry && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 8px 32px rgba(90, 122, 77, 0.1)',
                animation: 'slideUp 0.4s ease-out'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: '#5a7a4d',
                  marginTop: 0,
                  marginBottom: '1.5rem'
                }}>
                  Add Outdoor Time
                </h3>

                {/* Date Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#7a8c6f',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    What day?
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #c4d5b8',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      color: '#5a7a4d'
                    }}
                  />
                </div>

                {/* Activity Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#7a8c6f',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    What were you doing?
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem'
                  }}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActivity(cat)}
                        style={{
                          background: activity === cat
                            ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)'
                            : 'rgba(196, 213, 184, 0.3)',
                          color: activity === cat ? 'white' : '#5a7a4d',
                          border: activity === cat ? 'none' : '2px solid #c4d5b8',
                          padding: '1rem',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#7a8c6f',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    How long?
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    {quickTimes.map(time => (
                      <button
                        key={time}
                        onClick={() => {
                          setDuration(time);
                          setCustomDuration('');
                        }}
                        style={{
                          background: duration === time
                            ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)'
                            : 'rgba(196, 213, 184, 0.3)',
                          color: duration === time ? 'white' : '#5a7a4d',
                          border: duration === time ? 'none' : '2px solid #c4d5b8',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                      >
                        {time}m
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => {
                        setCustomDuration(e.target.value);
                        setDuration('');
                      }}
                      placeholder="Or enter custom minutes (e.g., 90)"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: customDuration ? '2px solid #6b8e5a' : '2px solid #c4d5b8',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={addEntry}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      boxShadow: '0 4px 12px rgba(107, 142, 90, 0.3)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Save Entry
                  </button>
                  <button
                    onClick={() => {
                      setShowAddEntry(false);
                      setDuration('');
                      setActivity('');
                      setCustomDuration('');
                      setEntryDate('');
                    }}
                    style={{
                      flex: 1,
                      background: 'rgba(122, 140, 111, 0.2)',
                      color: '#5a7a4d',
                      border: 'none',
                      padding: '1rem',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Entries List */}
            {entries.length > 0 && (
              <div style={{ animation: 'slideUp 0.8s ease-out 0.6s backwards' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  color: '#5a7a4d',
                  marginBottom: '1rem'
                }}>
                  Recent Entries
                </h3>
                {entries
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((entry, index) => (
                  <div
                    key={entry.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 16px rgba(90, 122, 77, 0.08)',
                      animation: `slideUp 0.4s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    {editingId === entry.id ? (
                      // Edit Mode
                      <div>
                        {/* Date */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', color: '#7a8c6f', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>Date</label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '2px solid #c4d5b8',
                              borderRadius: '10px',
                              fontSize: '0.95rem',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box',
                              color: '#5a7a4d'
                            }}
                          />
                        </div>

                        {/* Activity */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', color: '#7a8c6f', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>Activity</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                            {categories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => setEditActivity(cat)}
                                style={{
                                  background: editActivity === cat
                                    ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)'
                                    : 'rgba(196, 213, 184, 0.3)',
                                  color: editActivity === cat ? 'white' : '#5a7a4d',
                                  border: editActivity === cat ? 'none' : '2px solid #c4d5b8',
                                  padding: '0.5rem',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Duration */}
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ display: 'block', color: '#7a8c6f', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>Duration</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {quickTimes.map(time => (
                              <button
                                key={time}
                                onClick={() => { setEditDuration(time); setEditCustomDuration(''); }}
                                style={{
                                  background: editDuration === time
                                    ? 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)'
                                    : 'rgba(196, 213, 184, 0.3)',
                                  color: editDuration === time ? 'white' : '#5a7a4d',
                                  border: editDuration === time ? 'none' : '2px solid #c4d5b8',
                                  padding: '0.5rem',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                {time}m
                              </button>
                            ))}
                          </div>
                          <input
                            type="number"
                            value={editCustomDuration}
                            onChange={(e) => { setEditCustomDuration(e.target.value); setEditDuration(''); }}
                            placeholder="Custom minutes"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: editCustomDuration ? '2px solid #6b8e5a' : '2px solid #c4d5b8',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              fontFamily: 'inherit',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {/* Save/Cancel buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => saveEdit(entry.id)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              background: 'linear-gradient(135deg, #6b8e5a 0%, #8fac7e 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '10px',
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Check size={18} /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              background: 'rgba(122, 140, 111, 0.2)',
                              color: '#5a7a4d',
                              border: 'none',
                              padding: '0.75rem',
                              borderRadius: '10px',
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <X size={18} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#5a7a4d', marginBottom: '0.25rem' }}>
                              {Math.floor(entry.duration / 60) > 0 && `${Math.floor(entry.duration / 60)}h `}
                              {entry.duration % 60}min
                            </div>
                            <div style={{ color: '#7a8c6f', fontSize: '0.9rem' }}>
                              {entry.activity}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#7a8c6f' }}>
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <button
                              onClick={() => startEdit(entry)}
                              style={{
                                background: 'rgba(107, 142, 90, 0.15)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Edit"
                            >
                              <Pencil size={16} color="#6b8e5a" />
                            </button>
                            <button
                              onClick={() => deleteEntry(entry.id)}
                              style={{
                                background: 'rgba(220, 38, 38, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} color="#dc2626" />
                            </button>
                          </div>
                        </div>

                        {entry.ouraSnapshot && (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(122, 140, 111, 0.2)'
                          }}>
                            {entry.ouraSnapshot.readiness && (
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#7a8c6f', marginBottom: '0.25rem' }}>
                                  Readiness
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#5a7a4d' }}>
                                  {entry.ouraSnapshot.readiness.score}
                                </div>
                              </div>
                            )}
                            {entry.ouraSnapshot.sleep && (
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#7a8c6f', marginBottom: '0.25rem' }}>
                                  Sleep Score
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#5a7a4d' }}>
                                  {entry.ouraSnapshot.sleep.score}
                                </div>
                              </div>
                            )}
                            {entry.ouraSnapshot.activity && (
                              <div>
                                <div style={{ fontSize: '0.75rem', color: '#7a8c6f', marginBottom: '0.25rem' }}>
                                  Steps
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#5a7a4d' }}>
                                  {entry.ouraSnapshot.activity.steps?.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
