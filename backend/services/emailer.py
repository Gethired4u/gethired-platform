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
        "host":       os.getenv("SMTP_HOST", "").strip(),
        "port":       int(os.getenv("SMTP_PORT", "587")),
        "username":   os.getenv("SMTP_USERNAME", "").strip(),
        "password":   os.getenv("SMTP_PASSWORD", "").strip(),
        "from_email": os.getenv("SMTP_FROM_EMAIL", os.getenv("SMTP_USERNAME", "")).strip(),
        "from_name":  os.getenv("SMTP_FROM_NAME", "GetHired4U Team").strip(),
        "use_ssl":    _env_bool("SMTP_USE_SSL", False),
        "use_tls":    _env_bool("SMTP_USE_TLS", True),
    }


def is_email_enabled() -> bool:
    cfg = _mail_config()
    enabled = all([cfg["host"], cfg["port"], cfg["username"], cfg["password"], cfg["from_email"]])
    if not enabled:
        logger.warning(
            "SMTP not configured. Missing: %s",
            [k for k in ("host", "username", "password", "from_email") if not cfg.get(k)],
        )
    return enabled


def _send_message(message: EmailMessage) -> None:
    """Low-level: connect to SMTP and send. Raises on failure."""
    cfg = _mail_config()
    if cfg["use_ssl"]:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(str(cfg["host"]), int(cfg["port"]), context=ctx, timeout=20) as server:
            server.login(str(cfg["username"]), str(cfg["password"]))
            server.send_message(message)
    else:
        with smtplib.SMTP(str(cfg["host"]), int(cfg["port"]), timeout=20) as server:
            if cfg["use_tls"]:
                server.starttls(context=ssl.create_default_context())
            server.login(str(cfg["username"]), str(cfg["password"]))
            server.send_message(message)


def _format_services(services: list[str]) -> str:
    if not services:
        return "Not selected"
    return ", ".join(services)


# ── User confirmation email ────────────────────────────────────────────────────

def _build_user_email(payload: UserRegistration, user_id: int) -> tuple[str, str, str]:
    services      = _format_services(payload.services_interested)
    whatsapp_link = os.getenv("WHATSAPP_LINK", "https://wa.me/918328221007").strip()
    support_email = os.getenv("SUPPORT_EMAIL", "support@gethired4u.com").strip()

    subject   = f"We received your enquiry — GetHired4U #{user_id}"
    text_body = (
        f"Hi {payload.name},\n\n"
        "Thanks for contacting GetHired4U. We received your enquiry and our team will review your details shortly.\n\n"
        f"Registration ID : {user_id}\n"
        f"Target role     : {payload.role}\n"
        f"Current status  : {payload.experience}\n"
        f"Selected service: {services}\n\n"
        f"Chat with our team on WhatsApp: {whatsapp_link}\n"
        f"You can also reply to this email: {support_email}\n\n"
        "Regards,\nGetHired4U Team"
    )
    html_body = f"""
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a;max-width:620px;margin:0 auto;padding:24px">
      <div style="background:#0f172a;border-radius:12px 12px 0 0;padding:20px 24px">
        <h1 style="margin:0;font-size:22px;color:#ffffff">GetHired4U</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8">Your career journey starts here</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:18px">✅ Enquiry Received!</h2>
        <p>Hi <strong>{escape(payload.name)}</strong>,</p>
        <p>Thanks for reaching out to GetHired4U. Our team will review your profile and contact you within <strong>24 hours</strong>.</p>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Your Details</p>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="padding:5px 0;color:#64748b;width:40%">Registration ID</td><td style="padding:5px 0;font-weight:600">#{user_id}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b">Target Role</td><td style="padding:5px 0;font-weight:600">{escape(payload.role)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b">Current Status</td><td style="padding:5px 0">{escape(payload.experience)}</td></tr>
            <tr><td style="padding:5px 0;color:#64748b">Selected Service</td><td style="padding:5px 0">{escape(services)}</td></tr>
          </table>
        </div>

        <p style="margin:20px 0 8px"><strong>What happens next?</strong></p>
        <ol style="margin:0;padding-left:20px;font-size:14px;color:#475569">
          <li style="margin-bottom:6px">Our team reviews your profile and selected service</li>
          <li style="margin-bottom:6px">We contact you on WhatsApp within 24 hours</li>
          <li>Your service delivery begins immediately after confirmation</li>
        </ol>

        <div style="margin-top:24px">
          <a href="{escape(whatsapp_link)}"
             style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;padding:13px 22px;font-size:15px">
            💬 Chat with our team on WhatsApp
          </a>
        </div>

        <p style="margin-top:20px;font-size:12px;color:#94a3b8">
          You can also reply to this email: <a href="mailto:{escape(support_email)}" style="color:#0ea5e9">{escape(support_email)}</a>
        </p>
        <p style="font-size:14px;color:#475569">Regards,<br/><strong>GetHired4U Team</strong></p>
      </div>
    </div>
    """
    return subject, text_body, html_body


