import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Courses from '@/pages/Courses'
import LearnHub from '@/pages/LearnHub'
import LessonRunner from '@/pages/LessonRunner'
import Vocabulary from '@/pages/modules/Vocabulary'
import Grammar from '@/pages/modules/Grammar'
import Listening from '@/pages/modules/Listening'
import Speaking from '@/pages/modules/Speaking'
import Community from '@/pages/Community'
import Achievements from '@/pages/Achievements'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/learn" element={<LearnHub />} />
        <Route path="/learn/lesson/:id" element={<LessonRunner />} />
        <Route path="/learn/vocab" element={<Vocabulary />} />
        <Route path="/learn/grammar" element={<Grammar />} />
        <Route path="/learn/listening" element={<Listening />} />
        <Route path="/learn/speaking" element={<Speaking />} />
        <Route path="/community" element={<Community />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
