import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Calendar, Clock, X, Edit2, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Session = Database['public']['Tables']['skate_sessions']['Row'];

function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('skate_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (newSession: Partial<Session>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('skate_sessions')
        .insert([{
          user_id: user.id,
          place_name: newSession.place_name,
          address: newSession.address,
          session_date: newSession.session_date,
          review: newSession.review
        }]);

      if (error) throw error;

      await fetchSessions();
      setIsAddingSession(false);
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const handleEditSession = async (sessionId: string, updatedSession: Partial<Session>) => {
    try {
      const { error } = await supabase
        .from('skate_sessions')
        .update({
          place_name: updatedSession.place_name,
          address: updatedSession.address,
          session_date: updatedSession.session_date,
          review: updatedSession.review
        })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchSessions();
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('skate_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      await fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const SessionForm = ({ 
    onSubmit, 
    initialValues = { 
      place_name: '', 
      address: '', 
      session_date: new Date().toISOString().slice(0, 16), 
      review: '' 
    },
    mode = 'add'
  }: {
    onSubmit: (session: Partial<Session>) => void;
    initialValues?: Partial<Session>;
    mode?: 'add' | 'edit';
  }) => {
    const [formData, setFormData] = useState(initialValues);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Place Name</label>
          <input
            type="text"
            value={formData.place_name}
            onChange={e => setFormData({ ...formData, place_name: e.target.value })}
            className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={formData.session_date?.slice(0, 16)}
            onChange={e => setFormData({ ...formData, session_date: e.target.value })}
            className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Review</label>
          <textarea
            value={formData.review || ''}
            onChange={e => setFormData({ ...formData, review: e.target.value })}
            className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white h-24 resize-none"
            placeholder="How was your session?"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2 rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            {mode === 'add' ? 'Add Session' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => mode === 'add' ? setIsAddingSession(false) : setEditingSession(null)}
            className="px-4 py-2 bg-gray-800/50 text-gray-400 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">My Sessions</h1>
              <p className="text-sm sm:text-base text-white/80">Track your skateboarding journey</p>
            </div>
            <button 
              onClick={() => setIsAddingSession(true)}
              className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              <Plus size={20} />
              Log New Session
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6 lg:mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="block w-full pl-10 bg-gray-900/50 border border-white/5 rounded-xl py-2.5 sm:py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-xl"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Sessions List */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sessions
              .filter(session => 
                session.place_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                session.review?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-white/5 hover:bg-gray-800/50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-white text-lg">{session.place_name}</h3>
                      {session.address && (
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {session.address}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSession(session)}
                        className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar size={14} />
                    {formatDate(session.session_date)}
                  </div>

                  {session.review && (
                    <p className="text-sm text-gray-400 line-clamp-3">{session.review}</p>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Add Session Modal */}
        {isAddingSession && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/90 rounded-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-400">
                    <CalendarDays size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Log New Session</h2>
                </div>
                <button
                  onClick={() => setIsAddingSession(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <SessionForm onSubmit={handleAddSession} mode="add" />
            </div>
          </div>
        )}

        {/* Edit Session Modal */}
        {editingSession && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/90 rounded-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Edit2 size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Edit Session</h2>
                </div>
                <button
                  onClick={() => setEditingSession(null)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <SessionForm
                onSubmit={(updatedSession) => handleEditSession(editingSession.id, updatedSession)}
                initialValues={editingSession}
                mode="edit"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions;