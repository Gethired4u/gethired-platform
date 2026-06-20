import logging
import os
import smtplib
import ssl
from email.message import EmailMessage
from html import escape

from models.schemas import UserRegistration

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _mail_config() -> dict[str, str | int | bool]:
    return {
        "host": os.getenv("SMTP_HOST", "").strip(),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "username": os.getenv("SMTP_USERNAME", "").strip(),
        "password": os.getenv("SMTP_PASSWORD", "").strip(),
        "from_email": os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USERNAME", "")).strip(),
        "from_name": os.getenv("SMTP_FROM_NAME", "GetHired4U Team").strip(),
        "use_ssl": _env_bool("SMTP_USE_SSL", False),
        "use_tls": _env_bool("SMTP_USE_TLS", True),
    }


def is_email_enabled() -> bool:
    cfg = _mail_config()
    return all([cfg["host"], cfg["port"], cfg["username"], cfg["password"], cfg["from_email"]])


def _format_services(services: list[str]) -> str:
    if not services:
        return "Not selected"
    return ", ".join(services)


def _build_registration_email(payload: UserRegistration, user_id: int) -> tuple[str, str, str]:
    services = _format_services(payload.services_interested)
    whatsapp_link = os.getenv("WHATSAPP_LINK", "https://wa.me/918328221007").strip()
    support_email = os.getenv("SUPPORT_EMAIL", "support@gethired4u.com").strip()

    subject = f"GetHired4U enquiry received #{user_id}"
    text_body = f"""Hi {payload.name},

Thanks for contacting GetHired4U. We received your enquiry and our team will review your details shortly.

Your details:
- Registration ID: {user_id}
- Target role: {payload.role}
- Experience/current status: {payload.experience}
- Selected services: {services}

Chat with our team on WhatsApp: {whatsapp_link}
You can also reply to this email: {support_email}

Regards,
GetHired4U Team
"""

    html_body = f"""
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:620px;margin:0 auto">
      <h2 style="margin:0 0 12px;color:#0f172a">Your GetHired4U enquiry is received</h2>
      <p>Hi {escape(payload.name)},</p>
      <p>Thanks for contacting GetHired4U. Our team will review your details and contact you shortly.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:18px 0">
        <p style="margin:0 0 8px"><strong>Registration ID:</strong> {user_id}</p>
        <p style="margin:0 0 8px"><strong>Target role:</strong> {escape(payload.role)}</p>
        <p style="margin:0 0 8px"><strong>Experience/current status:</strong> {escape(payload.experience)}</p>
        <p style="margin:0"><strong>Selected services:</strong> {escape(services)}</p>
      </div>
      <p>
        <a href="{escape(whatsapp_link)}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;padding:12px 18px">
          Chat with our team
        </a>
      </p>
      <p style="font-size:13px;color:#64748b">You can also reply to this email: {escape(support_email)}</p>
      <p>Regards,<br/>GetHired4U Team</p>
    </div>
    """
    return subject, text_body, html_body


def send_registration_email(payload: UserRegistration, user_id: int) -> bool:
    if not is_email_enabled():
        logger.info("SMTP settings are incomplete; skipping registration email for user_id=%s", user_id)
        return False

    cfg = _mail_config()
    subject, text_body, html_body = _build_registration_email(payload, user_id)

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{cfg['from_name']} <{cfg['from_email']}>"
    message["To"] = payload.email
    message["Reply-To"] = os.getenv("SUPPORT_EMAIL", str(cfg["from_email"])).strip()
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    try:
        if cfg["use_ssl"]:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(str(cfg["host"]), int(cfg["port"]), context=context, timeout=20) as server:
                server.login(str(cfg["username"]), str(cfg["password"]))
                server.send_message(message)
        else:
            with smtplib.SMTP(str(cfg["host"]), int(cfg["port"]), timeout=20) as server:
                if cfg["use_tls"]:
                    server.starttls(context=ssl.create_default_context())
                server.login(str(cfg["username"]), str(cfg["password"]))
                server.send_message(message)
        return True
    except Exception:
        logger.exception("Failed to send registration email for user_id=%s", user_id)
        return False
