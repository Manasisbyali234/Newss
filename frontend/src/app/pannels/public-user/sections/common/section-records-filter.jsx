
function SectionRecordsFilter({ _config, onSortChange, onItemsPerPageChange, establishedYears = [] }) {
    const handleSortChange = (e) => {
        if (onSortChange) {
            onSortChange(e.target.value);
        }
    };

    const handleItemsPerPageChange = (e) => {
        if (onItemsPerPageChange) {
            const value = parseInt(e.target.value);
            onItemsPerPageChange(value);
        }
    };

    const isEmployerPage = _config.type === 'employers';

    return (
        <>
            <div className="product-filter-wrap d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <span className="woocommerce-result-count-left">
                    {
                        _config.prefix
                    }
                    {
                        _config.showRange ? (" 1-" + _config.showingUpto + " of ") : " "
                    }
                    {
                        _config.total + " " + _config.type
                    }
                </span>
                <form className="woocommerce-ordering twm-filter-select d-flex align-items-center gap-3" method="get">
                    <span className="woocommerce-result-count" style={{background: 'transparent', backgroundColor: 'transparent'}}>Sort By</span>
                    <select className="wt-select-bar-2 form-select" onChange={handleSortChange}>
                        {isEmployerPage ? (
                            <>
                                <option value="">Default</option>
                                <option value="companyName">Company Name A-Z</option>
                                <option value="-companyName">Company Name Z-A</option>
                                <option value="-establishedSince">Newest Companies</option>
                                <option value="establishedSince">Oldest Companies</option>
                            </>
                        ) : (
                            <>
                                <option value="Most Recent">Most Recent</option>
                                <option value="Oldest">Oldest</option>
                                <option value="Salary High to Low">Salary High to Low</option>
                                <option value="Salary Low to High">Salary Low to High</option>
                                <option value="A-Z">A-Z</option>
                                <option value="Z-A">Z-A</option>
                            </>
                        )}
                    </select>
                    <select className="wt-select-bar-2 form-select" onChange={handleItemsPerPageChange}>
                        <option value="10">Show 10</option>
                        <option value="20">Show 20</option>
                        <option value="30">Show 30</option>
                        <option value="40">Show 40</option>
                        <option value="50">Show 50</option>
                        <option value="60">Show 60</option>
                    </select>
                </form>
            </div>
        </>
    )
}

export default SectionRecordsFilter;
