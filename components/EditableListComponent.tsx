import React, { useState } from 'react';
import { PlusIcon, Trash2Icon } from './Icons';

interface EditableListComponentProps {
    items: string[];
    onItemsChange: (newItems: string[]) => void;
}

const EditableListComponent: React.FC<EditableListComponentProps> = ({ items, onItemsChange }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            onItemsChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (indexToRemove: number) => {
        onItemsChange(items.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {items.length > 0 ? items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                        <span>{item}</span>
                        <button onClick={() => handleRemoveItem(index)} className="text-gray-500 hover:text-red-500">
                            <Trash2Icon className="w-4 h-4" />
                        </button>
                    </div>
                )) : <p className="text-sm text-gray-500">No items listed.</p>}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add new item..."
                    className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                />
                <button
                    onClick={handleAddItem}
                    className="bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 flex items-center justify-center"
                    aria-label="Add item"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default EditableListComponent;
