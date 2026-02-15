import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Loading Component
const PageLoading = () => (
  <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4">
    <div className="relative">
      <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse" />
      </div>
    </div>
    <p className="mt-6 text-gray-500 text-sm font-medium animate-pulse tracking-widest uppercase">Loading Anilegeon...</p>
  </div>
);

// Lazy Pages
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const Trending = lazy(() => import('../pages/Trending').then(m => ({ default: m.Trending })));
const RandomAnime = lazy(() => import('../pages/RandomAnime').then(m => ({ default: m.RandomAnime })));
const AnimeDetails = lazy(() => import('../pages/AnimeDetails').then(m => ({ default: m.AnimeDetails })));
const Watch = lazy(() => import('../pages/Watch').then(m => ({ default: m.Watch })));
const Search = lazy(() => import('../pages/Search').then(m => ({ default: m.Search })));
const CategoryPage = lazy(() => import('../pages/Category').then(m => ({ default: m.CategoryPage })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));

// Watch Party
const WatchPartyDashboard = lazy(() => import('../features/watchParty/pages/WatchPartyDashboard'));
const WatchPartyRoom = lazy(() => import('../features/watchParty/pages/WatchPartyRoom'));

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminAnime = lazy(() => import('../pages/admin/AnimeManagement').then(m => ({ default: m.AdminAnime })));
const AdminEpisodes = lazy(() => import('../pages/admin/EpisodeManagement').then(m => ({ default: m.AdminEpisodes })));
const AdminCategories = lazy(() => import('../pages/admin/CategoryManagement').then(m => ({ default: m.AdminCategories })));
const AdminUsers = lazy(() => import('../pages/admin/UserManagement').then(m => ({ default: m.AdminUsers })));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/trending" element={<ProtectedRoute><Layout><Trending /></Layout></ProtectedRoute>} />
        <Route path="/random" element={<ProtectedRoute><Layout><RandomAnime /></Layout></ProtectedRoute>} />
        <Route path="/anime/:id" element={<ProtectedRoute><Layout><AnimeDetails /></Layout></ProtectedRoute>} />
        <Route path="/watch/:id" element={<ProtectedRoute><Layout><Watch /></Layout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Layout><Search /></Layout></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
        <Route path="/category/:id" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        
        {/* Watch Party Routes */}
        <Route path="/party" element={<ProtectedRoute><Layout><WatchPartyDashboard /></Layout></ProtectedRoute>} />
        <Route path="/party/:roomId" element={<ProtectedRoute><Layout><WatchPartyRoom /></Layout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/anime" element={<ProtectedRoute adminOnly><AdminLayout><AdminAnime /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/episodes/:animeId" element={<ProtectedRoute adminOnly><AdminLayout><AdminEpisodes /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminLayout><AdminCategories /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
};
