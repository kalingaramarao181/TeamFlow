import "./index.css"

const Loader = () => {
    return (
        <div className="loading-container">
            <div className="loader-container">
                <div className="loader-gear"></div>
                <div className="loader-text">Loading Project Details...</div>
            </div>
        </div>
    );
};

export default Loader;
