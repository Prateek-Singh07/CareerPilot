import pytest
from app.models.roadmap import CareerRoadmapDB


def test_roadmap_requires_auth(client):
    res = client.post("/api/roadmap", json={"target_role": "Frontend Developer"})
    assert res.status_code == 401


def test_roadmap_rejects_empty_role(client, auth_headers):
    res = client.post(
        "/api/roadmap",
        headers=auth_headers,
        json={"target_role": "   ", "hours_per_week": 10}
    )
    # Pydantic or endpoint rejects with 422 or 400
    assert res.status_code in (400, 422)


def test_roadmap_generation_and_persistence(client, auth_headers, db, demo_user, monkeypatch):
    mock_roadmap = {
        "target_role": "Full Stack Engineer",
        "skill_level": "Intermediate",
        "timeline": "14 Weeks (15 hrs/week)",
        "overview": "A comprehensive roadmap from fundamentals to scalable distributed apps.",
        "recommended_next_action": "Build a multi-container Docker compose environment.",
        "stages": [
            {
                "stage_number": 1,
                "title": "Backend Architecture & Microservices",
                "duration": "Weeks 1-4",
                "description": "Deep dive into FastAPI, SQLAlchemy, and Redis caching.",
                "skills": ["FastAPI", "SQLAlchemy", "PostgreSQL", "Redis"],
                "projects": [
                    {
                        "name": "E-Commerce Microservice",
                        "description": "Async order management system with JWT auth and rate limiting."
                    }
                ],
                "milestones": ["Built production-ready API with >80% test coverage"]
            },
            {
                "stage_number": 2,
                "title": "Frontend Integration & Cloud Deployment",
                "duration": "Weeks 5-8",
                "description": "React SPA with state management and containerized CI/CD.",
                "skills": ["React 19", "TypeScript", "Docker", "GitHub Actions"],
                "projects": [
                    {
                        "name": "Cloud Portfolio Dashboard",
                        "description": "Full-stack dashboard with real-time metrics and SSL deployment."
                    }
                ],
                "milestones": ["Continuous integration pipeline deploying to production"]
            }
        ]
    }

    monkeypatch.setattr(
        "app.api.roadmap.generate_career_roadmap",
        lambda target_role, skill_level, existing_skills, hours_per_week: mock_roadmap
    )

    # 1. Generate roadmap
    res = client.post(
        "/api/roadmap",
        headers=auth_headers,
        json={
            "target_role": "Full Stack Engineer",
            "skill_level": "Intermediate",
            "existing_skills": "Python, basic React, SQL",
            "hours_per_week": 15
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["target_role"] == "Full Stack Engineer"
    assert len(data["stages"]) == 2
    assert data["id"] is not None

    # 2. Verify in SQLite DB
    db_record = db.query(CareerRoadmapDB).filter(CareerRoadmapDB.id == data["id"]).first()
    assert db_record is not None
    assert db_record.user_id == demo_user.id
    assert db_record.hours_per_week == 15
    assert len(db_record.get_roadmap()["stages"]) == 2

    # 3. Test GET /api/roadmap/latest
    res_latest = client.get("/api/roadmap/latest", headers=auth_headers)
    assert res_latest.status_code == 200
    latest_data = res_latest.json()["roadmap"]
    assert latest_data is not None
    assert latest_data["target_role"] == "Full Stack Engineer"

    # 4. Test GET /api/roadmap/history
    res_hist = client.get("/api/roadmap/history", headers=auth_headers)
    assert res_hist.status_code == 200
    hist_data = res_hist.json()
    assert hist_data["total"] >= 1
    assert hist_data["roadmaps"][0]["target_role"] == "Full Stack Engineer"

