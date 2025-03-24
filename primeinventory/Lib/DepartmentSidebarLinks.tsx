export const DepartmentSidebarLinks = function (departmentId: number) {
    return [
        { title: "Department stocks", link: `/departments/inventory/${departmentId}`, },
        { title: "Expired stocks", link: `/departments/inventory/${departmentId}/expiredstocks` },
        { title: "Stocks usage Analytics", link: `/departments/inventory/${departmentId}/stockusage`, },
        { title: "Wastage Analytics", link: `/departments/inventory/${departmentId}/actions/wastage`, },
        { title: "Approved Requests", link: `/departments/inventory/${departmentId}/actions/approved`, },
        { title: "Pending Requests", link: `/departments/inventory/${departmentId}/actions/pending`, },
        { title: "Accepted Requests", link: `/departments/inventory/${departmentId}/actions/accepted`, },
        { title: "Receive stocks", link: `/departments/inventory/${departmentId}/actions/receive`, },
        { title: "Place order", link: `/departments/inventory/${departmentId}/placeorder`, },
        { title: "Transfer stock", link: `/departments/inventory/${departmentId}/transfer`, },
    ];
}