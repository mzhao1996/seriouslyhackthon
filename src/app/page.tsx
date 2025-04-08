"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

const ITEMS_PER_PAGE = 14;

const EXPERIENCE_LEVELS = [
  "Entry Level (0-2 years)",
  "Mid Level (3-5 years)",
  "Senior Level (6-10 years)",
  "Expert Level (10+ years)"
];

export default function Home() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [experienceSearch, setExperienceSearch] = useState("");
  const [countrySelectValue, setCountrySelectValue] = useState("");
  const [skillSelectValue, setSkillSelectValue] = useState("");
  const [experienceSelectValue, setExperienceSelectValue] = useState("");
  const [isCountryCommandOpen, setIsCountryCommandOpen] = useState(false);
  const [isSkillCommandOpen, setIsSkillCommandOpen] = useState(false);
  const [isExperienceCommandOpen, setIsExperienceCommandOpen] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProfessionals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*');
        console.log(data);

      if (error) throw error;
      
      const formattedData = data?.map(professional => ({
        ...professional,
        skills: typeof professional.skills === 'string' ? JSON.parse(professional.skills) : professional.skills,
        experience: typeof professional.experience === 'string' ? JSON.parse(professional.experience) : professional.experience,
        education: typeof professional.education === 'string' ? JSON.parse(professional.education) : professional.education
      })) || [];

      setProfessionals(formattedData);
      setFilteredProfessionals(formattedData);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.command-container')) {
        setIsCountryCommandOpen(false);
        setIsSkillCommandOpen(false);
        setIsExperienceCommandOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const performSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredProfessionals(professionals);
    } else {
      const filtered = professionals.filter(professional => 
        professional.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        professional.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.keys(professional.skills.skills.technical).some(skill => 
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        professional.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfessionals(filtered);
    }
    setCurrentPage(1);
  };

  const uniqueCountries = Array.from(new Set(professionals.map(professional => professional.country)));
  const uniqueSkills = Array.from(new Set(professionals.flatMap(professional => 
    professional?.skills?.skills?.technical ? Object.keys(professional.skills.skills.technical) : []
  )));

  const filteredCountries = uniqueCountries.filter(country => 
    country?.toLowerCase().includes(countrySearch.toLowerCase())
  );
  const filteredSkills = uniqueSkills.filter(skill => 
    skill?.toLowerCase().includes(skillSearch.toLowerCase())
  );
  const filteredExperience = EXPERIENCE_LEVELS.filter(level => 
    level?.toLowerCase().includes(experienceSearch.toLowerCase())
  );

  const handleCountrySelect = (value: string) => {
    if (value && !selectedCountries.includes(value)) {
      setSelectedCountries([...selectedCountries, value]);
    }
  };

  const handleSkillSelect = (value: string) => {
    if (value && !selectedSkills.includes(value)) {
      setSelectedSkills([...selectedSkills, value]);
    }
  };

  const handleExperienceSelect = (value: string) => {
    if (value && !selectedExperience.includes(value)) {
      setSelectedExperience([...selectedExperience, value]);
    }
  };

  const applyFilters = () => {
    let filtered = professionals;

    if (selectedCountries.length > 0) {
      filtered = filtered.filter(professional => 
        professional?.country && selectedCountries.includes(professional.country)
      );
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter(professional => 
        professional?.skills?.skills?.technical && 
        selectedSkills.some(skill => professional.skills.skills.technical.hasOwnProperty(skill))
      );
    }

    if (selectedExperience.length > 0) {
      filtered = filtered.filter(professional => 
        professional?.experience && 
        selectedExperience.some(exp => professional.experience.some(e => e.company === exp))
      );
    }

    setFilteredProfessionals(filtered);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch();
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

  const renderSkills = (skills: Professional['skills']) => {
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

  const renderSkillBadges = (skills: Professional['skills']) => {
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
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              className="w-full h-10 text-base"
            />
            <Button onClick={performSearch} className="h-10">
              Search
            </Button>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-10">
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] h-[600px] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Advanced Filters</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Countries</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCountries([])}
                        className="h-8 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCountries.map((country) => (
                        <Badge key={country} variant="secondary">
                          {country}
                          <button
                            onClick={() => setSelectedCountries(prev => prev.filter(c => c !== country))}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="command-container relative">
                      <Command 
                        className="rounded-lg border shadow-md"
                        shouldFilter={false}
                      >
                        <CommandInput 
                          placeholder="Search countries..." 
                          value={countrySearch}
                          onValueChange={setCountrySearch}
                          onFocus={() => setIsCountryCommandOpen(true)}
                        />
                        {isCountryCommandOpen && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg mt-1">
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => (
                                  <CommandItem
                                    key={country}
                                    value={country}
                                    onSelect={() => {
                                      if (!selectedCountries.includes(country)) {
                                        setSelectedCountries([...selectedCountries, country]);
                                      }
                                      setIsCountryCommandOpen(false);
                                      setCountrySearch("");
                                    }}
                                    disabled={selectedCountries.includes(country)}
                                  >
                                    {country}
                                  </CommandItem>
                                ))
                              ) : (
                                <div className="py-2 text-center text-sm text-muted-foreground">
                                  No matching countries found
                                </div>
                              )}
                            </CommandGroup>
                          </div>
                        )}
                      </Command>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Skills</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedSkills([])}
                        className="h-8 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                          <button
                            onClick={() => setSelectedSkills(prev => prev.filter(s => s !== skill))}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="command-container relative">
                      <Command 
                        className="rounded-lg border shadow-md"
                        shouldFilter={false}
                      >
                        <CommandInput 
                          placeholder="Search skills..." 
                          value={skillSearch}
                          onValueChange={setSkillSearch}
                          onFocus={() => setIsSkillCommandOpen(true)}
                        />
                        {isSkillCommandOpen && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg mt-1">
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {filteredSkills.length > 0 ? (
                                filteredSkills.map((skill) => (
                                  <CommandItem
                                    key={skill}
                                    value={skill}
                                    onSelect={() => {
                                      if (!selectedSkills.includes(skill)) {
                                        setSelectedSkills([...selectedSkills, skill]);
                                      }
                                      setIsSkillCommandOpen(false);
                                      setSkillSearch("");
                                    }}
                                    disabled={selectedSkills.includes(skill)}
                                  >
                                    {skill}
                                  </CommandItem>
                                ))
                              ) : (
                                <div className="py-2 text-center text-sm text-muted-foreground">
                                  No matching skills found
                                </div>
                              )}
                            </CommandGroup>
                          </div>
                        )}
                      </Command>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experience</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedExperience([])}
                        className="h-8 px-2 text-xs"
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedExperience.map((exp) => (
                        <Badge key={exp} variant="secondary">
                          {exp}
                          <button
                            onClick={() => setSelectedExperience(prev => prev.filter(e => e !== exp))}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="command-container relative">
                      <Command 
                        className="rounded-lg border shadow-md"
                        shouldFilter={false}
                      >
                        <CommandInput 
                          placeholder="Search experience levels..." 
                          value={experienceSearch}
                          onValueChange={setExperienceSearch}
                          onFocus={() => setIsExperienceCommandOpen(true)}
                        />
                        {isExperienceCommandOpen && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg mt-1">
                            <CommandGroup className="max-h-[200px] overflow-auto">
                              {filteredExperience.length > 0 ? (
                                filteredExperience.map((level) => (
                                  <CommandItem
                                    key={level}
                                    value={level}
                                    onSelect={() => {
                                      if (!selectedExperience.includes(level)) {
                                        setSelectedExperience([...selectedExperience, level]);
                                      }
                                      setIsExperienceCommandOpen(false);
                                      setExperienceSearch("");
                                    }}
                                    disabled={selectedExperience.includes(level)}
                                  >
                                    {level}
                                  </CommandItem>
                                ))
                              ) : (
                                <div className="py-2 text-center text-sm text-muted-foreground">
                                  No matching experience levels found
                                </div>
                              )}
                            </CommandGroup>
                          </div>
                        )}
                      </Command>
                    </div>
                  </div>
                </div>
                <div className="flex-none flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedProfessional ? (
            <div className={`flex gap-4 h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
              {!isFullScreen && (
                <div className="w-1/2 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {currentProfessionals.map((professional) => (
                      <div 
                        key={professional.id} 
                        className={`border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                          selectedProfessional?.id === professional.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setSelectedProfessional(professional);
                          setIsFullScreen(false);
                        }}
                      >
                        <div className="flex h-full">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 mr-3 flex-shrink-0">
                            {professional.full_name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-1">{professional.full_name}</h2>
                            <p className="text-sm text-gray-600 mb-2">{professional.country}</p>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">{professional.bio}</p>
                            <div className="flex flex-wrap gap-1">
                              {renderSkillBadges(professional.skills)}
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
                        setSelectedProfessional(null);
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
                      {selectedProfessional.full_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProfessional.full_name}</h2>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <p className="text-gray-600 text-lg">{selectedProfessional.country}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedProfessional.bio}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Skills & Expertise</h3>
                      {renderSkills(selectedProfessional?.skills)}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-300"></div>
                        {selectedProfessional?.experience?.map((exp, index) => (
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

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Education</h3>
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-300"></div>
                        {selectedProfessional?.education?.map((edu, index) => (
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
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
              {currentProfessionals.map((professional) => (
                <div 
                  key={professional.id} 
                  className="border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProfessional(professional)}
                >
                  <div className="flex h-full">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 mr-3 flex-shrink-0">
                      {professional.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-1">{professional.full_name}</h2>
                      <p className="text-sm text-gray-600 mb-2">{professional.country}</p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{professional.bio}</p>
                      <div className="flex flex-wrap gap-1">
                        {renderSkillBadges(professional.skills)}
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
