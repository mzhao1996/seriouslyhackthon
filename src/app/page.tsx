"use client";

import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JobSeeker {
  id: number;
  full_name: string;
  country: string;
  skills: string[];
  experience: string;
  education: string;
  bio: string;
}

const ITEMS_PER_PAGE = 14;

export default function Home() {
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [filteredJobSeekers, setFilteredJobSeekers] = useState<JobSeeker[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeeker, setSelectedSeeker] = useState<JobSeeker | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchJobSeekers();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const performSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredJobSeekers(jobSeekers);
    } else {
      const filtered = jobSeekers.filter(seeker => 
        seeker.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seeker.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seeker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        seeker.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobSeekers(filtered);
    }
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const fetchJobSeekers = async () => {
    try {
      const { data, error } = await supabase
        .from('job_seekers')
        .select('*');

      if (error) throw error;
      setJobSeekers(data || []);
      setFilteredJobSeekers(data || []);
    } catch (error) {
      console.error('Error fetching job seekers:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredJobSeekers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJobSeekers = filteredJobSeekers.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen p-4 overflow-hidden">
      <main className="h-full flex flex-col">
        <div className="flex-none mb-4">
          <h1 className="text-3xl font-bold mb-4">Job Seekers</h1>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name, country, skills or bio..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              className="w-full h-10 text-base"
            />
            <Button onClick={performSearch} className="h-10">
              Search
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedSeeker ? (
            <div className={`flex gap-4 h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
              {!isFullScreen && (
                <div className="w-1/2 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {currentJobSeekers.map((seeker) => (
                      <div 
                        key={seeker.id} 
                        className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                          selectedSeeker?.id === seeker.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedSeeker(seeker);
                          setIsFullScreen(false);
                        }}
                      >
                        <div className="flex h-full">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 mr-3 flex-shrink-0">
                            {seeker.full_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-1">{seeker.full_name}</h2>
                            <p className="text-sm text-gray-600 mb-2">{seeker.country}</p>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{seeker.bio}</p>
                            <div className="flex flex-wrap gap-1">
                              {seeker.skills.map((skill, index) => (
                                <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={`${isFullScreen ? 'w-full' : 'w-1/2'} border rounded-lg p-8 overflow-y-auto bg-white shadow-xl`}>
                <div className="flex justify-between items-center mb-8 pb-6 border-b">
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSeeker(null);
                        setIsFullScreen(false);
                      }}
                      className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Back to List
                    </Button>
                    {!isFullScreen && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsFullScreen(true)}
                        className="flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3h3a2 2 0 0 1 2 2v3m0 0h3a2 2 0 0 1 2 2v3m0 0h3a2 2 0 0 1 2 2v3"></path>
                        </svg>
                        Full Screen
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                      {selectedSeeker.full_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedSeeker.full_name}</h2>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <p className="text-gray-600 text-lg">{selectedSeeker.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedSeeker.bio}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeeker.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-300"></div>
                        {selectedSeeker.experience.split('\n').map((exp, index) => {
                          const [date, ...details] = exp.split(' - ');
                          return (
                            <div key={index} className="relative mb-6 last:mb-0">
                              <div className="absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-blue-600">{date}</div>
                                <div className="mt-1 text-gray-700 leading-relaxed">{details.join(' - ')}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Education</h3>
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-300"></div>
                        {selectedSeeker.education.split('\n').map((edu, index) => {
                          const [date, ...details] = edu.split(' - ');
                          return (
                            <div key={index} className="relative mb-6 last:mb-0">
                              <div className="absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500"></div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-green-600">{date}</div>
                                <div className="mt-1 text-gray-700 leading-relaxed">{details.join(' - ')}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
              {currentJobSeekers.map((seeker) => (
                <div 
                  key={seeker.id} 
                  className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSeeker(seeker)}
                >
                  <div className="flex h-full">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 mr-3 flex-shrink-0">
                      {seeker.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-1">{seeker.full_name}</h2>
                      <p className="text-sm text-gray-600 mb-2">{seeker.country}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{seeker.bio}</p>
                      <div className="flex flex-wrap gap-1">
                        {seeker.skills.map((skill, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-none flex justify-center gap-4 mt-4">
          <div className="text-sm text-gray-600 mb-2">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredJobSeekers.length)} of {filteredJobSeekers.length} job seekers
          </div>
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-1"
          >
            Previous
          </Button>
          <span className="flex items-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-1"
          >
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}
