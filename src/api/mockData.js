// Initial Mock Data for Restaurant Billing System

export const INITIAL_CATEGORIES = [
  { id: 1, name: "Starters & Appetizers", icon: "UtensilsCrossed", count: 8 },
  { id: 2, name: "Main Course", icon: "Soup", count: 14 },
  { id: 3, name: "Breads & Rice", icon: "Wheat", count: 6 },
  { id: 4, name: "Beverages", icon: "Coffee", count: 10 },
  { id: 5, name: "Desserts", icon: "IceCream", count: 5 }
];

export const INITIAL_MENU_ITEMS = [
  {
    id: 1,
    category: 2,
    category_name: "Main Course",
    name: "Chicken Biryani",
    description: "Aromatic basmati rice cooked with succulent chicken and secret spices",
    price: "340.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    category: 2,
    category_name: "Main Course",
    name: "Paneer Butter Masala",
    description: "Cottage cheese cubes in rich cashew and tomato gravy with butter",
    price: "280.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    category: 1,
    category_name: "Starters & Appetizers",
    name: "Crispy Garlic Wings",
    description: "Golden fried chicken wings tossed in garlic herb butter",
    price: "260.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    category: 3,
    category_name: "Breads & Rice",
    name: "Butter Naan",
    description: "Tandoor-baked leavened flatbread brushed with fresh butter",
    price: "50.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    category: 4,
    category_name: "Beverages",
    name: "Mango Lassi",
    description: "Traditional sweet yogurt beverage blended with fresh Alphonso mangoes",
    price: "120.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    category: 5,
    category_name: "Desserts",
    name: "Gulab Jamun with Ice Cream",
    description: "Warm milk solid dumplings in cardamom syrup served with vanilla ice cream",
    price: "150.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 7,
    category: 2,
    category_name: "Main Course",
    name: "Mutton Rogan Josh",
    description: "Slow-cooked Kashmiri style tender lamb curry",
    price: "420.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: 8,
    category: 1,
    category_name: "Starters & Appetizers",
    name: "Tandoori Paneer Tikka",
    description: "Marinated cottage cheese cooked in clay oven with peppers",
    price: "240.00",
    is_available: true,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=60"
  }
];

export const INITIAL_TABLES = [
  { id: 1, table_number: 1, capacity: 2, status: "OCCUPIED" },
  { id: 2, table_number: 2, capacity: 4, status: "AVAILABLE" },
  { id: 3, table_number: 3, capacity: 4, status: "RESERVED" },
  { id: 4, table_number: 4, capacity: 6, status: "OCCUPIED" },
  { id: 5, table_number: 5, capacity: 2, status: "AVAILABLE" },
  { id: 6, table_number: 6, capacity: 8, status: "AVAILABLE" }
];

export const INITIAL_STAFF = [
  { id: 1, username: "owner", email: "owner@restaurant.com", role: "OWNER", phone: "+91 98765 00001", created_at: "2026-01-10" },
  { id: 2, username: "waiter_rahul", email: "rahul@restaurant.com", role: "WAITER", phone: "9876543210", created_at: "2026-02-15" },
  { id: 3, username: "waiter_priya", email: "priya@restaurant.com", role: "WAITER", phone: "9876543211", created_at: "2026-03-01" },
  { id: 4, username: "waiter_amit", email: "amit@restaurant.com", role: "WAITER", phone: "9876543212", created_at: "2026-03-20" }
];

export const INITIAL_ORDERS = [
  {
    id: 1,
    order_number: "ORD-1001",
    table_id: 1,
    table_number: 1,
    waiter_username: "waiter_rahul",
    status: "PENDING",
    notes: "Extra spicy, less oil",
    created_at: "2026-10-07T14:30:00Z",
    items: [
      { menu_item_id: 1, name: "Chicken Biryani", price: "340.00", quantity: 2, subtotal: "680.00" },
      { menu_item_id: 3, name: "Crispy Garlic Wings", price: "260.00", quantity: 1, subtotal: "260.00" }
    ],
    total_amount: "940.00"
  },
  {
    id: 2,
    order_number: "ORD-1002",
    table_id: 4,
    table_number: 4,
    waiter_username: "waiter_priya",
    status: "SERVED",
    notes: "Serve dessert after main meal",
    created_at: "2026-10-07T14:15:00Z",
    items: [
      { menu_item_id: 2, name: "Paneer Butter Masala", price: "280.00", quantity: 2, subtotal: "560.00" },
      { menu_item_id: 4, name: "Butter Naan", price: "50.00", quantity: 4, subtotal: "200.00" },
      { menu_item_id: 5, name: "Mango Lassi", price: "120.00", quantity: 2, subtotal: "240.00" }
    ],
    total_amount: "1000.00"
  }
];

export const INITIAL_BILLS = [
  {
    id: 1,
    order_id: 2,
    bill_number: "INV-2026-001",
    table_number: 4,
    waiter_username: "waiter_priya",
    subtotal: "1000.00",
    tax_percentage: "5.0",
    tax_amount: "50.00",
    discount_amount: "20.00",
    final_amount: "1030.00",
    is_paid: true,
    payment_mode: "UPI",
    created_at: "2026-10-07T14:45:00Z",
    items: [
      { menu_item_id: 2, name: "Paneer Butter Masala", price: "280.00", quantity: 2, subtotal: "560.00" },
      { menu_item_id: 4, name: "Butter Naan", price: "50.00", quantity: 4, subtotal: "200.00" },
      { menu_item_id: 5, name: "Mango Lassi", price: "120.00", quantity: 2, subtotal: "240.00" }
    ]
  }
];

export const INITIAL_ANALYTICS = {
  sales_summary: {
    total_revenue: "48,250.00",
    today_revenue: "12,450.00",
    total_orders: 142,
    today_orders: 28,
    avg_order_value: "444.60",
    growth_percentage: "+14.2%",
    hourly_sales: [
      { hour: "12 PM", sales: 1200 },
      { hour: "1 PM", sales: 2800 },
      { hour: "2 PM", sales: 2100 },
      { hour: "3 PM", sales: 900 },
      { hour: "7 PM", sales: 3400 },
      { hour: "8 PM", sales: 4200 },
      { hour: "9 PM", sales: 3100 },
      { hour: "10 PM", sales: 1500 }
    ]
  },
  top_dishes: [
    { id: 1, name: "Chicken Biryani", category: "Main Course", orders_count: 86, total_sales: "29,240.00" },
    { id: 2, name: "Paneer Butter Masala", category: "Main Course", orders_count: 64, total_sales: "17,920.00" },
    { id: 4, name: "Butter Naan", category: "Breads & Rice", orders_count: 190, total_sales: "9,500.00" },
    { id: 3, name: "Crispy Garlic Wings", category: "Starters", orders_count: 42, total_sales: "10,920.00" },
    { id: 5, name: "Mango Lassi", category: "Beverages", orders_count: 58, total_sales: "6,960.00" }
  ],
  waiter_performance: [
    { id: 2, username: "waiter_rahul", total_orders: 54, total_revenue: "22,400.00", rating: 4.8 },
    { id: 3, username: "waiter_priya", total_orders: 48, total_revenue: "18,900.00", rating: 4.9 },
    { id: 4, username: "waiter_amit", total_orders: 40, total_revenue: "14,950.00", rating: 4.6 }
  ]
};
