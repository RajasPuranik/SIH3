from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    commodity_id = Column(String, nullable=False)
    title = Column(String, nullable=True)
    input_json = Column(Text, nullable=False)
    result_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TraceBatch(Base):
    __tablename__ = "trace_batches"

    id = Column(String, primary_key=True, index=True)
    hash = Column(String, unique=True, index=True, nullable=False)
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False)
    producer_name = Column(String, nullable=False)
    batch_number = Column(String, nullable=False)
    packaging_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    qr_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
