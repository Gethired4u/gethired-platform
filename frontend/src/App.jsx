import { Suspense, lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";

const AdminPage        = lazy(() => import("./pages/AdminPage"));
const RegisterPage     = lazy(() => import("./pages/RegisterPage"));
const ResumeCheckPage  = lazy(() => import("./pages/ResumeCheckPage"));

function PageLoader() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-2/3 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-5/6 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-4/6 rounded bg-slate-200" />
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      {/* "/" — React renders nothing; the HTML landing page in index.html is visible */}
      <Route path="/" element={null} />

      {/* All other routes — React takes over with Navbar + page content */}
      <Route element={<AppLayout />}>
        <Route path="/resume-check" element={<ResumeCheckPage />} />
        <Route path="/register"     element={<RegisterPage />} />
        <Route path="/admin"        element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;
