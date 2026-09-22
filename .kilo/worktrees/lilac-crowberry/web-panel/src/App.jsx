import { BrowserRouter, Routes, Route } from "react-router-dom";

import AnnouncementBar from "./components/layout/AnnouncementBar";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Hero from "./pages/home/Hero";
import CategoryMarquee from "./pages/home/CategoryMarquee";
import FoodDiscovery from "./pages/home/FoodDiscovery";
import HowItWorks from "./pages/home/HowItWorks";
import RestaurantShowcase from "./pages/home/RestaurantShowcase";
import AppExperience from "./pages/home/AppExperience";
import DeliveryJourney from "./pages/home/DeliveryJourney";
import LiveTracking from "./pages/home/LiveTracking";
import WhyChooseUs from "./pages/home/WhyChooseUs";
import Offers from "./pages/home/Offers";
import Riders from "./pages/home/Riders";
import Testimonials from "./pages/home/Testimonials";
import ServiceAreas from "./pages/home/ServiceAreas";
import FAQ from "./pages/home/FAQ";
import FinalCTA from "./pages/home/FinalCTA";

import AdminLogin from "./pages/auth/AdminLogin";
import VendorLogin from "./pages/auth/VendorLogin";
import VendorRegister from "./pages/auth/VendorRegister";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "../adminPanel/components/Dashboard";
import Orders from "../adminPanel/components/Orders";
import AdminProfile from "../adminPanel/pages/AdminProfile";
import AdminSettings from "../adminPanel/pages/AdminSettings";
import AdminNotifications from "../adminPanel/pages/AdminNotifications";
import AdminBanners from "../adminPanel/pages/AdminBanners";
import AdminCoupons from "../adminPanel/pages/AdminCoupons";
import AdminAuditLogs from "../adminPanel/pages/AdminAuditLogs";
import AdminApprovals from "../adminPanel/pages/AdminApprovals";
import AdminVendors from "../adminPanel/pages/AdminVendors";
import AdminRiders from "../adminPanel/pages/AdminRiders";
import AdminCustomers from "../adminPanel/pages/AdminCustomers";
import Placeholder from "../adminPanel/components/Placeholder";
import AdminCategories from "../adminPanel/pages/AdminCategories";
import VendorLayout from "./layouts/VendorLayout";
import VendorDashboard from "../vendorPanel/pages/VendorDashboard";
import VendorNewOrders from "../vendorPanel/pages/VendorNewOrders";
import VendorVerifyEmail from "../vendorPanel/pages/VendorVerifyEmail";
import VendorPending from "../vendorPanel/pages/VendorPending";
import ReviewsPage from "../vendorPanel/pages/ReviewsPage";
import CompletedPickupOrders from "../vendorPanel/pages/CompletedPickupOrders";
import AllOrders from "../vendorPanel/pages/AllOrders";
import VendorMenu from "../vendorPanel/pages/VendorMenu";
import VendorNotifications from "../vendorPanel/pages/VendorNotifications";
import VendorProfile from "../vendorPanel/pages/VendorProfile";
import VendorSettings from "../vendorPanel/pages/VendorSettings";
import VendorEarnings from "../vendorPanel/pages/VendorEarnings";
import PreparingOrders from "../vendorPanel/pages/PreparingOrders";
import OrderHistory from "../vendorPanel/pages/OrderHistory";
import VendorSupport from "../vendorPanel/pages/VendorSupport";
import Icons from "../adminPanel/pages/Icons";
import AddCategory from "../vendorPanel/pages/AddCategory";
import AdminOrders from "../adminPanel/pages/AdminOrders";
import AdminAllOrders from "../adminPanel/pages/AdminAllOrders";
import AdminLiveMap from "../adminPanel/pages/AdminLiveMap";
import AdminServiceAreas from "../adminPanel/pages/AdminServiceAreas";
import AdminPopularFoods from "../adminPanel/pages/AdminPopularFoods";
import VendorPopularFoods from "../vendorPanel/pages/VendorPopularFoods";
import AdminExplore from "../adminPanel/pages/AdminExplore";
import VendorBankDetails from "../vendorPanel/pages/VendorBankDetails";
import AdminTiffinApprovals from "../adminPanel/pages/tiffin/TiffinApprovals";
import TiffinEarnings from "../adminPanel/pages/tiffin/TiffinEarnings";
import TiffinSubscriptions from "../adminPanel/pages/tiffin/TiffinSubscriptions";
import TiffinReviews from "../adminPanel/pages/tiffin/TiffinReviews";
import RestaurantsList from "../adminPanel/pages/RestaurantsList";
import DhabasList from "../adminPanel/pages/DhabasList";
import BakeriesList from "../adminPanel/pages/BakeriesList";
import CafesList from "../adminPanel/pages/CafesList";
import TopVendors from "../adminPanel/pages/TopVendors";
import AdminAnalytics from "../adminPanel/pages/AdminAnalytics";
import AdminSalesAnalytics from "../adminPanel/pages/AdminSalesAnalytics";
import AdminOrderAnalytics from "../adminPanel/pages/AdminOrderAnalytics";
import AdminPayments from "../adminPanel/pages/Payments/AdminPayments";
import AdminVendorSettlements from "../adminPanel/pages/Payments/AdminVendorSettlements";
import AdminRiderPayouts from "../adminPanel/pages/Payments/AdminRiderPayouts";

