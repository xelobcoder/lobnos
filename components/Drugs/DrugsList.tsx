import React from "react";

export interface Drug {
     ascensionid: number;
     id: number;
     sensitivity: string;
     drug: string;
}

export interface DrugsListProps {
     hadDrugs: boolean;
     drugList: Drug[];
}

const DrugsList: React.FC<DrugsListProps> = ({ hadDrugs, drugList }) => {
     if (!hadDrugs || !drugList || drugList.length === 0) return null;

     return (
          <div>
               <table className="table mt-2 table-bordered table-striped">
                    <thead>
                         <tr>
                              <th>Drug</th>
                              <th>Sensitivity</th>
                         </tr>
                    </thead>
                    <tbody>
                         {drugList.map((drug) => (
                              <tr key={drug.id}>
                                   <td>{drug.drug}</td>
                                   <td>{drug.sensitivity}</td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </div>
     );
};

export default DrugsList;
