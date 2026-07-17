#!/usr/bin/env python3
"""
Weekly Status Updater for Slack, GitLab and GitHub
Randomly selects a status from statuses.json and updates all platforms.
"""

import json
import os
import random
import requests
from pathlib import Path
from datetime import datetime, time, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent / '.env')

SLACK_TOKEN = os.getenv('SLACK_USER_TOKEN')
GITLAB_TOKEN = os.getenv('GITLAB_TOKEN')
GITLAB_URL = os.getenv('GITLAB_URL', 'https://gitlab.com')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

def get_expiration_datetime():
    """Get a timezone-aware datetime for 17:30 today (or tomorrow if already past)."""
    now = datetime.now().astimezone()
    expiration = datetime.combine(now.date(), time(17, 30)).astimezone()

    # If it's already past 17:30, set for tomorrow
    if now >= expiration:
        expiration += timedelta(days=1)

    return expiration

def get_expiration_timestamp():
    """Get Unix timestamp for 17:30 today (or tomorrow if already past)."""
    return int(get_expiration_datetime().timestamp())

def load_statuses():
    """Load status messages from JSON file."""
    status_file = Path(__file__).parent / 'statuses.json'
    with open(status_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_random_status(statuses):
    """Select a random status, avoiding recent ones if possible."""
    history_file = Path(__file__).parent / '.status_history'

    # Load history
    recent = []
    if history_file.exists():
        recent = history_file.read_text().strip().split('\n')[-10:]

    # Filter out recent statuses
    available = [i for i in range(len(statuses)) if str(i) not in recent]
    if not available:
        available = list(range(len(statuses)))

    chosen_idx = random.choice(available)

    # Save to history
    recent.append(str(chosen_idx))
    history_file.write_text('\n'.join(recent[-10:]))

    return statuses[chosen_idx]

def update_slack_status(emoji, text):
    """Update Slack user status."""
    if not SLACK_TOKEN:
        print("SLACK_USER_TOKEN not configured, skipping Slack")
        return False

    url = "https://slack.com/api/users.profile.set"
    headers = {
        "Authorization": f"Bearer {SLACK_TOKEN}",
        "Content-Type": "application/json"
    }

    expiration = get_expiration_timestamp()
    payload = {
        "profile": {
            "status_text": text,
            "status_emoji": emoji,
            "status_expiration": expiration
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    result = response.json()

    if result.get('ok'):
        print(f"Slack status updated: {emoji} {text}")
        return True
    else:
        print(f"Slack error: {result.get('error')}")
        return False

def update_gitlab_status(emoji, text):
    """Update GitLab user status."""
    if not GITLAB_TOKEN:
        print("GITLAB_TOKEN not configured, skipping GitLab")
        return False

    url = f"{GITLAB_URL}/api/v4/user/status"
    headers = {
        "PRIVATE-TOKEN": GITLAB_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "emoji": emoji,
        "message": text,
        "clear_status_after": "8_hours"  # Expires after 8 hours
    }

    response = requests.put(url, headers=headers, json=payload)

    if response.status_code == 200:
        print(f"GitLab status updated: {emoji} {text}")
        return True
    else:
        print(f"GitLab error: {response.status_code} - {response.text}")
        return False

def update_github_status(emoji, text):
    """Update GitHub profile status via the GraphQL changeUserStatus mutation."""
    if not GITHUB_TOKEN:
        print("GITHUB_TOKEN not configured, skipping GitHub")
        return False

    query = """
    mutation($emoji: String!, $message: String!, $expiresAt: DateTime) {
      changeUserStatus(input: {emoji: $emoji, message: $message, expiresAt: $expiresAt}) {
        status { emoji message expiresAt }
      }
    }
    """
    variables = {
        "emoji": emoji,  # GitHub expects the colon form, e.g. ":fire:"
        "message": text,
        "expiresAt": get_expiration_datetime().isoformat()
    }
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        "https://api.github.com/graphql",
        headers=headers,
        json={"query": query, "variables": variables}
    )
    result = response.json()

    if response.status_code == 200 and not result.get('errors'):
        print(f"GitHub status updated: {emoji} {text}")
        return True
    else:
        error = result.get('errors') or response.text
        print(f"GitHub error: {response.status_code} - {error}")
        return False

def main():
    statuses = load_statuses()
    status = get_random_status(statuses)

    print(f"Selected status: {status['gitlab_emoji']} {status['text']}")
    print("-" * 50)

    update_slack_status(status['emoji'], status['text'])
    # GitLab needs emoji name without colons (e.g., "skull" not ":skull:" or "💀")
    gitlab_emoji_name = status['emoji'].strip(':')
    update_gitlab_status(gitlab_emoji_name, status['text'])
    # GitHub uses the same colon form as Slack (e.g. ":fire:")
    update_github_status(status['emoji'], status['text'])

if __name__ == "__main__":
    main()
