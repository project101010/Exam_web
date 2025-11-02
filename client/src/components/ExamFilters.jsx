import React from 'react';

const ExamFilters = ({ filters, onFilterChange, classes }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Search by Title</label>
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Search exams..."
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Class</label>
          <select
            name="classId"
            value={filters.classId || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Sort By</label>
          <select
            name="sortBy"
            value={filters.sortBy || 'createdAt'}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ExamFilters;
