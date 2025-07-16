import os
import requests
import smtplib
from email.mime.text import MIMEText
from typing import List

SLACK_WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL")

EMAIL_FROM = os.environ.get("EMAIL_FROM", "noreply@example.com")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "localhost")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 25))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
EMAIL_ADMINS = os.environ.get("EMAIL_ADMINS", "").split(",")


def send_email(subject: str, body: str, to: List[str]):
    # Filter out empty/invalid recipients
    valid_recipients = [email for email in to if email and email.strip()]
    if not valid_recipients:
        return  # No valid recipients, skip sending
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = ", ".join(valid_recipients)
    if SMTP_PORT == 465:
        # Use SSL for port 465 (Gmail, etc.)
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, valid_recipients, msg.as_string())
    else:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            if SMTP_PORT == 587:
                server.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(EMAIL_FROM, valid_recipients, msg.as_string())

def send_slack_notification(message: str):
    if not SLACK_WEBHOOK_URL:
        return
    requests.post(SLACK_WEBHOOK_URL, json={"text": message})
