# EER Diagram (Mermaid)

Files:

- `EER.mmd` — Mermaid ER diagram source (full system).
- `EER_user_management.mmd` — user management module.
- `EER_complaints.mmd` — complaint & feedback module.
- `EER_booking.mmd` — booking management module.
- `EER_job_posting.mmd` — job posting module.
- `EER_equipment.mmd` — equipment rental module.
- `ARCHITECTURE_COLORFUL.mmd` — colorful system/component architecture diagram.
- `WORKFLOW_COLORFUL.mmd` — colorful process/workflow diagram.

How to preview locally:

1) VS Code: install "Markdown Preview Mermaid Support" or use the built-in Mermaid preview in recent VS Code versions; open the `.mmd` file and preview.

2) mermaid-cli (Node):

```bash
npm install -g @mermaid-js/mermaid-cli
# render full diagram
mmdc -i diagrams/EER.mmd -o diagrams/EER.svg
# render module diagrams
mmdc -i diagrams/EER_user_management.mmd -o diagrams/EER_user_management.svg
mmdc -i diagrams/EER_complaints.mmd -o diagrams/EER_complaints.svg
mmdc -i diagrams/EER_booking.mmd -o diagrams/EER_booking.svg
mmdc -i diagrams/EER_job_posting.mmd -o diagrams/EER_job_posting.svg
mmdc -i diagrams/EER_equipment.mmd -o diagrams/EER_equipment.svg
```

3) GitHub: GitHub renders Mermaid in Markdown files; embed the `EER.mmd` content into a Markdown code block with `mermaid` language to preview.

You can also embed the architecture and workflow files the same way if you want a visual section in the report.

Notes:
- The diagrams are generated from `schema.sql` and JPA `@Entity` classes. They emphasize PKs and FKs and show high-level cardinalities.
- I can render SVG/PNG files here if you want; tell me whether to produce all module SVGs now.
