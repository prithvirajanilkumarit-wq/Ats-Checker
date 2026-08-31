"""
Job Scraper Service — extract job descriptions from URLs
"""
import re
from typing import Optional, Dict, Any
from backend.utils.logger import get_logger
import httpx

logger = get_logger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


async def extract_job_from_url(url: str) -> Dict[str, Any]:
    """
    Attempt to extract job description from a URL.
    Supports: LinkedIn, Naukri, Indeed, Foundit, Generic pages.
    """
    logger.info(f"Attempting job extraction from: {url}")

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            html = response.text
    except Exception as e:
        logger.error(f"Failed to fetch URL {url}: {e}")
        return {"raw_text": "", "error": str(e), "source_type": "url_fetch_failed"}

    # Detect source and parse accordingly
    if "linkedin.com" in url:
        return _parse_linkedin(html, url)
    elif "naukri.com" in url:
        return _parse_naukri(html, url)
    elif "indeed.com" in url:
        return _parse_indeed(html, url)
    elif "foundit.in" in url or "monster.com" in url:
        return _parse_generic(html, url, "foundit")
    else:
        return _parse_generic(html, url, "generic")


def _parse_linkedin(html: str, url: str) -> Dict[str, Any]:
    """Extract job description from LinkedIn page."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    # LinkedIn job description containers
    selectors = [
        "div.description__text",
        "div.show-more-less-html__markup",
        ".jobs-description-content__text",
        "div[class*='description']",
    ]

    text = ""
    for sel in selectors:
        el = soup.select_one(sel)
        if el:
            text = el.get_text(separator="\n", strip=True)
            break

    title = ""
    title_el = soup.select_one("h1.top-card-layout__title, h1.jobs-unified-top-card__job-title")
    if title_el:
        title = title_el.get_text(strip=True)

    company = ""
    company_el = soup.select_one("a.topcard__org-name-link, .jobs-unified-top-card__company-name")
    if company_el:
        company = company_el.get_text(strip=True)

    return {
        "raw_text": text or _fallback_text_extract(html),
        "title": title,
        "company": company,
        "source_type": "linkedin",
        "source_url": url,
    }


def _parse_naukri(html: str, url: str) -> Dict[str, Any]:
    """Extract job description from Naukri page."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    selectors = [
        "div.job-desc",
        "div[class*='dang-inner-html']",
        "section.job-desc",
        "div.jd-desc",
    ]

    text = ""
    for sel in selectors:
        el = soup.select_one(sel)
        if el:
            text = el.get_text(separator="\n", strip=True)
            break

    title_el = soup.select_one("h1.jd-header-title, h1[class*='title']")
    title = title_el.get_text(strip=True) if title_el else ""

    company_el = soup.select_one("a.jd-header-comp-name, a[class*='comp-name']")
    company = company_el.get_text(strip=True) if company_el else ""

    return {
        "raw_text": text or _fallback_text_extract(html),
        "title": title,
        "company": company,
        "source_type": "naukri",
        "source_url": url,
    }


def _parse_indeed(html: str, url: str) -> Dict[str, Any]:
    """Extract job description from Indeed page."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    selectors = [
        "#jobDescriptionText",
        "div[class*='jobsearch-jobDescriptionText']",
        "div[class*='job-description']",
    ]

    text = ""
    for sel in selectors:
        el = soup.select_one(sel)
        if el:
            text = el.get_text(separator="\n", strip=True)
            break

    return {
        "raw_text": text or _fallback_text_extract(html),
        "title": "",
        "company": "",
        "source_type": "indeed",
        "source_url": url,
    }


def _parse_generic(html: str, url: str, source_type: str = "generic") -> Dict[str, Any]:
    """Generic HTML parser for unknown job sites."""
    text = _fallback_text_extract(html)
    return {
        "raw_text": text,
        "title": "",
        "company": "",
        "source_type": source_type,
        "source_url": url,
    }


def _fallback_text_extract(html: str) -> str:
    """Extract all text from HTML as fallback."""
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        # Remove scripts and styles
        for tag in soup(["script", "style", "nav", "header", "footer"]):
            tag.decompose()
        text = soup.get_text(separator="\n", strip=True)
        # Clean up excessive whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return "\n".join(lines[:200])  # Cap at 200 lines
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        return ""
