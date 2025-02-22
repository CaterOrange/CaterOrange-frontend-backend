import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, Minus } from 'lucide-react';

const CollapsibleCart = ({ sortedData, handleRemove, handleIncrement, handleDecrement, handleQuantityChange }) => {
  const groupedItems = useMemo(() => {
    return sortedData.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
  }, [sortedData]);

  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categoryTotals = useMemo(() => {
    return Object.entries(groupedItems).reduce((acc, [category, items]) => {
      acc[category] = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return acc;
    }, {});
  }, [groupedItems]);

  return (
    <div className="flex flex-col space-y-6">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
          >
            <div className="flex items-center space-x-4">
              <h2 className="font-bold text-xl text-gray-900 font-serif">
                {category}
              </h2>
              <span className="text-sm text-gray-500">
                {/* ({items.length} {items.length === 1 ? 'item' : 'items'}) */}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-bold text-teal-700">
                ₹{categoryTotals[category].toLocaleString()}
              </span>
              {expandedCategories[category] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {expandedCategories[category] && (
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="relative p-4 hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="flex justify-between pr-8"> {/* Added right padding to make space for trash button */}
                    <div className="space-y-4 flex-grow">
                      <div>
                        <p className="text-sm text-gray-500">
                          Date: {item.date}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          className="text-teal-700 hover:text-teal-800 p-1 rounded-full hover:bg-teal-50 transition-colors duration-300"
                          onClick={() => handleDecrement(sortedData.indexOf(item))}
                        >
                          <Minus size={16} />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => handleQuantityChange(sortedData.indexOf(item), e.target.value, item.quantity)}
                          className="w-12 text-center border border-gray-200 rounded-md p-1 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />

                        <button
                          className="text-teal-700 hover:text-teal-800 p-1 rounded-full hover:bg-teal-50 transition-colors duration-300"
                          onClick={() => handleIncrement(sortedData.indexOf(item))}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right space-y-3">
                      <p className="text-gray-600">
                        ₹{item.price.toLocaleString()} per plate
                      </p>
                      <p className="font-bold text-xl text-teal-700">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-300"
                      onClick={() => handleRemove(sortedData.indexOf(item), item.quantity)}
                    >
                      <Trash2 size={20} className="hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CollapsibleCart;