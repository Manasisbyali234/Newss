function SectionLocation({ employer }) {
    const getMapSrc = () => {
        if (employer?.googleMapsEmbed) {
            const srcMatch = employer.googleMapsEmbed.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
                return srcMatch[1];
            }
        }
        // Fallback to MetroMindz map if no employer map is available
        return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.560631073671!2d77.58906297454797!3d13.063615412855306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3d6f9cd4840b%3A0xba4c05660b9a5961!2sMetroMindz%20Software%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1753869083346!5m2!1sen!2sin";
    };

    return (
        <>
            <h4 className="section-head-small mb-4">Location</h4>
            <div className="twm-s-map-iframe">
                <iframe 
                    height={270} 
                    src={getMapSrc()}
                    style={{border: 0, width: '100%'}}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </>
    )
}

export default SectionLocation;
