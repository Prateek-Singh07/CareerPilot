import { useState } from "react";
import axios from "axios";
import "./ResumeMatch.css";

function ResumeMatch() {

  const [file, setFile] = useState(null);

  const [jobDescription, setJobDescription] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const analyzeResume = async () => {

    if (!file) {
      alert("Please upload a resume.");
      return;
    }

    if (jobDescription.trim() === "") {
      alert("Please enter a job description.");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "job_description",
        jobDescription
      );

      const res = await axios.post(
        "http://127.0.0.1:8000/resume-match",
        formData
      );

      setResult(res.data);

    } catch (err) {

      console.error(err);

      alert("Failed to analyze resume.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="resume-match">

      <h1>📄 Resume Match Analyzer</h1>

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <br /><br />

      <textarea

        rows="10"

        placeholder="Paste Job Description Here..."

        value={jobDescription}

        onChange={(e)=>setJobDescription(e.target.value)}

      />

      <br /><br />

      <button
        onClick={analyzeResume}
      >

        {loading
          ? "Analyzing..."
          : "Analyze Resume"}

      </button>

      {result && (

        <div className="result-card">

          <h2>

            Resume Match

          </h2>

          <h1>

            {result.match_percentage}%

          </h1>

          <div className="progress">

            <div

              className="progress-fill"

              style={{
                width:`${result.match_percentage}%`
              }}

            />

          </div>

          <h3>✅ Strengths</h3>

          <ul>

            {result.strengths.map((item,index)=>(

              <li key={index}>{item}</li>

            ))}

          </ul>

          <h3>❌ Missing Skills</h3>

          <ul>

            {result.missing_skills.map((item,index)=>(

              <li key={index}>{item}</li>

            ))}

          </ul>

          <h3>💡 Suggestions</h3>

          <ul>

            {result.suggestions.map((item,index)=>(

              <li key={index}>{item}</li>

            ))}

          </ul>

        </div>

      )}

    </div>

  );

}

export default ResumeMatch;