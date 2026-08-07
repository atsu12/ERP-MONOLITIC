# Architecture Decisions

## ADR-001
Title: Inventory Philosophy

Decision:
Products never create stock.
Stock exists only after Stock In.

Status:
Approved

---

## ADR-002
Title: Dispatch Workflow

Decision:
Dispatch is created only after payment confirmation.
Proforma invoices are generated from the cart before any dispatch record exists.

Status:
Approved

---

## ADR-003
Title: Document Template Engine

Decision:
All printable documents use placeholder-based Excel templates.
No document generation code may rely on hardcoded cell references.

Status:
Approved
