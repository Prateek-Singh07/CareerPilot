"""Deterministic, high-quality sample data for CareerPilot AI presentation demo mode.

Provides realistic fallback responses when Gemini API quota is exhausted or demo mode is active.
Sample data strictly matches the exact schemas expected by the frontend.
"""

from typing import List, Dict, Any


DEMO_INTERVIEW_QUESTIONS: List[str] = [
    "Can you explain the difference between synchronous and asynchronous execution in modern web backends, and when you would choose one over the other?",
    "How would you optimize a slow database query in PostgreSQL or MySQL when indexing alone is insufficient?",
    "Explain how JSON Web Tokens (JWT) work for stateless authentication, and how you prevent token replay or revocation issues.",
    "Describe your approach to designing a resilient RESTful API with proper HTTP status codes, validation, and error envelopes.",
    "What is the purpose of database connection pooling, and what happens if pool size is set too high or too low?",
    "How do you handle background tasks and long-running operations in FastAPI without blocking the main event loop?",
    "Describe the difference between horizontal and vertical scaling, and how stateful versus stateless application design impacts scalability.",
    "Explain the concept of database transactions and the ACID properties with a concrete e-commerce checkout example.",
    "How do you structure automated tests (unit, integration, and end-to-end) in a continuous integration pipeline?",
    "Suppose your production service experiences a sudden spike in 504 Gateway Timeout errors. What systematic steps do you take to isolate the root cause?",
]


def get_demo_interview_questions(resume_text: str = "") -> List[str]:
    """Return realistic, professional technical interview questions for demonstration."""
    return list(DEMO_INTERVIEW_QUESTIONS)


def get_demo_answer_evaluation(question: str, answer: str) -> Dict[str, Any]:
    """Return a realistic, constructive evaluation for a candidate's answer."""
    ans_length = len(answer.strip().split()) if answer else 0
    score = 8 if ans_length >= 20 else (6 if ans_length >= 8 else 4)

    return {
        "score": score,
        "communication": min(10, score + 1),
        "technical_knowledge": score,
        "confidence": score,
        "grammar": 9,
        "problem_solving": score,
        "answer_completeness": score,
        "professionalism": 9,
        "strengths": [
            "Clear technical terminology and articulate explanation of core concepts.",
            "Demonstrated practical understanding of system architecture tradeoffs.",
            "Structured response starting with definition followed by implementation context.",
        ],
        "weaknesses": [
            "Could include concrete metric examples (e.g. latency impact, throughput figures).",
            "Could elaborate on production edge cases such as network partition or timeout handling.",
        ],
        "suggestions": [
            "Quantify past engineering impact where possible (e.g. 'reduced query time by 40%').",
            "Reference specific operational monitoring tools (e.g. Prometheus, OpenTelemetry) to demonstrate end-to-end ownership.",
        ],
        "is_demo": True,
    }


def get_demo_resume_match(resume_text: str = "", job_description: str = "") -> Dict[str, Any]:
    """Return realistic ATS resume match analysis with skill gaps and recommendations."""
    return {
        "match_percentage": 84,
        "strengths": [
            "Strong core proficiency in Python, RESTful API design, and asynchronous frameworks.",
            "Hands-on experience with relational databases (PostgreSQL/SQLite) and query optimization.",
            "Familiarity with containerization (Docker) and modern Git version control workflows.",
            "Clean project structuring adhering to MVC and service-repository architecture patterns.",
        ],
        "missing_skills": [
            "Kubernetes container orchestration and Helm chart management in production.",
            "Distributed caching patterns using Redis Cluster or Memcached.",
            "Message queuing and event-driven architecture with RabbitMQ, Kafka, or AWS SQS.",
            "Comprehensive automated end-to-end testing with Playwright or Cypress.",
        ],
        "suggestions": [
            "Incorporate quantitative metrics into bullet points (e.g., 'Engineered REST endpoints serving 500+ requests/sec with sub-50ms latency').",
            "Explicitly highlight cloud infrastructure exposure (AWS/GCP/Azure) and automated CI/CD deployment pipelines.",
            "Add a dedicated 'DevOps & Tooling' section matching target job keywords such as Kubernetes, Redis, and Terraform.",
            "Emphasize unit test coverage and code quality practices in project descriptions.",
        ],
        "is_demo": True,
    }


