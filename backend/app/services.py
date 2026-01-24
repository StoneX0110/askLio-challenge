import base64
import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI Client
client = OpenAI()

# Hardcoded Commodity Groups for context
COMMODITY_GROUPS = """
001: General Services - Accommodation Rentals
002: General Services - Membership Fees
003: General Services - Workplace Safety
004: General Services - Consulting
005: General Services - Financial Services
006: General Services - Fleet Management
007: General Services - Recruitment Services
008: General Services - Professional Development
009: General Services - Miscellaneous Services
010: General Services - Insurance
011: Facility Management - Electrical Engineering
012: Facility Management - Facility Management Services
013: Facility Management - Security
014: Facility Management - Renovations
015: Facility Management - Office Equipment
016: Facility Management - Energy Management
017: Facility Management - Maintenance
018: Facility Management - Cafeteria and Kitchenettes
019: Facility Management - Cleaning
020: Publishing Production - Audio and Visual Production
021: Publishing Production - Books/Videos/CDs
022: Publishing Production - Printing Costs
023: Publishing Production - Software Development for Publishing
024: Publishing Production - Material Costs
025: Publishing Production - Shipping for Production
026: Publishing Production - Digital Product Development
027: Publishing Production - Pre-production
028: Publishing Production - Post-production Costs
029: Information Technology - Hardware
030: Information Technology - IT Services
031: Information Technology - Software
032: Logistics - Courier, Express, and Postal Services
033: Logistics - Warehousing and Material Handling
034: Logistics - Transportation Logistics
035: Logistics - Delivery Services
036: Marketing & Advertising - Advertising
037: Marketing & Advertising - Outdoor Advertising
038: Marketing & Advertising - Marketing Agencies
039: Marketing & Advertising - Direct Mail
040: Marketing & Advertising - Customer Communication
041: Marketing & Advertising - Online Marketing
042: Marketing & Advertising - Events
043: Marketing & Advertising - Promotional Materials
044: Production - Warehouse and Operational Equipment
045: Production - Production Machinery
046: Production - Spare Parts
047: Production - Internal Transportation
048: Production - Production Materials
049: Production - Consumables
050: Production - Maintenance and Repairs
"""

class ExtractedOrderLine(BaseModel):
    description: str = Field(..., description="Description of the product or service")
    unit_price: float = Field(..., description="Price per unit")
    amount: float = Field(..., description="Quantity of units")
    unit: str = Field(..., description="The unit of measure (e.g., 'licenses', 'hours', 'pcs')")
    total_price: float = Field(..., description="Calculated total price for this line")

class ProcurementExtraction(BaseModel):
    requestor_name: str = Field(..., description="Full name of the person asking for the item. If unknown, use 'Unknown'.")
    department: str = Field(..., description="Department of the requestor.")
    vendor_name: str = Field(..., description="Name of the company providing the service/product.")
    vat_id: str = Field(..., description="VAT ID (e.g., DE123456789). If not found, return an empty string.")
    title: str = Field(..., description="A short, concise title for this request (e.g., 'Adobe Licenses').")
    total_cost: float = Field(..., description="The total cost of the offer.")
    commodity_group_id: str = Field(
        ..., 
        description=(
            "The best matching ID from the following list: "
            f"{COMMODITY_GROUPS}"
            "Use '009' (Miscellaneous) if unsure."
        )
    )
    order_lines: List[ExtractedOrderLine]

def extract_invoice_data(file_bytes: bytes, filename: str):
    """
    Uses OpenAI to extract structured JSON from the raw text.
    """
    try:
        base64_string = base64.b64encode(file_bytes).decode('utf-8')

        response = client.responses.parse(
            model="gpt-5.2",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_file",
                            "filename": filename,
                            "file_data": f"data:application/pdf;base64,{base64_string}"
                        },
                        {
                            "type": "input_text",
                            "text": (
                                "Analyze this document visually. "
                                "Extract the procurement request details, paying special attention to the table structure for Order Lines."
                                "Make sure that you include all alternative products as order lines as well."
                            )
                        }
                    ]
                }
            ],
            text_format=ProcurementExtraction,
            store=False
        )
        print(response.output_parsed.model_dump())
        return response.output_parsed.model_dump()

    except Exception as e:
        print(f"AI Extraction Error: {e}")
        return None