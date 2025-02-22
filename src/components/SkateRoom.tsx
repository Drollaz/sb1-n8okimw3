import React, { useState, useEffect } from 'react';
import { Plus, Search, ChevronRight, Keyboard as Skateboard, Wrench, Circle, Ruler, Grip, PenTool as Tool, X, Edit2, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type GearCategory = Database['public']['Enums']['gear_category'];
type UsageStatus = Database['public']['Enums']['usage_status'];
type ConditionStatus = Database['public']['Enums']['condition_status'];

type BaseGear = Database['public']['Tables']['skate_gear']['Row'];
type DeckDetails = Database['public']['Tables']['deck_details']['Row'];
type TruckDetails = Database['public']['Tables']['truck_details']['Row'];
type WheelDetails = Database['public']['Tables']['wheel_details']['Row'];
type BearingDetails = Database['public']['Tables']['bearing_details']['Row'];
type GriptapeDetails = Database['public']['Tables']['griptape_details']['Row'];
type ToolDetails = Database['public']['Tables']['tool_details']['Row'];

type GearWithDetails = BaseGear & {
  details?: DeckDetails | TruckDetails | WheelDetails | BearingDetails | GriptapeDetails | ToolDetails;
};

type Category = {
  name: string;
  icon: React.ElementType;
  type: GearCategory;
  count: number;
  items: GearWithDetails[];
};

const DECK_SIZES = ['<7.5', '7.5', '7.75', '7.875', '8', '8.125', '8.25', '8.375', '8.5', '>8.5'];
const USAGE_STATUS: UsageStatus[] = ['Yes', 'No', 'Stock'];
const CONDITION_STATUS: ConditionStatus[] = ['New', 'Poor', 'Brooken'];

const initialCategories: Category[] = [
  { name: "Decks", icon: Skateboard, type: 'deck', count: 0, items: [] },
  { name: "Trucks", icon: Wrench, type: 'truck', count: 0, items: [] },
  { name: "Wheels", icon: Circle, type: 'wheel', count: 0, items: [] },
  { name: "Bearings", icon: Ruler, type: 'bearing', count: 0, items: [] },
  { name: "Griptape", icon: Grip, type: 'griptape', count: 0, items: [] },
  { name: "Tools", icon: Tool, type: 'tool', count: 0, items: [] }
];

function SkateRoom() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<{ item: GearWithDetails; categoryName: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGear();
    }
  }, [user]);

  const fetchGear = async () => {
    if (!user) return;

    try {
      // Fetch all gear
      const { data: gearData, error: gearError } = await supabase
        .from('skate_gear')
        .select('*')
        .eq('user_id', user.id);

      if (gearError) throw gearError;

      // Reset categories with fresh copies
      const updatedCategories = initialCategories.map(category => ({
        ...category,
        items: [], // Reset items array
        count: 0   // Reset count
      }));

      for (const gear of gearData || []) {
        const category = updatedCategories.find(c => c.type === gear.category);
        if (!category) continue;

        // Fetch specific details based on category
        let details = null;
        const detailsTable = `${gear.category}_details`;
        
        const { data: detailsData, error: detailsError } = await supabase
          .from(detailsTable)
          .select('*')
          .eq('gear_id', gear.id)
          .maybeSingle(); // Use maybeSingle() instead of single()

        if (detailsError) {
          console.warn(`Error fetching details for ${gear.category}:`, detailsError);
        } else {
          details = detailsData;
        }

        // Add the item even if details are null
        category.items.push({ 
          ...gear, 
          details: details || { 
            image_url: '',
            price: 0
          } 
        });
        category.count++;
      }

      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error fetching gear:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (categoryName: string, newItem: GearWithDetails) => {
    if (!user) return;

    try {
      // Insert base gear
      const { data: gearData, error: gearError } = await supabase
        .from('skate_gear')
        .insert([{
          user_id: user.id,
          category: newItem.category,
          name: newItem.name,
          specs: newItem.specs,
        }])
        .select()
        .single();

      if (gearError) throw gearError;

      // Insert category-specific details
      if (gearData && newItem.details) {
        const detailsTable = `${newItem.category}_details`;
        const { error: detailsError } = await supabase
          .from(detailsTable)
          .insert([{ 
            gear_id: gearData.id,
            image_url: newItem.details.image_url,
            price: newItem.details.price,
          }]);

        if (detailsError) throw detailsError;
      }

      // Refresh gear list
      await fetchGear();
      setIsAddingItem(false);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEditItem = async (categoryName: string, oldItem: GearWithDetails, updatedItem: GearWithDetails) => {
    if (!user) return;

    try {
      // Update base gear
      const { error: gearError } = await supabase
        .from('skate_gear')
        .update({
          name: updatedItem.name,
      
        })
        .eq('id', oldItem.id);

      if (gearError) throw gearError;

      // Update category-specific details
      if (updatedItem.details) {
        const detailsTable = `${oldItem.category}_details`;
        const { error: detailsError } = await supabase
          .from(detailsTable)
          .update({
            ...updatedItem.details,
            brand: updatedItem.details.brand,
            image_url: updatedItem.details.image_url
          })
          .eq('gear_id', oldItem.id);

        if (detailsError) throw detailsError;
      }

      // Refresh gear list
      await fetchGear();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (categoryName: string, itemToDelete: GearWithDetails) => {
    try {
      const { error } = await supabase
        .from('skate_gear')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // Refresh gear list
      await fetchGear();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const ItemForm = ({ 
    onSubmit, 
    initialValues = { 
      name: '', 
      specs: '',
      details: {
        brand: '',
        model: '',
        size: '',
        image_url: '',
        price: 0,
        currently_using: 'No' as UsageStatus,
        condition: 'New' as ConditionStatus,
        purchase_date: ''
      }
    },
    categoryName,
    mode = 'add'
  }: {
    onSubmit: (item: GearWithDetails) => void;
    initialValues?: GearWithDetails;
    categoryName: string;
    mode?: 'add' | 'edit';
  }) => {
    const [formData, setFormData] = useState(initialValues);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const renderCommonFields = () => {
      const details = formData.details || {};
      
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Brand *</label>
            <input
              type="text"
              value={details.brand || ''}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, brand: e.target.value }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Specifications (Optional)</label>
            <input
              type="text"
              value={formData.specs || ''}
              onChange={e => setFormData({ ...formData, specs: e.target.value })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            />
          </div>
        </>
      );
    };

    const renderDeckFields = () => {
      const details = formData.details || {};
      
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Model (Optional)</label>
            <input
              type="text"
              value={details.model || ''}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, model: e.target.value }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Size *</label>
            <select
              value={details.size || '8.0'}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, size: e.target.value }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
              required
            >
              {DECK_SIZES.map(size => (
                <option key={size} value={size}>{size}"</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Date (Optional)</label>
            <input
              type="date"
              value={details.purchase_date || ''}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, purchase_date: e.target.value }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            />
          </div>
        </>
      );
    };

    const renderWheelsFields = () => {
      const details = formData.details || {};
      
      return (
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Size (Optional)</label>
          <input
            type="text"
            value={details.size || ''}
            onChange={e => setFormData({
              ...formData,
              details: { ...details, size: e.target.value }
            })}
            className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
          />
        </div>
      );
    };

    const renderUsageAndCondition = () => {
      const details = formData.details || {};
      
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Currently Using *</label>
            <select
              value={details.currently_using || 'No'}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, currently_using: e.target.value as UsageStatus }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
              required
            >
              {USAGE_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Condition (Optional)</label>
            <select
              value={details.condition || 'New'}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, condition: e.target.value as ConditionStatus }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            >
              {CONDITION_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </>
      );
    };

    const renderOptionalFields = () => {
      const details = formData.details || {};
      
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={details.image_url || ''}
              onChange={e => setFormData({
                ...formData,
                details: { ...details, image_url: e.target.value }
              })}
              className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Price (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={details.price || ''}
                onChange={e => setFormData({
                  ...formData,
                  details: { ...details, price: parseFloat(e.target.value) }
                })}
                className="w-full pl-9 bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
              />
            </div>
          </div>
        </>
      );
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800/50 border border-white/5 rounded-xl py-2 px-3 text-white"
            required
          />
        </div>
        
        {renderCommonFields()}
        
        {categoryName === "Decks" && renderDeckFields()}
        {categoryName === "Wheels" && renderWheelsFields()}
        
        {categoryName !== "Tools" && renderUsageAndCondition()}
        
        {renderOptionalFields()}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2 rounded-xl font-medium hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            {mode === 'add' ? 'Add' : 'Save'} {categoryName.slice(0, -1)}
          </button>
          <button
            type="button"
            onClick={() => mode === 'add' ? setIsAddingItem(false) : setEditingItem(null)}
            className="px-4 py-2 bg-gray-800/50 text-gray-400 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const renderItemDetails = (item: GearWithDetails) => {
    const details = item.details || {};
    return (
      <>
        <h3 className="font-medium text-white">{item.name}</h3>
        {details.brand && <p className="text-sm text-gray-400">{details.brand}</p>}
        {item.specs && <p className="text-sm text-gray-500">{item.specs}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {details.price > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400">
              ${details.price}
            </span>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            details.currently_using === 'Yes' 
              ? 'bg-green-500/10 text-green-400'
              : details.currently_using === 'Stock'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-gray-500/10 text-gray-400'
          }`}>
            {details.currently_using}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            details.condition === 'New'
              ? 'bg-green-500/10 text-green-400'
              : details.condition === 'Poor'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-red-500/10 text-red-400'
          }`}>
            {details.condition}
          </span>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Skate Room</h1>
              <p className="text-sm sm:text-base text-white/80">Manage your skateboarding gear collection</p>
            </div>
            <button 
              onClick={() => setIsAddingItem(true)}
              className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              <Plus size={20} />
              Add New Item
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
            placeholder="Search your gear..."
            className="block w-full pl-10 bg-gray-900/50 border border-white/5 rounded-xl py-2.5 sm:py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-xl"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category)}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/5 hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                      <category.icon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">{category.name}</h3>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-400">{category.count} items</span>
                  <span className="text-xs sm:text-sm text-indigo-400">View all</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modals */}
        {isAddingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md my-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Add New Item</h2>
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Category Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-colors ${
                        selectedCategory?.name === category.name
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                          : 'bg-gray-800/50 border-white/5 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <category.icon size={18} className="sm:w-5 sm:h-5" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory && (
                <ItemForm
                  onSubmit={(newItem) => handleAddItem(selectedCategory.name, { ...newItem, category: selectedCategory.type })}
                  categoryName={selectedCategory.name}
                  mode="add"
                />
              )}
            </div>
          </div>
        )}

        {/* Selected Category Modal */}
        {selectedCategory && !isAddingItem && !editingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-400">
                    <selectedCategory.icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{selectedCategory.name}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setIsAddingItem(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-sm hover:bg-indigo-600 transition-colors"
                  >
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                    Add New
                  </button>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {selectedCategory.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/5 hover:bg-gray-800/80 transition-all group"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.details?.image_url || 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&q=80&w=200&h=200'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&q=80&w=200&h=200';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {renderItemDetails(item)}
                      </div>
                      <div className="flex flex-col gap-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem({ item, categoryName: selectedCategory.name });
                          }}
                          className="p-1.5 sm:p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <Edit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(selectedCategory.name, item);
                          }}
                          className="p-1.5 sm:p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          <X size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md my-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Edit2 size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Edit {editingItem.categoryName.slice(0, -1)}</h2>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <ItemForm
                onSubmit={(updatedItem) => handleEditItem(editingItem.categoryName, editingItem.item, updatedItem)}
                initialValues={editingItem.item}
                categoryName={editingItem.categoryName}
                mode="edit"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkateRoom;
