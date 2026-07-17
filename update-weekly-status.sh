#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Status Nerd
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🤓
# @raycast.packageName Status Nerd

# Documentation:
# @raycast.description Sets a random funny status on Slack, GitLab and GitHub

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
/usr/bin/python3 update_status.py
