import { Plus } from "lucide-react";

// import DataTable from "../../../components/common/DataTable/DataTable";

const ProductManagement = () => {
  return (
    <div className="course-management">
      <div className="course-container">
        <h1>Course Management</h1>
        <button className="add-button">
          <Plus size={16} />
          Add Course
        </button>

        {/* <DataTable
          columns={columns as Column<Record<string, any>>[]}
          fetchData={fetchTableData}
          pageSize={10}
          initialSort={{ field: "title", order: "asc" }}
          refetchRef={refetchData}
        /> */}
      </div>
    </div>
  );
};

export default ProductManagement;
