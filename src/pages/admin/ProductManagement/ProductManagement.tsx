import { Plus } from "lucide-react";

const ProductManagement = () => {
  return (
    <div className="course-management">
      <div className="course-container">
        <h1>Course Management</h1>
        <button className="add-button">
          <Plus size={16} />
          Add Course
        </button>
      </div>
    </div>
  );
};

export default ProductManagement;
