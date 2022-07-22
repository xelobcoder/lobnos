function Sidebar() {
    return (
        <div className="test-wizard">
            <ul>
                <li className="category-test">  Biochemistry <i className="fa fa-caret-down"></i>
                <ul  className="cat">
                    <li>kidney function test</li>
                    <li>liver function test</li>
                    <li>glycated heamoglobin</li>
                    <li>lipid profile</li>
                </ul>
                </li>
                <li className="category-test">
                    Hematology <i className="fa fa-caret-down"></i>
                    <ul  className="cat">
                        <li>malaria</li>
                        <li>full blood count</li>
                    </ul>
                </li>
            </ul>
        </div>
    )
}



export default Sidebar;