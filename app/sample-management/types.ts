// Sample Lifecycle Management Types

export interface Sample {
     id: string;
     barcode: string;
     patientId: string;
     patientName: string;
     dateOfBirth?: string;
     gender?: string;
     phone?: string;
     testType: string;
     testName: string;
     sampleType: string;
     priority: SamplePriority;
     status: SampleStatus;
     collectionDate: string;
     collectionTime?: string;
     collectedBy?: string;
     collectionLocation?: string;
     volume?: number;
     temperature?: number;
     notes?: string;
     storageLocation?: StorageLocation;
     chainOfCustody: ChainOfCustodyEntry[];
     createdAt: string;
     updatedAt: string;
}

export type SampleStatus =
     | 'collected'
     | 'received'
     | 'processing'
     | 'processed'
     | 'rejected'
     | 'recalled'
     | 'disposed'
     | 'archived';

export type SamplePriority = 'routine' | 'urgent' | 'stat' | 'critical';

export interface ChainOfCustodyEntry {
     id: string;
     sampleId: string;
     action: ChainOfCustodyAction;
     timestamp: string;
     performedBy: string;
     performedByName?: string;
     location?: string;
     temperature?: number;
     notes?: string;
     attachments?: string[];
}

export type ChainOfCustodyAction =
     | 'collected'
     | 'received'
     | 'processed'
     | 'stored'
     | 'retrieved'
     | 'transferred'
     | 'tested'
     | 'rejected'
     | 'disposed'
     | 'aliquoted';

export interface StorageLocation {
     id: string;
     unitId: string;
     unitName: string;
     position: string;
     shelf?: string;
     rack?: string;
     capacity: number;
     occupied: boolean;
     sampleId?: string;
     temperature?: number;
     lastChecked?: string;
}

export interface StorageUnit {
     id: string;
     name: string;
     type: 'freezer' | 'refrigerator';
     temperature: number;
     minTemperature: number;
     maxTemperature: number;
     capacity: number;
     location: string;
     description?: string;
     currentTemperature?: number;
     lastTemperatureCheck?: string;
     locations: StorageLocation[];
     isActive: boolean;
}

export interface Aliquot {
     id: string;
     barcode: string;
     parentSampleId: string;
     volume: number;
     unit: string;
     purpose: string;
     storageLocation?: string;
     aliquotedBy: string;
     aliquotedAt: string;
     status: 'active' | 'used' | 'discarded';
     notes?: string;
}

export interface AliquotRequest {
     id: string;
     parentSampleId: string;
     requestedBy: string;
     requestedAt: string;
     numberOfAliquots: number;
     volumePerAliquot: number;
     purpose: string;
     status: 'pending' | 'approved' | 'rejected' | 'completed';
     approvedBy?: string;
     approvedAt?: string;
     notes?: string;
}

export interface RejectionRecord {
     id: string;
     sampleId: string;
     reason: RejectionReason;
     severity: 'minor' | 'major' | 'critical';
     description: string;
     correctiveAction?: string;
     rejectedBy: string;
     rejectedAt: string;
     followUpRequired: boolean;
     followUpDate?: string;
     notifiedParties: string[];
     attachments?: string[];
}

export type RejectionReason =
     | 'contamination'
     | 'improper_collection'
     | 'labeling_error'
     | 'temperature_excursion'
     | 'equipment_failure'
     | 'other';

export interface RecallRecord {
     id: string;
     reason: RecallReason;
     severity: 'minor' | 'major' | 'critical';
     description: string;
     affectedSamples: string[];
     initiatedBy: string;
     initiatedAt: string;
     containmentAction?: string;
     notifiedParties: string[];
     followUpRequired: boolean;
     followUpDate?: string;
     status: 'active' | 'completed' | 'cancelled';
     attachments?: string[];
}

export type RecallReason =
     | 'quality_issue'
     | 'contamination'
     | 'labeling_error'
     | 'regulatory_requirement'
     | 'other';

export interface SampleSearchFilters {
     barcode?: string;
     patientId?: string;
     patientName?: string;
     testType?: string;
     sampleType?: string;
     status?: SampleStatus[];
     priority?: SamplePriority[];
     collectionDateFrom?: string;
     collectionDateTo?: string;
     rejected?: boolean;
     recalled?: boolean;
     disposed?: boolean;
}

export interface SampleStatistics {
     totalSamples: number;
     samplesByStatus: Record<SampleStatus, number>;
     samplesByPriority: Record<SamplePriority, number>;
     totalStorageUnits: number;
     occupiedStorageLocations: number;
     totalAliquots: number;
     activeRecalls: number;
     pendingRejections: number;
}

