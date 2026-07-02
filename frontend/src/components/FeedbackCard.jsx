import "./FeedbackCard.css";

function FeedbackCard({
  feedback,
  averageScore,
  nextQuestion,
}) {
  const Metric = ({ title, value }) => (
    <>
      <h3>{title}</h3>

      <div className="metric-bar">

        <div
          className="metric-fill"
          style={{
            width: `${value * 10}%`,
          }}
        />

      </div>

      <p>{value}/10</p>
    </>
  );

  return (
    <div className="card fade">

      <h2>🤖 AI Feedback</h2>

      <h3>
        📊 Average Score : {averageScore}/10
      </h3>

      <Metric
        title="⭐ Overall Score"
        value={feedback.score}
      />

      <Metric
        title="🗣 Communication"
        value={feedback.communication}
      />

      <Metric
        title="🧠 Technical Knowledge"
        value={feedback.technical_knowledge}
      />

      <Metric
        title="💪 Confidence"
        value={feedback.confidence}
      />

      <Metric
        title="📖 Grammar"
        value={feedback.grammar}
      />

      <Metric
        title="🧩 Problem Solving"
        value={feedback.problem_solving}
      />

      <Metric
        title="✅ Completeness"
        value={feedback.answer_completeness}
      />

      <Metric
        title="🤝 Professionalism"
        value={feedback.professionalism}
      />

      <h3>✅ Strengths</h3>

      <ul className="feedback-list">
        {feedback.strengths.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3>❌ Weaknesses</h3>

      <ul className="feedback-list">
        {feedback.weaknesses.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3>💡 Suggestions</h3>

      <ul className="feedback-list">
        {feedback.suggestions.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <button onClick={nextQuestion}>
        Next Question →
      </button>

    </div>
  );
}

export default FeedbackCard;