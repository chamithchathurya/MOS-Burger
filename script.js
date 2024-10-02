


const { jsPDF } = window.jspdf;

// Food item array
let foodItems = [
    { id: 1, code: 'B1001', name: 'Classic Burger(L)', category: 'Burgers', price: 750.00, expireDate: '2024-12-31', quality: 'Good', quantity: 50 },
    { id: 2, code: 'B1003', name: 'Turkey Burger', category: 'Burgers', price: 1600.00, expireDate: '2024-12-31', quality: 'Good', quantity: 40 },
    { id: 3, code: 'B1004', name: 'Chicken Burger(L)', category: 'Burgers', price: 1400.00, expireDate: '2024-10-30', quality: 'Good', quantity: 30 },
    { id: 4, code: 'B1006', name: 'Cheese Burger', category: 'Burgers', price: 1000.00, expireDate: '2025-01-15', quality: 'Good', quantity: 20 },
    { id: 5, code: 'B1026', name: 'Steak Fries(M)', category: 'Fries', price: 600.00, expireDate: '2024-11-01', quality: 'Good', quantity: 70 },
    { id: 6, code: 'B1035', name: 'Lamon Butter Pasta', category: 'Pasta', price: 1950.00, expireDate: '2025-12-31', quality: 'Good', quantity: 100 },
    { id: 7, code: 'B1016', name: 'Crispy Chicken Submarine', category: 'Submarine', price:2000.00, expireDate: '2024-12-31', quality: 'Good', quantity: 80 },
    { id: 8, code: 'B1020', name: 'Grinder Submarine', category: 'Submarine', price: 2300.00, expireDate: '2024-12-31', quality: 'Good', quantity: 80 },
    { id: 9, code: 'B1021', name: 'Cheese Submarine', category: 'Submarine', price: 2100.00, expireDate: '2024-10-15', quality: 'Good', quantity: 25 },
    { id: 10, code: 'B1025', name: 'Steak Frise(L)', category: 'Fries', price: 1200.00, expireDate: '2024-12-31', quality: 'Good', quantity: 60 },
];

// Customers Array
let customers = [
    { id: 1, name: 'Sandupa', phone: '077-1234567', orders: [] },
    { id: 2, name: 'Sithum', phone: '011-4589687', orders: [] },
    { id: 3, name: 'Chamith', phone: '074-3712721', orders: [] },
]; 

// Orders Array
let orders = [];

// Selecte items for oder
let selectedItems = [];

// GEnerate food item to dashbord
function renderFoodItemsDashboard() {
    const container = document.getElementById('food-items-container');
    container.innerHTML = '';

    // get search value
    const searchQuery = document.getElementById('search-bar').value.trim().toLowerCase();

    foodItems.forEach(item => {
        // Skip items that are expired or out of stock
        if (item.quality === 'Expired' || item.quantity === 0) return;

        // Apply search filter
        if (searchQuery) {
            const matchesCode = item.code.toLowerCase().includes(searchQuery);
            const matchesName = item.name.toLowerCase().includes(searchQuery);
            const matchesCategory = item.category.toLowerCase().includes(searchQuery);
            if (!matchesCode && !matchesName && !matchesCategory) return;
        }

        const card = document.createElement('div'); // create card division
        card.className = 'col-md-6 food-card';

        card.innerHTML = `
            <h5>${item.name}</h5>
            <p>Code: ${item.code}</p>
            <p>Category: ${item.category}</p>
            <p>Rs.${item.price.toFixed(2)}</p>
            <p>Available: ${item.quantity}</p>
            <div class="input-group mb-3">
                <input type="number" class="form-control" placeholder="Quantity" min="1" max="${item.quantity}" id="qty-${item.code}">
                <button class="btn btn-success" onclick="addItemToOrder('${item.code}')">Add</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Add item to oder
function addItemToOrder(itemCode) {
    const quantityInput = document.getElementById(`qty-${itemCode}`);
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        alert('Please enter a valid quantity.');
        return;
    }

    const item = foodItems.find(f => f.code === itemCode);

    if (quantity > item.quantity) {
        alert('Requested quantity exceeds available stock.');
        return;
    }

    // Check item is already in selected
    const existingItem = selectedItems.find(i => i.code === itemCode);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        selectedItems.push({
            code: item.code,
            name: item.name,
            quantity: quantity,
            price: item.price
        });
    }

    // Update available quantity
    item.quantity -= quantity;
    renderFoodItemsDashboard();
    renderSelectedItems();
}

// generate selected items
function renderSelectedItems() {
    const list = document.getElementById('selected-items-list');
    list.innerHTML = '';

    selectedItems.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            ${item.name} (x${item.quantity}) - Rs.${(item.price * item.quantity).toFixed(2)}
            <button class="btn btn-sm btn-danger" onclick="removeItemFromOrder(${index})">Remove</button>
        `;
        list.appendChild(listItem);
    });
}

