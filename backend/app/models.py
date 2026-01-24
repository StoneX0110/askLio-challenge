from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class ProcurementRequest(Base):
    __tablename__ = "procurement_requests"

    id = Column(Integer, primary_key=True, index=True)
    requestor_name = Column(String, index=True)
    department = Column(String)
    title = Column(String)
    vendor_name = Column(String)
    vat_id = Column(String)
    commodity_group_id = Column(String)
    total_cost = Column(Float)
    status = Column(String, default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)

    order_lines = relationship("OrderLine", back_populates="request")

class OrderLine(Base):
    __tablename__ = "order_lines"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("procurement_requests.id"))
    description = Column(String)
    unit_price = Column(Float)
    amount = Column(Float)
    unit = Column(String)
    total_price = Column(Float)

    request = relationship("ProcurementRequest", back_populates="order_lines")