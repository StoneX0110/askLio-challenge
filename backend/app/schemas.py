from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Shared Models ---
class RequestBase(BaseModel):
    requestor_name: str
    department: str
    title: str
    vendor_name: str
    vat_id: str
    commodity_group_id: str
    total_cost: float

class OrderLineBase(BaseModel):
    description: str
    unit_price: float
    amount: float
    unit: str
    total_price: float
    
# --- Creation Models (Input) ---
class RequestCreate(RequestBase):
    order_lines: List[OrderLineBase]

# --- Response Models (Output) ---
class OrderLineResponse(OrderLineBase):
    id: int
    class Config:
        from_attributes = True

class RequestResponse(RequestBase):
    id: int
    status: str
    created_at: datetime
    order_lines: List[OrderLineResponse]
    class Config:
        from_attributes = True

class RequestStatusUpdate(BaseModel):
    status: str