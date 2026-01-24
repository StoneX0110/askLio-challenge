from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List


from . import models, schemas, database, services

# Create Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="askLio Procurement API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/extract", response_model=schemas.RequestCreate)
async def extract_data(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF file and get AI-extracted JSON.
    """
    content = await file.read()
    extracted_data = services.extract_invoice_data(content, file.filename)
    
    if not extracted_data:
        raise HTTPException(status_code=400, detail="Could not extract data.")
    
    return extracted_data

@app.post("/requests/", response_model=schemas.RequestResponse)
def create_request(request: schemas.RequestCreate, db: Session = Depends(database.get_db)):
    # Predict Commodity Group
    if not request.commodity_group_id:
        predicted_group = services.predict_commodity_group(request)
        request.commodity_group_id = predicted_group

    # Create the main request object
    db_request = models.ProcurementRequest(
        requestor_name=request.requestor_name,
        department=request.department,
        title=request.title,
        vendor_name=request.vendor_name,
        vat_id=request.vat_id,
        commodity_group_id=request.commodity_group_id,
        total_cost=request.total_cost
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # Create order lines
    for line in request.order_lines:
        db_line = models.OrderLine(
            request_id=db_request.id,
            description=line.description,
            unit_price=line.unit_price,
            amount=line.amount,
            unit=line.unit,
            total_price=line.total_price
        )
        db.add(db_line)
    
    db.commit()
    return db_request

@app.get("/requests/", response_model=List[schemas.RequestResponse])
def read_requests(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    requests = db.query(models.ProcurementRequest).offset(skip).limit(limit).all()
    return requests

@app.put("/requests/{request_id}/status")
def update_status(request_id: int, status_update: schemas.RequestStatusUpdate, db: Session = Depends(database.get_db)):
    db_request = db.query(models.ProcurementRequest).filter(models.ProcurementRequest.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    db_request.status = status_update.status
    db.commit()
    return {"message": "Status updated"}