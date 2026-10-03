from datetime import datetime, timezone, timedelta

# Indian Standard Time (IST) is UTC+05:30
IST_TIMEZONE = timezone(timedelta(hours=5, minutes=30), name="IST")

def get_ist_now() -> datetime:
    """Returns current datetime in Indian Standard Time (IST)"""
    return datetime.now(IST_TIMEZONE)

def get_ist_iso() -> str:
    """Returns current ISO formatted string in IST"""
    return get_ist_now().isoformat()

def format_ist(dt: datetime = None) -> str:
    """Returns formatted string e.g. '2026-09-29 13:46:30 IST'"""
    if dt is None:
        dt = get_ist_now()
    elif dt.tzinfo is None:
        # If naive datetime, set to IST
        dt = dt.replace(tzinfo=IST_TIMEZONE)
    return dt.strftime("%Y-%m-%d %H:%M:%S IST")
