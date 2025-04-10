"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Professional {
  id: number;
  full_name: string;
  country: string;
  skills: {
    skills: { 
      technical: Record<string, number>;
      soft: Record<string, number>;
      certifications: string[];
    }
    contact: {
      email: string;
      phone: string;
    }
  };
  experience: Array<{
    company: string;
    position: string;
    period: string;
    responsibilities: string[];
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    period: string;
    thesis?: string;
    gpa?: string;
  }>;

  bio: string;
  recommendation?: string;
}

const ITEMS_PER_PAGE = 14;

const SkillBadges = ({ skills }: { skills: Professional['skills'] }) => {
  if (!skills?.skills?.technical) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(skills.skills.technical).map(([skill, years], index) => (
        <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
          {skill} ({years} years)
        </span>
      ))}
    </div>
  );
};

const SkillsDetail = ({ skills }: { skills: Professional['skills'] }) => {
  if (!skills) return null;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-2">Technical Skills</h4>
        <div className="flex flex-wrap gap-2">
          {skills.skills.technical && Object.keys(skills.skills.technical).length > 0 ? 
            Object.entries(skills.skills.technical).map(([skill, years], index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                {skill} ({years} years)
              </span>
            )) : (
              <p className="text-gray-500">No technical skills listed</p>
            )
          }
        </div>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-2">Soft Skills</h4>
        <div className="flex flex-wrap gap-2">
          {skills.skills.soft && Object.keys(skills.skills.soft).length > 0 ? 
            Object.entries(skills.skills.soft).map(([skill, years], index) => (
              <span key={index} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                {skill} ({years} years)
              </span>
            )) : (
              <p className="text-gray-500">No soft skills listed</p>
            )
          }
        </div>
      </div>
      <div>
        <h4 className="text-lg font-medium text-gray-800 mb-2">Certifications</h4>
        <div className="flex flex-wrap gap-2">
          {skills.skills.certifications && skills.skills.certifications.length > 0 ? 
            skills.skills.certifications.map((cert, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                {cert}
              </span>
            )) : (
              <p className="text-gray-500">No certifications listed</p>
            )
          }
        </div>
      </div>
    </div>
  );
};

