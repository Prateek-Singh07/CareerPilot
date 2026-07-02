class InterviewSession:

    def __init__(self):
        self.reset()

    def reset(self):
        self.questions = []
        self.answers = []
        self.feedbacks = []
        self.scores = []
        self.current_question = 0

    def load_questions(self, questions):
        self.reset()
        self.questions = questions

    def get_next_question(self):

        if self.current_question >= len(self.questions):
            return None

        question = self.questions[self.current_question]
        self.current_question += 1

        return question

    def save_answer(self, answer):
        self.answers.append(answer)

    def save_feedback(self, feedback):
        self.feedbacks.append(feedback)

        if isinstance(feedback, dict) and "score" in feedback:
            self.scores.append(feedback["score"])

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
    "scores": self.scores
}


interview = InterviewSession()