// remove item order
function removeItemFromOrder(index) {
    const item = selectedItems[index];
    const originalItem = foodItems.find(f => f.code === item.code);
    originalItem.quantity += item.quantity;
    selectedItems.splice(index, 1);
    renderFoodItemsDashboard();
    renderSelectedItems();
}

// place oder function
function placeOrder() {
    if (selectedItems.length === 0) {
        alert('No items selected for the order.');
        return;
    }

    // customer selection
    const customerNames = customers.map(c => c.name).join('\n');
    const customerName = prompt(`Enter customer name:\nAvailable customers:\n${customerNames}`);

    if (!customerName) {
        alert('Customer name is required.');
        return;
    }

    const customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    if (!customer) {
        alert('Customer not found.');
        return;
    }

    const orderId = `MOS-ODR-${Date.now()}`;
    const orderDetails = {
        orderId: orderId,
        customerId: customer.id,
        customerName: customer.name,
        items: selectedItems.map(item => ({
            code: item.code,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        date: new Date().toLocaleString()
    };

    // Calculate total amount
    let totalAmount = 0;
    orderDetails.items.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    orderDetails.totalAmount = totalAmount.toFixed(2);

    // Add order to orders array
    orders.push(orderDetails);

    // Add order to customer
    customer.orders.push(orderDetails);

    // Display order details in modal
    document.getElementById('modal-order-id').innerText = orderDetails.orderId;
    document.getElementById('modal-customer-name').innerText = orderDetails.customerName;
    document.getElementById('modal-order-date').innerText = orderDetails.date;

    const itemsTable = document.getElementById('modal-order-items');
    itemsTable.innerHTML = '';
    orderDetails.items.forEach(item => {
        const row = document.createElement('tr');
        const totalPrice = item.price * item.quantity;
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>Rs.${totalPrice.toFixed(2)}</td>
        `;
        itemsTable.appendChild(row);
    });

    // Set the total amount
    document.getElementById('modal-total-amount').innerText = orderDetails.totalAmount;

    // Show the modal
    const orderModal = new bootstrap.Modal(document.getElementById('orderSheetModal'));
    orderModal.show();

    // Reset order
    selectedItems = [];
    renderFoodItemsDashboard();
    renderSelectedItems();
}

// control navigation item
function showSection(sectionId) {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = '';

    if (sectionId === 'dashboard') {
        mainContent.innerHTML = `
            <h2>Dashboard</h2>
            <!-- Search Bar -->
            <div class="mb-3">
                <input type="text" class="form-control" id="search-bar" placeholder="Search by Food Code, Name, or Category" oninput="renderFoodItemsDashboard()">
            </div>
            <div class="row g-2">
                <!-- Food Items Section -->
                <div class="col-md-8">
                    <div id="food-items-container" class="row">
                        <!-- Food cards will be appended here -->
                    </div>
                </div>

                <!-- Selected Order Items -->
                <div class="col-md-4">
                    <div class="order-section">
                        <h4>Selected Items</h4>
                        <ul id="selected-items-list" class="list-group mb-3">
                            <!-- Selected items will appear here -->
                        </ul>
                        <button class="btn btn-primary" id="place-order-btn">Place Order</button>
                    </div>
                </div>
            </div>
        `;

        // Re-attach event listeners and render items
        document.getElementById('place-order-btn').addEventListener('click', placeOrder);
        renderFoodItemsDashboard();
        renderSelectedItems();
        }else if (sectionId === 'food') {
        // Food Items Management
        mainContent.innerHTML = `
            <h2>Food Items Management</h2>
            <button class="btn btn-success mb-3" onclick="openFoodModal()">Add Food Item</button>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price Rs.</th>
                        <th>Expire Date</th>
                        <th>Quality</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="food-items-table-body">
                    <!-- Food items will be inserted here -->
                </tbody>
            </table>
        `;

        renderFoodItemsTable();
    } else if (sectionId === 'customer') {
        //  Customer Information Management
        mainContent.innerHTML = `
            <h2>Customer Information</h2>
            <button class="btn btn-success mb-3" onclick="openCustomerModal()">Add Customer</button>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Number of Orders</th>
                        <th>Actions</th>
                        <th>View Orders</th>
                    </tr>
                </thead>
                <tbody id="customers-table-body">
                    <!-- Customers will be inserted here -->
                </tbody>
            </table>
        `;

        renderCustomersTable();
    } else if (sectionId === 'report') {
        mainContent.innerHTML = `
            <h2>Reports</h2>
            <div class="mb-3">
                <label for="report-type" class="form-label">Report Type</label>
                <select class="form-select" id="report-type">
                    <option value="monthly">Monthly Report</option>
                    <option value="annual">Annual Report</option>
                </select>
            </div>
            <div class="mb-3" id="report-month-container">
                <label for="report-month" class="form-label">Select Month</label>
                <input type="month" class="form-control" id="report-month">
            </div>
            <div class="mb-3" id="report-year-container" style="display: none;">
                <label for="report-year" class="form-label">Select Year</label>
                <input type="number" class="form-control" id="report-year" min="2000" max="2100" value="2024">
            </div>
            <button class="btn btn-primary" onclick="generateReport()">Generate Report</button>
            <button class="btn btn-success ms-2" onclick="exportReportToPDF()">Export to PDF</button>

            <div class="mt-4" id="report-content">
                <!-- Report will be displayed here -->
            </div>
        `;

        // select report type
        document.getElementById('report-type').addEventListener('change', function() {
            const reportType = this.value;
            if (reportType === 'monthly') {
                document.getElementById('report-month-container').style.display = 'block';
                document.getElementById('report-year-container').style.display = 'none';
            } else if (reportType === 'annual') {
                document.getElementById('report-month-container').style.display = 'none';
                document.getElementById('report-year-container').style.display = 'block';
            }
        });
    }
}

// render Food Items in a table (Food Items Management)
function renderFoodItemsTable() {
    const tableBody = document.getElementById('food-items-table-body');
    tableBody.innerHTML = '';

    foodItems.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.expireDate}</td>
            <td>${item.quality}</td>
            <td>${item.quantity}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editFoodItem(${item.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteFoodItem(${item.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to open Food Modal for Adding
function openFoodModal() {
    // Reset form
    document.getElementById('food-form').reset();
    document.getElementById('food-id').value = '';
    document.getElementById('foodModalLabel').innerText = 'Add Food Item';
    const foodModal = new bootstrap.Modal(document.getElementById('foodModal'));
    foodModal.show();
}

// Function to open Food Modal for Editing
function editFoodItem(id) {
    const item = foodItems.find(f => f.id === id);
    if (!item) return;

    document.getElementById('food-id').value = item.id;
    document.getElementById('food-code').value = item.code;
    document.getElementById('food-name').value = item.name;
    document.getElementById('food-category').value = item.category;
    document.getElementById('food-price').value = item.price;
    document.getElementById('food-expire-date').value = item.expireDate;
    document.getElementById('food-quality').value = item.quality;
    document.getElementById('food-quantity').value = item.quantity;

    document.getElementById('foodModalLabel').innerText = 'Edit Food Item';
    const foodModal = new bootstrap.Modal(document.getElementById('foodModal'));
    foodModal.show();
}

//  delete Food Item
function deleteFoodItem(id) {
    if (!confirm('Are you sure you want to delete this food item?')) return;

    foodItems = foodItems.filter(f => f.id !== id);
    renderFoodItemsTable();

    //  update selected same items 
    selectedItems = selectedItems.filter(item => item.code !== foodItems.find(f => f.id === id)?.code);
    renderSelectedItems();
    renderFoodItemsDashboard();
}

// Food Form Submission
document.getElementById('food-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('food-id').value;
    const code = document.getElementById('food-code').value.trim();
    const name = document.getElementById('food-name').value.trim();
    const category = document.getElementById('food-category').value.trim();
    const price = parseFloat(document.getElementById('food-price').value);
    const expireDate = document.getElementById('food-expire-date').value;
    const quality = document.getElementById('food-quality').value;
    const quantity = parseInt(document.getElementById('food-quantity').value);

    if (id) {
        // Edit existing food item
        const itemIndex = foodItems.findIndex(f => f.id === parseInt(id));
        if (itemIndex !== -1) {
            foodItems[itemIndex] = {
                id: parseInt(id),
                code,
                name,
                category,
                price,
                expireDate,
                quality,
                quantity
            };
        }
    } else {
        // Add new food item
        const newId = foodItems.length > 0 ? Math.max(...foodItems.map(f => f.id)) + 1 : 1;
        foodItems.push({
            id: newId,
            code,
            name,
            category,
            price,
            expireDate,
            quality,
            quantity
        });
    }

    // Close modal
    const foodModal = bootstrap.Modal.getInstance(document.getElementById('foodModal'));
    foodModal.hide();

    // Refresh table or dashboard
    const currentSection = document.querySelector('.main-content').innerHTML;
    if (currentSection.includes('Food Items Management')) {
        renderFoodItemsTable();
    } else if (currentSection.includes('Dashboard')) {
        renderFoodItemsDashboard();
    }
});

// Function to render Customers in a table (Customer Information)
function renderCustomersTable() {
    const tableBody = document.getElementById('customers-table-body');
    tableBody.innerHTML = '';

    customers.forEach(customer => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.orders.length}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editCustomer(${customer.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCustomerOrders(${customer.id})">View Orders</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// open Customer Modal for Adding
function openCustomerModal() {
    // Reset form
    document.getElementById('customer-form').reset();
    document.getElementById('customer-id').value = '';
    document.getElementById('customerModalLabel').innerText = 'Add Customer';
    const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
    customerModal.show();
}

//open Customer Modal for Editing
function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('customer-id').value = customer.id;
    document.getElementById('customer-name').value = customer.name;
    document.getElementById('customer-phone').value = customer.phone;

    document.getElementById('customerModalLabel').innerText = 'Edit Customer';
    const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
    customerModal.show();
}

// Function to delete Customer
function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    customers = customers.filter(c => c.id !== id);
    orders = orders.filter(o => o.customerId !== id);
    renderCustomersTable();
}

//  Customer Form Submission
document.getElementById('customer-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('customer-id').value;
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

    if (id) {
        // Edit existing customer
        const customerIndex = customers.findIndex(c => c.id === parseInt(id));
        if (customerIndex !== -1) {
            customers[customerIndex].name = name;
            customers[customerIndex].phone = phone;
        }
    } else {
        // Add new customer
        const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
        customers.push({
            id: newId,
            name,
            phone,
            orders: []
        });
    }

    // Close modal
    const customerModal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
    customerModal.hide();

    // Refresh table or dashboard
    const currentSection = document.querySelector('.main-content').innerHTML;
    if (currentSection.includes('Customer Information')) {
        renderCustomersTable();
    }
});

// view customer orders
function viewCustomerOrders(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    document.getElementById('modal-customer-name-view').innerText = customer.name;
    document.getElementById('modal-customer-phone-view').innerText = customer.phone;

    const ordersTableBody = document.getElementById('modal-customer-orders');
    ordersTableBody.innerHTML = '';

    if (customer.orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No orders found.</td></tr>';
    } else {
        customer.orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.date}</td>
                <td>Rs.${order.totalAmount}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="previewOrder('${order.orderId}')">View Details</button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }

    const customerOrdersModal = new bootstrap.Modal(document.getElementById('customerOrdersModal'));
    customerOrdersModal.show();
}

// Function to preview order details (Same as Order Sheet Modal)
function previewOrder(orderId) {
    const order = orders.find(o => o.orderId === orderId);
    if (!order) return;

    document.getElementById('modal-order-id').innerText = order.orderId;
    document.getElementById('modal-customer-name').innerText = order.customerName;
    document.getElementById('modal-order-date').innerText = order.date;

    const itemsTable = document.getElementById('modal-order-items');
    itemsTable.innerHTML = '';
    order.items.forEach(item => {
        const row = document.createElement('tr');
        const totalPrice = item.price * item.quantity;
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>Rs.${totalPrice.toFixed(2)}</td>
        `;
        itemsTable.appendChild(row);
    });

    // Set the total amount
    document.getElementById('modal-total-amount').innerText = order.totalAmount;

    // Show the modal
    const orderModal = new bootstrap.Modal(document.getElementById('orderSheetModal'));
    orderModal.show();
}

// Function to generate report
let currentReport = null; 

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    let filteredOrders = [];

    if (reportType === 'monthly') {
        const monthInput = document.getElementById('report-month').value;
        if (!monthInput) {
            alert('Please select a month.');
            return;
        }
        const [year, month] = monthInput.split('-').map(Number);
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getFullYear() === year && (orderDate.getMonth() + 1) === month;
        });
    } else if (reportType === 'annual') {
        const year = parseInt(document.getElementById('report-year').value);
        if (!year) {
            alert('Please enter a valid year.');
            return;
        }
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getFullYear() === year;
        });
    }

    // Calculate total sales
    const totalSales = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0).toFixed(2);

    // Calculate number of orders
    const numberOfOrders = filteredOrders.length;

    // Display report
    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = `
        <h4>Report Summary</h4>
        <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</p>
        ${reportType === 'monthly' ? `<p><strong>Month:</strong> ${new Date(filteredOrders[0]?.date).toLocaleString('default', { month: 'long' }) || 'N/A'}</p>` : `<p><strong>Year:</strong> ${document.getElementById('report-year').value}</p>`}
        <p><strong>Total Sales:</strong> Rs.${totalSales}</p>
        <p><strong>Number of Orders:</strong> ${numberOfOrders}</p>

        <h5>Order Details:</h5>
        <table class="table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total Amount Rs.</th>
                </tr>
            </thead>
            <tbody>
                ${filteredOrders.map(order => `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${order.customerName}</td>
                        <td>${order.date}</td>
                        <td>Rs.${order.totalAmount}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    currentReport = {
        reportType,
        filteredOrders,
        totalSales,
        numberOfOrders,
        generatedOn: new Date().toLocaleString()
    };
}

