# Interview Guide — EAROS Artifact Generation

This reference contains question templates per section, guidance on adapting to artifact type and platform, examples of good vs. bad interview answers, probing techniques, and N/A handling. Read this before Step 2 (interview) in SKILL.md.

---

## Core Interviewing Principles

### Ask about the world, not the document

The architect knows their system. They do not know EAROS. Every question must be phrased in terms of the system, not the rubric.

| Rubric language (never use) | Natural language (use this) |
|----------------------------|----------------------------|
| "Describe your STK-01 stakeholders" | "Who are the main groups that will use or be affected by this system?" |
| "What are your TRC-01 business drivers?" | "What problem is this system solving — what would go wrong if it didn't exist?" |
| "Provide RA-VIEW-01 architectural views" | "Can you describe what the system looks like — what are the main pieces and how do they connect?" |
| "Document your CMP-01 compliance controls" | "Are there any regulatory or policy requirements this system has to meet?" |

### Probe for specifics

Vague answers produce vague artifacts that score 1. Use these probing patterns:

| Vague answer | Probing question |
|-------------|-----------------|
| "We need high availability" | "What does that mean in practice — how long can the system be unavailable before it becomes a business problem? Do you have a number?" |
| "It integrates with the main systems" | "Which specific systems — what are their names? What does each integration do?" |
| "We considered a few options" | "What were the options? What made you choose this one over the others?" |
| "Security is important" | "What specific security requirements does this need to meet? Any compliance frameworks like ISO 27001 or PCI DSS? Who owns security sign-off?" |
| "It's a microservices architecture" | "How many services? Who owns each one? What do the service boundaries map to?" |
| "We'll monitor it with standard tooling" | "What tooling specifically? What are the key metrics you'll alert on? What does an on-call engineer do when they get paged?" |

### When to push back

Push back when:
- A quality attribute target is not measurable ("fast", "reliable", "secure")
- A decision is stated without rationale ("we chose Kafka")
- A stakeholder is listed without concerns ("IT Operations")
- A compliance requirement is mentioned without a control mechanism ("we follow GDPR")

Don't accept aspirational answers. The EAROS scoring guide requires evidence. If the artifact says "high performance", an evaluator will score it 1. If it says "p99 < 100ms at 1,000 TPS, validated by load test on date", it scores 3 or 4.

---

## Block-by-Block Question Templates

### Block 1 — Context and Purpose
*Rubric mapping: STK-01 (stakeholder identification), SCP-01 (scope and boundaries)*

**Opening:**
> "Before we get into the architecture, let's make sure we capture the context. I'll ask a few questions about who this is for and what it's supposed to do."

**Questions:**
1. "What is this system? Give me the one-sentence version — what does it do and why does it exist?"
2. "Who are the main groups that will use or be affected by this system? Think broadly — not just developers, but business users, operations teams, compliance reviewers, customers."
3. "For each of those groups, what is their primary concern about this system? What would they most want to know when reviewing this document?"
4. "Where does this system start and stop? What is in scope for this architecture, and what are you explicitly not covering? Are there elements you're deferring to a later phase?"
5. "Who authored this document and who is responsible for keeping it up to date?"

**What good answers look like:**
- Stakeholder: "The payments team (will build it), Finance (approves transactions), Fraud (monitors for anomalies) — each with a one-sentence concern"
- Scope: Clear in/out-of-scope list, not "everything related to payments"

**What to probe:**
- If stakeholders are all technical roles: "Are there business stakeholders — people who will use the system or be accountable for it?"
- If scope is stated in terms of goals rather than boundaries: "Can you describe the technical boundary — what external systems does this interact with? Where does your system hand off to another?"

---

### Block 2 — Business Drivers and Constraints
*Rubric mapping: TRC-01 (traceability), RAT-01 (rationale and decisions)*

**Opening:**
> "Let's talk about why this architecture looks the way it does — what were the key requirements and constraints driving the design?"

**Questions:**
1. "What business problem is this architecture solving? What would happen if it didn't exist or if you built it a different way?"
2. "Are there specific business drivers — events, regulations, strategic goals, or pain points — that led to this project?"
3. "What are the hard constraints? Things that are non-negotiable — budget, timeline, technology stack, integration with existing systems, regulatory requirements?"
4. "Who are the key business stakeholders for this project, and what does success look like from their perspective?"
5. "Are there known risks or assumptions that could affect the design?"

**What good answers look like:**
- "The regulation requires us to store transaction records for 7 years — that drove the data retention architecture in Section 4"
- "We're constrained to Azure because of our enterprise agreement — that ruled out AWS-native services"

**What to probe:**
- If drivers are vague ("digital transformation"): "What specifically needs to change? What are users or the business unable to do today?"
- If constraints are vague ("limited budget"): "What does 'limited' mean — are we talking about annual cloud spend target, headcount, or license costs?"

---

### Block 3 — Architecture Views and Components
*Rubric mapping: RA-VIEW-01 (views), CVP-01 (component value proposition) — or equivalent per profile*

