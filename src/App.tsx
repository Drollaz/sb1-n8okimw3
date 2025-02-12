import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './components/Profile';
import Login from './components/Login';
import SkateRoom from './components/SkateRoom';
import Sessions from './components/Sessions';
import Navigation from './components/Navigation';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/5">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider fallback={<LoadingScreen />}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Profile />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/skate-room"
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <SkateRoom />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <Sessions />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;