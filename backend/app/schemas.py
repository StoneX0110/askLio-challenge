from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .constants import COMMODITY_GROUPS

# --- Shared Models ---
class OrderLineBase(BaseModel):
    description: str = Field(..., description="Description of the product or service")
    unit_price: float = Field(..., description="Price per unit")
    amount: float = Field(..., description="Quantity of units")
    unit: str = Field(..., description="The unit of measure (e.g., 'licenses', 'hours', 'pcs')")
    total_price: float = Field(..., description="Calculated total price for this line")

class RequestBase(BaseModel):
    requestor_name: str = Field(..., description="Full name of the person asking for the item. If unknown, use 'Unknown'.")
    department: str = Field(..., description="Department of the requestor.")
    title: str = Field(..., description="A short, concise title for this request (e.g., 'Adobe Licenses').")
    vendor_name: str = Field(..., description="Name of the company providing the service/product.")
    vat_id: str = Field(..., description="VAT ID (e.g., DE123456789). If not found, return an empty string.")
    commodity_group_id: Optional[str] = Field(
        None, 
        description=(
            "The best matching ID from the following list: "
            f"{COMMODITY_GROUPS}"
            "Use '009' (Miscellaneous) if unsure."
        )
    )
    total_cost: float = Field(..., description="The total cost of the offer.")

# --- Creation Models (Input & Extraction) ---
# Unified model for both API input and AI extraction
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
