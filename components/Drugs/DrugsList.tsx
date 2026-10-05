import React from "react";
import styles from './DrugsList.module.css';

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
     const orderedDrugs = [...drugList].sort((first, second) => first.drug.localeCompare(second.drug));

     return (
          <section className={styles.section} aria-label="Antimicrobial susceptibility results">
               <div className={styles.heading}>
                    <h3 className={styles.title}>Antimicrobial Susceptibility</h3>
                    <span className={styles.count}>{orderedDrugs.length} agents tested</span>
               </div>
               <div className="table-responsive">
                    <table className={`table table-sm mb-0 ${styles.table}`}>
                         <thead>
                              <tr>
                                   <th scope="col">Antimicrobial agent</th>
                                   <th scope="col">Interpretation</th>
                              </tr>
                         </thead>
                         <tbody>
                              {orderedDrugs.map((drug, index) => {
                                   const sensitivity = drug.sensitivity?.trim() || 'Not reported';
                                   const statusClass = sensitivity.toLowerCase() === 'sensitive'
                                        ? styles.sensitive
                                        : sensitivity.toLowerCase() === 'resistant'
                                             ? styles.resistant
                                             : styles.unreported;

                                   return (
                                        <tr key={`${drug.ascensionid}-${drug.id}-${index}`}>
                                             <td>{drug.drug}</td>
                                             <td className={statusClass}>{sensitivity}</td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>
          </section>
     );
};

export default DrugsList;
