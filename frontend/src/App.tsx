import Cashier from "./pages/Cashier";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import ProductDetails from "./pages/ProductDetails";

import MyAccount from "./pages/MyAccount";

import NotFound from "./pages/NotFound";

import Dashboard from "./pages/Dashboard";

import Products from "./pages/Products";

import Movements from "./pages/Movements";

import Activity from "./pages/Activity";

import Scan from "./pages/Scan";

import StockIn from "./pages/StockIn";

import StockOut from "./pages/StockOut";

import Adjustments from "./pages/Adjustments";

import Reports from "./pages/Reports";

import Warehouses from "./pages/Warehouses";

import WarehouseInventory from "./pages/WarehouseInventory";

import UsersPage from "./pages/Users";

import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/cashier"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "MANAGER",
                "STAFF",
              ]}
            >
              <Layout>
                <Cashier />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* STOCK OUT */}

        <Route
          path="/stock-out"
          element={
            <ProtectedRoute>
              <Layout>
                <StockOut />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* STOCK IN */}

        <Route
          path="/stock-in"
          element={
            <ProtectedRoute>
              <Layout>
                <StockIn />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* LOGIN */}

        <Route path="/login" element={<Login />} />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PRODUCTS */}

        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "STAFF"]}>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PRODUCT DETAILS */}

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "STAFF"]}>
              <Layout>
                <ProductDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* MOVEMENTS */}

        <Route
          path="/movements"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Layout>
                <Movements />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* SCAN */}

        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <Layout>
                <Scan />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ACTIVITY */}

        <Route
          path="/activity"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Layout>
                <Activity />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ADJUSTMENTS */}

        <Route
          path="/adjustments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Layout>
                <Adjustments />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* REPORTS */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* WAREHOUSES */}

        <Route
          path="/warehouses"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Layout>
                <Warehouses />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* WAREHOUSE INVENTORY */}

        <Route
          path="/warehouses/:id/inventory"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Layout>
                <WarehouseInventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* USERS */}

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <Layout>
                <MyAccount />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
