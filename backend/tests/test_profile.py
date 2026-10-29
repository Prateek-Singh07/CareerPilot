"""Tests for the Personalized Career Profile API endpoints."""

import pytest
from app.auth import get_password_hash, create_access_token
from app.models.user import User


def test_get_profile_unauthenticated(client):
    """GET /api/profile requires authentication."""
    response = client.get("/api/profile")
    assert response.status_code == 401


def test_put_profile_unauthenticated(client):
    """PUT /api/profile requires authentication."""
    payload = {
        "target_role": "Backend Engineer",
        "current_skills": ["Python", "FastAPI"],
        "experience_level": "Intermediate",
        "weekly_hours": 12,
        "career_goals": "Master async backend development",
    }
    response = client.put("/api/profile", json=payload)
    assert response.status_code == 401


def test_get_profile_empty_for_new_user(client, auth_headers):
    """GET /api/profile returns profile=None for a user without a saved profile."""
    response = client.get("/api/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data == {"profile": None}


def test_create_and_get_profile(client, auth_headers):
    """PUT /api/profile creates a new profile and GET retrieves it."""
    payload = {
        "target_role": "Software Development Engineer",
        "current_skills": ["Python", "React", "Docker"],
        "experience_level": "Beginner",
        "weekly_hours": 15,
        "career_goals": "Land an SDE internship at a top tech company.",
    }

    create_res = client.put("/api/profile", json=payload, headers=auth_headers)
    assert create_res.status_code == 200
    body = create_res.json()
    assert body["message"] == "Career profile saved successfully"
    profile = body["profile"]
    assert profile["target_role"] == "Software Development Engineer"
    assert profile["current_skills"] == ["Python", "React", "Docker"]
    assert profile["experience_level"] == "Beginner"
    assert profile["weekly_hours"] == 15
    assert profile["career_goals"] == "Land an SDE internship at a top tech company."
    assert profile["created_at"] is not None
    assert profile["updated_at"] is not None

    # Fetch with GET
    get_res = client.get("/api/profile", headers=auth_headers)
    assert get_res.status_code == 200
    fetched = get_res.json()["profile"]
    assert fetched["id"] == profile["id"]
    assert fetched["target_role"] == "Software Development Engineer"
    assert fetched["current_skills"] == ["Python", "React", "Docker"]


def test_update_profile(client, auth_headers):
    """PUT /api/profile updates existing profile instead of creating duplicates."""
    initial = {
        "target_role": "Junior Developer",
        "current_skills": ["HTML", "CSS"],
        "experience_level": "Beginner",
        "weekly_hours": 8,
        "career_goals": "Learn JavaScript",
    }
    client.put("/api/profile", json=initial, headers=auth_headers)

    updated = {
        "target_role": "Frontend Developer",
        "current_skills": ["HTML", "CSS", "JavaScript", "TypeScript"],
        "experience_level": "Intermediate",
        "weekly_hours": 20,
        "career_goals": "Build full stack React applications",
    }
    res = client.put("/api/profile", json=updated, headers=auth_headers)
    assert res.status_code == 200
    p = res.json()["profile"]
    assert p["target_role"] == "Frontend Developer"
    assert p["experience_level"] == "Intermediate"
    assert p["weekly_hours"] == 20
    assert len(p["current_skills"]) == 4

    # Ensure only 1 profile exists
    get_res = client.get("/api/profile", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["profile"]["target_role"] == "Frontend Developer"


def test_post_alias_works(client, auth_headers):
    """POST /api/profile works as an alias to PUT."""
    payload = {
        "target_role": "Data Analyst",
        "current_skills": ["SQL", "Pandas"],
        "experience_level": "Beginner",
        "weekly_hours": 10,
        "career_goals": "Learn data visualization",
    }
    res = client.post("/api/profile", json=payload, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["profile"]["target_role"] == "Data Analyst"


def test_validation_weekly_hours_range(client, auth_headers):
    """Pydantic rejects weekly_hours outside 1..80."""
    payload_too_low = {
        "target_role": "DevOps Engineer",
        "current_skills": ["Linux"],
        "experience_level": "Beginner",
        "weekly_hours": 0,
        "career_goals": "",
    }
    res_low = client.put("/api/profile", json=payload_too_low, headers=auth_headers)
    assert res_low.status_code == 422

    payload_too_high = {
        "target_role": "DevOps Engineer",
        "current_skills": ["Linux"],
        "experience_level": "Beginner",
        "weekly_hours": 81,
        "career_goals": "",
    }
    res_high = client.put("/api/profile", json=payload_too_high, headers=auth_headers)
    assert res_high.status_code == 422


def test_validation_target_role_length(client, auth_headers):
    """Rejects empty or single-character target role."""
    payload = {
        "target_role": "A",
        "current_skills": ["Git"],
        "experience_level": "Beginner",
        "weekly_hours": 5,
        "career_goals": "",
    }
    res = client.put("/api/profile", json=payload, headers=auth_headers)
    assert res.status_code in (400, 422)


def test_skills_deduplication_and_trimming(client, auth_headers):
    """Duplicates and extra whitespace in skills are cleaned automatically."""
    payload = {
        "target_role": "Python Developer",
        "current_skills": [" Python ", "python", "PYTHON", "FastAPI", "  FastAPI  ", ""],
        "experience_level": "Intermediate",
        "weekly_hours": 10,
        "career_goals": "",
    }
    res = client.put("/api/profile", json=payload, headers=auth_headers)
    assert res.status_code == 200
    skills = res.json()["profile"]["current_skills"]
    assert skills == ["Python", "FastAPI"]


def test_user_isolation(client, db, auth_headers):
    """Users cannot access or modify each other's career profiles."""
    # 1. Demo user creates a profile
    demo_payload = {
        "target_role": "Demo Role",
        "current_skills": ["DemoSkill"],
        "experience_level": "Beginner",
        "weekly_hours": 5,
        "career_goals": "Demo User's private goal",
    }
    res1 = client.put("/api/profile", json=demo_payload, headers=auth_headers)
    assert res1.status_code == 200

    # 2. Register a second user 'seconduser' and generate token
    second_user = User(
        email="second@careerpilot.ai",
        username="seconduser",
        hashed_password=get_password_hash("Secret@123"),
    )
    db.add(second_user)
    db.commit()

    second_token = create_access_token(data={"sub": str(second_user.id)})
    second_headers = {"Authorization": f"Bearer {second_token}"}

    # 3. Second user initially has no profile
    res2 = client.get("/api/profile", headers=second_headers)
    assert res2.status_code == 200
    assert res2.json() == {"profile": None}

    # 4. Second user creates their own profile
    second_payload = {
        "target_role": "Second Role",
        "current_skills": ["SecondSkill"],
        "experience_level": "Advanced",
        "weekly_hours": 25,
        "career_goals": "Second User's private goal",
    }
    res3 = client.put("/api/profile", json=second_payload, headers=second_headers)
    assert res3.status_code == 200
    assert res3.json()["profile"]["target_role"] == "Second Role"

    # 5. Demo user retrieves their profile - it is unaffected
    res4 = client.get("/api/profile", headers=auth_headers)
    assert res4.status_code == 200
    assert res4.json()["profile"]["target_role"] == "Demo Role"
    assert res4.json()["profile"]["current_skills"] == ["DemoSkill"]
