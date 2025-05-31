'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
import './dashboard.css';
import { Cause } from '../api/causes/types';
import Sidebar from './components/Sidebar';
import FullScreenEditor from './FullScreenEditor';
import { useCauses } from './hooks/useCauses';
import CausesSection from './components/CausesSection';
import EventsSection from './components/EventsSection';
import GallerySection from './components/GallerySection';
import TeamsSection from './components/TeamsSection';

type User = {
  email: string;
  id: string;
};

// Loading Components
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
  </div>
);

const AuthLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error Components
const ErrorMessage = ({ error }: { error: string }) => (
  <div className="error-message">{error}</div>
);

const AuthErrorMessage = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <div className="max-w-md mx-auto p-6">
    <div className="alert alert-error">
      {error}
    </div>
    <button
      onClick={onRetry}
      className="btn btn-primary mt-4"
    >
      Return to Login
    </button>
  </div>
);

// Dashboard Content Renderer
const DashboardContent = ({
  activeComponent,
  causes,
  loading,
  error,
  onEditCause,
  onDeleteCause,
  onCreateNewCause
}: {
  activeComponent: string;
  causes: Cause[];
  loading: boolean;
  error: string | null;
  onEditCause: (cause: Cause) => void;
  onDeleteCause: (id: string) => Promise<boolean>;
  onCreateNewCause: () => void;
}) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  switch (activeComponent) {
    case 'causes':
      return (
        <CausesSection
          causes={causes}
          onEdit={onEditCause}
          onDelete={onDeleteCause}
          onCreateNew={onCreateNewCause}
        />
      );
    case 'events':
      return <EventsSection />;
    case 'gallery':
      return <GallerySection />;
    case 'teams':
      return <TeamsSection />;
    default:
      return <div>Select a section from the sidebar</div>;
  }
};

// Main Dashboard Component
export default function Dashboard() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Dashboard state
  const [activeComponent, setActiveComponent] = useState('causes');
  const [editingCause, setEditingCause] = useState<Cause | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    causes,
    loading,
    error,
    createCause,
    deleteCause,
    updateCause
  } = useCauses();

  // Auth effects
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) router.push('/login');
        else setUser(user as User);      } catch (err: unknown) {
        setAuthError((err as Error)?.message || 'Failed to load user data');
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUser();
  }, [router]);
  // Cause handlers
  const handleCreateCause = async (newCause: Partial<Cause>) => {
    const success = await createCause(newCause);
    if (success) setIsCreating(false);
  };

  const handleEditCause = async (updatedCause: Partial<Cause>) => {
    if (!editingCause?.id) return;
    const success = await updateCause(editingCause.id, updatedCause);
    if (success) setEditingCause(null);
  };

  // Render auth states
  if (isAuthLoading) return <AuthLoadingSpinner />;
  if (authError) return <AuthErrorMessage error={authError} onRetry={() => router.push('/login')} />;
  if (!user) return <AuthLoadingSpinner />;

  return (
    <>
      {/* Main Content Dashboard */}
      <div className="dashboard-container">
        <Sidebar 
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />

        <div className="main-content">
          <DashboardContent
            activeComponent={activeComponent}
            causes={causes}
            loading={loading}
            error={error}
            onEditCause={setEditingCause}
            onDeleteCause={deleteCause}
            onCreateNewCause={() => setIsCreating(true)}
          />
        </div>

        {editingCause && (
          <FullScreenEditor
            cause={editingCause}
            onSave={handleEditCause}
            onClose={() => setEditingCause(null)}
          />
        )}        {isCreating && (
          <FullScreenEditor
            cause={{
              id: '',
              title: '',
              description: '',
              category: '',
              goal: 0,
              imageUrl: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }}
            onSave={handleCreateCause}
            onClose={() => setIsCreating(false)}
          />
        )}
      </div>
    </>
  );
}