const ProfessionalCard = ({ 
  professional, 
  isSelected = false, 
  onClick 
}: { 
  professional: Professional, 
  isSelected?: boolean, 
  onClick: () => void 
}) => (
  <div 
    className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-[280px] flex flex-col ${
      isSelected ? 'border-blue-500 bg-blue-50' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 mr-3 flex-shrink-0">
          {professional.full_name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{professional.full_name}</h2>
          <p className="text-sm text-gray-600">{professional.country}</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm text-gray-700 line-clamp-3 mb-2">{professional.bio}</p>
        {professional.recommendation && (
          <div className="bg-blue-50 p-2 rounded-md mb-2 min-h-[3rem]">
            <h3 className="text-sm font-medium text-blue-800 mb-1">AI Evaluation</h3>
            <p className="text-sm text-blue-700 line-clamp-2">{professional.recommendation}</p>
          </div>
        )}
        <SkillBadges skills={professional.skills} />
      </div>
    </div>
  </div>
);

const WorkExperience = ({ experience }: { experience: Professional['experience'] }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
    <div className="relative pl-8">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-300"></div>
      {experience?.map((exp, index) => (
        <div key={index} className="relative mb-6 last:mb-0">
          <div className="absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
          <div className="ml-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">{exp.position}</h4>
              <span className="text-sm text-blue-600">{exp.period}</span>
            </div>
            <p className="text-gray-600 mb-2">{exp.company}</p>
            <div className="space-y-2">
              <div>
                <h5 className="text-sm font-medium text-gray-800 mb-1">Responsibilities:</h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
              {exp.achievements && exp.achievements.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-800 mb-1">Achievements:</h5>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Education = ({ education }: { education: Professional['education'] }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900">Education</h3>
    <div className="relative pl-8">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-300"></div>
      {education?.map((edu, index) => (
        <div key={index} className="relative mb-6 last:mb-0">
          <div className="absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500"></div>
          <div className="ml-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
              <span className="text-sm text-green-600">{edu.period}</span>
            </div>
            <p className="text-gray-600 mb-2">{edu.institution}</p>
            {edu.gpa && (
              <p className="text-sm text-gray-700">GPA: {edu.gpa}</p>
            )}
            {edu.thesis && (
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-800">Thesis:</h5>
                <p className="text-sm text-gray-700">{edu.thesis}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProfessionalDetail = ({ 
  professional, 
  isFullScreen, 
  onClose, 
  onToggleFullScreen 
}: { 
  professional: Professional, 
  isFullScreen: boolean, 
  onClose: () => void, 
  onToggleFullScreen: () => void 
}) => (
  <div className={`${isFullScreen ? 'w-full' : 'w-1/2'} border rounded-lg p-8 overflow-y-auto bg-white shadow-xl`}>
    <div className="flex justify-between items-center mb-8 pb-6 border-b">
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
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
            onClick={onToggleFullScreen}
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
          {professional.full_name.charAt(0)}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{professional.full_name}</h2>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p className="text-gray-600 text-lg">{professional.country}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
        <p className="text-gray-700 leading-relaxed">{professional.bio}</p>
      </div>

      {professional.recommendation && (
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">AI Evaluation</h3>
          <p className="text-blue-700 leading-relaxed">{professional.recommendation}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Skills & Expertise</h3>
          <SkillsDetail skills={professional?.skills} />
        </div>

        <WorkExperience experience={professional?.experience} />
        <Education education={professional?.education} />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [skillFilter, setSkillFilter] = useState<string>("");

  const fetchProfessionals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .limit(42);
      if (error) throw error;
      
      const formattedData = data?.map((professional: Professional) => ({
        ...professional,
        skills: typeof professional.skills === 'string' ? JSON.parse(professional.skills) : professional.skills,
        experience: typeof professional.experience === 'string' ? JSON.parse(professional.experience) : professional.experience,
        education: typeof professional.education === 'string' ? JSON.parse(professional.education) : professional.education
      })) || [];
      setFilteredProfessionals(formattedData);
    } catch (error) {
      console.error('Error getting professional data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !countryFilter && !skillFilter) {
      fetchProfessionals();
      return;
    }

    let sqlQuerybuilder = searchQuery;
    if (countryFilter && skillFilter) {
      sqlQuerybuilder = (searchQuery || "I want to find a Professional")+ " lived in " + countryFilter + " and has " + skillFilter + " skills";
    } else if (countryFilter) {
      sqlQuerybuilder = (searchQuery || "I want to find a Professional")+ " lived in " + countryFilter;
    } else if (skillFilter) {
      sqlQuerybuilder = (searchQuery || "I want to find a Professional")+ " has " + skillFilter + " skills";
    }
    

    try {
      console.log(sqlQuerybuilder);
      const response = await fetch('/api/nl-to-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuerybuilder }),
      });

      if (!response.ok) {
        throw new Error('Unable to get SQL query from AI');
      }

      const { sqlQuery } = await response.json();
      
      try {
        const { data, error } = await supabase.rpc('run_sql', { sql: sqlQuery });

        if (error) throw error;

        const formattedData = data?.map((professional: Professional) => ({
          ...professional,
          skills: typeof professional.skills === 'string' ? JSON.parse(professional.skills) : professional.skills,
          experience: typeof professional.experience === 'string' ? JSON.parse(professional.experience) : professional.experience,
          education: typeof professional.education === 'string' ? JSON.parse(professional.education) : professional.education
        })) || [];

        const professionalsWithRecommendations = await Promise.all(
          formattedData.map(async (professional: Professional) => {
            const recommendationResponse = await fetch('/api/generate-recommendation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                professional,
                searchQuery: sqlQuerybuilder
              }),
            });

            if (!recommendationResponse.ok) {
              throw new Error('Unable to generate recommendation');
            }

            const { recommendation } = await recommendationResponse.json();
            return {
              ...professional,
              recommendation
            };
          })
        );

        setFilteredProfessionals(professionalsWithRecommendations);
        setCurrentPage(1);
      } catch (parseError) {
        console.error('Error parsing query:', parseError);
        throw new Error('Received invalid query format from AI');
      }
    } catch (error) {
      console.error('Error searching professionals:', error);
    }
  };

  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProfessionals = filteredProfessionals.slice(startIndex, endIndex);

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
          <h1 className="text-3xl font-bold mb-4">Professionals</h1>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name, country, skills or bio..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full h-10 text-base"
            />
            <Button 
              onClick={handleSearch} 
              className="h-10 active:scale-95 transition-transform duration-75"
            >
              Search
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Select value={countryFilter} onValueChange={(value) => setCountryFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sweden">Sweden</SelectItem>
                <SelectItem value="Singapore">Singapore</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="South Korea">South Korea</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Switzerland">Switzerland</SelectItem>
                <SelectItem value="Brazil">Brazil</SelectItem>
              </SelectContent>
            </Select>

            <Select value={skillFilter} onValueChange={(value) => setSkillFilter(value)} >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Select Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Java">Java</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="Go">Go</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
                <SelectItem value="Rust">Rust</SelectItem>
                <SelectItem value="Swift">Swift</SelectItem>
                <SelectItem value="Kotlin">Kotlin</SelectItem>
                <SelectItem value="TypeScript">TypeScript</SelectItem>
                <SelectItem value="TensorFlow">TensorFlow</SelectItem>
                <SelectItem value="PyTorch">PyTorch</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setCountryFilter("");
                setSkillFilter("");
                fetchProfessionals();
              }} 
              className="h-10"
            >
              Reset
            </Button>

            <Button 
              onClick={handleSearch} 
              className="h-10"
            >
              Apply
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedProfessional ? (
            <div className={`flex gap-4 h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
              {!isFullScreen && (
                <div className="w-1/2 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {currentProfessionals.map((professional) => (
                      <ProfessionalCard
                        key={professional.id}
                        professional={professional}
                        isSelected={selectedProfessional?.id === professional.id}
                        onClick={() => {
                          setSelectedProfessional(professional);
                          setIsFullScreen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <ProfessionalDetail
                professional={selectedProfessional}
                isFullScreen={isFullScreen}
                onClose={() => {
                  setSelectedProfessional(null);
                  setIsFullScreen(false);
                }}
                onToggleFullScreen={() => setIsFullScreen(true)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
              {currentProfessionals.length <= 7 ? (
                <>
                  <div className="space-y-4">
                    {currentProfessionals.map((professional) => (
                      <ProfessionalCard
                        key={professional.id}
                        professional={professional}
                        onClick={() => setSelectedProfessional(professional)}
                      />
                    ))}
                  </div>
                  <div></div>
                </>
              ) : (
                currentProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onClick={() => setSelectedProfessional(professional)}
                  />
                ))
              )}
            </div>
          )}
        </div>
        <div className="flex-none flex justify-center gap-4 mt-4">
          <div className="text-sm text-gray-600 mb-2">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredProfessionals.length)} of {filteredProfessionals.length} professionals
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
