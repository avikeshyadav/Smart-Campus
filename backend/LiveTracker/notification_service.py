import datetime

from sqlalchemy.orm import Session

from database import Notification


def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    entity_type: str = None,
    entity_id: int = None,
    metadata: dict = None,
):
    try:

        expires_at = (
            datetime.datetime.now()
            + datetime.timedelta(days=1)
        )

        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,

            # IMPORTANT:
            # Python attribute is notification_metadata
            # Database column is metadata
            notification_metadata=metadata,

            is_read=False,
            created_at=datetime.datetime.now(),
            expires_at=expires_at,
        )

        db.add(notification)

        db.commit()

        db.refresh(notification)

        print(
            "Notification created:",
            notification.id,
        )

        return notification.id

    except Exception as error:

        db.rollback()

        print(
            "Notification creation error:",
            error,
        )

        raise
