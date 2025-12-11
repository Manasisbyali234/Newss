import { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, className, isMulti = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleOptionClick = (optionValue) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter(v => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
        setSearch('');
    };

    const handleAddCustom = () => {
        if (search.trim() && !options.find(opt => opt.label.toLowerCase() === search.toLowerCase())) {
            if (isMulti) {
                const currentValues = Array.isArray(value) ? value : [];
                onChange([...currentValues, search.trim()]);
            } else {
                onChange(search.trim());
                setIsOpen(false);
            }
            setSearch('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        }
    };

    const removeValue = (valueToRemove) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            onChange(currentValues.filter(v => v !== valueToRemove));
        }
    };

    const renderValue = () => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.length === 0) {
                return <span className="text-muted">{placeholder}</span>;
            }
            return (
                <div className="d-flex flex-wrap gap-1">
                    {currentValues.map((val, index) => (
                        <span key={index} className="d-flex align-items-center" style={{border: '1px solid #ccc', borderRadius: '4px', padding: '2px 8px', fontSize: '0.875em', backgroundColor: 'transparent'}}>
                            {val}
                            <button
                                type="button"
                                className="btn-close ms-1"
                                style={{ 
                                    fontSize: '0.6em', 
                                    filter: 'invert(58%) sepia(69%) saturate(2618%) hue-rotate(16deg) brightness(101%) contrast(101%) !important',
                                    opacity: '1 !important',
                                    backgroundColor: 'transparent !important'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue(val);
                                }}
                            ></button>
                        </span>
                    ))}
                </div>
            );
        } else {
            const selected = options.find(opt => opt.value === value);
            return selected ? selected.label : placeholder;
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div 
                className={className}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', minHeight: '38px', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
            >
                {renderValue()}
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search or type to add..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onClick={(e) => e.stopPropagation()}
                        style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #dee2e6' }}
                        autoFocus
                    />
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {filtered.map(opt => {
                            const isSelected = isMulti 
                                ? Array.isArray(value) && value.includes(opt.value)
                                : opt.value === value;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => handleOptionClick(opt.value)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = isSelected ? '#e3f2fd' : '#fff'}
                                >
                                    {isMulti && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            style={{ marginRight: '8px' }}
                                        />
                                    )}
                                    {opt.label}
                                </div>
                            );
                        })}
                        {search.trim() && !options.find(opt => opt.label.toLowerCase() === search.toLowerCase()) && (
                            <div
                                onClick={handleAddCustom}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    backgroundColor: '#f8f9fa',
                                    borderTop: '1px solid #dee2e6',
                                    fontStyle: 'italic'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                            >
                                Add "{search.trim()}"
                            </div>
                        )}
                        {filtered.length === 0 && !search.trim() && (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#6c757d' }}>
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
