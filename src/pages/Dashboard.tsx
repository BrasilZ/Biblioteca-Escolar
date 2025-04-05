import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, CheckCircle } from 'lucide-react';

interface Loan {
  id: string;
  book: {
    title: string;
    author: string;
  };
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
}

interface Profile {
  full_name: string;
  email: string;
  is_admin: boolean;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchDashboardData() {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's loans with book details
        const { data: loansData, error: loansError } = await supabase
          .from('loans')
          .select(`
            id,
            borrowed_at,
            due_date,
            returned_at,
            books (
              title,
              author
            )
          `)
          .eq('user_id', user.id)
          .order('borrowed_at', { ascending: false });

        if (loansError) throw loansError;
        setLoans(loansData as Loan[]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {profile?.full_name || 'Reader'}!</h2>
        <div className="text-gray-600">
          <p className="mb-2">Email: {profile?.email}</p>
          <p>Role: {profile?.is_admin ? 'Administrator' : 'Member'}</p>
        </div>
      </div>

      {/* Loans Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Book Loans</h3>
        
        {loans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">You haven't borrowed any books yet.</p>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="border rounded-lg p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{loan.book.title}</h4>
                    <p className="text-gray-600 text-sm">{loan.book.author}</p>
                  </div>
                  {loan.returned_at ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Returned
                    </span>
                  ) : (
                    <span className="flex items-center text-blue-600 text-sm">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Borrowed: {new Date(loan.borrowed_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Due: {new Date(loan.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;