"""
Test Suite — Company Analyzer Factual Extraction & Zero Fabrication
"""
import asyncio
from backend.services.company_analyzer import (
    analyze_company,
    _resolve_company_entity,
    _extract_wikipedia_facts,
    _deterministic_factual_synthesis,
    _COMPANY_CACHE,
)


def test_wikipedia_entity_resolution_phonepe():
    """Verify that PhonePe resolves accurately to the Indian fintech enterprise."""
    entity, candidates = asyncio.run(_resolve_company_entity("PhonePe"))
    assert entity["page_title"] == "PhonePe"
    assert "fintech" in entity["extract"].lower() or "payments" in entity["extract"].lower() or "financial" in entity["extract"].lower()


def test_wikipedia_infobox_facts_tcs():
    """Verify that TCS extracts verified ticker, founding year, and parent company."""
    facts = asyncio.run(_extract_wikipedia_facts("Tata Consultancy Services"))
    assert facts.get("founded_year") == "1968"
    assert "Tata Group" in facts.get("parent", "")
    assert "TCS" in facts.get("ticker", "")
    assert facts.get("company_type") == "Public Company"


def test_wikipedia_infobox_facts_google():
    """Verify that Google extracts Alphabet Inc. parent company."""
    facts = asyncio.run(_extract_wikipedia_facts("Google"))
    assert facts.get("founded_year") == "1998"
    assert "Alphabet" in facts.get("parent", "")


def test_careers_portal_formatting():
    """Verify that careers URLs are constructed and validated."""
    res = asyncio.run(analyze_company("Tata Consultancy Services"))
    assert "careers" in res["careers_url"].lower() or "tcs.com" in res["careers_url"].lower()
    assert res["data_status"] == "verified"
    assert "hiring_skills" in res
    assert len(res["hiring_skills"]) > 0


def test_company_caching():
    """Verify that subsequent analyses hit the in-memory cache."""
    # First call primes cache
    res1 = asyncio.run(analyze_company("Infosys"))
    assert "INFY" in res1.get("ticker", "")

    # Second call should return immediately from cache
    res2 = asyncio.run(analyze_company("Infosys"))
    assert res1["company_name"] == res2["company_name"]
    assert res1["founded_year"] == res2["founded_year"]


def test_zero_fabrication_on_unknown():
    """Verify that unknown company returns 'Data unavailable' / 'Unavailable' rather than fabricated numbers."""
    res = _deterministic_factual_synthesis(
        "NonExistentCompanyXYZ999",
        {},
        {"extract": ""},
        "Unavailable",
        "https://www.google.com/search?q=NonExistentCompanyXYZ999",
        {"hiring_skills": [], "common_roles": []},
        [],
    )
    assert res["founded_year"] == "Unavailable"
    assert res["employee_count"] == "Unavailable"
    assert res["revenue"] == "Unavailable"
    assert res["ticker"] is None
