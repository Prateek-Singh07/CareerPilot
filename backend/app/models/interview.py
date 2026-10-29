"""Interview session models - both in-memory session and DB persistence.

Session state is isolated per authenticated user via InterviewSessionManager.
"""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class InterviewSessionDB(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    total_questions = Column(Integer, default=0)
    questions_json = Column(Text, default="[]")
    answers_json = Column(Text, default="[]")
    feedbacks_json = Column(Text, default="[]")
    scores_json = Column(Text, default="[]")
    current_question = Column(Integer, default=0)
    completed = Column(Integer, default=0)
    is_demo = Column(Integer, default=0)

    user = relationship("User")

    def get_questions(self) -> list:
        return json.loads(self.questions_json) if self.questions_json else []

    def get_answers(self) -> list:
        return json.loads(self.answers_json) if self.answers_json else []

    def get_feedbacks(self) -> list:
        return json.loads(self.feedbacks_json) if self.feedbacks_json else []

    def get_scores(self) -> list:
        return json.loads(self.scores_json) if self.scores_json else []


class InterviewSession:
    """In-memory interview state for a single session."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.questions = []
        self.answers = []
        self.feedbacks = []
        self.scores = []
        self.current_question = 0
        self.db_session_id = None
        self.is_demo = False

    def load_questions(self, questions: list, is_demo: bool = False):
        self.reset()
        self.questions = list(questions)
        self.is_demo = is_demo

    def get_next_question(self):
        if self.current_question >= len(self.questions):
            return None
        question = self.questions[self.current_question]
        self.current_question += 1
        return question

    def save_answer(self, answer: str):
        """Save or update the answer for the current question to prevent duplicates on retries."""
        idx = max(0, self.current_question - 1)
        if idx < len(self.answers):
            self.answers[idx] = answer
        else:
            self.answers.append(answer)

    def save_feedback(self, feedback: dict):
        """Save or update feedback and extract score for the current question."""
        idx = max(0, self.current_question - 1)
        score = feedback.get("score") if isinstance(feedback, dict) else None

        if idx < len(self.feedbacks):
            self.feedbacks[idx] = feedback
            if score is not None and idx < len(self.scores):
                self.scores[idx] = score
        else:
            self.feedbacks.append(feedback)
            if score is not None:
                self.scores.append(score)

    def average_score(self):
        if len(self.scores) == 0:
            return 0
        return round(sum(self.scores) / len(self.scores), 2)

    def summary(self):
        return {
            "questions_answered": len(self.answers),
            "total_questions": len(self.questions),
            "average_score": self.average_score(),
            "questions": self.questions,
            "answers": self.answers,
            "feedbacks": self.feedbacks,
            "scores": self.scores,
            "is_demo": self.is_demo,
        }

    def persist_to_db(self, user_id: int):
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            is_completed = 1 if len(self.questions) > 0 and len(self.answers) >= len(self.questions) else 0
            if self.db_session_id:
                rec = db.query(InterviewSessionDB).filter_by(id=self.db_session_id).first()
                if rec:
                    rec.answers_json = json.dumps(self.answers)
                    rec.feedbacks_json = json.dumps(self.feedbacks)
                    rec.scores_json = json.dumps(self.scores)
                    rec.current_question = self.current_question
                    rec.completed = is_completed
                    rec.is_demo = 1 if self.is_demo else 0
                    db.commit()
                    return

            rec = InterviewSessionDB(
                user_id=user_id,
                total_questions=len(self.questions),
                questions_json=json.dumps(self.questions),
                answers_json=json.dumps(self.answers),
                feedbacks_json=json.dumps(self.feedbacks),
                scores_json=json.dumps(self.scores),
                current_question=self.current_question,
                completed=is_completed,
                is_demo=1 if self.is_demo else 0,
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
            self.db_session_id = rec.id
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()


class InterviewSessionManager:
    """Manages isolated InterviewSession instances per authenticated user."""

    def __init__(self):
        self._sessions: dict[int, InterviewSession] = {}

    def get_session(self, user_id: int) -> InterviewSession:
        if user_id not in self._sessions:
            sess = InterviewSession()
            # Restore state from database if available
            self._restore_from_db(user_id, sess)
            self._sessions[user_id] = sess
        return self._sessions[user_id]

    def _restore_from_db(self, user_id: int, sess: InterviewSession):
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            rec = (
                db.query(InterviewSessionDB)
                .filter_by(user_id=user_id)
                .order_by(InterviewSessionDB.id.desc())
                .first()
            )
            if rec and rec.questions_json:
                sess.questions = rec.get_questions()
                sess.answers = rec.get_answers()
                sess.feedbacks = rec.get_feedbacks()
                sess.scores = rec.get_scores()
                sess.current_question = rec.current_question or len(sess.answers)
                sess.db_session_id = rec.id
                sess.is_demo = bool(getattr(rec, "is_demo", 0))
        except Exception:
            pass
        finally:
            db.close()

    def clear_session(self, user_id: int):
        if user_id in self._sessions:
            del self._sessions[user_id]


session_manager = InterviewSessionManager()
