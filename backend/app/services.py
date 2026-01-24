import base64
import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List

from .constants import COMMODITY_GROUPS

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI Client
client = OpenAI()

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