# Partner Billing and Pharmacy Flow Maps

These diagrams define the intended business flow. Status changes are backend-enforced commands; screens are views of those states.

## 1. End-to-End Partner Laboratory Flow

```mermaid
flowchart TD
    A[Partner user signs in] --> B{Account active and scoped?}
    B -- No --> B1[Block access and show support route]
    B -- Yes --> C[Find or register patient]
    C --> D[Select tests from assigned catalogue]
    D --> E[Choose partner or center sample collection]
    E --> F[Review read-only prices and submit]
    F --> G[Pending center approval]
    G --> H{Billing reviewer decision}
    H -- Hold --> I[Return reason and required action]
    I --> J[Partner edits new revision]
    J --> F
    H -- Reject --> K[Close revision and notify partner]
    H -- Approve --> L[Freeze approved revision and notify partner]
    L --> M{Collection location}
    M -- Partner --> N[Partner records collection and dispatch]
    M -- Center --> O[Center collects sample]
    N --> P[Center receives sample]
    O --> P
    P --> Q{Current bill revision approved?}
    Q -- No --> R[Quarantine workflow and block processing]
    R --> G
    Q -- Yes --> S[Validate specimen]
    S --> T[Process sample]
    T --> U[Enter results]
    U --> V[Validate and sign results]
    V --> W[Submit report to partner]
    W --> X[Partner views or downloads report]
    X --> Y[Record acknowledgement and audit]
```

## 2. Billing State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> PendingApproval: Submit
    PendingApproval --> Approved: Approve
    PendingApproval --> OnHold: Hold with reason
    PendingApproval --> Rejected: Reject with reason
    OnHold --> DraftRevision: Edit
    DraftRevision --> PendingApproval: Resubmit new revision
    Approved --> SampleExpected: Activate handoff
    SampleExpected --> SampleReceived: Receive sample
    SampleReceived --> InProcess: Start processing when approval is valid
    InProcess --> ResultEntered: Complete entry
    ResultEntered --> ResultValidated: Validate and sign
    ResultValidated --> ReleasedToPartner: Submit report
    Draft --> Cancelled: Cancel
    PendingApproval --> Cancelled: Withdraw
    OnHold --> Cancelled: Cancel
    Approved --> Cancelled: Authorized cancel before processing
    Rejected --> [*]
    ReleasedToPartner --> [*]
    Cancelled --> [*]
```

## 3. Approval Guard

```mermaid
sequenceDiagram
    actor Scientist
    participant UI as Laboratory UI
    participant API as Laboratory API
    participant Billing as Billing Decision Store
    participant Audit as Audit Log

    Scientist->>UI: Start processing
    UI->>API: POST processing/start with order and revision
    API->>Billing: Read latest submitted revision and decision
    alt Approval exists and matches current revision
        Billing-->>API: APPROVED and snapshot hash
        API->>API: Start processing transaction
        API->>Audit: Record processing start
        API-->>UI: 200 Processing started
    else Approval missing, stale, held, rejected, or revoked
        Billing-->>API: Blocking status and reason
        API->>Audit: Record blocked attempt
        API-->>UI: 409 APPROVAL_REQUIRED
        UI-->>Scientist: Show blocker and approval link
    end
```

## 4. Partner Order Screen Flow

```mermaid
flowchart LR
    A[Dashboard] --> B[New order]
    B --> C[1 Patient]
    C --> D[2 Services]
    D --> E[3 Sample plan]
    E --> F[4 Review]
    F --> G{Submit valid?}
    G -- No --> H[Inline errors and summary]
    H --> C
    G -- Yes --> I[Pending approval detail]
    I --> J{Decision notification}
    J -- Hold --> K[Reason panel]
    K --> L[Edit and resubmit]
    L --> I
    J -- Reject --> M[Read-only decision]
    J -- Approve --> N[Sample instructions and timeline]
    N --> O[Released result]
