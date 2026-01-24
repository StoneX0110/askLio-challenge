import base64
import os
from dotenv import load_dotenv
from openai import OpenAI
from typing import List

# Import centralized schemas and constants
from . import schemas
from .constants import COMMODITY_GROUPS

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI Client
client = OpenAI()

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
            text_format=schemas.RequestCreate,
            store=False
        )
        print(response.output_parsed.model_dump())
        return response.output_parsed.model_dump()

    except Exception as e:
        print(f"AI Extraction Error: {e}")
        return None

def predict_commodity_group(request_data: schemas.RequestCreate) -> str:
    """
    Predicts the commodity group ID string (e.g. '029') based on the request details.
    """
    try:
        lines_text = "\n".join([f"- {line.description} (Price: {line.total_price})" for line in request_data.order_lines])
        prompt_text = (
            f"Title: {request_data.title}\n"
            f"Vendor: {request_data.vendor_name}\n"
            f"Requestor: {request_data.requestor_name}\n"
            f"Items:\n{lines_text}\n\n"
            f"Based on the above, select the most appropriate Commodity Group ID from the list below:\n"
            f"{COMMODITY_GROUPS}"
        )

        response = client.responses.parse(
            model="gpt-5.2",
            input=[
                {
                    "role": "system",
                    "content": "You are a procurement expert helper. You only output the Commodity Group ID."
                },
                {
                    "role": "user",
                    "content": prompt_text
                }
            ],
            text_format=schemas.CommodityPrediction,
            store=False
        )
        prediction = response.output_parsed.commodity_group_id
        # Extract just the ID if the AI returns "029 - Hardware" (safety check)
        return prediction.split(":")[0].split(" ")[0].strip()
        
    except Exception as e:
        print(f"Commodity Prediction Error: {e}")
        return "009" # Default to Miscellaneous on failure