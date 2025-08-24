import { useState } from "react";

export default function SearchCard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for search results
  const sampleData = [
    {
      id: 1,
      title: "Project Aurora",
      description:
        "A revolutionary project management tool with AI integration",
      category: "Productivity",
      rating: 4.8,
      users: 1250,
    },
    {
      id: 2,
      title: "Marketing Suite Pro",
      description: "All-in-one marketing platform for small businesses",
      category: "Marketing",
      rating: 4.5,
      users: 890,
    },
    {
      id: 3,
      title: "Financial Analyzer",
      description: "Advanced financial analytics and forecasting tool",
      category: "Finance",
      rating: 4.9,
      users: 2100,
    },
    {
      id: 4,
      title: "Health Tracker",
      description: "Comprehensive health and fitness monitoring application",
      category: "Health",
      rating: 4.7,
      users: 3500,
    },
    {
      id: 5,
      title: "Design Collaboration",
      description: "Real-time design collaboration tool for creative teams",
      category: "Design",
      rating: 4.6,
      users: 1750,
    },
  ];

  // Simulate search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const results = sampleData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(results);
      setIsLoading(false);
    }, 800);
  };

  // Clear search results
  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="min-h-full flex items-start justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden">
        {/* Search Header */}
        <div className="p-6 bg-gradient-to-r from-[#7A6DFF] to-[#9D93FF] text-white">
          <h2 className="text-lg font-bold mb-2">Search Material</h2>

          <form onSubmit={handleSearch} className="mt-6 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dengan MID atau Description..."
                className="w-full py-4 pl-12 pr-6 rounded-3xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7A6DFF] shadow-inner"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              )}

              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#7A6DFF] hover:bg-[#6A5BFF] text-white py-2 px-4 rounded-2xl transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7A6DFF]"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Search Results{" "}
                  <span className="text-[#7A6DFF]">
                    ({searchResults.length})
                  </span>
                </h3>
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-[#7A6DFF] transition-colors"
                >
                  Clear results
                </button>
              </div>

              <div className="space-y-4">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 mt-1">{item.description}</p>
                        <div className="flex items-center mt-3">
                          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {item.category}
                          </span>
                          <div className="flex items-center ml-4">
                            <svg
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm text-gray-600">
                              {item.rating}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-600">
                              {item.users.toLocaleString()} users
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-[#7A6DFF] hover:text-[#6A5BFF] bg-[#7A6DFF10] hover:bg-[#7A6DFF20] px-4 py-2 rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-700">
                No results found
              </h3>
              <p className="mt-2 text-gray-500">
                Try different keywords or browse our categories
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-700">
                Start searching
              </h3>
              <p className="mt-2 text-gray-500">
                Enter keywords to find relevant tools and resources
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Productivity", "Marketing", "Finance"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSearchQuery(category)}
                    className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