**Opening:**
> "Now let's get into the architecture itself. I'll ask you to describe it at a few different levels — the big picture, the main components, and how data moves through the system."

**Questions:**
1. "At the highest level — what does this system look like? If you drew a box labeled '[system name]' in the middle of a whiteboard, what external actors and systems would you draw connecting to it? What does each connection represent?"
2. "Inside that box, what are the main components or services? What is each one responsible for?"
3. "How do the components talk to each other? Are there any important data flows or sequences worth describing — like a key transaction or use case?"
4. "Where does this run? Describe the deployment — cloud, on-prem, hybrid? What infrastructure or platform components are involved?"
5. "Where does data live? What are the key data stores, and what does each one hold?"

**What good answers look like:**
- "The API gateway receives all inbound requests, routes them to three microservices, and calls the legacy mainframe via an adapter for settlement"
- "We have three data stores: Postgres for transactional data, Redis for session state, and S3 for document storage"

**What to probe:**
- If the description is still high-level: "Can you name the main components? Even a list of service names helps"
- If deployment is vague ("it runs on AWS"): "Which AWS services specifically? Are you on ECS, EKS, Lambda? Is there a multi-region setup?"
- If data flows are missing: "Walk me through a typical request — what happens from the moment a user hits the API to when they get a response?"

**Platform-specific probing:**

*AWS:* "EC2 or managed services? ECS/EKS/Lambda? RDS or DynamoDB? Are you using VPC peering or Transit Gateway for network isolation?"

*Azure:* "AKS or App Service? Cosmos DB or Azure SQL? Are you using Azure AD for identity, and how does that integrate with your existing directory?"

*On-prem / hybrid:* "What hypervisor or container platform? How does this connect to your cloud footprint, if any? Who manages the physical infrastructure?"

---

### Block 4 — Key Decisions and Rationale
*Rubric mapping: RAT-01 (decision rationale), RA-DEC-01 (key architectural decisions)*

**Opening:**
> "Architecture is shaped by choices. Let's capture the major decisions that define why this design looks the way it does."

**Questions:**
1. "What were the 3–5 most important design decisions you made? The ones that, if you'd chosen differently, would have produced a fundamentally different architecture?"
2. For each decision: "What were the main options you considered?"
3. For each decision: "What led you to choose this option over the others? Was it a technical constraint, a business requirement, a risk, or a preference?"
4. "Are there any decisions that are still open — where you haven't settled on an approach yet?"
5. "Were there any decisions that were controversial or where people on the team disagreed? How was it resolved?"

**What good answers look like:**
- "We chose event streaming over REST callbacks for inter-service communication. We considered webhooks (simpler but unreliable) and polling (too much load). We went with Kafka because it's already in our platform and gives us replay capability for the audit requirement"
- "The choice of PostgreSQL over MongoDB was driven by the need for strong consistency on financial records — we couldn't accept eventual consistency"

**What to probe:**
- If a decision is stated without alternatives: "What else did you consider before choosing [X]?"
- If a decision lacks a business driver: "What requirement or constraint made [X] the right choice? What would have been different if you'd chosen [Y]?"
- If the team "always uses" something: "Is there a specific reason that technology was the right fit here, or was it familiarity? Were there any tradeoffs you accepted?"

---

### Block 5 — Quality Attributes
*Rubric mapping: RA-QA-01 (quality attributes and NFRs)*

**Opening:**
> "Let's talk about the non-functional requirements — the '-ilities'. These are often what makes or breaks an architecture."

**Questions:**
1. "What are the performance requirements? Think about response time, throughput, and concurrent users."
2. "What are the availability and reliability requirements? What's the acceptable downtime? What happens during a failure?"
3. "What are the scalability requirements? What's the current scale, and what does growth look like? Is there a seasonal peak?"
4. "What are the security requirements? Authentication, authorization, encryption at rest and in transit?"
5. "What observability do you need? What metrics, logs, and traces are required?"

**What good answers look like:**
- "API response time < 200ms at the 99th percentile under 500 concurrent users"
- "We need 99.9% monthly uptime — that's roughly 8 hours/year"
- "Data at rest encrypted with AES-256, all connections TLS 1.2 or higher, OAuth 2.0 for external API auth"

**What to probe:**
- If targets are not measurable: "Can you put a number on that? What's the threshold where performance becomes a problem?"
- If availability is stated without a failure scenario: "What happens when a component fails? Is there failover? What's the recovery time objective?"
- If observability is vague: "What would an on-call engineer look at first when something goes wrong?"

---

### Block 6 — Operations
*Rubric mapping: RA-OPS-01 (operational concerns), MNT-01 (maintainability)*

**Opening:**
> "Good architectures are built to run, not just to deploy. Let's cover how this system will operate in production."

**Questions:**
1. "How will this be deployed? Is there a CI/CD pipeline? Who owns the deployment process?"
2. "How will it be monitored? What are the key health indicators?"
3. "What does a degraded state look like, and what happens to traffic when a component is down?"
4. "What is the disaster recovery plan? If the whole system went down right now, what would you do, and how long would it take to restore?"
5. "Are there any ongoing operational costs or concerns — data retention, storage growth, licensing?"

