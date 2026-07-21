import { useState, useEffect, useMemo, useCallback } from 'react';
import { getImageUrl } from '../lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, Folder, LogOut, Users, User, Phone, Mail } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'page-editor', label: 'Page Editor' },
  { id: 'fulfillment', label: 'Orders' },
  { id: 'users', label: 'Users' },
];

const DEFAULT_HOMEPAGE = {
  hero: {
    slides: [
      {
        id: 1,
        title: 'Unleash the Future',
        subtitle: 'Experience the next generation of mobile performance and design.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=80',
      },
      {
        id: 2,
        title: 'Titanium Strength',
        subtitle: 'Aerospace-grade titanium design. Incredibly strong. Incredibly light.',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1920&q=80',
      },
      {
        id: 3,
        title: 'Pure Audio Bliss',
        subtitle: 'Crystal clear sound with advanced active noise cancellation technology.',
        image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1920&q=80',
      },
    ],
    buttonText: 'Discover Elite',
  },
  deals: {
    show: true,
    items: [
      { productId: 1, customLabel: 'Flat 10% Off' },
      { productId: 2, customLabel: 'Limited Stock' },
    ],
  },
  franchise: {
    title: 'Partner with Stella',
    description: 'Join the fastest growing mobile retail franchise in India. Zero franchise fees, elite brand authority, and high-fidelity logistics support.',
    bannerImg: 'https://images.unsplash.com/photo-1556740734-7f95831517f9?auto=format&fit=crop&w=1920&q=80',
    stats: [{ label: 'Outlets', value: '50+' }, { label: 'Growth', value: '200%' }],
    hubs: [
      { tag: 'Own Outlet', name: 'Unit I, Hongkong Plaza', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20Unit%201%20-%20Hongkong%20Plaza.png' },
      { tag: 'Own Outlet', name: 'Unit II, Hongkong Plaza', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20Unit%201%20-%20Hongkong%20Plaza%202.png' },
      { tag: 'Own Outlet', name: 'Thalamuthunagar', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20Thalamuthunagar.jpeg' },
      { tag: 'Own Outlet', name: 'Chidambara Nagar', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM' },
      { tag: 'Own Outlet', name: 'Kulathur', address: 'Tuticorin', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Stella%20Mobiles%20-%20KULATHUR.png' },
      { tag: 'Franchise Outlet', name: 'Pudukottai', address: 'Pudukottai', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Franchisee%20Shops/STELLA%20Hi%20TECH%20MOBILES%20-%20PUDUKOTTAI/IMG-20250327-WA0007.jpg.jpeg' },
      { tag: 'Franchise Outlet', name: 'Kulathur', address: 'Kulathur', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Franchisee%20Shops/STELLA%20Hi%20TECH%20MOBILES%20-%20KULATHUR/IMG-20251002-WA0014.jpg.jpeg' },
      { tag: 'Franchise Outlet', name: 'MR.93 Thoothukudi', address: 'Thoothukudi', phone: '+91 90 95 510510', hours: '10 AM - 9 PM', image: '/images/hubs/Franchisee%20Shops/MR%2093%20Hi%20TECH%20MOBILES/20260703_124126.jpg.jpeg' },
    ],
    benefits: [
      { title: 'Comprehensive Mobile Solutions', desc: 'Stella Hit Tech offers not only mobile sales but also top-tier after-sales services, ensuring a seamless experience.' },
      { title: 'Tech Expertise', desc: 'With a strong foundation in software development and customized applications, we understand diverse business needs.' },
      { title: 'Innovation-Driven', desc: 'We stay ahead of industry trends, constantly evolving with the latest technologies like AI and cloud solutions.' },
      { title: 'Customer-Centric Approach', desc: 'Customer satisfaction is at the heart of what we do. We provide personalized services to meet client needs.' },
      { title: 'Skilled Team', desc: 'Our passionate professionals bring expertise in both mobile technology and software development.' },
      { title: 'Affordable & Scalable', desc: 'We offer scalable solutions that are both cost-effective and tailored to your unique requirements.' },
    ],
  },
  testimonials: {
    col1: [
      { id: 1, name: 'Rahul S.', text: 'Best mobile buying experience! The staff at Anna Nagar were incredibly helpful.', stars: 5 },
      { id: 2, name: 'Priya K.', text: 'Got my Stella Pro at an unbelievable deal. Highly recommend the seamless store pickup!', stars: 5 },
      { id: 3, name: 'Vikram M.', text: 'Authentic products and 0% UPI fee makes a huge difference when buying flagships.', stars: 5 },
    ],
    col2: [
      { id: 4, name: 'Anjali R.', text: 'Super fast checkout! The custom UPI payments are fully transparent and fee-free.', stars: 5 },
      { id: 5, name: 'Karthik B.', text: 'Elite premium customer support. Setup my new smartphone right in their luxury lounge.', stars: 5 },
      { id: 6, name: 'Deepa T.', text: 'Outstanding store design. The bento layout and dark mode look premium online & offline.', stars: 5 },
    ],
    col3: [
      { id: 7, name: 'Sanjay V.', text: 'Excellent twilio OTP secure login. My orders are safe, and tracking is very accurate.', stars: 5 },
      { id: 8, name: 'Meera N.', text: 'Best gadget accessories in Chennai. Visited Pondy Bazaar Express Hub, absolute speed.', stars: 5 },
      { id: 9, name: 'Arun K.', text: 'Stella franchise protocol is highly systematic. Excited to grow our partnership.', stars: 5 },
    ],
  },
  navLinks: [
    { label: 'Smartphones', category: 'Smartphones' },
    { label: 'Accessories', category: 'Accessories' },
    { label: 'Laptops', category: 'Laptops' },
    { label: 'Franchise', link: '/#franchise' },
  ],
  our_story: {
    hero_title: 'Driven by Technology. Defined by Trust.',
    hero_subtitle: 'From a single vision to the fastest-growing tech franchise network in South India.',
    hero_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
    vision_title: 'Our Story',
    vision_text: `Founded in 2007 by visionary Mr. Maheshkumar V, our journey began as a dedicated home appliance agency in Kulathur, Tuticorin under the brand name "STELLA".\n\nDriven by a commitment to reliability and customer satisfaction, Stella Mobiles opened its doors at Hongkong Plaza, later evolving into a full-fledged Mobile Sales Showroom in 2015. Today, we stand as a premier multi-brand retail chain offering an extensive range of the latest smartphones, smart gadgets, tablets, laptops, and TVs.\n\nWith consistent growth and transformation across multiple branches, we united as a team to launch our technology solutions firm, Stella Hi Tech Private Limited, right in the heart of the Pearl City. Our greatest strength continues to be our deeply rooted understanding of customer needs, our well-trained team, and an unwavering passion for delivering exceptional service.`,
    stats: [
      { value: '8+', label: 'Stores Across TN' },
      { value: '50K+', label: 'Happy Customers' },
      { value: '10+', label: 'Brand Partners' },
      { value: '100%', label: 'Commitment' },
    ],
    hubs: [],
  },
  companyDescription: "Redefining the premium mobile shopping experience across India. Innovation, trust, and zero-compromise service.",
  footerSections: [
    {
      title: 'Legal & Policies',
      links: [
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Product Warranty', path: '/warranty' },
        { name: 'Return Policy', path: '/return-policy' },
      ],
    },
    {
      title: 'Customer Support',
      links: [
        { name: 'My Account', path: '/account' },
        { name: 'Track Your Order', path: '/account?tab=tracking' },
        { name: 'Order History', path: '/account?tab=orders' },
      ],
    },
    {
      title: 'Stella Mobiles',
      links: [
        { name: 'Our Story', path: '/#our-story' },
        { name: 'Franchise Program', path: '/#franchise' },
        { name: 'Our Branches', path: '/#branches' },
      ],
    },
  ]
};


const DEFAULT_CATEGORY_FILTERS = {
  Smartphones: [
    { name: 'Brand', key: 'brand', options: ['Apple', 'Samsung', 'Google', 'OnePlus'] },
    { name: 'Storage', key: 'Storage', options: ['128GB', '256GB', '512GB'] },
    { name: 'RAM', key: 'RAM', options: ['8GB', '12GB'] },
  ],
  Audio: [
    { name: 'Brand', key: 'brand', options: ['Stella', 'Sony', 'Bose', 'Apple'] },
    { name: 'Type', key: 'Type', options: ['ANC Earbuds', 'Wireless Over-Ear'] },
  ],
  Accessories: [
    { name: 'Type', key: 'Type', options: ['Chargers', 'Protective Cases', 'Cables', 'Power Banks'] },
  ],
  Tablets: [
    { name: 'Brand', key: 'brand', options: ['Apple', 'Samsung', 'Lenovo'] },
    { name: 'Storage', key: 'Storage', options: ['64GB', '128GB', '256GB'] },
  ],
};

function TestimonialColumn({ title, reviews, onAdd, onRemove, onUpdate }) {
  return (
    <div className="space-y-6 p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <h4 className="text-xs font-black uppercase tracking-widest text-stella-gold">{title}</h4>
        <button type="button" onClick={onAdd} className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors">+ Add Card</button>
      </div>
      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 admin-custom-scrollbar">
        {reviews.map((review, ridx) => (
          <div key={review.id} className="p-4 rounded-xl border border-white/5 bg-stella-black relative">
            <button type="button" onClick={() => onRemove(ridx)} className="absolute top-2 right-2 text-[8px] font-black text-stella-red uppercase tracking-widest">Delete</button>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[7px] text-gray-500 font-bold uppercase">Name</label>
                  <input value={review.name} onChange={(e) => onUpdate(ridx, 'name', e.target.value)} className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] text-gray-500 font-bold uppercase">Stars (1-5)</label>
                  <input type="number" min="1" max="5" value={review.stars} onChange={(e) => onUpdate(ridx, 'stars', Number(e.target.value))} className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] text-gray-500 font-bold uppercase">Review Quote Text</label>
                <textarea value={review.text} onChange={(e) => onUpdate(ridx, 'text', e.target.value)} rows={2} className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-medium leading-relaxed" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const ImageUploadInput = ({ value, onChange, placeholder, className }) => {
  const [isUploading, setIsUploading] = useState(false);
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const serverUrl = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
      const uploadUrl = serverUrl + '/api/upload';
      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onChange(data.url);
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Is the server running?');
    }
    setIsUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <label className={`shrink-0 bg-white/10 text-white px-3 py-2 rounded-lg cursor-pointer text-[10px] font-bold border border-white/10 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}>
        {isUploading ? 'Uploading...' : 'Upload'}
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
      </label>
    </div>
  );
};

const FileUploadInput = ({ value, onChange, placeholder, className, accept }) => {
  const [isUploading, setIsUploading] = useState(false);
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file); // The backend upload.js uses 'image' field for all uploads
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const serverUrl = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
      const uploadUrl = serverUrl + '/api/upload';
      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        onChange(data.url);
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Is the server running?');
    }
    setIsUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <label className={`shrink-0 bg-white/10 text-white px-3 py-2 rounded-lg cursor-pointer text-[10px] font-bold border border-white/10 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}>
        {isUploading ? 'Uploading...' : 'Upload'}
        <input type="file" className="hidden" accept={accept} onChange={handleUpload} disabled={isUploading} />
      </label>
    </div>
  );
};

function UsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/auth/users`);
      const data = await res.json();
      if (data.success) setUsers(data.users.filter(u => u.role !== 'admin'));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API}/orders/user/${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) setUserOrders(data);
      else if (data.success) setUserOrders(data.orders);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-bold uppercase tracking-widest text-xs animate-pulse">Loading User Database...</div>;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center space-x-6 glass p-8 rounded-[2.5rem]">
        <div className="w-12 h-12 rounded-2xl bg-stella-red/20 flex items-center justify-center text-stella-red text-xl"><Users className="w-6 h-6" /></div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Customer Database</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass p-6 rounded-[2rem] h-[600px] flex flex-col">
          <h3 className="text-stella-gold font-black uppercase tracking-widest text-xs mb-6">Registered Users ({users.length})</h3>
          <div className="overflow-y-auto pr-2 admin-custom-scrollbar flex-1 space-y-3">
            {users.map(u => (
              <button 
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedUser?.id === u.id ? 'bg-stella-red border-stella-red shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div className="font-bold text-white text-sm truncate">{u.name}</div>
                <div className="text-[10px] text-gray-400 mt-1 font-medium">{u.phone_number}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass p-8 rounded-[2rem] min-h-[600px]">
          {selectedUser ? (
            <div className="space-y-8 animate-fade-up">
              <div className="border-b border-white/10 pb-8">
                <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-6">{selectedUser.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-300 bg-stella-black p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-stella-gold" /></div>
                    <span className="font-bold">{selectedUser.phone_number}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-300 bg-stella-black p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-stella-gold" /></div>
                    <span className="font-bold truncate">{selectedUser.email || 'Not Provided'}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-300 bg-stella-black p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-stella-gold" /></div>
                    <span className="font-bold">Role: <span className="uppercase text-stella-red">{selectedUser.role || 'Customer'}</span></span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-300 bg-stella-black p-4 rounded-2xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Folder className="w-4 h-4 text-stella-gold" /></div>
                    <span className="font-bold">Joined: <span className="text-gray-400 font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</span></span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-stella-gold font-black uppercase tracking-widest text-xs mb-6">Order History ({userOrders.length})</h3>
                {ordersLoading ? (
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading orders...</div>
                ) : userOrders.length === 0 ? (
                  <div className="text-gray-500 text-sm font-medium bg-white/5 p-8 rounded-2xl border border-white/5 text-center">No previous orders found for this user.</div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 admin-custom-scrollbar">
                    {userOrders.map(order => (
                      <div key={order.id} className="bg-stella-black p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-stella-red/30 transition-colors">
                        <div>
                          <div className="font-black uppercase tracking-wider text-white text-sm mb-1 flex items-center space-x-2">
                            <span>Order #{order.id}</span>
                            {order.items && <span className="text-[9px] font-bold text-gray-500 tracking-normal bg-white/5 px-2 py-0.5 rounded-full">{order.items.length} items</span>}
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">{new Date(order.created_at).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-stella-red text-base mb-1">₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
                          <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md inline-block ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-300'}`}>{order.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Users className="w-16 h-16 text-stella-gold" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-[200px] leading-relaxed">
                Select a user from the list to view their complete profile and order history
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [specsList, setSpecsList] = useState([]);
  const [categorySpecs, setCategorySpecs] = useState({});


  const [editingProduct, setEditingProduct] = useState(null);
  const [manufacturerUrl, setManufacturerUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('week');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderTimeFilter, setOrderTimeFilter] = useState('All');
  const [orderCategoryFilter, setOrderCategoryFilter] = useState('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All');

  const [productForm, setProductForm] = useState({
    name: '', category_id: 1, price: '', stock_quantity: '', description: '', image_url: '', additional_images: [], specs: {},
  });

  const [homepage, setHomepage] = useState(DEFAULT_HOMEPAGE);
  const [categoryFilters, setCategoryFilters] = useState({});
  const [dbCategories, setDbCategories] = useState([]);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');

  useEffect(() => {
    if (!productForm.category_id) {
      setCategorySpecs({});
      return;
    }
    const cat = dbCategories.find(c => String(c.id) === String(productForm.category_id));
    if (!cat || !cat.filters) {
      setCategorySpecs({});
      return;
    }
    let parsedFilters = [];
    try {
      parsedFilters = typeof cat.filters === 'string' ? JSON.parse(cat.filters) : cat.filters;
    } catch(e) {}
    
    setCategorySpecs(prev => {
       const next = { ...prev };
       let changed = false;
       parsedFilters.forEach(f => {
          if (f.key && next[f.key] === undefined) {
             next[f.key] = '';
             changed = true;
          }
       });
       return changed ? next : prev;
    });
  }, [productForm.category_id, dbCategories]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category_name).filter(Boolean));
    return ['All', ...cats];
  }, [products]);

  const filteredProductsList = useMemo(() => {
    if (selectedCategoryFilter === 'All') return products;
    return products.filter((p) => p.category_name === selectedCategoryFilter);
  }, [products, selectedCategoryFilter]);

  const filteredOrdersList = useMemo(() => {
    let result = orders;
    if (orderStatusFilter !== 'All') result = result.filter((o) => o.status === orderStatusFilter);
    if (orderCategoryFilter !== 'All') result = result.filter((o) => o.categories && o.categories.includes(orderCategoryFilter));
    if (orderPaymentFilter !== 'All') result = result.filter((o) => o.payment_method === orderPaymentFilter);
    if (orderTimeFilter !== 'All') {
      const now = new Date();
      result = result.filter((o) => {
        const orderDate = new Date(o.created_at);
        const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
        if (orderTimeFilter === 'Day') return diffDays <= 1;
        if (orderTimeFilter === 'Week') return diffDays <= 7;
        if (orderTimeFilter === 'Month') return diffDays <= 30;
        if (orderTimeFilter === 'Year') return diffDays <= 365;
        return true;
      });
    }
    return result;
  }, [orders, orderStatusFilter, orderCategoryFilter, orderPaymentFilter, orderTimeFilter]);

  const categoryHeaderImage = selectedFilterCategory && categoryFilters._category_images?.[selectedFilterCategory] || '';

  const setCategoryHeaderImage = (val) => {
    if (!selectedFilterCategory) return;
    setCategoryFilters((prev) => {
      const next = { ...prev };
      if (!next._category_images) next._category_images = {};
      next._category_images = { ...next._category_images, [selectedFilterCategory]: val };
      return next;
    });
  };

  const maxChartRevenue = useMemo(() => Math.max(...chartData.map((d) => d.revenue), 1), [chartData]);

  const updateDealsCategoryIds = useCallback((prods, hp) => {
    if (!prods?.length || !hp?.deals?.items) return hp;
    const next = { ...hp, deals: { ...hp.deals, items: hp.deals.items.map((deal) => {
      if (!deal.categoryId && deal.productId) {
        const prod = prods.find((p) => p.id === parseInt(deal.productId, 10));
        if (prod) return { ...deal, categoryId: prod.category_id };
      }
      return deal;
    }) } };
    return next;
  }, []);

  const fetchStats = useCallback(async (filter = selectedTimeFilter) => {
    try {
      const response = await fetch(`${API}/stats?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setChartData(data.chartData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [selectedTimeFilter]);

  const downloadReport = () => {
    if (!chartData || chartData.length === 0) {
      addToast('No data to download for the selected period.', 'error');
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Revenue\\n";
    chartData.forEach(row => {
      csvContent += `${row.date},${row.revenue}\\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${selectedTimeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Report for ${selectedTimeFilter} downloaded successfully!`, 'success');
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setHomepage((hp) => updateDealsCategoryIds(data, hp));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [updateDealsCategoryIds]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API}/orders`);
      if (response.ok) setOrders(await response.json());
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API}/products/categories`);
      if (response.ok) {
        const data = await response.json();
        setDbCategories(data);
        if (data.length > 0) setSelectedFilterCategory(data[0].name);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    try {
      const response = await fetch(`${API}/site-config/homepage`);
      if (response.ok) {
        const data = await response.json();
        setHomepage((prev) => {
          const merged = {
            hero: data.hero || prev.hero,
            deals: data.deals || prev.deals,
            franchise: {
              title: data.franchise?.title || prev.franchise.title,
              description: data.franchise?.description || prev.franchise.description,
              bannerImg: data.franchise?.bannerImg || prev.franchise.bannerImg,
              stats: data.franchise?.stats || prev.franchise.stats,
              hubs: data.franchise?.hubs || prev.franchise.hubs,
              benefits: data.franchise?.benefits || prev.franchise.benefits,
            },
            testimonials: {
              col1: data.testimonials?.col1 || prev.testimonials.col1,
              col2: data.testimonials?.col2 || prev.testimonials.col2,
              col3: data.testimonials?.col3 || prev.testimonials.col3,
            },
            navLinks: data.navLinks || prev.navLinks,
            our_story: {
              hero_title: data.our_story?.hero_title || prev.our_story.hero_title,
              hero_subtitle: data.our_story?.hero_subtitle || prev.our_story.hero_subtitle,
              hero_image: data.our_story?.hero_image || prev.our_story.hero_image,
              vision_title: data.our_story?.vision_title || prev.our_story.vision_title,
              vision_text: data.our_story?.vision_text || prev.our_story.vision_text,
              stats: data.our_story?.stats || prev.our_story.stats,
              hubs: data.our_story?.hubs || prev.our_story.hubs,
            },
            companyDescription: data.companyDescription || prev.companyDescription,
            footerSections: data.footerSections || prev.footerSections,
          };
          return updateDealsCategoryIds(products, merged);
        });
      }

      const filterResponse = await fetch(`${API}/site-config/category_filters`);
      if (filterResponse.ok) {
        setCategoryFilters(await filterResponse.json());
      } else {
        setCategoryFilters(DEFAULT_CATEGORY_FILTERS);
      }
    } catch (err) {
      console.error('Error fetching site config:', err);
    }
  }, [products, updateDealsCategoryIds]);

  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchOrders();
    fetchCategories();
    fetchConfigs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setTimeFilter = (filter) => {
    setSelectedTimeFilter(filter);
    fetchStats(filter);
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category_id: '', price: '', stock_quantity: '', description: '', image_url: '', additional_images: [], specs: {} });
    setProductImages([]);
    setSpecsList([]);
    setCategorySpecs({});
    setManufacturerUrl('');
    setActiveTab('product-editor');
  };

  const openEditProduct = (p) => {
    setEditingProduct(p);
    
    let parsedAdditionalImages = [];
    if (typeof p.additional_images === 'string') {
      try { parsedAdditionalImages = JSON.parse(p.additional_images); } catch(e) { parsedAdditionalImages = []; }
    } else {
      parsedAdditionalImages = p.additional_images || [];
    }
    
    setProductForm({ ...p, additional_images: parsedAdditionalImages });
    setProductImages([]);
    
    let parsedSpecs = {};
    if (typeof p.specs === 'string') {
      try { parsedSpecs = JSON.parse(p.specs); } catch (e) { parsedSpecs = {}; }
    } else {
      parsedSpecs = p.specs || {};
    }
    const cleanSpecs = { ...parsedSpecs };
    setManufacturerUrl(cleanSpecs.manufacturer_url || '');
    delete cleanSpecs.manufacturer_url;

    const cat = dbCategories.find(c => String(c.id) === String(p.category_id));
    const catSpecsObj = {};
    if (cat && cat.filters) {
       let parsedFilters = [];
       try { parsedFilters = typeof cat.filters === 'string' ? JSON.parse(cat.filters) : cat.filters; } catch(e) {}
       parsedFilters.forEach(f => {
          if (f.key) {
             catSpecsObj[f.key] = cleanSpecs[f.key] || '';
             delete cleanSpecs[f.key];
          }
       });
    }
    setCategorySpecs(catSpecsObj);
    setSpecsList(Object.entries(cleanSpecs).map(([key, value]) => ({ key, value })));
    setActiveTab('product-editor');
  };

  const handleImageSelect = (e) => setProductImages(Array.from(e.target.files || []));

  const saveProduct = async () => {
    try {
      setLoading(true);
      const url = editingProduct ? `${API}/products/${editingProduct.id}` : `${API}/products`;
      const specsObj = {};
      Object.entries(categorySpecs).forEach(([k, v]) => {
         if (String(v).trim()) specsObj[k] = String(v).trim();
      });
      specsList.forEach((s) => { if (s.key.trim() && s.value.trim()) specsObj[s.key.trim()] = s.value.trim(); });
      if (manufacturerUrl.trim()) {
        specsObj['manufacturer_url'] = manufacturerUrl.trim();
      }

      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', productForm.price);
      formData.append('stock_quantity', productForm.stock_quantity);
      formData.append('category_id', productForm.category_id);
      formData.append('specs', JSON.stringify(specsObj));
      productImages.forEach((file) => formData.append('images', file));
      if (editingProduct && productImages.length === 0) {
        formData.append('image_url', productForm.image_url);
        formData.append('additional_images', JSON.stringify(productForm.additional_images));
      }

      const response = await fetch(url, { method: editingProduct ? 'PUT' : 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to save product');
      addToast('Product saved successfully', 'success');
      await fetchProducts();
      setActiveTab('inventory');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => { setProductToDelete(id); setShowDeleteModal(true); };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`${API}/products/${productToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      addToast('Product deleted successfully', 'success');
      await fetchProducts();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', filters: [] });
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    let parsedFilters = [];
    if (cat.filters) {
      try {
        parsedFilters = typeof cat.filters === 'string' ? JSON.parse(cat.filters) : cat.filters;
      } catch (e) {
        console.error('Error parsing filters', e);
      }
    }
    setCategoryForm({ name: cat.name, description: cat.description || '', filters: parsedFilters });
    setShowCategoryModal(true);
  };

  const addCategoryFilter = () => {
    setCategoryForm(prev => ({ ...prev, filters: [...(prev.filters || []), { name: 'New Filter', key: 'specs_key', type: 'list', options: ['Option 1'] }] }));
  };

  const updateCategoryFilter = (fidx, field, value) => {
    setCategoryForm(prev => {
      const newFilters = prev.filters.map((f, i) => {
        if (i !== fidx) return f;
        const updated = { ...f, [field]: value };
        if (field === 'name') {
          updated.key = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
        return updated;
      });
      return { ...prev, filters: newFilters };
    });
  };

  const removeCategoryFilter = (fidx) => {
    setCategoryForm(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== fidx)
    }));
  };

  const saveCategory = async () => {
    try {
      setLoading(true);
      const url = editingCategory ? `${API}/categories/${editingCategory.id}` : `${API}/categories`;
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save category');
      }
      addToast('Category saved successfully', 'success');
      await fetchCategories();
      setShowCategoryModal(false);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteCategory = async (catId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await fetch(`${API}/categories/${catId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete category');
      }
      addToast('Category deleted successfully', 'success');
      await fetchCategories();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const saveHomepage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/site-config/homepage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: homepage }),
      });
      if (!response.ok) throw new Error('Failed to sync site assets');

      const filterResponse = await fetch(`${API}/site-config/category_filters`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: categoryFilters }),
      });
      if (!filterResponse.ok) throw new Error('Failed to sync custom filters');

      addToast('Changes saved successfully: Homepage content and category filters updated.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    try {
      const response = await fetch(`${API}/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
        addToast('Order status updated', 'success');
      } else throw new Error('Failed to update status');
    } catch (err) {
      addToast(`Error updating order fulfillment status: ${err.message}`, 'error');
    }
  };

  const updateDeliveryDate = async (order, date) => {
    try {
      const response = await fetch(`${API}/orders/${order.id}/delivery-date`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expected_delivery_date: date || null }),
      });
      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, expected_delivery_date: date || null } : o)));
        addToast('Expected delivery date saved', 'success');
      } else throw new Error('Failed to update delivery date');
    } catch (err) {
      addToast(`Error saving delivery date: ${err.message}`, 'error');
    }
  };

  const downloadInvoice = (orderId) => window.open(`${API}/orders/${orderId}/invoice`, '_blank');

  const updateHomepage = (path, value) => {
    setHomepage((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateTestimonial = (col, idx, field, value) => {
    setHomepage((prev) => {
      const next = structuredClone(prev);
      next.testimonials[col][idx][field] = value;
      return next;
    });
  };

  const addFilterGroup = () => {
    setCategoryFilters((prev) => {
      const next = { ...prev };
      if (!next[selectedFilterCategory]) next[selectedFilterCategory] = [];
      next[selectedFilterCategory] = [...next[selectedFilterCategory], { name: 'New Filter', key: 'specs_key', options: ['Option 1'] }];
      return next;
    });
  };

  const updateFilter = (fidx, field, value) => {
    setCategoryFilters((prev) => {
      const next = { ...prev };
      next[selectedFilterCategory] = next[selectedFilterCategory].map((f, i) => (i === fidx ? { ...f, [field]: value } : f));
      return next;
    });
  };

  const removeFilter = (fidx) => {
    setCategoryFilters((prev) => {
      const next = { ...prev };
      next[selectedFilterCategory] = next[selectedFilterCategory].filter((_, i) => i !== fidx);
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-32">
      <style>{`
        .admin-animate-fade-in { animation: adminFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes adminFadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .admin-custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .admin-custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
      `}</style>

      <section className="relative h-[40vh] flex items-end pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-stella-black via-stella-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10 grayscale" />
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-20">
          <div className="flex items-center space-x-3 mb-6 animate-fade-up">
            <span className="w-12 h-[1px] bg-stella-red" />
            <span className="text-stella-red font-black text-[10px] uppercase tracking-[0.5em]">Command Center</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white">
              Admin.<span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Dashboard</span>
            </h1>
            
            <button 
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-stella-red hover:bg-red-600 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:shadow-[0_0_25px_rgba(255,0,0,0.5)]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
          <div className="flex items-center space-x-1 p-2 bg-[#0a0a0c] backdrop-blur-3xl rounded-[1.5rem] border border-white/10 w-fit animate-fade-up shadow-3xl" style={{ animationDelay: '0.2s' }}>
            {ADMIN_TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`px-8 py-4 rounded-[1rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-fade-up">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-[1rem] w-fit border border-white/[0.05]">
                {['week', 'month', 'year'].map((f) => (
                  <button key={f} type="button" onClick={() => setTimeFilter(f)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedTimeFilter === f ? 'bg-white text-black shadow-md shadow-white/10' : 'text-gray-400 hover:text-white'}`}>{f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'Year'}</button>
                ))}
              </div>
              <button 
                type="button" 
                onClick={downloadReport}
                className="stella-button bg-stella-gold/10 text-stella-gold border border-stella-gold/20 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-stella-gold hover:text-black transition-colors"
              >
                Download Report
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl p-8 lg:p-12 group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4 group-hover:text-white transition-colors relative z-10">{stat.label}</p>
                  <p className={`text-3xl lg:text-4xl font-black tracking-tighter relative z-10 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl p-10 lg:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-stella-red/5 to-transparent pointer-events-none blur-3xl" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-3 relative z-10">
                <span className="w-1.5 h-1.5 bg-stella-red rounded-full" /> {selectedTimeFilter === 'year' ? '12-Month' : selectedTimeFilter === 'month' ? '30-Day' : '7-Day'} Revenue Matrix
              </h3>
              {chartData.length > 0 ? (
                <div className="h-64 flex items-end gap-2 lg:gap-4 w-full relative z-10">
                  {chartData.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <div className="w-full bg-white/5 rounded-t-lg group-hover:bg-stella-red transition-all duration-300 relative" style={{ height: `${(point.revenue / maxChartRevenue) * 100}%` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">₹{point.revenue.toLocaleString()}</div>
                      </div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase mt-4 rotate-45 origin-left lg:rotate-0 lg:origin-center">
                        {selectedTimeFilter === 'year' ? new Date(`${point.date}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No Data Available for {selectedTimeFilter}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8 admin-animate-fade-in">
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-white/[0.05] flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Product Inventory</h2>
                  <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} className="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                    {uniqueCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <button type="button" onClick={openAddProduct} className="stella-button bg-stella-red text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 relative group overflow-hidden">
                  <span className="relative z-10">+ Add New Product</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-xs font-black uppercase tracking-widest text-gray-400 bg-white/[0.01]">
                      <th className="px-12 py-8">Product</th>
                      <th className="px-12 py-8">Stock available</th>
                      <th className="px-12 py-8">Price</th>
                      <th className="px-12 py-8 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProductsList.map((product) => (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-12 py-10">
                          <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 rounded-xl bg-stella-black border border-white/5 flex items-center justify-center p-2">
                              <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-contain mix-blend-lighten" />
                            </div>
                            <span className="text-white font-black uppercase tracking-widest text-xs">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-12 py-10">
                          <span className={`glass px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${product.stock_quantity > 5 ? 'border-green-500/20 text-green-400' : 'border-stella-red/20 text-stella-red'}`}>{product.stock_quantity} Units</span>
                        </td>
                        <td className="px-12 py-10 text-white font-black tracking-widest text-sm">RS {product.price}</td>
                        <td className="px-12 py-10 text-right">
                          <div className="flex items-center justify-end space-x-6">
                            <button type="button" onClick={() => openEditProduct(product)} className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Edit</button>
                            <button type="button" onClick={() => openDeleteModal(product.id)} className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-600 hover:text-stella-red transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'product-editor' && (
          <div className="space-y-10 admin-animate-fade-in pb-16">
            <div className="flex justify-between items-center glass p-8 rounded-[2rem] border border-white/5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Configure product details, images, specifications, and manufacturer scrape URLs</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProduct}
                  disabled={loading}
                  className="stella-button bg-stella-red text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 shadow-xl shadow-stella-red/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Save Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* General Info */}
                <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
                  <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">General Details</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Product Name</label>
                    <input
                      type="text"
                      value={productForm.name || ''}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      placeholder="e.g. Stella Neo 15 Pro"
                      className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Price (INR)</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                        required
                        className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Stock Quantity</label>
                      <input
                        type="number"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
                        required
                        className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Category</label>
                      <select
                        value={productForm.category_id || ''}
                        onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                        required
                        className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold focus:border-stella-red outline-none cursor-pointer"
                      >
                        <option value="">Select Category</option>
                        {dbCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Deal Tag / Label (Optional)</label>
                      <input
                        type="text"
                        value={productForm.deal_label || ''}
                        onChange={(e) => setProductForm({ ...productForm, deal_label: e.target.value })}
                        placeholder="e.g. Save 15%"
                        className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                    <textarea
                      value={productForm.description || ''}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={4}
                      placeholder="Enter premium description details..."
                      className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-medium leading-relaxed resize-none focus:border-stella-red outline-none"
                    />
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
                  <div className="border-b border-white/5 pb-4 mb-4">
                    <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em]">Category Specifications</h3>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">These are auto-populated based on the selected category's filters.</p>
                  </div>
                  
                  {Object.keys(categorySpecs).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(categorySpecs).map((key) => {
                        const cat = dbCategories.find(c => String(c.id) === String(productForm.category_id));
                        let displayName = key;
                        if (cat && cat.filters) {
                          let parsedFilters = [];
                          try { parsedFilters = typeof cat.filters === 'string' ? JSON.parse(cat.filters) : cat.filters; } catch(e) {}
                          const f = parsedFilters.find(f => f.key === key);
                          if (f && f.name) displayName = f.name;
                        }
                        return (
                          <div key={key} className="space-y-2">
                            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">{displayName}</label>
                            <input
                              type="text"
                              value={categorySpecs[key]}
                              onChange={(e) => setCategorySpecs({ ...categorySpecs, [key]: e.target.value })}
                              placeholder={`Enter ${displayName}`}
                              className="w-full bg-black border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider py-2 italic">Select a category to load its specific filters here.</p>
                  )}

                  <div className="flex justify-between items-center border-b border-white/5 pb-4 pt-6 mt-6">
                    <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em]">Additional Specifications</h3>
                    <button
                      type="button"
                      onClick={() => setSpecsList([...specsList, { key: '', value: '' }])}
                      className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                    >
                      + Add Additional Spec
                    </button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {specsList.map((spec, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => {
                            const next = [...specsList];
                            next[idx].key = e.target.value;
                            setSpecsList(next);
                          }}
                          placeholder="Key (e.g. Processor)"
                          className="flex-1 bg-black border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const next = [...specsList];
                            next[idx].value = e.target.value;
                            setSpecsList(next);
                          }}
                          placeholder="Value (e.g. Stella Octa-Core)"
                          className="flex-1 bg-black border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-stella-red outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))}
                          className="text-[10px] font-black text-stella-red uppercase tracking-widest px-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {specsList.length === 0 && (
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-center py-4">No custom specifications added.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar: Images and Manufacturer Scraping URL */}
              <div className="space-y-8">
                {/* Images Upload */}
                <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
                  <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Product Assets</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Upload Images (Hold Ctrl/Cmd to select multiple)</label>
                      <input
                        type="file"
                        multiple
                        onChange={handleImageSelect}
                        className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-white/5 file:text-white hover:file:bg-white/10 file:cursor-pointer"
                      />
                    </div>

                    {productImages.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="block text-[9px] font-black text-stella-gold uppercase tracking-widest">New Selected Images to Upload</label>
                        <div className="flex gap-4 overflow-x-auto admin-custom-scrollbar pb-2">
                          {productImages.map((file, idx) => (
                            <div key={idx} className={`relative shrink-0 w-24 h-24 rounded-xl ${idx === 0 ? 'border-2 border-stella-gold' : 'border border-white/10'} bg-black flex items-center justify-center p-2`}>
                              {idx === 0 && <span className="absolute -top-2 -right-2 bg-stella-gold text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Main</span>}
                              <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="max-w-full max-h-full object-contain" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editingProduct && !productImages.length && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Existing Images</label>
                        <div className="flex gap-4 overflow-x-auto admin-custom-scrollbar pb-2">
                          {productForm.image_url && (
                            <div className="relative shrink-0 w-24 h-24 rounded-xl border-2 border-stella-gold bg-black flex items-center justify-center p-2">
                              <span className="absolute -top-2 -right-2 bg-stella-gold text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Main</span>
                              <img src={getImageUrl(productForm.image_url)} alt="Main" className="max-w-full max-h-full object-contain" />
                            </div>
                          )}
                          {(productForm.additional_images || []).map((img, idx) => (
                            <div key={idx} className="relative shrink-0 w-24 h-24 rounded-xl border border-white/10 bg-black flex items-center justify-center p-2 group">
                              <img src={getImageUrl(img)} alt={`Additional ${idx}`} className="max-w-full max-h-full object-contain" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">To replace these images, simply select new files using the Upload Images button above.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manufacturer Content Scrape Settings */}
                <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
                  <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Manufacturer Scraper</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Manufacturer URL</label>
                      <input
                        type="url"
                        value={manufacturerUrl}
                        onChange={(e) => setManufacturerUrl(e.target.value)}
                        placeholder="e.g. https://www.amazon.in/dp/B0CHX1W1S3"
                        className="w-full bg-black border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[10px] font-medium focus:border-stella-red outline-none"
                      />
                      <p className="text-[8px] text-gray-500 leading-relaxed font-bold uppercase tracking-wider mt-2">
                        Provide a link containing manufacturer features (e.g. Amazon product page). The site engine will dynamically extract, sanitize, and cache rich image/marketing assets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fulfillment' && (
          <div className="space-y-12 animate-fade-up">
            <div className="flex justify-between items-center glass p-8 rounded-[2.5rem]">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 rounded-2xl bg-stella-red/20 flex items-center justify-center text-stella-red text-xl"><ClipboardList /></div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Order Logs</h2>
              </div>
              <div className="flex items-center space-x-4 flex-wrap">
                <select value={orderCategoryFilter} onChange={(e) => setOrderCategoryFilter(e.target.value)} className="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                  {uniqueCategories.map((cat) => <option key={cat} value={cat}>{cat === 'All' ? 'All Products' : cat}</option>)}
                </select>
                <select value={orderPaymentFilter} onChange={(e) => setOrderPaymentFilter(e.target.value)} className="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                  <option value="All">All Payments</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="upi">UPI</option>
                  <option value="store">Store Hub</option>
                </select>
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select value={orderTimeFilter} onChange={(e) => setOrderTimeFilter(e.target.value)} className="bg-stella-charcoal border border-white/10 text-white rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer hover:border-white/20 transition-colors">
                  <option value="All">All Time</option>
                  <option value="Day">Past Day</option>
                  <option value="Week">Past Week</option>
                  <option value="Month">Past Month</option>
                  <option value="Year">Past Year</option>
                </select>
              </div>
            </div>
            <div className="stella-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stella-black/50 border-b border-white/5 text-xs uppercase tracking-[0.4em] text-gray-500 font-black">
                  <tr>
                    <th className="px-12 py-10">Order Details</th>
                    <th className="px-12 py-10">Customer Details</th>
                    <th className="px-12 py-10">Payment Method</th>
                    <th className="px-12 py-10">Price</th>
                    <th className="px-12 py-10">Status</th>
                    <th className="px-12 py-10">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrdersList.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-12 py-10">
                        <div className="flex flex-col">
                          <span className="text-white font-black tracking-widest text-sm">#ST-{order.id}</span>
                          <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex flex-col">
                          <span className="text-white font-black uppercase tracking-widest text-sm">{order.user_name || 'Walk-in Buyer'}</span>
                          <span className="text-gray-400 font-mono text-[10px] md:text-xs mt-1">{order.user_phone || 'Direct Store'}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex flex-col">
                          <span className="text-white font-black uppercase tracking-widest text-sm">{order.delivery_type}</span>
                          <span className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider font-bold">{order.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-white font-black tracking-widest text-sm">RS {order.total_amount}</td>
                      <td className="px-12 py-10">
                        <select value={order.status} onChange={(e) => updateOrderStatus(order, e.target.value)} className="bg-stella-black border border-white/10 text-xs font-black uppercase tracking-wider text-white rounded-xl px-4 py-2 outline-none focus:border-stella-red">
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-8 py-10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em]">Expected Delivery</span>
                          <input type="date" value={order.expected_delivery_date ? order.expected_delivery_date.split('T')[0] : ''} onChange={(e) => updateDeliveryDate(order, e.target.value)} className="bg-stella-black border border-white/10 text-xs font-bold text-white rounded-xl px-3 py-2 outline-none focus:border-stella-red cursor-pointer" />
                        </div>
                      </td>
                      <td className="px-12 py-10 text-center">
                        <button type="button" onClick={() => downloadInvoice(order.id)} className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/10 transition-colors flex items-center justify-center text-white" title="Download Invoice"><FileText size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrdersList.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-20 text-gray-500 font-black uppercase tracking-[0.3em] text-xs">No logs registered in system database</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 admin-animate-fade-in">
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-white/[0.05] flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Categories</h2>
                </div>
                <button type="button" onClick={openAddCategory} className="stella-button bg-stella-red text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700">
                  + Add Category
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-xs font-black uppercase tracking-widest text-gray-400 bg-white/[0.01]">
                      <th className="px-12 py-8">Category Name</th>
                      <th className="px-12 py-8">Description</th>
                      <th className="px-12 py-8 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-white">
                    {dbCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-12 py-8 font-black uppercase tracking-wider">{cat.name}</td>
                        <td className="px-12 py-8 text-gray-400 font-medium">{cat.description || 'No description provided'}</td>
                        <td className="px-12 py-8 text-right">
                          <div className="flex items-center justify-end space-x-6">
                            <button type="button" onClick={() => openEditCategory(cat)} className="font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Edit</button>
                            <button type="button" onClick={() => executeDeleteCategory(cat.id)} className="font-black uppercase tracking-widest text-gray-600 hover:text-stella-red transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'page-editor' && (
          <div className="space-y-10 admin-animate-fade-in pb-16">
            {/* Header action bar */}
            <div className="flex justify-between items-center glass p-8 rounded-[2rem] border border-white/5">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Site Editor</h2>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Configure layout, slides, and franchise settings</p>
              </div>
              <button
                type="button"
                onClick={saveHomepage}
                disabled={loading}
                className="stella-button bg-stella-red text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-700 shadow-xl shadow-stella-red/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Site Config
              </button>
            </div>

            {/* Category Display Settings Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-8">
              <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Category Display Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Select Category</label>
                  <select
                    value={selectedFilterCategory}
                    onChange={(e) => setSelectedFilterCategory(e.target.value)}
                    className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold cursor-pointer outline-none"
                  >
                    {uniqueCategories.map(cat => cat !== 'All' && <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                {selectedFilterCategory && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Header Image URL</label>
                    <ImageUploadInput
                      value={categoryHeaderImage}
                      onChange={(val) => setCategoryHeaderImage(val)}
                      className="w-full bg-black/50 border border-white/5 text-white rounded-lg py-2 px-3 text-[12px] font-mono mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Franchise Settings Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-8">
              <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Franchise Program Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Franchise Title</label>
                  <input
                    value={homepage.franchise?.title || ''}
                    onChange={(e) => updateHomepage('franchise.title', e.target.value)}
                    className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Banner Image URL</label>
                  <ImageUploadInput
                    value={homepage.franchise?.bannerImg || ''}
                    onChange={(val) => updateHomepage('franchise.bannerImg', val)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3 text-[12px] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Downloads Settings Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-8 mt-10">
              <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Downloads</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Franchise Brochure URL</label>
                  <FileUploadInput
                    value={homepage.franchise?.brochureUrl || ''}
                    onChange={(val) => updateHomepage('franchise.brochureUrl', val)}
                    placeholder="/Business_Brochure.pdf"
                    accept=".pdf,.doc,.docx"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3 text-[12px] font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Billing Software URL</label>
                  <FileUploadInput
                    value={homepage.franchise?.softwareUrl || ''}
                    onChange={(val) => updateHomepage('franchise.softwareUrl', val)}
                    placeholder="/Stella_Billing_Software.exe"
                    accept=".exe,.zip,.rar"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3 text-[12px] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                <textarea
                  value={homepage.franchise?.description || ''}
                  onChange={(e) => updateHomepage('franchise.description', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-medium leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Franchise Hub Locations Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em]">Active Hub Locations</h3>
                <button
                  type="button"
                  onClick={() => {
                    const currentHubs = homepage.franchise?.hubs || [];
                    updateHomepage('franchise.hubs', [
                      ...currentHubs,
                      { tag: 'New Store', name: 'Stella New Branch', address: '123 Store Street Road, Chennai - 600001', phone: '+91 44 2XXXXXXX', hours: '10 AM - 9 PM' }
                    ]);
                  }}
                  className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                >
                  + Add Hub Outlet
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(homepage.franchise?.hubs || []).map((hub, hidx) => (
                  <div key={hidx} className="p-6 rounded-2xl border border-white/5 bg-black relative space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextHubs = (homepage.franchise?.hubs || []).filter((_, i) => i !== hidx);
                        updateHomepage('franchise.hubs', nextHubs);
                      }}
                      className="absolute top-4 right-4 text-[8px] font-black text-stella-red uppercase tracking-widest"
                    >
                      Delete
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Store Tag</label>
                        <input
                          value={hub.tag || ''}
                          onChange={(e) => {
                            const nextHubs = [...homepage.franchise.hubs];
                            nextHubs[hidx] = { ...hub, tag: e.target.value };
                            updateHomepage('franchise.hubs', nextHubs);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. Flagship Store"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Store Name</label>
                        <input
                          value={hub.name || ''}
                          onChange={(e) => {
                            const nextHubs = [...homepage.franchise.hubs];
                            nextHubs[hidx] = { ...hub, name: e.target.value };
                            updateHomepage('franchise.hubs', nextHubs);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. Stella Anna Nagar"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[7px] text-gray-500 font-bold uppercase">Address</label>
                      <input
                        value={hub.address || ''}
                        onChange={(e) => {
                          const nextHubs = [...homepage.franchise.hubs];
                          nextHubs[hidx] = { ...hub, address: e.target.value };
                          updateHomepage('franchise.hubs', nextHubs);
                        }}
                        className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[7px] text-gray-500 font-bold uppercase">Map Location Point (Google Maps Embed URL)</label>
                      <input
                        value={hub.mapUrl || ''}
                        onChange={(e) => {
                          const nextHubs = [...homepage.franchise.hubs];
                          nextHubs[hidx] = { ...hub, mapUrl: e.target.value };
                          updateHomepage('franchise.hubs', nextHubs);
                        }}
                        className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-mono"
                        placeholder="Optional: Custom Google Maps Embed URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[7px] text-gray-500 font-bold uppercase">Store Images</label>
                      <ImageUploadInput
                        value=""
                        onChange={(val) => {
                          if (!val) return;
                          const nextHubs = [...homepage.franchise.hubs];
                          const currentImages = hub.images || [];
                          if (!currentImages.includes(val)) {
                             nextHubs[hidx] = { ...hub, image: currentImages.length === 0 ? val : hub.image, images: [...currentImages, val] };
                             updateHomepage('franchise.hubs', nextHubs);
                          }
                        }}
                        className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-mono"
                      />
                      {(hub.images || (hub.image ? [hub.image] : [])).length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pt-2 pb-1 admin-custom-scrollbar">
                           {(hub.images || (hub.image ? [hub.image] : [])).map((imgUrl, imgIdx) => (
                             <div key={imgIdx} className="relative w-16 h-16 rounded-xl border border-white/10 shrink-0 group bg-black p-1">
                               <img src={getImageUrl(imgUrl)} className="w-full h-full object-contain rounded-lg mix-blend-lighten" />
                               <button onClick={() => {
                                  const nextHubs = [...homepage.franchise.hubs];
                                  const currentImages = hub.images || (hub.image ? [hub.image] : []);
                                  const nextImages = currentImages.filter((_, i) => i !== imgIdx);
                                  nextHubs[hidx] = { ...hub, image: nextImages[0] || '', images: nextImages };
                                  updateHomepage('franchise.hubs', nextHubs);
                               }} className="absolute -top-1.5 -right-1.5 bg-stella-red text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110">×</button>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Manager Name</label>
                        <input
                          value={hub.manager || ''}
                          onChange={(e) => {
                            const nextHubs = [...homepage.franchise.hubs];
                            nextHubs[hidx] = { ...hub, manager: e.target.value };
                            updateHomepage('franchise.hubs', nextHubs);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Phone Contact</label>
                        <input
                          value={hub.phone || ''}
                          onChange={(e) => {
                            const nextHubs = [...homepage.franchise.hubs];
                            nextHubs[hidx] = { ...hub, phone: e.target.value };
                            updateHomepage('franchise.hubs', nextHubs);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Operating Timings</label>
                        <input
                          value={hub.hours || ''}
                          onChange={(e) => {
                            const nextHubs = [...homepage.franchise.hubs];
                            nextHubs[hidx] = { ...hub, hours: e.target.value };
                            updateHomepage('franchise.hubs', nextHubs);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Partner With Us (Modal Benefits) Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em]">Why Partner With Us (Modal Benefits)</h3>
                <button
                  type="button"
                  onClick={() => {
                    const currentBenefits = homepage.franchise?.benefits || [];
                    updateHomepage('franchise.benefits', [
                      ...currentBenefits,
                      { title: 'New Benefit Title', desc: 'Detailed benefit description explaining why partners should choose Stella.' }
                    ]);
                  }}
                  className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                >
                  + Add Benefit Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(homepage.franchise?.benefits || []).map((benefit, bidx) => (
                  <div key={bidx} className="p-6 rounded-2xl border border-white/5 bg-black relative space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextBenefits = (homepage.franchise?.benefits || []).filter((_, i) => i !== bidx);
                        updateHomepage('franchise.benefits', nextBenefits);
                      }}
                      className="absolute top-4 right-4 text-[8px] font-black text-stella-red uppercase tracking-widest"
                    >
                      Delete
                    </button>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1 col-span-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Icon</label>
                        <input
                          value={benefit.icon || ''}
                          onChange={(e) => {
                            const nextBenefits = [...homepage.franchise.benefits];
                            nextBenefits[bidx] = { ...benefit, icon: e.target.value };
                            updateHomepage('franchise.benefits', nextBenefits);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold text-center"
                          placeholder="Icon Name"
                        />
                      </div>
                      <div className="space-y-1 col-span-3">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Benefit Title</label>
                        <input
                          value={benefit.title || ''}
                          onChange={(e) => {
                            const nextBenefits = [...homepage.franchise.benefits];
                            nextBenefits[bidx] = { ...benefit, title: e.target.value };
                            updateHomepage('franchise.benefits', nextBenefits);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. Zero Franchise Fee"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[7px] text-gray-500 font-bold uppercase">Description</label>
                      <textarea
                        value={benefit.desc || ''}
                        onChange={(e) => {
                          const nextBenefits = [...homepage.franchise.benefits];
                          nextBenefits[bidx] = { ...benefit, desc: e.target.value };
                          updateHomepage('franchise.benefits', nextBenefits);
                        }}
                        rows={2}
                        className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-medium leading-relaxed resize-none"
                        placeholder="Detailed explanation of the benefit..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Story Settings Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-8">
              <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Our Story Content</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Hero Image URL</label>
                  <ImageUploadInput
                    value={homepage.our_story?.hero_image || ''}
                    onChange={(val) => updateHomepage('our_story.hero_image', val)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-2 px-3 text-[12px] font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Hero Title</label>
                  <input
                    value={homepage.our_story?.hero_title || ''}
                    onChange={(e) => updateHomepage('our_story.hero_title', e.target.value)}
                    className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Hero Subtitle</label>
                  <input
                    value={homepage.our_story?.hero_subtitle || ''}
                    onChange={(e) => updateHomepage('our_story.hero_subtitle', e.target.value)}
                    className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Hero Background Image</label>
                <input
                  value={homepage.our_story?.hero_image || ''}
                  onChange={(e) => updateHomepage('our_story.hero_image', e.target.value)}
                  className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Vision Title</label>
                  <input
                    value={homepage.our_story?.vision_title || ''}
                    onChange={(e) => updateHomepage('our_story.vision_title', e.target.value)}
                    className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Vision Text</label>
                <textarea
                  value={homepage.our_story?.vision_text || ''}
                  onChange={(e) => updateHomepage('our_story.vision_text', e.target.value)}
                  rows={4}
                  className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-medium leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Vision Stats</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(homepage.our_story?.stats || []).map((stat, sidx) => (
                    <div key={sidx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 relative">
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-400 font-bold uppercase">Stat Value</label>
                        <input value={stat.value} onChange={(e) => {
                          const nextStats = [...homepage.our_story.stats];
                          nextStats[sidx] = { ...stat, value: e.target.value };
                          updateHomepage('our_story.stats', nextStats);
                        }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-400 font-bold uppercase">Stat Label</label>
                        <input value={stat.label} onChange={(e) => {
                          const nextStats = [...homepage.our_story.stats];
                          nextStats[sidx] = { ...stat, label: e.target.value };
                          updateHomepage('our_story.stats', nextStats);
                        }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Story Hubs</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const currentHubs = homepage.our_story?.hubs || [];
                      updateHomepage('our_story.hubs', [
                        ...currentHubs,
                        { tag: 'New Store', name: 'Stella Hub', description: 'Store description...', address: '123 Road', phone: '+91 XXX', image: 'https://images.unsplash.com/photo-1554941068-a252680d25d9?auto=format&fit=crop&w=800&q=80' }
                      ]);
                    }}
                    className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                  >
                    + Add Story Hub
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {(homepage.our_story?.hubs || []).map((hub, hidx) => (
                    <div key={hidx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => {
                          const nextHubs = (homepage.our_story?.hubs || []).filter((_, i) => i !== hidx);
                          updateHomepage('our_story.hubs', nextHubs);
                        }}
                        className="absolute top-4 right-4 text-[8px] font-black text-stella-red uppercase tracking-widest"
                      >
                        Delete
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-400 font-bold uppercase">Store Name</label>
                          <input value={hub.name || ''} onChange={(e) => {
                            const nextHubs = [...homepage.our_story.hubs];
                            nextHubs[hidx] = { ...hub, name: e.target.value };
                            updateHomepage('our_story.hubs', nextHubs);
                          }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-400 font-bold uppercase">Tag</label>
                          <input value={hub.tag || ''} onChange={(e) => {
                            const nextHubs = [...homepage.our_story.hubs];
                            nextHubs[hidx] = { ...hub, tag: e.target.value };
                            updateHomepage('our_story.hubs', nextHubs);
                          }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-400 font-bold uppercase">Description</label>
                        <textarea value={hub.description || ''} onChange={(e) => {
                          const nextHubs = [...homepage.our_story.hubs];
                          nextHubs[hidx] = { ...hub, description: e.target.value };
                          updateHomepage('our_story.hubs', nextHubs);
                        }} rows={2} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold resize-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-400 font-bold uppercase">Manager Name</label>
                          <input value={hub.manager || ''} onChange={(e) => {
                            const nextHubs = [...homepage.our_story.hubs];
                            nextHubs[hidx] = { ...hub, manager: e.target.value };
                            updateHomepage('our_story.hubs', nextHubs);
                          }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-400 font-bold uppercase">Address</label>
                          <input value={hub.address || ''} onChange={(e) => {
                            const nextHubs = [...homepage.our_story.hubs];
                            nextHubs[hidx] = { ...hub, address: e.target.value };
                            updateHomepage('our_story.hubs', nextHubs);
                          }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-400 font-bold uppercase">Phone</label>
                          <input value={hub.phone || ''} onChange={(e) => {
                            const nextHubs = [...homepage.our_story.hubs];
                            nextHubs[hidx] = { ...hub, phone: e.target.value };
                            updateHomepage('our_story.hubs', nextHubs);
                          }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[7px] text-gray-400 font-bold uppercase">Store Images</label>
                          <ImageUploadInput value="" onChange={(val) => {
                             if (!val) return;
                             const nextHubs = [...homepage.our_story.hubs];
                             const currentImages = hub.images || [];
                             if (!currentImages.includes(val)) {
                                nextHubs[hidx] = { ...hub, image: currentImages.length === 0 ? val : hub.image, images: [...currentImages, val] };
                                updateHomepage('our_story.hubs', nextHubs);
                             }
                          }} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold font-mono" />
                          
                          {(hub.images || (hub.image ? [hub.image] : [])).length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pt-2 pb-1 admin-custom-scrollbar">
                               {(hub.images || (hub.image ? [hub.image] : [])).map((imgUrl, imgIdx) => (
                                 <div key={imgIdx} className="relative w-12 h-12 rounded border border-white/10 shrink-0 group bg-black p-0.5">
                                   <img src={getImageUrl(imgUrl)} className="w-full h-full object-contain rounded mix-blend-lighten" />
                                   <button onClick={() => {
                                      const nextHubs = [...homepage.our_story.hubs];
                                      const currentImages = hub.images || (hub.image ? [hub.image] : []);
                                      const nextImages = currentImages.filter((_, i) => i !== imgIdx);
                                      nextHubs[hidx] = { ...hub, image: nextImages[0] || '', images: nextImages };
                                      updateHomepage('our_story.hubs', nextHubs);
                                   }} className="absolute -top-1.5 -right-1.5 bg-stella-red text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110">×</button>
                                 </div>
                               ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deals of the Day Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em]">Deals of the Day</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={homepage.deals?.show !== false}
                      onChange={(e) => updateHomepage('deals.show', e.target.checked)}
                      className="accent-stella-red"
                    />
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Show Section</label>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">End Time</label>
                    <input
                      type="datetime-local"
                      value={homepage.deals?.endTime || ''}
                      onChange={(e) => updateHomepage('deals.endTime', e.target.value)}
                      className="bg-white/5 border border-white/5 text-white rounded-lg py-1 px-2 text-[10px] font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDeals = homepage.deals?.items || [];
                      updateHomepage('deals.items', [
                        ...currentDeals,
                        { productId: products.length > 0 ? products[0].id : '', customLabel: 'Special Offer', subtitle: '', dealPrice: '' }
                      ]);
                    }}
                    className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                  >
                    + Add Deal
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(homepage.deals?.items || []).map((deal, didx) => (
                  <div key={didx} className="p-6 rounded-2xl border border-white/5 bg-black relative space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextDeals = (homepage.deals?.items || []).filter((_, i) => i !== didx);
                        updateHomepage('deals.items', nextDeals);
                      }}
                      className="absolute top-4 right-4 text-[8px] font-black text-stella-red uppercase tracking-widest"
                    >
                      Delete
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-12">
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Select Product</label>
                        <select
                          value={deal.productId || ''}
                          onChange={(e) => {
                            const nextDeals = [...homepage.deals.items];
                            nextDeals[didx] = { ...deal, productId: e.target.value };
                            updateHomepage('deals.items', nextDeals);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                        >
                          <option value="">Select a Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Deal Price (Optional)</label>
                        <input
                          type="number"
                          value={deal.dealPrice || ''}
                          onChange={(e) => {
                            const nextDeals = [...homepage.deals.items];
                            nextDeals[didx] = { ...deal, dealPrice: e.target.value };
                            updateHomepage('deals.items', nextDeals);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. 1999"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Custom Label</label>
                        <input
                          type="text"
                          value={deal.customLabel || ''}
                          onChange={(e) => {
                            const nextDeals = [...homepage.deals.items];
                            nextDeals[didx] = { ...deal, customLabel: e.target.value };
                            updateHomepage('deals.items', nextDeals);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. Flat 10% Off"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Subtitle (Optional)</label>
                        <input
                          type="text"
                          value={deal.subtitle || ''}
                          onChange={(e) => {
                            const nextDeals = [...homepage.deals.items];
                            nextDeals[didx] = { ...deal, subtitle: e.target.value };
                            updateHomepage('deals.items', nextDeals);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-bold"
                          placeholder="e.g. Special weekend offer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(homepage.deals?.items || []).length === 0 && (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">No custom deals configured.</p>
                    <p className="text-gray-600 text-[9px] mt-1">If empty, deals will automatically be pulled from products marked as 'Deal of the Day'.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Banner Slides Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em]">Hero Slides</h3>
                <button
                  type="button"
                  onClick={() => {
                    const currentSlides = homepage.hero?.slides || [];
                    updateHomepage('hero.slides', [
                      ...currentSlides,
                      { id: Date.now(), title: 'New Slide Title', subtitle: 'Detailed descriptions...', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=80' }
                    ]);
                  }}
                  className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                >
                  + Add Slide
                </button>
              </div>

              <div className="space-y-6">
                {(homepage.hero?.slides || []).map((slide, sidx) => (
                  <div key={slide.id || sidx} className="p-6 rounded-2xl border border-white/5 bg-black relative space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        const nextSlides = (homepage.hero?.slides || []).filter((_, i) => i !== sidx);
                        updateHomepage('hero.slides', nextSlides);
                      }}
                      className="absolute top-4 right-4 text-[8px] font-black text-stella-red uppercase tracking-widest"
                    >
                      Delete
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6 space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Slide Title</label>
                        <input
                          value={slide.title || ''}
                          onChange={(e) => {
                            const nextSlides = [...homepage.hero.slides];
                            nextSlides[sidx] = { ...slide, title: e.target.value };
                            updateHomepage('hero.slides', nextSlides);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-bold"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Title Size Preset</label>
                        <select
                          value={
                            ['', 'text-[6vw] md:text-[3vw]', 'text-[8vw] md:text-[4vw]', 'text-[12vw] md:text-[6vw]', 'text-[14vw] md:text-[7vw]'].includes(slide.titleSize || '') 
                            ? slide.titleSize || '' 
                            : 'custom'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              const nextSlides = [...homepage.hero.slides];
                              nextSlides[sidx] = { ...slide, titleSize: e.target.value };
                              updateHomepage('hero.slides', nextSlides);
                            }
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-bold"
                        >
                          <option value="">Default</option>
                          <option value="text-[6vw] md:text-[3vw]">Small</option>
                          <option value="text-[8vw] md:text-[4vw]">Medium</option>
                          <option value="text-[12vw] md:text-[6vw]">Large</option>
                          <option value="text-[14vw] md:text-[7vw]">Extra Large</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Manual Size</label>
                        <input
                          value={slide.titleSize || ''}
                          onChange={(e) => {
                            const nextSlides = [...homepage.hero.slides];
                            nextSlides[sidx] = { ...slide, titleSize: e.target.value };
                            updateHomepage('hero.slides', nextSlides);
                          }}
                          placeholder="e.g. text-[60px]"
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6 space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Subtitle / Caption</label>
                        <input
                          value={slide.subtitle || ''}
                          onChange={(e) => {
                            const nextSlides = [...homepage.hero.slides];
                            nextSlides[sidx] = { ...slide, subtitle: e.target.value };
                            updateHomepage('hero.slides', nextSlides);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-medium"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Subtitle Size Preset</label>
                        <select
                          value={
                            ['', 'text-[8px] md:text-[10px]', 'text-[12px] md:text-sm', 'text-sm md:text-base', 'text-base md:text-lg'].includes(slide.subtitleSize || '')
                            ? slide.subtitleSize || ''
                            : 'custom'
                          }
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              const nextSlides = [...homepage.hero.slides];
                              nextSlides[sidx] = { ...slide, subtitleSize: e.target.value };
                              updateHomepage('hero.slides', nextSlides);
                            }
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-medium"
                        >
                          <option value="">Default</option>
                          <option value="text-[8px] md:text-[10px]">Small</option>
                          <option value="text-[12px] md:text-sm">Medium</option>
                          <option value="text-sm md:text-base">Large</option>
                          <option value="text-base md:text-lg">Extra Large</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Manual Size</label>
                        <input
                          value={slide.subtitleSize || ''}
                          onChange={(e) => {
                            const nextSlides = [...homepage.hero.slides];
                            nextSlides[sidx] = { ...slide, subtitleSize: e.target.value };
                            updateHomepage('hero.slides', nextSlides);
                          }}
                          placeholder="e.g. text-sm"
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Link to Category</label>
                        <select
                          value={slide.categoryId || ''}
                          onChange={(e) => {
                            const nextSlides = [...homepage.hero.slides];
                            nextSlides[sidx] = { ...slide, categoryId: e.target.value };
                            updateHomepage('hero.slides', nextSlides);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2.5 px-4 text-xs font-bold"
                        >
                          <option value="">No Link</option>
                          {dbCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[7px] text-gray-500 font-bold uppercase">Image URL</label>
                        <ImageUploadInput
                          value={slide.image || ''}
                          onChange={(val) => {
                            const nextSlides = [...homepage.hero.slides];
                            nextSlides[sidx] = { ...slide, image: val };
                            updateHomepage('hero.slides', nextSlides);
                          }}
                          className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-2 px-3 text-[10px] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Footer Settings */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-8">
              <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Global Footer Settings</h3>
              
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest">Company Description</label>
                <textarea
                  value={homepage.companyDescription || ''}
                  onChange={(e) => updateHomepage('companyDescription', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-xs font-medium leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Footer Links Sections</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(homepage.footerSections || []).map((section, sidx) => (
                    <div key={sidx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[7px] text-gray-400 font-bold uppercase">Section Title</label>
                        <input
                          value={section.title}
                          onChange={(e) => {
                            const nextSections = [...homepage.footerSections];
                            nextSections[sidx] = { ...section, title: e.target.value };
                            updateHomepage('footerSections', nextSections);
                          }}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[7px] text-gray-400 font-bold uppercase">Links</label>
                        {section.links.map((link, lidx) => (
                          <div key={lidx} className="grid grid-cols-2 gap-2">
                            <input
                              value={link.name}
                              onChange={(e) => {
                                const nextSections = [...homepage.footerSections];
                                nextSections[sidx].links[lidx].name = e.target.value;
                                updateHomepage('footerSections', nextSections);
                              }}
                              placeholder="Name"
                              className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[9px]"
                            />
                            <input
                              value={link.path}
                              onChange={(e) => {
                                const nextSections = [...homepage.footerSections];
                                nextSections[sidx].links[lidx].path = e.target.value;
                                updateHomepage('footerSections', nextSections);
                              }}
                              placeholder="Path"
                              className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[9px] font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials Panel */}
            <div className="bg-[#0e0e11] rounded-[2rem] border border-white/[0.05] p-10 space-y-8">
              <h3 className="text-sm font-black text-stella-gold uppercase tracking-[0.4em] border-b border-white/5 pb-4">Testimonials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['col1', 'col2', 'col3'].map((col) => (
                  <div key={col} className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{col.toUpperCase()}</h4>
                    {(homepage.testimonials?.[col] || []).map((review, ridx) => (
                      <div key={ridx} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => {
                            const nextCol = homepage.testimonials[col].filter((_, i) => i !== ridx);
                            updateHomepage(`testimonials.${col}`, nextCol);
                          }}
                          className="absolute top-2 right-2 text-[8px] font-black text-stella-red uppercase tracking-widest"
                        >
                          X
                        </button>
                        <input
                          value={review.name || ''}
                          onChange={(e) => {
                            const nextCol = [...homepage.testimonials[col]];
                            nextCol[ridx] = { ...review, name: e.target.value };
                            updateHomepage(`testimonials.${col}`, nextCol);
                          }}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[10px] font-bold"
                          placeholder="Customer Name"
                        />
                        <textarea
                          value={review.text || ''}
                          onChange={(e) => {
                            const nextCol = [...homepage.testimonials[col]];
                            nextCol[ridx] = { ...review, text: e.target.value };
                            updateHomepage(`testimonials.${col}`, nextCol);
                          }}
                          rows={3}
                          className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-white text-[9px] resize-none"
                          placeholder="Review text..."
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextCol = [...(homepage.testimonials?.[col] || []), { id: Date.now(), name: 'New Customer', text: 'Great experience!', stars: 5 }];
                        updateHomepage(`testimonials.${col}`, nextCol);
                      }}
                      className="w-full text-white text-[8px] font-black uppercase tracking-widest bg-white/5 py-2 rounded-lg border border-white/5 hover:border-stella-gold transition-colors"
                    >
                      + Add Review
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
        
        {activeTab === 'users' && <UsersManager />}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stella-black/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-stella-charcoal border border-white/10 rounded-[2rem] w-full max-w-md p-10 shadow-2xl animate-fade-up">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-stella-red/10 flex items-center justify-center border border-stella-red/20 text-stella-red font-bold text-xl">!</div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Delete Product</h2>
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold leading-relaxed mb-10">Are you sure you want to delete this product?</p>
            <div className="flex items-center space-x-4">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 bg-white/[0.03] border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-colors">Cancel</button>
              <button type="button" onClick={executeDeleteProduct} className="flex-1 bg-stella-red text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-stella-red/20 hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stella-black/80 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)} />
          <div className="relative bg-stella-charcoal border border-white/10 rounded-[2rem] w-full max-w-lg p-10 shadow-2xl animate-fade-up">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-stella-red/10 flex items-center justify-center border border-stella-red/20 text-stella-red font-bold text-xl"><Folder /></div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveCategory(); }} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Category Name</label>
                <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required className="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-4 text-white text-sm focus:border-stella-red outline-none transition-colors" placeholder="e.g. Tablets" />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Description</label>
                <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={3} className="w-full bg-black/50 border border-white/[0.05] rounded-xl px-6 py-4 text-white text-sm focus:border-stella-red outline-none transition-colors resize-none" placeholder="Brief description..." />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">Filter Groups</h4>
                  <button type="button" onClick={addCategoryFilter} className="text-white text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-stella-gold transition-colors">+ Add Filter Group</button>
                </div>
                <div className="space-y-4 max-h-60 overflow-y-auto admin-custom-scrollbar pr-2">
                  {(categoryForm.filters || []).map((filter, fidx) => (
                    <div key={fidx} className="p-4 rounded-2xl border border-white/5 bg-black relative space-y-3">
                      <button type="button" onClick={() => removeCategoryFilter(fidx)} className="absolute top-3 right-3 text-[8px] font-black text-stella-red uppercase tracking-widest">Delete</button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-500 font-bold uppercase">Filter Type</label>
                          <select value={filter.type || 'list'} onChange={(e) => updateCategoryFilter(fidx, 'type', e.target.value)} className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-1.5 px-3 text-[10px] font-bold outline-none focus:border-stella-red cursor-pointer">
                            <option value="list">List (Checkbox)</option>
                            <option value="range">Range (Min/Max)</option>
                            <option value="boolean">Boolean (Toggle)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-500 font-bold uppercase">Filter Display Name</label>
                          <input value={filter.name || ''} onChange={(e) => updateCategoryFilter(fidx, 'name', e.target.value)} className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-1.5 px-3 text-[10px] font-bold outline-none focus:border-stella-red" placeholder="e.g. Brand" />
                        </div>
                      </div>
                      {(!filter.type || filter.type === 'list') && (
                        <div className="space-y-1">
                          <label className="text-[7px] text-gray-500 font-bold uppercase">Options (Comma separated)</label>
                          <input value={(filter.options || []).join(', ')} onChange={(e) => updateCategoryFilter(fidx, 'options', e.target.value.split(',').map(s => s.trim()))} className="w-full bg-white/5 border border-white/5 text-white rounded-lg py-1.5 px-3 text-[10px] font-bold outline-none focus:border-stella-red" placeholder="e.g. Apple, Samsung" />
                        </div>
                      )}
                    </div>
                  ))}
                  {(!categoryForm.filters || categoryForm.filters.length === 0) && (
                    <p className="text-gray-600 text-[10px] font-bold italic">No filter groups defined for this category.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 bg-white/[0.03] border border-white/10 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-stella-red text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-stella-red/20 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