/* ================================
   LANDING PAGE
================================ */

function LandingPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <CategoryMarquee />
        <FoodDiscovery />
        <HowItWorks />
        <RestaurantShowcase />
        <AppExperience />
        <DeliveryJourney />
        <LiveTracking />
        <WhyChooseUs />
        <Offers />
        <Riders />
        <Testimonials />
        <ServiceAreas />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

/* ================================
   APP ROUTES
================================ */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Vendor Auth (outside layout) */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor/verify/email" element={<VendorVerifyEmail />} />
        <Route path="/vendor/pending/approved" element={<VendorPending />} />

        {/* Admin Panel (with AdminLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="push/notifications" element={<AdminNotifications />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="audit/logs" element={<AdminAuditLogs />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="riders" element={<AdminRiders />} />
          {/* <Route path="all/orders" element={<Orders />} /> */}
          <Route path="food/categories" element={<AdminCategories />} />
          {/* Placeholder routes – you can replace later */}
          <Route path="explore" element={<AdminExplore />} />
          <Route path="live/orders" element={<AdminOrders />} />
          <Route path="all/orders" element={<AdminAllOrders />} />
          <Route path="live/delivery/map" element={<AdminLiveMap />} />
          <Route path="popular/foods" element={<AdminPopularFoods />} />
          <Route path="tiffin/approvals" element={<AdminTiffinApprovals />} />
          <Route path="tiffin/earnings" element={<TiffinEarnings />} />
          <Route path="top/rated/vendors" element={<TopVendors />} />
          <Route
            path="tiffin/subscriptions"
            element={<TiffinSubscriptions />}
          />
          <Route path="tiffin/reviews" element={<TiffinReviews />} />
          <Route path="icons" element={<Icons />} />
          <Route path="restaurants" element={<RestaurantsList />} />
          <Route path="service/areas" element={<AdminServiceAreas />} />
          <Route path="dhabas" element={<DhabasList />} />
          <Route path="bakeries" element={<BakeriesList />} />
          <Route path="cafes" element={<CafesList />} />
          <Route path="analytics/overview" element={<AdminAnalytics />} />
          <Route path="sales/analytics" element={<AdminSalesAnalytics />} />
          <Route path="order/analytics" element={<AdminOrderAnalytics />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route
            path="vendor/settlements"
            element={<AdminVendorSettlements />}
          />
          <Route path="rider/payouts" element={<AdminRiderPayouts />} />
          <Route
            path="tiffin-centers"
            element={<Placeholder title="Tiffin Centers" />}
          />
          <Route
            path="add-vendor"
            element={<Placeholder title="Add Vendor" />}
          />
          <Route
            path="pending-kyc"
            element={<Placeholder title="Pending KYC" />}
          />
          <Route
            path="online-riders"
            element={<Placeholder title="Online Riders" />}
          />
          <Route
            path="offline-riders"
            element={<Placeholder title="Offline Riders" />}
          />
          <Route
            path="blocked-riders"
            element={<Placeholder title="Blocked Riders" />}
          />
          <Route
            path="rider-payouts"
            element={<Placeholder title="Rider Payouts" />}
          />
          <Route
            path="business-types"
            element={<Placeholder title="Business Types" />}
          />
          <Route
            path="categories"
            element={<Placeholder title="Categories" />}
          />
          <Route path="cuisines" element={<Placeholder title="Cuisines" />} />
          <Route path="products" element={<Placeholder title="Products" />} />
          <Route
            path="service-areas"
            element={<Placeholder title="Service Areas" />}
          />
          <Route
            path="delivery-charges"
            element={<Placeholder title="Delivery Charges" />}
          />
          <Route
            path="delivery-settings"
            element={<Placeholder title="Delivery Settings" />}
          />
          <Route path="payments" element={<Placeholder title="Payments" />} />
          <Route
            path="vendor-settlements"
            element={<Placeholder title="Vendor Settlements" />}
          />
          <Route path="refunds" element={<Placeholder title="Refunds" />} />
          <Route
            path="support-tickets"
            element={<Placeholder title="Support Tickets" />}
          />
          <Route path="reviews" element={<Placeholder title="Reviews" />} />
          <Route
            path="cancellations"
            element={<Placeholder title="Cancellations" />}
          />
          <Route
            path="analytics-overview"
            element={<Placeholder title="Analytics Overview" />}
          />
          <Route
            path="sales-analytics"
            element={<Placeholder title="Sales Analytics" />}
          />
          <Route
            path="order-analytics"
            element={<Placeholder title="Order Analytics" />}
          />
          <Route path="reports" element={<Placeholder title="Reports" />} />
          <Route
            path="admin-staff"
            element={<Placeholder title="Admin Staff" />}
          />
          <Route
            path="roles-permissions"
            element={<Placeholder title="Roles & Permissions" />}
          />
          <Route
            path="audit-logs"
            element={<Placeholder title="Audit Logs" />}
          />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>

        {/* Vendor Panel (with VendorLayout) */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="new/orders" element={<VendorNewOrders />} />
          <Route path="all/orders" element={<AllOrders />} />
          <Route path="preparing" element={<PreparingOrders />} />
          <Route path="ready/and/pickup" element={<CompletedPickupOrders />} />
          <Route path="order/history" element={<OrderHistory />} />{" "}
          {/* ✅ fixed */}
          <Route path="bank/details" element={<VendorBankDetails />} />
          <Route path="menu" element={<VendorMenu />} />
          <Route path="notifications" element={<VendorNotifications />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="settings" element={<VendorSettings />} />
          <Route path="earnings" element={<VendorEarnings />} />
          <Route path="support" element={<VendorSupport />} />
          <Route path="add/categories" element={<AddCategory />} />
          <Route path="popular/foods" element={<VendorPopularFoods />} />
        </Route>

        {/* 404 – Catch-all */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen px-4 bg-brand-light">
              <div className="text-center">
                <h1 className="font-bold text-7xl text-brand-primary">404</h1>
                <h2 className="mt-4 text-2xl font-bold text-brand-dark">
                  Page not found
                </h2>
                <p className="mt-2 text-gray-500">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="inline-flex px-6 py-3 mt-6 font-semibold text-white transition rounded-xl bg-brand-primary hover:bg-brand-hover"
                >
                  Back to Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
