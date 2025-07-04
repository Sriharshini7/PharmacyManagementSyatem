import requests
import unittest
import json
from datetime import datetime, date, timedelta
import os
import sys
import random
import string

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://4f692aa5-5871-43a6-bc8c-5d5cb6026edd.preview.emergentagent.com"
API_URL = f"{BACKEND_URL}/api"

class PharmacyAPITest(unittest.TestCase):
    """Test suite for Pharmacy Management System API"""
    
    def setUp(self):
        """Setup test data"""
        self.medicine_data = {
            "name": f"Test Medicine {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "generic_name": "Test Generic",
            "manufacturer": "Test Manufacturer",
            "category": "Test Category",
            "dosage": "10mg",
            "form": "tablet",
            "batch_number": f"BATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "expiry_date": datetime.combine(date.today() + timedelta(days=365), datetime.min.time()).isoformat(),
            "purchase_price": 5.0,
            "selling_price": 10.0,
            "stock_quantity": 100,
            "min_stock_level": 20
        }
        
        self.customer_data = {
            "name": f"Test Customer {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "phone": "1234567890",
            "email": "test@example.com",
            "address": "123 Test Street"
        }
        
        self.supplier_data = {
            "name": f"Test Supplier {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "contact_person": "Test Contact",
            "phone": "0987654321",
            "email": "supplier@example.com",
            "address": "456 Supplier Street"
        }
        
        # Store created resources for cleanup
        self.created_resources = {
            "medicines": [],
            "customers": [],
            "suppliers": [],
            "sales": []
        }
    
    def tearDown(self):
        """Clean up created resources"""
        # Delete created medicines
        for medicine_id in self.created_resources["medicines"]:
            try:
                requests.delete(f"{API_URL}/medicines/{medicine_id}")
            except:
                pass
    
    def test_01_medicine_crud(self):
        """Test medicine CRUD operations"""
        print("\n=== Testing Medicine CRUD Operations ===")
        
        # Create medicine
        print("Creating medicine...")
        response = requests.post(f"{API_URL}/medicines", json=self.medicine_data)
        self.assertEqual(response.status_code, 200, f"Failed to create medicine: {response.text}")
        medicine = response.json()
        self.created_resources["medicines"].append(medicine["id"])
        print(f"Created medicine with ID: {medicine['id']}")
        
        # Get all medicines
        print("Getting all medicines...")
        response = requests.get(f"{API_URL}/medicines")
        self.assertEqual(response.status_code, 200, "Failed to get medicines")
        medicines = response.json()
        self.assertIsInstance(medicines, list, "Medicines response is not a list")
        print(f"Retrieved {len(medicines)} medicines")
        
        # Get specific medicine
        print(f"Getting medicine with ID: {medicine['id']}...")
        response = requests.get(f"{API_URL}/medicines/{medicine['id']}")
        self.assertEqual(response.status_code, 200, f"Failed to get medicine: {response.text}")
        retrieved_medicine = response.json()
        self.assertEqual(retrieved_medicine["id"], medicine["id"], "Retrieved medicine ID doesn't match")
        print("Successfully retrieved specific medicine")
        
        # Update medicine
        print("Updating medicine...")
        update_data = {
            "name": f"Updated Medicine {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "stock_quantity": 50
        }
        response = requests.put(f"{API_URL}/medicines/{medicine['id']}", json=update_data)
        self.assertEqual(response.status_code, 200, f"Failed to update medicine: {response.text}")
        updated_medicine = response.json()
        self.assertEqual(updated_medicine["name"], update_data["name"], "Medicine name not updated")
        self.assertEqual(updated_medicine["stock_quantity"], update_data["stock_quantity"], "Medicine stock not updated")
        print("Successfully updated medicine")
        
        # Delete medicine
        print(f"Deleting medicine with ID: {medicine['id']}...")
        response = requests.delete(f"{API_URL}/medicines/{medicine['id']}")
        self.assertEqual(response.status_code, 200, f"Failed to delete medicine: {response.text}")
        print("Successfully deleted medicine")
        
        # Verify deletion
        response = requests.get(f"{API_URL}/medicines/{medicine['id']}")
        self.assertEqual(response.status_code, 404, "Medicine not properly deleted")
        print("Verified medicine deletion")
        
        # Remove from cleanup list since we already deleted it
        self.created_resources["medicines"].remove(medicine["id"])
    
    def test_02_customer_management(self):
        """Test customer management operations"""
        print("\n=== Testing Customer Management ===")
        
        # Create customer
        print("Creating customer...")
        response = requests.post(f"{API_URL}/customers", json=self.customer_data)
        self.assertEqual(response.status_code, 200, f"Failed to create customer: {response.text}")
        customer = response.json()
        self.created_resources["customers"].append(customer["id"])
        print(f"Created customer with ID: {customer['id']}")
        
        # Get all customers
        print("Getting all customers...")
        response = requests.get(f"{API_URL}/customers")
        self.assertEqual(response.status_code, 200, "Failed to get customers")
        customers = response.json()
        self.assertIsInstance(customers, list, "Customers response is not a list")
        print(f"Retrieved {len(customers)} customers")
        
        # Verify our customer is in the list
        customer_ids = [c["id"] for c in customers]
        self.assertIn(customer["id"], customer_ids, "Created customer not found in customers list")
        print("Verified customer was created successfully")
    
    def test_03_supplier_management(self):
        """Test supplier management operations"""
        print("\n=== Testing Supplier Management ===")
        
        # Create supplier
        print("Creating supplier...")
        response = requests.post(f"{API_URL}/suppliers", json=self.supplier_data)
        self.assertEqual(response.status_code, 200, f"Failed to create supplier: {response.text}")
        supplier = response.json()
        self.created_resources["suppliers"].append(supplier["id"])
        print(f"Created supplier with ID: {supplier['id']}")
        
        # Get all suppliers
        print("Getting all suppliers...")
        response = requests.get(f"{API_URL}/suppliers")
        self.assertEqual(response.status_code, 200, "Failed to get suppliers")
        suppliers = response.json()
        self.assertIsInstance(suppliers, list, "Suppliers response is not a list")
        print(f"Retrieved {len(suppliers)} suppliers")
        
        # Verify our supplier is in the list
        supplier_ids = [s["id"] for s in suppliers]
        self.assertIn(supplier["id"], supplier_ids, "Created supplier not found in suppliers list")
        print("Verified supplier was created successfully")
    
    def test_04_sales_processing(self):
        """Test sales processing and inventory updates"""
        print("\n=== Testing Sales Processing ===")
        
        # First create a medicine to sell
        print("Creating medicine for sale...")
        response = requests.post(f"{API_URL}/medicines", json=self.medicine_data)
        self.assertEqual(response.status_code, 200, f"Failed to create medicine: {response.text}")
        medicine = response.json()
        self.created_resources["medicines"].append(medicine["id"])
        print(f"Created medicine with ID: {medicine['id']}")
        
        # Create a customer
        print("Creating customer for sale...")
        response = requests.post(f"{API_URL}/customers", json=self.customer_data)
        self.assertEqual(response.status_code, 200, f"Failed to create customer: {response.text}")
        customer = response.json()
        self.created_resources["customers"].append(customer["id"])
        print(f"Created customer with ID: {customer['id']}")
        
        # Get initial stock quantity
        initial_stock = medicine["stock_quantity"]
        print(f"Initial stock quantity: {initial_stock}")
        
        # Create a sale
        sale_quantity = 5
        sale_data = {
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "items": [
                {
                    "medicine_id": medicine["id"],
                    "medicine_name": medicine["name"],
                    "quantity": sale_quantity,
                    "unit_price": medicine["selling_price"],
                    "total_price": sale_quantity * medicine["selling_price"]
                }
            ],
            "subtotal": sale_quantity * medicine["selling_price"],
            "discount_percent": 5,
            "tax_percent": 10,
            "payment_method": "cash"
        }
        
        print("Creating sale...")
        response = requests.post(f"{API_URL}/sales", json=sale_data)
        self.assertEqual(response.status_code, 200, f"Failed to create sale: {response.text}")
        sale = response.json()
        self.created_resources["sales"].append(sale["id"])
        print(f"Created sale with ID: {sale['id']}")
        
        # Verify stock was updated
        print("Verifying stock update...")
        response = requests.get(f"{API_URL}/medicines/{medicine['id']}")
        self.assertEqual(response.status_code, 200, f"Failed to get medicine: {response.text}")
        updated_medicine = response.json()
        expected_stock = initial_stock - sale_quantity
        self.assertEqual(updated_medicine["stock_quantity"], expected_stock, 
                         f"Stock not updated correctly. Expected: {expected_stock}, Got: {updated_medicine['stock_quantity']}")
        print(f"Stock updated correctly. New stock: {updated_medicine['stock_quantity']}")
        
        # Get all sales
        print("Getting all sales...")
        response = requests.get(f"{API_URL}/sales")
        self.assertEqual(response.status_code, 200, "Failed to get sales")
        sales = response.json()
        self.assertIsInstance(sales, list, "Sales response is not a list")
        print(f"Retrieved {len(sales)} sales")
        
        # Verify our sale is in the list
        sale_ids = [s["id"] for s in sales]
        self.assertIn(sale["id"], sale_ids, "Created sale not found in sales list")
        print("Verified sale was created successfully")
    
    def test_05_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n=== Testing Dashboard Statistics ===")
        
        # Get dashboard stats
        print("Getting dashboard statistics...")
        response = requests.get(f"{API_URL}/dashboard/stats")
        self.assertEqual(response.status_code, 200, f"Failed to get dashboard stats: {response.text}")
        stats = response.json()
        
        # Verify stats structure
        required_fields = ["total_medicines", "low_stock_count", "today_sales_count", "today_revenue", "expired_medicines_count"]
        for field in required_fields:
            self.assertIn(field, stats, f"Dashboard stats missing field: {field}")
        
        print("Dashboard statistics retrieved successfully:")
        for field in required_fields:
            print(f"  {field}: {stats[field]}")
    
    def test_06_search_functionality(self):
        """Test medicine search functionality"""
        print("\n=== Testing Search Functionality ===")
        
        # Create a medicine with a unique name for search
        unique_term = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        search_medicine_data = self.medicine_data.copy()
        search_medicine_data["name"] = f"SearchTest {unique_term}"
        
        print(f"Creating medicine with unique name: {search_medicine_data['name']}...")
        response = requests.post(f"{API_URL}/medicines", json=search_medicine_data)
        self.assertEqual(response.status_code, 200, f"Failed to create medicine: {response.text}")
        medicine = response.json()
        self.created_resources["medicines"].append(medicine["id"])
        print(f"Created medicine with ID: {medicine['id']}")
        
        # Search for the medicine
        print(f"Searching for medicine with term: {unique_term}...")
        response = requests.get(f"{API_URL}/search/medicines?q={unique_term}")
        self.assertEqual(response.status_code, 200, f"Failed to search medicines: {response.text}")
        search_results = response.json()
        
        # Verify search results
        self.assertIsInstance(search_results, list, "Search results is not a list")
        self.assertGreaterEqual(len(search_results), 1, "Search returned no results")
        
        # Check if our medicine is in the results
        found = False
        for result in search_results:
            if result["id"] == medicine["id"]:
                found = True
                break
        
        self.assertTrue(found, "Created medicine not found in search results")
        print(f"Search successful. Found {len(search_results)} results including our test medicine.")
    
    def test_07_low_stock_medicines(self):
        """Test low stock medicines endpoint"""
        print("\n=== Testing Low Stock Medicines ===")
        
        # Create a medicine with low stock
        low_stock_medicine_data = self.medicine_data.copy()
        low_stock_medicine_data["stock_quantity"] = 5
        low_stock_medicine_data["min_stock_level"] = 10
        
        print("Creating medicine with low stock...")
        response = requests.post(f"{API_URL}/medicines", json=low_stock_medicine_data)
        self.assertEqual(response.status_code, 200, f"Failed to create medicine: {response.text}")
        medicine = response.json()
        self.created_resources["medicines"].append(medicine["id"])
        print(f"Created low stock medicine with ID: {medicine['id']}")
        
        # Get low stock medicines
        print("Getting low stock medicines...")
        response = requests.get(f"{API_URL}/medicines/low-stock")
        self.assertEqual(response.status_code, 200, f"Failed to get low stock medicines: {response.text}")
        low_stock_medicines = response.json()
        
        # Verify our medicine is in the low stock list
        low_stock_ids = [m["id"] for m in low_stock_medicines]
        self.assertIn(medicine["id"], low_stock_ids, "Created low stock medicine not found in low stock list")
        print(f"Low stock medicines retrieved successfully. Found {len(low_stock_medicines)} low stock medicines.")
    
    def test_08_expired_medicines(self):
        """Test expired medicines endpoint"""
        print("\n=== Testing Expired Medicines ===")
        
        # Create a medicine with expired date
        expired_medicine_data = self.medicine_data.copy()
        expired_medicine_data["expiry_date"] = datetime.combine(date.today() - timedelta(days=1), datetime.min.time()).isoformat()
        
        print("Creating medicine with expired date...")
        response = requests.post(f"{API_URL}/medicines", json=expired_medicine_data)
        self.assertEqual(response.status_code, 200, f"Failed to create medicine: {response.text}")
        medicine = response.json()
        self.created_resources["medicines"].append(medicine["id"])
        print(f"Created expired medicine with ID: {medicine['id']}")
        
        # Get expired medicines
        print("Getting expired medicines...")
        response = requests.get(f"{API_URL}/medicines/expired")
        self.assertEqual(response.status_code, 200, f"Failed to get expired medicines: {response.text}")
        expired_medicines = response.json()
        
        # Verify our medicine is in the expired list
        expired_ids = [m["id"] for m in expired_medicines]
        self.assertIn(medicine["id"], expired_ids, "Created expired medicine not found in expired list")
        print(f"Expired medicines retrieved successfully. Found {len(expired_medicines)} expired medicines.")

def run_tests():
    """Run all tests"""
    print(f"Testing Pharmacy Management System API at: {API_URL}")
    unittest.main(argv=['first-arg-is-ignored'], exit=False)

if __name__ == "__main__":
    run_tests()