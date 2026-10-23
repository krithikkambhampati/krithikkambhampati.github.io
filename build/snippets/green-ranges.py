def _ranges(
    values: dict[str, Any], unknown: set[str]
) -> tuple[dict[str, tuple[float, float]], tuple[int, int]]:
    """Exact enumeration over every value of each unknown score field (and an imputed rating ± spread)."""
    cfg = get_config()
    options = {
        f: [e.value for e in _ENUMS[f]] for f in cfg.engine.validation.score_feature_fields if f in unknown
    }
    if "energy_rating" in unknown:
        bands = [r.value for r in EnergyRating]
        i, k = bands.index(values["energy_rating"]), cfg.score.score_range["rating_band_spread"]
        options["energy_rating"] = bands[max(i - k, 0) : i + k + 1]
    totals: list[int] = []
    seen: dict[str, list[float]] = {k: [] for k in _COMPONENT_FIELDS}
    for combo in itertools.product(*options.values()):
        subs = _sub_scores(values | dict(zip(options, combo, strict=True)))
        if None in subs.values():  # e.g. a roof type that needs a roof_insulation we don't have
            continue
        totals.append(round_score(sum(_contributions(subs).values())))
        for k, v in subs.items():
            seen[k].append(v)
    varied = [k for k, fs in _COMPONENT_FIELDS.items() if set(fs) & options.keys()]
    return {k: (min(seen[k]), max(seen[k])) for k in varied}, (min(totals), max(totals))
