import "./LoadingScreen.css";

function LoadingScreen({ text }) {
  return (
    <div className="loading-screen fade">
      <div className="spinner"></div>

      <h2>{text}</h2>

      <p>
        Please wait while Gemini AI processes your request...
      </p>
    </div>
  );
}

export default LoadingScreen;