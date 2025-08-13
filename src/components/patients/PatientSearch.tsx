'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@/types/patient';
import { ROUTES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface PatientSearchProps {
  onPatientSelect?: (patient: Patient) => void;
  placeholder?: string;
  showResults?: boolean;
  autoFocus?: boolean;
}

export default function PatientSearch({ 
  onPatientSelect, 
  placeholder = "Cari berdasarkan nama, NIK, atau nomor HP...",
  showResults = true,
  autoFocus = false
}: PatientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await patientsApi.getPatients({ 
          query: searchQuery.trim(), 
          limit: 10 
        });
        setResults(response.data.pasien);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Gagal mencari pasien');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handlePatientSelect = (patient: Patient) => {
    setQuery(patient.nama);
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    if (onPatientSelect) {
      onPatientSelect(patient);
    } else {
      // Default behavior: navigate to patient detail
      router.push(ROUTES.PATIENT_DETAIL(patient.id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handlePatientSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const formatPatientInfo = (patient: Patient) => {
    const age = calculateAge(patient.tanggal_lahir);
    return `${patient.nama} • NIK: ${patient.nik} • Umur: ${age} tahun`;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          rightIcon={
            <div className="flex items-center gap-1">
              {isSearching && <Loading size="sm" />}
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Hapus pencarian"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto z-50 shadow-lg">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((patient, index) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {highlightMatch(patient.nama, query)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        NIK: {highlightMatch(patient.nik, query)}
                      </div>
                      {patient.nomor_hp && (
                        <div className="text-sm text-gray-500">
                          HP: {highlightMatch(patient.nomor_hp, query)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 ml-4">
                      {calculateAge(patient.tanggal_lahir)} tahun
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isSearching ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <p className="text-sm">Tidak ada pasien ditemukan</p>
              <p className="text-xs text-gray-400 mt-1">
                Coba gunakan kata kunci yang berbeda
              </p>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}

// Utility functions
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}