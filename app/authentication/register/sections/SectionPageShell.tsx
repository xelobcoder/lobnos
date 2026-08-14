import Link from "next/link";
import React from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import {
     RiAddLine,
     RiArrowGoBackLine,
     RiCheckLine,
     RiCloseLine,
     RiEditLine,
     RiSaveLine,
} from "@remixicon/react";
import SectionPageHero from "./SectionPageHero";
import styles from "./section-standard.module.css";

type SectionPageShellProps = {
     title: string;
     itemLabel: string;
     icon: React.ReactNode;
     badge?: string;
     backHref: string;
     isEditing: boolean;
     loadingServer?: boolean;
     savingServer?: boolean;
     recordCount: number;
     onEdit: () => void;
     onCancel: () => void;
     onSave: () => void;
     onAdd?: () => void;
     children: React.ReactNode;
};

export default function SectionPageShell({
     title,
     itemLabel,
     icon,
     badge = "Employee Profile",
     backHref,
     isEditing,
     loadingServer = false,
     savingServer = false,
     recordCount,
     onEdit,
     onCancel,
     onSave,
     onAdd,
     children,
}: SectionPageShellProps) {
     const subtitle = isEditing
          ? `Edit or add ${itemLabel.toLowerCase()} records for this employee.`
          : `Review ${itemLabel.toLowerCase()} records. Switch to edit mode to make changes.`;

     return (
          <div className={`container-fluid ${styles.pageRoot}`}>
               <SectionPageHero
                    title={title}
                    subtitle={subtitle}
                    icon={icon}
                    badge={badge}
                    stats={[
                         { label: "Records", value: recordCount },
                         { label: "Mode", value: isEditing ? "Edit" : "View" },
                         { label: "Status", value: loadingServer ? "Loading" : savingServer ? "Saving" : "Ready" },
                    ]}
               />

               <Card className={styles.surfaceCard}>
                    <Card.Header
                         className={`${styles.surfaceHeader} d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 py-3 px-3 px-md-4`}
                    >
                         <div>
                              <strong className={styles.surfaceTitle}>{title}</strong>
                              {loadingServer ? (
                                   <div className={`${styles.loadingInline} mt-1`}>
                                        <Spinner size="sm" animation="border" />
                                        Loading existing records...
                                   </div>
                              ) : null}
                         </div>
                         <div className={styles.headerActions}>
                              {!isEditing ? (
                                   <Button size="sm" variant="primary" onClick={onEdit}>
                                        <RiEditLine size={14} className="me-1" />
                                        Edit / Add
                                   </Button>
                              ) : (
                                   <Button size="sm" variant="outline-secondary" onClick={onCancel}>
                                        <RiCloseLine size={14} className="me-1" />
                                        Cancel
                                   </Button>
                              )}
                              <Link href={backHref} className="btn btn-outline-secondary btn-sm">
                                   <RiArrowGoBackLine size={14} className="me-1" />
                                   Back To Registration
                              </Link>
                         </div>
                    </Card.Header>

                    <Card.Body className="p-3 p-md-4">{children}</Card.Body>

                    {isEditing ? (
                         <div className={styles.actionBar}>
                              {onAdd ? (
                                   <Button size="sm" variant="outline-primary" onClick={onAdd}>
                                        <RiAddLine size={14} className="me-1" />
                                        Add {itemLabel}
                                   </Button>
                              ) : (
                                   <span />
                              )}
                              <div className="d-flex gap-2 flex-wrap">
                                   <Button size="sm" variant="primary" onClick={onSave} disabled={savingServer}>
                                        <RiSaveLine size={14} className="me-1" />
                                        {savingServer ? "Saving..." : `Save ${title}`}
                                   </Button>
                                   <Link href={backHref} className="btn btn-success btn-sm">
                                        <RiCheckLine size={14} className="me-1" />
                                        Done
                                   </Link>
                              </div>
                         </div>
                    ) : null}
               </Card>
          </div>
     );
}

export function SectionEmptyState({ message }: { message: string }) {
     return <div className={styles.emptyState}>{message}</div>;
}

export function SectionRecordCard({
     title,
     meta,
     actions,
     children,
}: {
     title: string;
     meta?: string;
     actions?: React.ReactNode;
     children: React.ReactNode;
}) {
     return (
          <div className={styles.recordCard}>
               <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <div>
                         <h6 className={styles.recordTitle}>{title}</h6>
                         {meta ? <p className={styles.recordMeta}>{meta}</p> : null}
                    </div>
                    {actions ? <div className="d-flex gap-2 flex-wrap">{actions}</div> : null}
               </div>
               {children}
          </div>
     );
}

export function SectionField({ label, value }: { label: string; value?: string }) {
     return (
          <div className="col-md-6">
               <div className={styles.fieldLabel}>{label}</div>
               <div className={styles.fieldValue}>{value || "-"}</div>
          </div>
     );
}