```

## 5. Structured Consultation Flow

```mermaid
flowchart TD
    A[Open patient consultation] --> B[Clinical Note]
    B --> C[Add diagnoses and plan]
    C --> D{Downstream orders needed?}
    D -- Investigations --> E[Search laboratory or imaging catalogue]
    E --> F[Add indication and priority]
    F --> G[Confirm derived billing source and entity]
    G --> H[Create investigation order]
    D -- Medications --> I[Search medication catalogue]
    I --> J[Enter dose, route, frequency, duration, quantity]
    J --> K{Fulfilment source}
    K -- Internal --> L[Send signed order to dispensary]
    K -- External --> M[Issue printable external prescription]
    H --> N[Show investigation status in consultation timeline]
    L --> O[Show dispensing status in consultation timeline]
    M --> O
    N --> P[Save structured consultation and narrative snapshot]
    O --> P
```

## 6. Internal and External Pharmacy Flow

```mermaid
flowchart TD
    A[Prescriber signs prescription] --> B{Line fulfilment source}
    B -- External --> C[Generate external prescription]
    C --> D[Mark issued externally]
    D --> E[No inventory movement]
    B -- Internal --> F[Check active pharmacy item]
    F --> G{Eligible FEFO stock available?}
    G -- No --> H[Mark unavailable or propose permitted alternative]
    H --> I[Notify prescriber and patient]
    G -- Yes --> J[Reserve quantity by batch]
    J --> K[Dispensary reviews safety and identity]
    K --> L{Fulfilment outcome}
    L -- Full --> M[Issue stock and mark dispensed]
    L -- Partial --> N[Issue available stock and retain remainder]
    L -- Decline --> O[Release reservation and record reason]
    M --> P[Immutable stock movement and audit]
    N --> P
    O --> P
```

## 7. Partner Authentication and Authorization

```mermaid
sequenceDiagram
    actor User as Partner User
    participant Auth as Authentication API
    participant Session as Session Cookie
    participant MW as Next.js Middleware
    participant Page as Partner Workspace
    participant Data as Backend API

    User->>Auth: Submit credentials
    Auth->>Auth: Validate identity, partner account, and status
    Auth-->>Session: Set HTTP-only session with partner claims
    User->>MW: Request partner orders
    MW->>Session: Verify token and partner role
    alt Valid partner session
        MW->>Page: Allow partner layout
        Page->>Data: Fetch orders
        Data->>Data: Derive tenant and billing entity from session
        Data-->>Page: Entity-scoped records only
    else Invalid, suspended, or staff session
        MW-->>User: Redirect to correct login or unauthorized page
    end
```

## 8. Responsibility Handoffs

| Stage | Responsible role | Exit condition |
| --- | --- | --- |
| Draft order | Partner billing officer / clinician | Patient, services, sample plan, and declaration complete |
| Financial review | Center billing reviewer | Approved, held with reason, or rejected with reason |
| Sample collection | Partner collector or center phlebotomist | Collection identity and time recorded |
| Sample receipt | Center receiving officer | Condition and chain of custody recorded |
| Processing | Scientist | Approved revision verified and testing completed |
| Result authorization | Validator / signatory | Result validated and signed |
| Result release | Authorized center user | Signed report explicitly submitted to partner |
| Medication fulfilment | External patient route or dispensary | Prescription issued or internal stock movement posted |

## 9. Exception Paths

| Exception | Required behavior |
| --- | --- |
| Price changes during draft | Refresh draft and show changed lines before submission |
| Price changes after submission | Preserve snapshot; reviewer sees mismatch warning |
| Partner edits a held order | Create new revision; previous decision remains immutable |
| Sample arrives before approval | Record receipt only if policy permits; quarantine and block processing |
| Sample rejected | Record reason, notify partner, and request recollection without silently changing billing |
| Report corrected after release | Create signed replacement version and notify partner |
| Insufficient internal stock | Allow partial fulfilment or external reroute according to policy |
| Prescription cancelled after reservation | Release reservation; do not post an issue movement |
| Concurrent stock issue | One transaction succeeds; stale request receives conflict and refreshes availability |