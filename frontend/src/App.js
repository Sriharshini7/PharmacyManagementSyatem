import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data functions
  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API}/medicines`);
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/sales`);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const searchMedicines = async (query) => {
    if (!query.trim()) {
      fetchMedicines();
      return;
    }
    try {
      const response = await axios.get(`${API}/search/medicines?q=${query}`);
      setMedicines(response.data);
    } catch (error) {
      console.error('Error searching medicines:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchMedicines();
    fetchCustomers();
    fetchSales();
    fetchSuppliers();
  }, []);

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">PharmaCare Management</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded ${currentView === 'dashboard' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('medicines')}
            className={`px-4 py-2 rounded ${currentView === 'medicines' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
          >
            Medicines
          </button>
          <button 
            onClick={() => setCurrentView('sales')}
            className={`px-4 py-2 rounded ${currentView === 'sales' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
          >
            Sales
          </button>
          <button 
            onClick={() => setCurrentView('customers')}
            className={`px-4 py-2 rounded ${currentView === 'customers' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
          >
            Customers
          </button>
          <button 
            onClick={() => setCurrentView('suppliers')}
            className={`px-4 py-2 rounded ${currentView === 'suppliers' ? 'bg-blue-800' : 'bg-blue-500 hover:bg-blue-700'}`}
          >
            Suppliers
          </button>
        </div>
      </div>
    </nav>
  );

  // Dashboard Component
  const Dashboard = () => (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Medicines</h3>
          <p className="text-3xl font-bold">{dashboardStats.total_medicines || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Low Stock Alert</h3>
          <p className="text-3xl font-bold">{dashboardStats.low_stock_count || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Today's Sales</h3>
          <p className="text-3xl font-bold">{dashboardStats.today_sales_count || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold">${dashboardStats.today_revenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Sales</h3>
          <div className="space-y-2">
            {sales.slice(0, 5).map((sale, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{sale.customer_name || 'Walk-in Customer'}</p>
                  <p className="text-sm text-gray-600">{new Date(sale.sale_date).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-green-600">${sale.total_amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Low Stock Medicines</h3>
          <div className="space-y-2">
            {medicines.filter(med => med.stock_quantity <= med.min_stock_level).slice(0, 5).map((medicine, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                <div>
                  <p className="font-medium">{medicine.name}</p>
                  <p className="text-sm text-gray-600">{medicine.manufacturer}</p>
                </div>
                <p className="font-bold text-red-600">{medicine.stock_quantity} left</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Medicine Management Component
  const MedicineManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      generic_name: '',
      manufacturer: '',
      category: '',
      dosage: '',
      form: '',
      batch_number: '',
      expiry_date: '',
      purchase_price: '',
      selling_price: '',
      stock_quantity: '',
      min_stock_level: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API}/medicines`, {
          ...formData,
          purchase_price: parseFloat(formData.purchase_price),
          selling_price: parseFloat(formData.selling_price),
          stock_quantity: parseInt(formData.stock_quantity),
          min_stock_level: parseInt(formData.min_stock_level)
        });
        setShowAddForm(false);
        setFormData({
          name: '',
          generic_name: '',
          manufacturer: '',
          category: '',
          dosage: '',
          form: '',
          batch_number: '',
          expiry_date: '',
          purchase_price: '',
          selling_price: '',
          stock_quantity: '',
          min_stock_level: ''
        });
        fetchMedicines();
        fetchDashboardStats();
      } catch (error) {
        console.error('Error adding medicine:', error);
      }
    };

    const handleDelete = async (medicineId) => {
      if (window.confirm('Are you sure you want to delete this medicine?')) {
        try {
          await axios.delete(`${API}/medicines/${medicineId}`);
          fetchMedicines();
          fetchDashboardStats();
        } catch (error) {
          console.error('Error deleting medicine:', error);
        }
      }
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Medicine Management</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add Medicine
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchMedicines(e.target.value);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add Medicine Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">Add New Medicine</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Medicine Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Generic Name"
                    value={formData.generic_name}
                    onChange={(e) => setFormData({...formData, generic_name: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.form}
                    onChange={(e) => setFormData({...formData, form: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Form</option>
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="cream">Cream</option>
                    <option value="drops">Drops</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Batch Number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Purchase Price"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Selling Price"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({...formData, selling_price: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Min Stock Level"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})}
                    required
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Add Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medicine List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((medicine) => (
                  <tr key={medicine.id} className={medicine.stock_quantity <= medicine.min_stock_level ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.generic_name}</div>
                        <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.category}</div>
                      <div className="text-sm text-gray-500">{medicine.form} - {medicine.dosage}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.stock_quantity}</div>
                      <div className="text-sm text-gray-500">Min: {medicine.min_stock_level}</div>
                      {medicine.stock_quantity <= medicine.min_stock_level && (
                        <span className="text-red-600 text-xs font-medium">Low Stock!</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${medicine.selling_price}</div>
                      <div className="text-sm text-gray-500">Cost: ${medicine.purchase_price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{medicine.expiry_date}</div>
                      <div className="text-sm text-gray-500">Batch: {medicine.batch_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(medicine.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Sales Management Component
  const SalesManagement = () => {
    const [showSaleForm, setShowSaleForm] = useState(false);
    const [saleItems, setSaleItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);

    const addSaleItem = (medicine) => {
      const existingItem = saleItems.find(item => item.medicine_id === medicine.id);
      if (existingItem) {
        setSaleItems(saleItems.map(item => 
          item.medicine_id === medicine.id 
            ? {...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price}
            : item
        ));
      } else {
        setSaleItems([...saleItems, {
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          quantity: 1,
          unit_price: medicine.selling_price,
          total_price: medicine.selling_price
        }]);
      }
    };

    const updateItemQuantity = (medicineId, quantity) => {
      setSaleItems(saleItems.map(item => 
        item.medicine_id === medicineId 
          ? {...item, quantity: quantity, total_price: quantity * item.unit_price}
          : item
      ));
    };

    const removeItem = (medicineId) => {
      setSaleItems(saleItems.filter(item => item.medicine_id !== medicineId));
    };

    const calculateSubtotal = () => {
      return saleItems.reduce((sum, item) => sum + item.total_price, 0);
    };

    const processSale = async () => {
      if (saleItems.length === 0) return;

      const subtotal = calculateSubtotal();
      const saleData = {
        customer_name: customerName || 'Walk-in Customer',
        items: saleItems,
        subtotal: subtotal,
        discount_percent: discountPercent,
        tax_percent: taxPercent,
        payment_method: 'cash'
      };

      try {
        await axios.post(`${API}/sales`, saleData);
        setShowSaleForm(false);
        setSaleItems([]);
        setCustomerName('');
        setDiscountPercent(0);
        setTaxPercent(0);
        fetchSales();
        fetchMedicines();
        fetchDashboardStats();
        alert('Sale completed successfully!');
      } catch (error) {
        console.error('Error processing sale:', error);
        alert('Error processing sale. Please try again.');
      }
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Sales Management</h2>
          <button 
            onClick={() => setShowSaleForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            New Sale
          </button>
        </div>

        {/* New Sale Form */}
        {showSaleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">New Sale</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Select Medicines</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {medicines.filter(med => med.stock_quantity > 0).map((medicine) => (
                      <div key={medicine.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{medicine.name}</p>
                          <p className="text-sm text-gray-600">${medicine.selling_price} - Stock: {medicine.stock_quantity}</p>
                        </div>
                        <button
                          onClick={() => addSaleItem(medicine)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Sale Items</h4>
                  <div className="space-y-2 mb-4">
                    <input
                      type="text"
                      placeholder="Customer Name (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {saleItems.map((item) => (
                      <div key={item.medicine_id} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <div>
                          <p className="font-medium">{item.medicine_name}</p>
                          <p className="text-sm text-gray-600">${item.unit_price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.medicine_id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <span className="font-medium">${item.total_price.toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(item.medicine_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Discount (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Tax (%):</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>${(calculateSubtotal() - (calculateSubtotal() * discountPercent / 100) + ((calculateSubtotal() - (calculateSubtotal() * discountPercent / 100)) * taxPercent / 100)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={() => setShowSaleForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={processSale}
                      disabled={saleItems.length === 0}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                    >
                      Process Sale
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(sale.sale_date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{new Date(sale.sale_date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.customer_name || 'Walk-in Customer'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.items.length} items</div>
                      <div className="text-sm text-gray-500">
                        {sale.items.map(item => `${item.medicine_name} (${item.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${sale.total_amount.toFixed(2)}</div>
                      {sale.discount_amount > 0 && (
                        <div className="text-sm text-gray-500">Discount: ${sale.discount_amount.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">{sale.payment_method}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Customer Management Component
  const CustomerManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      email: '',
      address: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API}/customers`, formData);
        setShowAddForm(false);
        setFormData({ name: '', phone: '', email: '', address: '' });
        fetchCustomers();
      } catch (error) {
        console.error('Error adding customer:', error);
      }
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Customer Management</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add Customer
          </button>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4">Add New Customer</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Address (Optional)"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Add Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      {customer.email && <div className="text-sm text-gray-500">{customer.email}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Supplier Management Component
  const SupplierManagement = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API}/suppliers`, formData);
        setShowAddForm(false);
        setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
        fetchSuppliers();
      } catch (error) {
        console.error('Error adding supplier:', error);
      }
    };

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Supplier Management</h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Add Supplier
          </button>
        </div>

        {/* Add Supplier Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold mb-4">Add New Supplier</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Address (Optional)"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Add Supplier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Supplier List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.contact_person}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{supplier.address || 'N/A'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'medicines':
        return <MedicineManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;