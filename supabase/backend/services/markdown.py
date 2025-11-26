def build_markdown(
    garment_brief,
    design_section,
    materials_section,
    measurements,
    fabric_specs,
    svg_features
):

    md = f"# TECH PACK\n\n## OVERVIEW\n{garment_brief}\n\n"

    md += "## DESIGN\n"
    for key, value in design_section.items():
        md += f"- **{key}**: {value}\n"

    md += "\n## MATERIALS\n"
    for key, value in materials_section.items():
        md += f"- **{key}**: {value}\n"

    md += "\n## MEASUREMENTS\n"
    for m in measurements:
        md += f"- {m['name']}: {m['value']}\n"

    md += "\n## FABRIC\n"
    for f in fabric_specs:
        md += f"- {f['type']}: {f['details']} {f.get('gsm','')}\n"

    md += "\n## SVG FEATURES\n"
    for key, value in svg_features.items():
        md += f"- **{key}**: {value}\n"

    return md
