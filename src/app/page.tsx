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
          <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
            {currentJobSeekers.map((seeker) => (
              <div key={seeker.id} className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow h-[120px] overflow-hidden">
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
        <div className="flex-none flex items-center justify-center gap-8 mt-4">
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
            Showing <span className="font-medium">{startIndex + 1}-{Math.min(endIndex, filteredJobSeekers.length)}</span> of <span className="font-medium">{filteredJobSeekers.length}</span> job seekers
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
