import "./UploadSection.css";

function UploadSection({ setFile, uploadResume }) {
  return (
    <div className="upload-card">

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={uploadResume}>
        🚀 Upload Resume
      </button>

    </div>
  );
}

export default UploadSection;