def send_registration_email(payload: UserRegistration, user_id: int) -> bool:
    if not is_email_enabled():
        return False

    cfg = _mail_config()
    subject, text_body, html_body = _build_user_email(payload, user_id)

    msg = EmailMessage()
    msg["Subject"]  = subject
    msg["From"]     = f"{cfg['from_name']} <{cfg['from_email']}>"
    msg["To"]       = payload.email
    msg["Reply-To"] = os.getenv("SUPPORT_EMAIL", str(cfg["from_email"])).strip()
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        _send_message(msg)
        logger.info("Confirmation email sent to %s for user_id=%s", payload.email, user_id)
        return True
    except Exception:
        logger.exception("Failed to send confirmation email to %s for user_id=%s", payload.email, user_id)
        return False


# ── Admin notification email ───────────────────────────────────────────────────

def _build_admin_email(payload: UserRegistration, user_id: int) -> tuple[str, str, str]:
    services  = _format_services(payload.services_interested)
    base_url  = os.getenv("BASE_URL", "https://gethired4u.com").strip()

    subject   = f"🔔 New lead #{user_id} — {payload.name} ({payload.role})"
    text_body = (
        f"New lead received.\n\n"
        f"ID      : {user_id}\n"
        f"Name    : {payload.name}\n"
        f"Email   : {payload.email}\n"
        f"Phone   : {payload.phone}\n"
        f"Role    : {payload.role}\n"
        f"Status  : {payload.experience}\n"
        f"Services: {services}\n"
        f"Source  : {payload.lead_source}\n"
        f"Plan    : {payload.recommended_plan or 'Not specified'}\n\n"
        f"Admin panel: {base_url}/admin"
    )
    html_body = f"""
    <div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a;max-width:620px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;font-size:18px">🔔 New Lead #{user_id}</h2>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:20px">
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:5px 0;color:#64748b;width:35%">Name</td><td style="padding:5px 0;font-weight:600">{escape(payload.name)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Email</td><td style="padding:5px 0">{escape(payload.email)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Phone</td><td style="padding:5px 0">{escape(payload.phone)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Target Role</td><td style="padding:5px 0">{escape(payload.role)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Status</td><td style="padding:5px 0">{escape(payload.experience)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Services</td><td style="padding:5px 0;font-weight:600;color:#0ea5e9">{escape(services)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Source</td><td style="padding:5px 0">{escape(payload.lead_source)}</td></tr>
          <tr><td style="padding:5px 0;color:#64748b">Plan</td><td style="padding:5px 0">{escape(payload.recommended_plan or 'Not specified')}</td></tr>
        </table>
      </div>
      <a href="{escape(base_url)}/admin"
         style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:10px;padding:12px 20px;font-size:14px">
        View in Admin Panel →
      </a>
    </div>
    """
    return subject, text_body, html_body


def send_admin_notification(payload: UserRegistration, user_id: int) -> bool:
    if not is_email_enabled():
        return False

    admin_email = os.getenv("SUPPORT_EMAIL", "").strip()
    if not admin_email:
        logger.warning("SUPPORT_EMAIL not set — skipping admin notification for user_id=%s", user_id)
        return False

    cfg = _mail_config()
    subject, text_body, html_body = _build_admin_email(payload, user_id)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"]    = f"{cfg['from_name']} <{cfg['from_email']}>"
    msg["To"]      = admin_email
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        _send_message(msg)
        logger.info("Admin notification sent for user_id=%s", user_id)
        return True
    except Exception:
        logger.exception("Failed to send admin notification for user_id=%s", user_id)
        return False


# ── SMTP connectivity test (call from /admin/test-email) ──────────────────────

def test_smtp_connection() -> dict:
    """Returns a status dict — use from admin route to verify SMTP on production."""
    if not is_email_enabled():
        return {"ok": False, "error": "SMTP not configured — check SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD in .env"}

    cfg = _mail_config()
    try:
        if cfg["use_ssl"]:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(str(cfg["host"]), int(cfg["port"]), context=ctx, timeout=10) as server:
                server.login(str(cfg["username"]), str(cfg["password"]))
        else:
            with smtplib.SMTP(str(cfg["host"]), int(cfg["port"]), timeout=10) as server:
                if cfg["use_tls"]:
                    server.starttls(context=ssl.create_default_context())
                server.login(str(cfg["username"]), str(cfg["password"]))
        return {"ok": True, "host": cfg["host"], "port": cfg["port"], "from": cfg["from_email"]}
    except Exception as exc:
        return {"ok": False, "error": str(exc), "host": cfg["host"], "port": cfg["port"]}
