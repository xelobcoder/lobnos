"use client"
import { useState } from "react";
import DrugCategoryForm from "../../../../../components/Drugs/addNewDrugCategory";
import DrugCategoryTable from "../../../../../components/Drugs/DrugCategoryTable";
import { Container } from "react-bootstrap";
const defaultEditData = { editid: null, description: null, editing: false, name: null }
export default function DrugCategoryPage() {
    const [editing, setEditing] = useState(defaultEditData);

    const handleEditCategory = (data) => {
        const { id, description, categoryName } = data;
        setEditing({ editing: true, editid: id, description, name: categoryName })
    }

    const resetEditCategory = (data) => {
        setEditing(defaultEditData);
    }


    return (
        <Container fluid>
            <DrugCategoryForm edit={editing} reset={resetEditCategory} />
            <DrugCategoryTable handleEditCategory={handleEditCategory} />
        </Container>
    );
}
