import { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, className }) => {
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

    const selected = options.find(opt => opt.value === value);

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div 
                className={className}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer' }}
            >
                {selected ? selected.label : placeholder}
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
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #dee2e6' }}
                        autoFocus
                    />
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {filtered.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    backgroundColor: opt.value === value ? '#f8f9fa' : '#fff'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = opt.value === value ? '#f8f9fa' : '#fff'}
                            >
                                {opt.label}
                            </div>
                        ))}
                        {filtered.length === 0 && (
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