**What good answers look like:**
- "We use ArgoCD for continuous deployment from main. RTO is 4 hours based on snapshot recovery. We alert on p95 > 500ms and error rate > 0.1%"

**What to probe:**
- If DR is vague: "Walk me through what you'd actually do — who gets called, what gets restored first, what's the recovery time in the worst case?"
- If monitoring is vague: "What's the dashboard that the on-call person opens first? What's the first alert they'd see?"

---

### Block 7 — Compliance and Governance
*Rubric mapping: CMP-01 (compliance and governance fit)*

**Opening:**
> "Let's make sure we capture the regulatory and policy context. This is important for governance review."

**Questions:**
1. "Does this system process personal data, financial data, or any regulated data types?"
2. "What compliance frameworks or regulations apply — GDPR, PCI DSS, ISO 27001, internal policy?"
3. "For each applicable framework, what specific requirements does it impose on this architecture? How does the design address those requirements?"
4. "Are there any compliance gaps — controls that are required but not yet implemented?"
5. "Who is responsible for compliance sign-off? Has legal or compliance reviewed this design?"

**What good answers look like:**
- "We're in scope for PCI DSS SAQ D because we handle cardholder data. The key requirements addressed are: network segmentation (shown in Section 4.2), encryption in transit and at rest (Section 5.1), and access logging (Section 6.3). The pen test requirement is deferred to Q3"

**What to probe:**
- If "it's not in scope": "Are you certain? Does it process any customer identifiers, financial transactions, or health data?"
- If compliance is asserted without evidence: "How specifically does the architecture address that requirement? Which component or control implements it?"

---

### Block 8 — Implementation Guidance
*Rubric mapping: RA-IMP-01 (implementation guidance), ACT-01 (actionability)*

**Opening:**
> "Finally, let's make sure the document gives implementers what they need to act."

**Questions:**
1. "What are the key next steps? What needs to happen for this architecture to be implemented?"
2. "Are there any decisions still outstanding that need to be made before implementation can start?"
3. "What are the main dependencies on other teams, systems, or external approvals?"
4. "Are there any known risks that could affect the implementation timeline or approach?"
5. "Who should read this document? What do you want them to do with it?"

---

## Artifact-Type Specific Guidance

### Solution Architecture

Focus on: implementation specifics, integration points, phasing, team ownership.

Additional questions:
- "What is the delivery timeline? Is this being built in phases?"
- "Which team or vendor is building each component?"
- "What are the integration contracts with existing systems — APIs, events, data formats?"

Probe deeper on: deployment topology, team boundaries, handover points.

### Reference Architecture

Focus on: reusability, pattern documentation, variation points.

Additional questions:
- "Who are the intended consumers of this reference architecture? What systems or teams would use it as a blueprint?"
- "What are the 'slots' where users can substitute their own choices? What's fixed vs. flexible?"
- "What are the known patterns or anti-patterns for systems in this category?"

Probe deeper on: applicability conditions, variance mechanism, governance for deviation.

### Architecture Decision Record (ADR)

Focus on: one decision only. Interview is shorter — 5–8 questions.

Structure: Context → Decision → Alternatives → Rationale → Consequences.

Questions:
1. "What decision are you documenting?"
2. "What context led to this decision — what constraints or requirements made it necessary?"
3. "What options did you consider? Why were the alternatives rejected?"
4. "What are the consequences — positive and negative — of this decision?"
5. "Who made this decision, and is it final or revisable?"

### Capability Map

Focus on: capability definitions, business ownership, maturity levels.

Additional questions:
- "How are capabilities defined — what makes something a distinct capability vs. a sub-capability?"
- "For each capability, who owns it and what business process does it support?"
- "Is there a current maturity assessment for each capability?"

Probe deeper on: gaps between current and target maturity, investment priorities.

### Roadmap

Focus on: timeline, sequencing rationale, dependencies.

Additional questions:
- "What is the planning horizon? 1 year, 3 years?"
- "What drives the sequencing — business priority, technical dependency, funding?"
- "What are the key milestones and what does each one deliver?"

Probe deeper on: risks to the timeline, dependencies on external decisions or teams.

---

## When to Skip a Section

If a block clearly doesn't apply, state it explicitly and move on:

- "You mentioned this is a capability map with no deployment concerns — I'll skip the operations block."
- "For an ADR, compliance details belong in the decision context rather than a separate block. Let me ask about that as part of the rationale."

Never skip silently. Every skipped block should be noted as either N/A or deferred, so an evaluator knows the author considered it.

---

## Handling "I Don't Know" Answers

If the architect can't answer a question:

1. Record it as an open question or assumption: `[TBD: who owns DR for this system?]`
2. Note the impact: "This will likely score low on the operational concerns criterion — it's worth finding out before the review"
3. Offer to proceed and return: "We can come back to this — let's keep going and circle back"

Do not generate placeholder content that sounds complete. A visible TBD is better than a fabricated answer that scores 0 when the evaluator checks.