export interface TemperatureReading {
     id: string;
     unitId: string;
     temperature: number;
     recordedBy: string;
     recordedAt: string;
     notes?: string;
}

// Dummy Data for Development and Testing
export const DUMMY_SAMPLES: Sample[] = [
     {
          id: 'sample-001',
          barcode: 'S20241108001',
          patientId: 'PAT001',
          patientName: 'John Smith',
          dateOfBirth: '1985-03-15',
          gender: 'male',
          phone: '+1-555-0101',
          testType: 'cbc',
          testName: 'Complete Blood Count',
          sampleType: 'blood',
          priority: 'routine',
          status: 'processed',
          collectionDate: '2024-11-08',
          collectionTime: '09:30',
          collectedBy: 'Sarah Johnson',
          collectionLocation: 'Room 101',
          volume: 5,
          temperature: 4,
          notes: 'Sample collected without issues',
          storageLocation: {
               id: 'loc-001',
               unitId: 'unit-001',
               unitName: 'Freezer A',
               position: 'Shelf 1, Position 1',
               capacity: 1,
               occupied: true,
               sampleId: 'sample-001',
               temperature: -80,
               lastChecked: '2024-11-08T10:00:00Z'
          },
          chainOfCustody: [
               {
                    id: 'coc-001',
                    sampleId: 'sample-001',
                    action: 'collected',
                    timestamp: '2024-11-08T09:30:00Z',
                    performedBy: 'sarah.johnson',
                    performedByName: 'Sarah Johnson',
                    location: 'Collection Room 101',
                    temperature: 22,
                    notes: 'Blood drawn from left arm'
               },
               {
                    id: 'coc-002',
                    sampleId: 'sample-001',
                    action: 'received',
                    timestamp: '2024-11-08T09:45:00Z',
                    performedBy: 'mike.wilson',
                    performedByName: 'Mike Wilson',
                    location: 'Lab Reception',
                    temperature: 4,
                    notes: 'Sample received and logged'
               },
               {
                    id: 'coc-003',
                    sampleId: 'sample-001',
                    action: 'stored',
                    timestamp: '2024-11-08T10:00:00Z',
                    performedBy: 'lisa.brown',
                    performedByName: 'Lisa Brown',
                    location: 'Freezer A',
                    temperature: -80,
                    notes: 'Stored in Freezer A, Shelf 1'
               }
          ],
          createdAt: '2024-11-08T09:30:00Z',
          updatedAt: '2024-11-08T10:00:00Z'
     },
     {
          id: 'sample-002',
          barcode: 'S20241108002',
          patientId: 'PAT002',
          patientName: 'Emily Davis',
          dateOfBirth: '1992-07-22',
          gender: 'female',
          phone: '+1-555-0102',
          testType: 'lipid',
          testName: 'Lipid Panel',
          sampleType: 'blood',
          priority: 'urgent',
          status: 'processing',
          collectionDate: '2024-11-08',
          collectionTime: '10:15',
          collectedBy: 'David Chen',
          collectionLocation: 'Room 102',
          volume: 8,
          temperature: 4,
          notes: 'Patient reported fasting for 12 hours',
          storageLocation: {
               id: 'loc-002',
               unitId: 'unit-002',
               unitName: 'Refrigerator B',
               position: 'Shelf 2, Position 3',
               capacity: 1,
               occupied: true,
               sampleId: 'sample-002',
               temperature: 4,
               lastChecked: '2024-11-08T10:30:00Z'
          },
          chainOfCustody: [
               {
                    id: 'coc-004',
                    sampleId: 'sample-002',
                    action: 'collected',
                    timestamp: '2024-11-08T10:15:00Z',
                    performedBy: 'david.chen',
                    performedByName: 'David Chen',
                    location: 'Collection Room 102',
                    temperature: 22,
                    notes: 'Blood drawn after confirming 12-hour fast'
               },
               {
                    id: 'coc-005',
                    sampleId: 'sample-002',
                    action: 'received',
                    timestamp: '2024-11-08T10:30:00Z',
                    performedBy: 'anna.rodriguez',
                    performedByName: 'Anna Rodriguez',
                    location: 'Lab Reception',
                    temperature: 4,
                    notes: 'Urgent sample - lipid panel'
               }
          ],
          createdAt: '2024-11-08T10:15:00Z',
          updatedAt: '2024-11-08T10:30:00Z'
     },
     {
          id: 'sample-003',
          barcode: 'S20241108003',
          patientId: 'PAT003',
          patientName: 'Robert Wilson',
          dateOfBirth: '1978-11-30',
          gender: 'male',
          phone: '+1-555-0103',
          testType: 'urinalysis',
          testName: 'Urinalysis',
          sampleType: 'urine',
          priority: 'routine',
          status: 'collected',
          collectionDate: '2024-11-08',
          collectionTime: '11:00',
          collectedBy: 'Maria Garcia',
          collectionLocation: 'Bathroom 1',
          volume: 50,
          temperature: 22,
          notes: 'Mid-stream urine sample',
          chainOfCustody: [
               {
                    id: 'coc-006',
                    sampleId: 'sample-003',
                    action: 'collected',
                    timestamp: '2024-11-08T11:00:00Z',
                    performedBy: 'maria.garcia',
                    performedByName: 'Maria Garcia',
                    location: 'Patient Bathroom 1',
                    temperature: 22,
                    notes: 'Patient provided mid-stream urine sample'
               }
          ],
          createdAt: '2024-11-08T11:00:00Z',
          updatedAt: '2024-11-08T11:00:00Z'
     },
     {
          id: 'sample-004',
          barcode: 'S20241108004',
          patientId: 'PAT004',
          patientName: 'Jennifer Lee',
          dateOfBirth: '1989-05-12',
          gender: 'female',
          phone: '+1-555-0104',
          testType: 'culture',
          testName: 'Culture & Sensitivity',
          sampleType: 'swab',
          priority: 'stat',
          status: 'rejected',
          collectionDate: '2024-11-08',
          collectionTime: '08:45',
          collectedBy: 'Tom Anderson',
          collectionLocation: 'ER Bay 3',
          volume: 1,
          temperature: 22,
          notes: 'Throat swab for strep culture',
          chainOfCustody: [
               {
                    id: 'coc-007',
                    sampleId: 'sample-004',
                    action: 'collected',
                    timestamp: '2024-11-08T08:45:00Z',
                    performedBy: 'tom.anderson',
                    performedByName: 'Tom Anderson',
                    location: 'ER Bay 3',
                    temperature: 22,
                    notes: 'Throat swab collected from pediatric patient'
               },
               {
                    id: 'coc-008',
                    sampleId: 'sample-004',
                    action: 'rejected',
                    timestamp: '2024-11-08T09:15:00Z',
                    performedBy: 'susan.miller',
                    performedByName: 'Susan Miller',
                    location: 'Microbiology Lab',
                    temperature: 22,
                    notes: 'Sample rejected - improper collection technique'
               }
          ],
          createdAt: '2024-11-08T08:45:00Z',
          updatedAt: '2024-11-08T09:15:00Z'
     },
     {
          id: 'sample-005',
          barcode: 'S20241108005',
          patientId: 'PAT005',
          patientName: 'Michael Brown',
          dateOfBirth: '1965-09-18',
          gender: 'male',
          phone: '+1-555-0105',
          testType: 'bmp',
          testName: 'Basic Metabolic Panel',
          sampleType: 'blood',
          priority: 'routine',
          status: 'recalled',
          collectionDate: '2024-11-07',
          collectionTime: '14:20',
          collectedBy: 'Lisa Brown',
          collectionLocation: 'Room 103',
          volume: 6,
          temperature: 4,
          notes: 'Routine metabolic panel',
          storageLocation: {
               id: 'loc-003',
               unitId: 'unit-001',
               unitName: 'Freezer A',
               position: 'Shelf 1, Position 2',
               capacity: 1,
               occupied: true,
               sampleId: 'sample-005',
               temperature: -80,
               lastChecked: '2024-11-07T15:00:00Z'
          },
          chainOfCustody: [
               {
                    id: 'coc-009',
                    sampleId: 'sample-005',
                    action: 'collected',
                    timestamp: '2024-11-07T14:20:00Z',
                    performedBy: 'lisa.brown',
                    performedByName: 'Lisa Brown',
                    location: 'Collection Room 103',
                    temperature: 22,
                    notes: 'Blood drawn from right arm'
               },
               {
                    id: 'coc-010',
                    sampleId: 'sample-005',
                    action: 'stored',
                    timestamp: '2024-11-07T15:00:00Z',
                    performedBy: 'mike.wilson',
                    performedByName: 'Mike Wilson',
                    location: 'Freezer A',
                    temperature: -80,
                    notes: 'Stored for future testing'
               }
          ],
          createdAt: '2024-11-07T14:20:00Z',
          updatedAt: '2024-11-08T09:00:00Z'
     }
];

export const DUMMY_STORAGE_UNITS: StorageUnit[] = [
     {
          id: 'unit-001',
          name: 'Freezer A',
          type: 'freezer',
          temperature: -80,
          minTemperature: -85,
          maxTemperature: -75,
          capacity: 100,
          location: 'Lab Storage Room',
          description: 'Ultra-low temperature freezer for long-term storage',
          currentTemperature: -78,
          lastTemperatureCheck: '2024-11-08T08:00:00Z',
          isActive: true,
          locations: [
               {
                    id: 'loc-001',
                    unitId: 'unit-001',
                    unitName: 'Freezer A',
                    position: 'Shelf 1, Position 1',
                    capacity: 1,
                    occupied: true,
                    sampleId: 'sample-001',
                    temperature: -80,
                    lastChecked: '2024-11-08T10:00:00Z'
               },
               {
                    id: 'loc-003',
                    unitId: 'unit-001',
                    unitName: 'Freezer A',
                    position: 'Shelf 1, Position 2',
                    capacity: 1,
                    occupied: true,
                    sampleId: 'sample-005',
                    temperature: -80,
                    lastChecked: '2024-11-07T15:00:00Z'
               }
          ]
     },
     {
          id: 'unit-002',
          name: 'Refrigerator B',
          type: 'refrigerator',
          temperature: 4,
          minTemperature: 2,
          maxTemperature: 8,
          capacity: 50,
          location: 'Lab Storage Room',
          description: 'Standard refrigerator for short-term storage',
          currentTemperature: 4,
          lastTemperatureCheck: '2024-11-08T08:00:00Z',
          isActive: true,
          locations: [
               {
                    id: 'loc-002',
                    unitId: 'unit-002',
                    unitName: 'Refrigerator B',
                    position: 'Shelf 2, Position 3',
                    capacity: 1,
                    occupied: true,
                    sampleId: 'sample-002',
                    temperature: 4,
                    lastChecked: '2024-11-08T10:30:00Z'
               }
          ]
     }
];

export const DUMMY_ALIQUOTS: Aliquot[] = [
     {
          id: 'aliq-001',
          barcode: 'S20241108001-A001',
          parentSampleId: 'sample-001',
          volume: 1,
          unit: 'mL',
          purpose: 'testing',
          storageLocation: 'Freezer A, Shelf 1, Position 1',
          aliquotedBy: 'Dr. Sarah Johnson',
          aliquotedAt: '2024-11-08T11:00:00Z',
          status: 'active',
          notes: 'Aliquot for CBC analysis'
     },
     {
          id: 'aliq-002',
          barcode: 'S20241108001-A002',
          parentSampleId: 'sample-001',
          volume: 2,
          unit: 'mL',
          purpose: 'backup',
          storageLocation: 'Freezer A, Shelf 1, Position 2',
          aliquotedBy: 'Dr. Sarah Johnson',
          aliquotedAt: '2024-11-08T11:00:00Z',
          status: 'active',
          notes: 'Backup aliquot'
     },
     {
          id: 'aliq-003',
          barcode: 'S20241108002-A001',
          parentSampleId: 'sample-002',
          volume: 3,
          unit: 'mL',
          purpose: 'testing',
          storageLocation: 'Refrigerator B, Shelf 2, Position 4',
          aliquotedBy: 'Dr. David Chen',
          aliquotedAt: '2024-11-08T11:30:00Z',
          status: 'used',
          notes: 'Used for lipid panel testing'
     }
];

export const DUMMY_REJECTIONS: RejectionRecord[] = [
     {
          id: 'rej-001',
          sampleId: 'sample-004',
          reason: 'improper_collection',
          severity: 'major',
          description: 'Throat swab was not collected properly - insufficient sample',
          correctiveAction: 'Recollect sample using proper technique',
          rejectedBy: 'Susan Miller',
          rejectedAt: '2024-11-08T09:15:00Z',
          followUpRequired: true,
          followUpDate: '2024-11-08T10:00:00Z',
          notifiedParties: ['Dr. Tom Anderson', 'Patient Jennifer Lee'],
          attachments: []
     }
];

export const DUMMY_RECALLS: RecallRecord[] = [
     {
          id: 'rec-001',
          reason: 'quality_issue',
          severity: 'critical',
          description: 'Potential contamination in batch of collection tubes',
          affectedSamples: ['sample-005'],
          initiatedBy: 'Quality Manager',
          initiatedAt: '2024-11-08T09:00:00Z',
          containmentAction: 'Quarantine all affected samples',
          notifiedParties: ['Lab Director', 'All Clinicians'],
          followUpRequired: true,
          followUpDate: '2024-11-15T00:00:00Z',
          status: 'active',
          attachments: []
     }
];

