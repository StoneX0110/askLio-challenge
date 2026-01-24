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