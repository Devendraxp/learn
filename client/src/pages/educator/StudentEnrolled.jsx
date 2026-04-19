import React , { useEffect, useState,useContext} from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const StudentEnrolled = ()=>{
    const [enrolledStudents, setEnrolledStudents] = useState(null);
    const [courseWiseData, setCourseWiseData] = useState({});
    const [error, setError] = useState(null);

    const {getEnrolledStudentsData, currency} = useContext(AppContext)

    const fetchEnrolledStudents = async()=>{
        try {
            const data = await getEnrolledStudentsData();
            setEnrolledStudents(data || []);
            
            // Group students by course
            const grouped = {};
            if (data && data.length > 0) {
                data.forEach(student => {
                    const courseTitle = student.courseTitle;
                    if (!grouped[courseTitle]) {
                        grouped[courseTitle] = [];
                    }
                    grouped[courseTitle].push(student);
                });
            }
            setCourseWiseData(grouped);
        } catch (err) {
            console.error('Error fetching enrolled students:', err);
            setEnrolledStudents([]);
            setCourseWiseData({});
        }
    }

    useEffect(()=>{
        fetchEnrolledStudents()
    },[])

    return error ? (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 text-lg font-medium mb-2">Error Loading Data</div>
                    <div className="text-red-500 mb-4">{error}</div>
                    <button 
                        onClick={fetchEnrolledStudents}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrolled Students</h1>
                    <p className="text-gray-600">Manage and view all students enrolled in your courses</p>
                    {enrolledStudents && enrolledStudents.length > 0 && (
                        <div className="mt-4 text-sm text-gray-500">
                            Total Students: {enrolledStudents.length} across {Object.keys(courseWiseData).length} courses
                        </div>
                    )}
                </div>

                {enrolledStudents && enrolledStudents.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                        <div className="text-gray-400 text-lg mb-4">No Students Enrolled Yet</div>
                        <p className="text-gray-500">Students who purchase your courses will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(courseWiseData).map(([courseTitle, students]) => (
                            <div key={courseTitle} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Course Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                    <h3 className="text-xl font-semibold text-white">{courseTitle}</h3>
                                    <p className="text-blue-100 text-sm mt-1">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
                                </div>
                                
                                {/* Students Table */}
                                <div className="overflow-x-auto">
                                    <table className='table-fixed md:table-auto w-full overflow-hidden'>
                                        <thead className='text-gray-900 border-b border-gray-200 text-sm text-left bg-gray-50'>
                                            <tr>
                                                <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell '>
                                                    #
                                                </th>
                                                <th className='px-4 py-3 font-semibold'> Student Name</th>
                                                <th className='px-4 py-3 font-semibold hidden md:table-cell'>Email</th>
                                                <th className='px-4 py-3 font-semibold hidden sm:table-cell '>Purchase Date</th>
                                                <th className='px-4 py-3 font-semibold text-center'>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                                {students.map((student,studentindex)=>{
                                                    return  (
                                                    <tr key={studentindex} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-600"> {studentindex +1} </td>
                                                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                                            <img 
                                                                src={student.student.imageUrl} 
                                                                alt="Student Profile" 
                                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=' + student.student.name.charAt(0);
                                                                }}
                                                            />
                                                            <span className="truncate font-medium text-gray-800"> {student.student.name} </span>
                                                        </td> 
                                                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                                            {student.student.email || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{new Date(student.purchaseDate).toLocaleDateString()}</td> 
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudentEnrolled;