def check(text: str, sheet: FactSheet, *, extra_allowed: list[Fact] | None = None) -> CheckReport:
    # ...
    allowed = _allowed(sheet, list(extra_allowed or []))
    found: list[str] = []
    unsupported: list[str] = []
    for m in extract_numbers(text):
        found.append(m.raw)
        hits = _matches(m, allowed) or (_hedged(m, text) and _matches(m, allowed, approx=True))
        if not hits:
            if not _structural(m, text):
                unsupported.append(m.raw)
            continue
        if all(h.direction == "up" for h in hits) and not _direction_ok(text, m.span):
            unsupported.append(f"{m.raw} (direction)")
        elif all(h.direction == "down" for h in hits) and not _direction_ok(text, m.span, "down"):
            unsupported.append(f"{m.raw} (saving)")
    for rx in _NEVER_CLAIMS:
        unsupported += [f"{mt.group(0).strip()} (no such figure)" for mt in rx.finditer(text)]
    banned = banned_phrases(text)
    banned += [f"recommending {n}{INFEASIBLE_SUFFIX}" for n in recommended_infeasible(text, sheet)]
    return CheckReport(
        passed=not unsupported and not banned,
        # ...
    )
