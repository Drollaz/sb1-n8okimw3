import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, MapPin, Settings, Edit3, Plus, Keyboard as Skateboard, Ruler, Wrench, Circle, X, Camera } from 'lucide-react';
import { Map, Marker } from 'pigeon-maps';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ProfileData = Database['public']['Tables']['profiles']['Row'];

function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function calculateSkatingDuration(startDate: string | null): string {
  if (!startDate) return '0 months';
  const start = new Date(startDate);
  const today = new Date();
  
  const years = today.getFullYear() - start.getFullYear();
  const months = today.getMonth() - start.getMonth();
  
  let adjustedYears = years;
  let adjustedMonths = months;
  
  if (months < 0) {
    adjustedYears = years - 1;
    adjustedMonths = months + 12;
  }
  
  if (adjustedYears === 0) {
    return `${adjustedMonths} months`;
  } else if (adjustedMonths === 0) {
    return `${adjustedYears} years`;
  } else {
    return `${adjustedYears} years, ${adjustedMonths} months`;
  }
}

const spots = [
  {
    name: "Downtown Plaza",
    address: "123 Main St, Los Angeles",
    lastVisited: "2 days ago",
    coordinates: [34.0522, -118.2437]
  },
  {
    name: "Westside Skatepark",
    address: "456 Park Ave, Los Angeles",
    lastVisited: "1 week ago",
    coordinates: [34.0511, -118.2680]
  },
  {
    name: "School Yard",
    address: "789 School St, Los Angeles",
    lastVisited: "2 weeks ago",
    coordinates: [34.0488, -118.2518]
  }
];

function Profile() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfileData(data);
      if (data?.avatar_url) {
        setProfileImage(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        // Upload image to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setProfileImage(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get('name') as string,
      date_of_birth: formData.get('dateOfBirth') as string,
      hometown: formData.get('hometown') as string,
      stance: formData.get('stance') as string,
      skating_since: formData.get('skatingSince') as string,
      total_sessions: parseInt(formData.get('totalSessions') as string),
      decks_used: parseInt(formData.get('decksUsed') as string),
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile data
      await fetchProfile();
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Error loading profile</div>
      </div>
    );
  }

  const age = calculateAge(profileData.date_of_birth);
  const skatingDuration = calculateSkatingDuration(profileData.skating_since);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl cursor-pointer" onClick={handleImageClick}>
                <img
                  src={profileImage || "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&q=80&w=200&h=200"}
                  alt="Profile"
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profileData.full_name || 'Add your name'}</h1>
              <div className="flex items-center gap-6 text-white/80">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  <User size={16} />
                  {age} years
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  <MapPin size={16} />
                  {profileData.hometown || 'Add hometown'}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  <Skateboard size={16} />
                  {profileData.stance || 'Add stance'} Stance
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="p-3 rounded-xl hover:bg-white/10 text-white/90 transition-all"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="mt-8 grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/5">
            <div className="text-indigo-400 font-medium mb-1">Skating Since</div>
            <div className="text-white text-2xl font-bold">{skatingDuration}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/5">
            <div className="text-indigo-400 font-medium mb-1">Total Skate Sessions</div>
            <div className="text-white text-2xl font-bold">{profileData.total_sessions}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/5">
            <div className="text-indigo-400 font-medium mb-1">Decks Used</div>
            <div className="text-white text-2xl font-bold">{profileData.decks_used}</div>
          </div>
        </div>

        {/* Recent Spots */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/5 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Spots</h2>
            <button className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors">
              <Plus size={16} />
              Add Spot
            </button>
          </div>
          
          {/* Map Section */}
          <div className="mb-6 rounded-xl overflow-hidden h-[300px] border border-white/5">
            <Map 
              defaultCenter={[34.0522, -118.2437]} 
              defaultZoom={12}
              attribution={false}
              metaWheelZoom={true}
              twoFingerDrag={false}
            >
              {spots.map((spot, index) => (
                <Marker 
                  key={index}
                  width={50}
                  anchor={[spot.coordinates[0], spot.coordinates[1]]}
                  color="#818cf8"
                />
              ))}
            </Map>
          </div>

          {/* Spots List */}
          <div className="space-y-4">
            {spots.map((spot, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/50 border border-white/5 hover:bg-gray-800/80 transition-colors cursor-pointer">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <MapPin size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{spot.name}</div>
                  <div className="text-sm text-gray-400 truncate">{spot.address}</div>
                </div>
                <div className="text-sm text-gray-500">{spot.lastVisited}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/90 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={profileData.full_name || ''}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  defaultValue={profileData.date_of_birth || ''}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hometown</label>
                <input
                  name="hometown"
                  defaultValue={profileData.hometown || ''}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stance</label>
                <select
                  name="stance"
                  defaultValue={profileData.stance || ''}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                >
                  <option value="">Select stance</option>
                  <option value="Regular">Regular</option>
                  <option value="Goofy">Goofy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Skating Since</label>
                <input
                  name="skatingSince"
                  type="date"
                  defaultValue={profileData.skating_since || ''}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total Sessions</label>
                <input
                  name="totalSessions"
                  type="number"
                  defaultValue={profileData.total_sessions}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Decks Used</label>
                <input
                  name="decksUsed"
                  type="number"
                  defaultValue={profileData.decks_used}
                  className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all mt-6"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;