def get_demo_career_roadmap(
    target_role: str = "Full Stack Developer",
    skill_level: str = "Beginner",
    existing_skills: str = "",
    hours_per_week: int = 10,
) -> Dict[str, Any]:
    """Return a comprehensive, realistic career learning roadmap for presentation demo."""
    role = target_role or "Full Stack Developer"
    total_weeks = max(8, int(200 / max(hours_per_week, 1)))

    return {
        "target_role": role,
        "skill_level": skill_level or "Beginner",
        "timeline": f"Estimated {total_weeks} Weeks ({hours_per_week} hrs/week)",
        "overview": (
            f"Comprehensive engineering roadmap designed to take you from {skill_level} to a job-ready {role}. "
            "Focuses on practical project implementation, architectural patterns, and production deployment."
        ),
        "recommended_next_action": "Set up a clean GitHub repository and complete Stage 1 foundational exercises.",
        "stages": [
            {
                "stage_number": 1,
                "title": "Core Foundations & Language Mastery",
                "duration": f"Weeks 1-{max(2, total_weeks // 4)}",
                "description": f"Master fundamental programming principles, data structures, and idiomatic idioms required for {role}.",
                "skills": [
                    "Data Structures & Algorithm Fundamentals",
                    "Modern Syntax & Asynchronous Programming",
                    "Git Version Control & Branching Workflows",
                    "Linux Command-Line & Environment Configuration",
                ],
                "projects": [
                    {
                        "name": "CLI Task & Workflow Manager",
                        "description": "Build an interactive command-line tool with persistent file/database storage, arguments parsing, and unit tests.",
                    }
                ],
                "milestones": [
                    "Achieve 80%+ test coverage on foundational project algorithms",
                    "Publish a well-documented repository with clean README and CI linting",
                ],
            },
            {
                "stage_number": 2,
                "title": "Backend Engineering & API Design",
                "duration": f"Weeks {total_weeks // 4 + 1}-{total_weeks // 2}",
                "description": "Build high-throughput REST APIs, database schemas, authentication, and secure endpoint access.",
                "skills": [
                    "RESTful API Architecture & Status Standards",
                    "Relational Database Design & Indexing (SQL)",
                    "JWT Authentication & Role-Based Access Control",
                    "Data Validation, Serialization & Error Handling",
                ],
                "projects": [
                    {
                        "name": "Multi-Tenant Resource Management API",
                        "description": "Develop a production-grade FastAPI service with PostgreSQL, SQLAlchemy ORM, rate limiting, and JWT auth.",
                    }
                ],
                "milestones": [
                    "Pass end-to-end integration test suite with SQLite/PostgreSQL",
                    "Generate interactive Swagger OpenAPI documentation",
                ],
            },
            {
                "stage_number": 3,
                "title": "Frontend Integration & State Management",
                "duration": f"Weeks {total_weeks // 2 + 1}-{int(total_weeks * 0.75)}",
                "description": "Construct reactive user interfaces that interface cleanly with backend APIs and handle complex application state.",
                "skills": [
                    "Component-Driven UI Design (React / TypeScript)",
                    "Client State Management & Context API",
                    "Responsive Styling, Dark Mode & Design Tokens",
                    "Asynchronous Data Fetching & Cache Synchronization",
                ],
                "projects": [
                    {
                        "name": "Interactive Analytics & Operations Portal",
                        "description": "Build a responsive dashboard featuring data visualizations, theme toggles, and live API synchronization.",
                    }
                ],
                "milestones": [
                    "Implement WCAG 2.1 AA accessible keyboard navigation and color contrast",
                    "Deploy a verified production build on Vercel/Netlify",
                ],
            },
            {
                "stage_number": 4,
                "title": "Cloud Deployment, CI/CD & Production Readiness",
                "duration": f"Weeks {int(total_weeks * 0.75) + 1}-{total_weeks}",
                "description": "Containerize services, configure continuous deployment pipelines, and prepare a presentation-ready portfolio.",
                "skills": [
                    "Docker Containerization & Multi-Stage Builds",
                    "GitHub Actions CI/CD Automated Pipelines",
                    "Cloud Platform Deployment (Render, AWS, or GCP)",
                    "Application Monitoring, Structured Logging & Health Probes",
                ],
                "projects": [
                    {
                        "name": "Production-Grade Capstone Deployment",
                        "description": "Deploy the complete full-stack platform with SSL encryption, custom domain, automated testing, and health checks.",
                    }
                ],
                "milestones": [
                    "Automated GitHub Actions pipeline running linting, tests, and build on push",
                    "Live production deployment with 99.9% uptime and public demonstration link",
                ],
            },
        ],
        "is_demo": True,
    }