export const DUMMY_PATIENTS: Patient[] = [
     {
          id: 'PAT001',
          name: 'John Smith',
          dateOfBirth: '1985-03-15',
          gender: 'male',
          phone: '+1-555-0101',
          email: 'john.smith@email.com',
          address: '123 Main St, Anytown, USA'
     },
     {
          id: 'PAT002',
          name: 'Emily Davis',
          dateOfBirth: '1992-07-22',
          gender: 'female',
          phone: '+1-555-0102',
          email: 'emily.davis@email.com',
          address: '456 Oak Ave, Somewhere, USA'
     },
     {
          id: 'PAT003',
          name: 'Robert Wilson',
          dateOfBirth: '1978-11-30',
          gender: 'male',
          phone: '+1-555-0103',
          email: 'robert.wilson@email.com',
          address: '789 Pine Rd, Elsewhere, USA'
     },
     {
          id: 'PAT004',
          name: 'Jennifer Lee',
          dateOfBirth: '1989-05-12',
          gender: 'female',
          phone: '+1-555-0104',
          email: 'jennifer.lee@email.com',
          address: '321 Elm St, Nowhere, USA'
     },
     {
          id: 'PAT005',
          name: 'Michael Brown',
          dateOfBirth: '1965-09-18',
          gender: 'male',
          phone: '+1-555-0105',
          email: 'michael.brown@email.com',
          address: '654 Maple Dr, Anywhere, USA'
     }
];

export const DUMMY_TEST_TYPES: TestType[] = [
     {
          id: 'cbc',
          name: 'Complete Blood Count',
          category: 'Hematology',
          requiresFasting: false
     },
     {
          id: 'bmp',
          name: 'Basic Metabolic Panel',
          category: 'Chemistry',
          requiresFasting: true
     },
     {
          id: 'lipid',
          name: 'Lipid Panel',
          category: 'Chemistry',
          requiresFasting: true
     },
     {
          id: 'tsh',
          name: 'Thyroid Stimulating Hormone',
          category: 'Endocrinology',
          requiresFasting: false
     },
     {
          id: 'urinalysis',
          name: 'Urinalysis',
          category: 'Urinalysis',
          requiresFasting: false
     },
     {
          id: 'culture',
          name: 'Culture & Sensitivity',
          category: 'Microbiology',
          requiresFasting: false
     }
];

export const DUMMY_STATISTICS: SampleStatistics = {
     totalSamples: 5,
     samplesByStatus: {
          collected: 1,
          received: 0,
          processing: 1,
          processed: 1,
          rejected: 1,
          recalled: 1,
          disposed: 0,
          archived: 0
     },
     samplesByPriority: {
          routine: 3,
          urgent: 1,
          stat: 1,
          critical: 0
     },
     totalStorageUnits: 2,
     occupiedStorageLocations: 3,
     totalAliquots: 3,
     activeRecalls: 1,
     pendingRejections: 0
};

// Additional interfaces that were referenced but not defined
export interface Patient {
     id: string;
     name: string;
     dateOfBirth?: string;
     gender?: string;
     phone?: string;
     email?: string;
     address?: string;
}

export interface TestType {
     id: string;
     name: string;
     category: string;
     requiresFasting: boolean;
}

export interface CollectionRequest {
     id: string;
     patientId: string;
     patientName: string;
     testType: string;
     testName: string;
     priority: SamplePriority;
     requestedBy: string;
     requestedAt: string;
     status: 'pending' | 'approved' | 'collected' | 'cancelled';
     notes?: string;
}

export interface QualityControlIssue {
     id: string;
     sampleId: string;
     issueType: string;
     description: string;
     severity: 'low' | 'moderate' | 'high' | 'critical';
     reportedBy: string;
     assignedTo: string;
     status: 'open' | 'in_progress' | 'closed';
     reportedAt: string;
     dueDate?: string;
     resolution?: string;
     resolvedAt?: string;
     resolvedBy?: string;
}

export interface Rejection {
     id: string;
     sampleId: string;
     reason: string;
     severity: 'minor' | 'moderate' | 'high' | 'critical';
     description: string;
     reportedBy: string;
     timestamp: string;
     status: 'active' | 'resolved';
     correctiveAction?: string;
     notes?: string;
}

export interface Recall {
     id: string;
     reason: string;
     severity: 'minor' | 'moderate' | 'high' | 'critical';
     description: string;
     affectedSamples: string[];
     initiatedBy: string;
     initiatedAt: string;
     status: 'initiated' | 'active' | 'completed' | 'cancelled';
     correctiveAction?: string;
     communicationPlan?: string;
     notes?: string;
}