// Function to export report to PDF
function exportReportToPDF() {
    if (!currentReport) {
        alert('Please generate a report first.');
        return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('POS System Report', 14, 22);

    doc.setFontSize(12);
    doc.text(`Report Type: ${currentReport.reportType.charAt(0).toUpperCase() + currentReport.reportType.slice(1)} Report`, 14, 32);
    if (currentReport.reportType === 'monthly') {
        const month = new Date(currentReport.filteredOrders[0]?.date).toLocaleString('default', { month: 'long' }) || 'N/A';
        doc.text(`Month: ${month}`, 14, 40);
    } else {
        doc.text(`Year: ${document.getElementById('report-year').value}`, 14, 40);
    }
    doc.text(`Total Sales: Rs.${currentReport.totalSales}`, 14, 48);
    doc.text(`Number of Orders: ${currentReport.numberOfOrders}`, 14, 56);
    doc.text(`Generated On: ${currentReport.generatedOn}`, 14, 64);

    // Add table headers
    doc.autoTable({
        startY: 70,
        head: [['Order ID', 'Customer', 'Date', 'Total Amount Rs.']],
        body: currentReport.filteredOrders.map(order => [order.orderId, order.customerName, order.date, `$${order.totalAmount}`]),
        theme: 'grid',
        styles: { fontSize: 10 },
    });

    doc.save('report.pdf');
}

// Attach event listeners to navigation items
document.getElementById('nav-dashboard').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('dashboard');
});

document.getElementById('nav-food').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('food');
});

document.getElementById('nav-customer').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('customer');
});

document.getElementById('nav-report').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('report');
});

// Initial rendering
showSection('dashboard');
