import React, { useState, useEffect } from 'react';
import './App.css'

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 

import firebaseConfig from './Firebase/firebaseConfig'; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

const TimerApp = () => {
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(1500);
  const [breakTimer, setBreakTimer] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return unsubscribe; 
  }, [auth]); 

  const signInWithEmail = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign In Error:', error.message);
    }
  };

  const signOut = () => {
    auth.signOut();
  };

  const handleTimerAction = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimer(1500);
    setBreakTimer(300);
    setIsBreak(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    let interval;

    if (isTimerRunning) {
      interval = setInterval(() => {
        if (!isBreak && timer > 0) {
          setTimer((prevTimer) => prevTimer - 1);
        } else if (isBreak && breakTimer > 0) {
          setBreakTimer((prevBreakTimer) => prevBreakTimer - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    if (timer === 0 && !isBreak) {
      setIsBreak(true);
      setIsTimerRunning(true);
    }

    if (timer === 0 && breakTimer === 0 && isTimerRunning) {
      resetTimer();
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timer, breakTimer, isBreak]);

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.displayName || user.email}!</p>
          <button onClick={signOut}>Sign Out</button>
          <div>
            {!isBreak && <p>Work Timer: {formatTime(timer)}</p>}
            {isBreak && <p>Break Timer: {formatTime(breakTimer)}</p>}
            <button onClick={handleTimerAction}>
              {isTimerRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={resetTimer}>Reset</button>
          </div>
        </div>
      ) : (
        <div>
          <input type="email" placeholder="Email" id="email" />
          <input type="password" placeholder="Password" id="password" />
          <button onClick={() => signInWithEmail(document.getElementById('email').value, document.getElementById('password').value)}>Sign In with Email</button>
        </div>
      )}
    </div>
  );
};

export default TimerApp;
