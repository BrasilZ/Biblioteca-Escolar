import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  quantity: number;
  available_quantity: number;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Library Books
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-4">by {book.author}</p>
            <div className="space-y-2">
              {book.isbn && (
                <p className="text-sm text-gray-500">
                  ISBN: {book.isbn}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Available: {book.available_quantity} of {book.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found in the library.</p>
        </div>
      )}
    </div>
  );
}