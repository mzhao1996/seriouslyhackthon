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

const ITEMS_PER_PAGE = 16;

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

  useEffect(() => {
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
  }, [searchQuery, jobSeekers]);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
          <Input
            type="text"
            placeholder="Search by name, country, skills or bio..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full h-10 text-base"
          />
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
                          <div className="w-1/3 pr-3 border-r">
                            <h2 className="text-lg font-semibold mb-1">{seeker.full_name}</h2>
                            <p className="text-sm text-gray-600 mb-2">{seeker.country}</p>
                          </div>
                          <div className="w-2/3 pl-3">
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
              <div className={`${isFullScreen ? 'w-full' : 'w-1/2'} border rounded-lg p-6 overflow-y-auto`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedSeeker(null);
                        setIsFullScreen(false);
                      }}
                      className="flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Close
                    </Button>
                    {!isFullScreen && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsFullScreen(true)}
                        className="flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3h3a2 2 0 0 1 2 2v3m0 0h3a2 2 0 0 1 2 2v3m0 0h3a2 2 0 0 1 2 2v3"></path>
                        </svg>
                        Maximize
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{selectedSeeker.full_name}</h2>
                  <div className="text-gray-600">{selectedSeeker.country}</div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Bio</h3>
                    <p className="text-gray-700">{selectedSeeker.bio}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeeker.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Experience</h3>
                    <p className="text-gray-700">{selectedSeeker.experience}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Education</h3>
                    <p className="text-gray-700">{selectedSeeker.education}</p>
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
                    <div className="w-1/3 pr-3 border-r">
                      <h2 className="text-lg font-semibold mb-1">{seeker.full_name}</h2>
                      <p className="text-sm text-gray-600 mb-2">{seeker.country}</p>
                    </div>
                    <div className="w-2/3 pl-3">
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
