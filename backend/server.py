from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date
from decimal import Decimal


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Medicine Models
class Medicine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    generic_name: str
    manufacturer: str
    category: str
    dosage: str
    form: str  # tablet, capsule, syrup, etc.
    batch_number: str
    expiry_date: date
    purchase_price: float
    selling_price: float
    stock_quantity: int
    min_stock_level: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MedicineCreate(BaseModel):
    name: str
    generic_name: str
    manufacturer: str
    category: str
    dosage: str
    form: str
    batch_number: str
    expiry_date: date
    purchase_price: float
    selling_price: float
    stock_quantity: int
    min_stock_level: int

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    dosage: Optional[str] = None
    form: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None

# Customer Models
class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

# Sale Models
class SaleItem(BaseModel):
    medicine_id: str
    medicine_name: str
    quantity: int
    unit_price: float
    total_price: float

class Sale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    items: List[SaleItem]
    subtotal: float
    discount_percent: float = 0
    discount_amount: float = 0
    tax_percent: float = 0
    tax_amount: float = 0
    total_amount: float
    payment_method: str = "cash"
    sale_date: datetime = Field(default_factory=datetime.utcnow)

class SaleCreate(BaseModel):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    items: List[SaleItem]
    subtotal: float
    discount_percent: float = 0
    tax_percent: float = 0
    payment_method: str = "cash"

# Supplier Models
class Supplier(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

# Medicine Routes
@api_router.post("/medicines", response_model=Medicine)
async def create_medicine(medicine: MedicineCreate):
    medicine_dict = medicine.dict()
    medicine_obj = Medicine(**medicine_dict)
    await db.medicines.insert_one(medicine_obj.dict())
    return medicine_obj

@api_router.get("/medicines", response_model=List[Medicine])
async def get_medicines():
    medicines = await db.medicines.find().to_list(1000)
    return [Medicine(**medicine) for medicine in medicines]

@api_router.get("/medicines/{medicine_id}", response_model=Medicine)
async def get_medicine(medicine_id: str):
    medicine = await db.medicines.find_one({"id": medicine_id})
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return Medicine(**medicine)

@api_router.put("/medicines/{medicine_id}", response_model=Medicine)
async def update_medicine(medicine_id: str, medicine_update: MedicineUpdate):
    update_dict = {k: v for k, v in medicine_update.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.medicines.update_one(
        {"id": medicine_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    updated_medicine = await db.medicines.find_one({"id": medicine_id})
    return Medicine(**updated_medicine)

@api_router.delete("/medicines/{medicine_id}")
async def delete_medicine(medicine_id: str):
    result = await db.medicines.delete_one({"id": medicine_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"message": "Medicine deleted successfully"}

@api_router.get("/medicines/low-stock")
async def get_low_stock_medicines():
    medicines = await db.medicines.find().to_list(1000)
    low_stock_medicines = [
        Medicine(**medicine) for medicine in medicines 
        if medicine["stock_quantity"] <= medicine["min_stock_level"]
    ]
    return low_stock_medicines

@api_router.get("/medicines/expired")
async def get_expired_medicines():
    today = date.today()
    medicines = await db.medicines.find().to_list(1000)
    expired_medicines = [
        Medicine(**medicine) for medicine in medicines 
        if medicine["expiry_date"] <= today
    ]
    return expired_medicines

# Customer Routes
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate):
    customer_dict = customer.dict()
    customer_obj = Customer(**customer_dict)
    await db.customers.insert_one(customer_obj.dict())
    return customer_obj

@api_router.get("/customers", response_model=List[Customer])
async def get_customers():
    customers = await db.customers.find().to_list(1000)
    return [Customer(**customer) for customer in customers]

# Sale Routes
@api_router.post("/sales", response_model=Sale)
async def create_sale(sale: SaleCreate):
    # Calculate amounts
    subtotal = sale.subtotal
    discount_amount = subtotal * (sale.discount_percent / 100)
    taxable_amount = subtotal - discount_amount
    tax_amount = taxable_amount * (sale.tax_percent / 100)
    total_amount = taxable_amount + tax_amount
    
    sale_dict = sale.dict()
    sale_dict.update({
        "discount_amount": discount_amount,
        "tax_amount": tax_amount,
        "total_amount": total_amount
    })
    
    sale_obj = Sale(**sale_dict)
    
    # Update medicine stock
    for item in sale.items:
        result = await db.medicines.update_one(
            {"id": item.medicine_id},
            {"$inc": {"stock_quantity": -item.quantity}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"Medicine {item.medicine_name} not found")
    
    await db.sales.insert_one(sale_obj.dict())
    return sale_obj

@api_router.get("/sales", response_model=List[Sale])
async def get_sales():
    sales = await db.sales.find().to_list(1000)
    return [Sale(**sale) for sale in sales]

@api_router.get("/sales/today")
async def get_today_sales():
    today = datetime.utcnow().date()
    sales = await db.sales.find({
        "sale_date": {
            "$gte": datetime.combine(today, datetime.min.time()),
            "$lt": datetime.combine(today, datetime.max.time())
        }
    }).to_list(1000)
    return [Sale(**sale) for sale in sales]

# Supplier Routes
@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate):
    supplier_dict = supplier.dict()
    supplier_obj = Supplier(**supplier_dict)
    await db.suppliers.insert_one(supplier_obj.dict())
    return supplier_obj

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers():
    suppliers = await db.suppliers.find().to_list(1000)
    return [Supplier(**supplier) for supplier in suppliers]

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_medicines = await db.medicines.count_documents({})
    low_stock_count = len(await db.medicines.find({"$expr": {"$lte": ["$stock_quantity", "$min_stock_level"]}}).to_list(1000))
    
    today = datetime.utcnow().date()
    today_sales = await db.sales.find({
        "sale_date": {
            "$gte": datetime.combine(today, datetime.min.time()),
            "$lt": datetime.combine(today, datetime.max.time())
        }
    }).to_list(1000)
    
    today_revenue = sum(sale["total_amount"] for sale in today_sales)
    
    # Get expired medicines
    expired_medicines = await db.medicines.find({
        "expiry_date": {"$lte": datetime.utcnow()}
    }).to_list(1000)
    
    return {
        "total_medicines": total_medicines,
        "low_stock_count": low_stock_count,
        "today_sales_count": len(today_sales),
        "today_revenue": today_revenue,
        "expired_medicines_count": len(expired_medicines)
    }

# Search Routes
@api_router.get("/search/medicines")
async def search_medicines(q: str):
    medicines = await db.medicines.find({
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"generic_name": {"$regex": q, "$options": "i"}},
            {"manufacturer": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}}
        ]
    }).to_list(100)
    return [Medicine(**medicine) for medicine in medicines]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()